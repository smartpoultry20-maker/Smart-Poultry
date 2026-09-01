import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FarmSensorData, ConnectionState, ThresholdConfig } from './types';
import {
  DEFAULT_THRESHOLDS,
  getThingSpeakCredentials,
  getStoredThresholds,
  generateSimulatedTelemetry,
} from './config/thresholds';
import { getLatestReading, getHistoricalReadings } from './services/thingspeak';
import { Header } from './components/Header';
import { FarmStatus } from './components/FarmStatus';
import { PoultryComfortCard } from './components/PoultryComfortCard';
import { SensorGrid } from './components/SensorGrid';
import { ConnectionStatus } from './components/ConnectionStatus';
import { Analytics } from './components/Analytics';
import { FarmActivity } from './components/FarmActivity';
import { Footer } from './components/Footer';
import { ConfigModal } from './components/ConfigModal';
import { UnconfiguredView } from './components/UnconfiguredView';
import { exportToCSV } from './utils/exportTelemetry';
import { playSuccessChime } from './utils/audioAlert';

export default function App() {
  // Credentials & Thresholds state
  const [credentials, setCredentials] = useState(() => getThingSpeakCredentials());
  const [thresholds, setThresholds] = useState<ThresholdConfig>(() => getStoredThresholds());
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Sensor data state
  const [latestData, setLatestData] = useState<FarmSensorData | null>(null);
  const [previousData, setPreviousData] = useState<FarmSensorData | null>(null);
  const [historicalData, setHistoricalData] = useState<FarmSensorData[]>([]);
  const [historyLimit, setHistoryLimit] = useState<number>(30);

  // Connection & status state
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Features: Audio alerts & Demo simulation mode
  const [isAudioAlertEnabled, setIsAudioAlertEnabled] = useState<boolean>(false);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(false);

  // Polling countdown state (seconds)
  const [countdown, setCountdown] = useState<number>(thresholds.refreshInterval / 1000);

  // Active fetch tracking ref to prevent overlapping calls
  const isFetchingRef = useRef<boolean>(false);

  /**
   * Main function to fetch both latest reading and historical readings from ThingSpeak
   */
  const fetchData = useCallback(
    async (isManualRefresh = false) => {
      // If simulation mode is active, produce realistic synthetic data
      if (isSimulationActive) {
        const nextSim = generateSimulatedTelemetry((latestData?.entryId || 100) + 1, false);
        setPreviousData(latestData);
        setLatestData(nextSim);
        setHistoricalData((prev) => [...prev.slice(-49), nextSim]);
        setConnectionState('simulated');
        setErrorMessage(null);

        const now = new Date();
        const timeFormatted =
          now.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) +
          ', ' +
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        setLastUpdatedTime(timeFormatted);
        setCountdown(thresholds.refreshInterval / 1000);
        return;
      }

      if (!credentials.channelId) {
        setConnectionState('unconfigured');
        setIsInitialLoading(false);
        return;
      }

      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isManualRefresh) {
        setIsRefreshing(true);
      }
      setConnectionState('connecting');

      try {
        // Fetch both latest and history in parallel
        const [latestRes, historyRes] = await Promise.all([
          getLatestReading(credentials.channelId, credentials.readApiKey),
          getHistoricalReadings(credentials.channelId, credentials.readApiKey, historyLimit),
        ]);

        if (latestRes.success && latestRes.data) {
          setPreviousData(latestData);
          setLatestData(latestRes.data);
          setErrorMessage(null);
          setConnectionState('connected');

          const now = new Date();
          const timeFormatted =
            now.toLocaleDateString([], {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }) +
            ', ' +
            now.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            });
          setLastUpdatedTime(timeFormatted);
        } else {
          setErrorMessage(latestRes.error || 'Unable to retrieve farm data.');
          setConnectionState('offline');
        }

        if (historyRes.success && historyRes.feeds) {
          setHistoricalData(historyRes.feeds);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown network failure';
        setErrorMessage(`Unable to retrieve farm data: ${msg}`);
        setConnectionState('offline');
      } finally {
        isFetchingRef.current = false;
        setIsRefreshing(false);
        setIsInitialLoading(false);
        setCountdown(thresholds.refreshInterval / 1000);
      }
    },
    [credentials.channelId, credentials.readApiKey, historyLimit, isSimulationActive, latestData, thresholds.refreshInterval]
  );

  // Fetch immediately whenever credentials, history limit or thresholds change
  useEffect(() => {
    fetchData();
  }, [credentials.channelId, credentials.readApiKey, historyLimit]);

  // Set up polling interval and 1-second countdown tick
  useEffect(() => {
    if (!credentials.channelId && !isSimulationActive) return;

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchData();
          return thresholds.refreshInterval / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, [credentials.channelId, fetchData, isSimulationActive, thresholds.refreshInterval]);

  // Handle saving new credentials and thresholds from modal or unconfigured view
  const handleSaveConfiguration = (newChannelId: string, newApiKey: string, updatedThresholds?: ThresholdConfig) => {
    setCredentials({
      channelId: newChannelId,
      readApiKey: newApiKey,
    });
    if (updatedThresholds) {
      setThresholds(updatedThresholds);
      setCountdown(updatedThresholds.refreshInterval / 1000);
    }
    if (!isSimulationActive) {
      setLatestData(null);
      setHistoricalData([]);
      setIsInitialLoading(true);
    }
  };

  // Toggle Viva Demonstration Simulation Mode
  const handleToggleSimulation = () => {
    if (!isSimulationActive) {
      setIsSimulationActive(true);
      setConnectionState('simulated');
      const seedData = Array.from({ length: 15 }, (_, i) => generateSimulatedTelemetry(100 + i, false));
      setHistoricalData(seedData);
      setLatestData(seedData[seedData.length - 1]);
      setIsInitialLoading(false);
      playSuccessChime();
    } else {
      setIsSimulationActive(false);
      fetchData(true);
    }
  };

  // Trigger simulated warning alarm during presentation
  const handleTriggerSimulatedAlert = () => {
    const alertTelemetry = generateSimulatedTelemetry((latestData?.entryId || 200) + 1, true);
    setPreviousData(latestData);
    setLatestData(alertTelemetry);
    setHistoricalData((prev) => [...prev.slice(-49), alertTelemetry]);
  };

  // Export current dataset to CSV
  const handleExportCSV = () => {
    const dataToExport = historicalData.length > 0 ? historicalData : latestData ? [latestData] : [];
    exportToCSV(dataToExport, credentials.channelId || 'demo');
  };

  return (
    <div id="farm-status-app" className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Header */}
      <Header
        connectionState={credentials.channelId || isSimulationActive ? connectionState : 'offline'}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchData(true)}
        onOpenSettings={() => setIsConfigOpen(true)}
        channelId={credentials.channelId}
        isAudioAlertEnabled={isAudioAlertEnabled}
        onToggleAudioAlert={() => setIsAudioAlertEnabled(!isAudioAlertEnabled)}
        isSimulationActive={isSimulationActive}
        onToggleSimulation={handleToggleSimulation}
        onExportCSV={handleExportCSV}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!credentials.channelId && !isSimulationActive ? (
          <UnconfiguredView onConfigured={(c, k) => handleSaveConfiguration(c, k)} />
        ) : isInitialLoading ? (
          /* Initial Clean Loading State with Motion */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            id="initial-loading-view"
            className="flex flex-col items-center justify-center py-24 sm:py-32 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 text-3xl flex items-center justify-center mb-4 shadow-sm border border-emerald-200"
            >
              🐔
            </motion.div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight">
              Loading Farm Telemetry...
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xs font-medium">
              Connecting to ThingSpeak channel #{credentials.channelId} via REST API
            </p>
          </motion.div>
        ) : (
          <div>
            {/* 1. Farm Status Banner (Normal / Alert) */}
            <FarmStatus
              data={latestData}
              error={errorMessage}
              thresholds={thresholds}
              isAudioAlertEnabled={isAudioAlertEnabled}
              onTriggerSimulatedAlert={handleTriggerSimulatedAlert}
              isSimulationActive={isSimulationActive}
            />

            {/* 2. Flock Comfort & Heat Stress (THI) Assessment */}
            <PoultryComfortCard
              temperature={latestData?.temperature ?? null}
              humidity={latestData?.humidity ?? null}
            />

            {/* 3. Sensor Cards Grid (6 Channels) */}
            <SensorGrid
              data={latestData}
              previousData={previousData}
              thresholds={thresholds}
            />

            {/* 4. Connection & Last Updated Information Panel */}
            <ConnectionStatus
              connectionState={connectionState}
              lastUpdatedTime={lastUpdatedTime}
              secondsUntilNextRefresh={countdown}
              channelId={credentials.channelId}
              totalHistoricalCount={historicalData.length}
              refreshIntervalSeconds={thresholds.refreshInterval / 1000}
            />

            {/* 5. Live Sensor Analytics (Historical Trends) */}
            <Analytics
              historicalData={historicalData}
              selectedLimit={historyLimit}
              onSelectLimit={(newLimit) => setHistoryLimit(newLimit)}
              isLoading={isRefreshing}
              thresholds={thresholds}
              onExportCSV={handleExportCSV}
            />

            {/* 6. Farm Activity & Rule Diagnostics */}
            <FarmActivity
              data={latestData}
              thresholds={thresholds}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Settings / Channel ID & Thresholds Configuration Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentChannelId={credentials.channelId}
        currentReadApiKey={credentials.readApiKey}
        currentThresholds={thresholds}
        onSave={handleSaveConfiguration}
      />
    </div>
  );
}
