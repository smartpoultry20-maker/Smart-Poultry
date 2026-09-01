import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ShieldCheck, ShieldAlert, AlertCircle, BellRing, Sparkles } from 'lucide-react';
import { FarmSensorData, ThresholdConfig } from '../types';
import { playAlertBuzzer } from '../utils/audioAlert';

interface FarmStatusProps {
  data: FarmSensorData | null;
  error?: string | null;
  thresholds: ThresholdConfig;
  isAudioAlertEnabled?: boolean;
  onTriggerSimulatedAlert?: () => void;
  isSimulationActive?: boolean;
}

export const FarmStatus: React.FC<FarmStatusProps> = ({
  data,
  error,
  thresholds,
  isAudioAlertEnabled = false,
  onTriggerSimulatedAlert,
  isSimulationActive = false,
}) => {
  // Calculate individual sensor violations against configurable thresholds
  const isTempAlert = data?.temperature !== null && data?.temperature !== undefined && data.temperature >= thresholds.temperatureLimit;
  const isHumidityAlert = data?.humidity !== null && data?.humidity !== undefined && data.humidity >= thresholds.humidityLimit;
  const isFeedAlert = data?.feedLevel !== null && data?.feedLevel !== undefined && data.feedLevel <= thresholds.feedLowLimit;
  const isWaterAlert = data?.waterLevel !== null && data?.waterLevel !== undefined && data.waterLevel <= thresholds.waterLowLimit;
  const isField6Alert = data?.farmStatusRaw === 1;

  // Farm status is ALERT if Field 6 is 1 OR any monitored sensor violates limit
  const isAlert = isField6Alert || isTempAlert || isHumidityAlert || isFeedAlert || isWaterAlert;

  // Play alarm buzzer chime when alert triggers if audio enabled
  useEffect(() => {
    if (isAlert && isAudioAlertEnabled) {
      playAlertBuzzer();
    }
  }, [isAlert, isAudioAlertEnabled, data?.entryId]);

  if (error && !data) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        id="farm-status-banner-error"
        className="bg-rose-50 border border-rose-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-xs flex items-start gap-4"
      >
        <div className="p-3 bg-rose-100 rounded-xl text-rose-700 shrink-0">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-rose-900">🔴 CONNECTION ISSUE</span>
          </div>
          <p className="text-sm text-rose-700 mt-1 font-medium">
            {error || 'Unable to retrieve live farm data from ThingSpeak.'}
          </p>
          <p className="text-xs text-rose-600 mt-2">
            Please verify that your ThingSpeak Channel ID is correct and the ESP32 is transmitting data.
          </p>
        </div>
      </motion.div>
    );
  }

  const warnings: string[] = [];
  if (isTempAlert && data?.temperature !== null) {
    warnings.push(`High Temp (${data?.temperature}°C ≥ ${thresholds.temperatureLimit}°C)`);
  }
  if (isHumidityAlert && data?.humidity !== null) {
    warnings.push(`High Humidity (${data?.humidity}% ≥ ${thresholds.humidityLimit}%)`);
  }
  if (isFeedAlert && data?.feedLevel !== null) {
    warnings.push(`Low Feed (${data?.feedLevel}% ≤ ${thresholds.feedLowLimit}%)`);
  }
  if (isWaterAlert && data?.waterLevel !== null) {
    warnings.push(`Low Water (${data?.waterLevel}% ≤ ${thresholds.waterLowLimit}%)`);
  }
  if (isField6Alert && warnings.length === 0) {
    warnings.push('ESP32 triggered Farm Alert (Field 6 = 1)');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      id="farm-status-banner"
      className={`rounded-2xl p-5 sm:p-6 mb-6 transition-all duration-300 border shadow-xs relative overflow-hidden ${
        isAlert
          ? 'bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border-amber-300 text-amber-950 ring-2 ring-amber-400/20'
          : 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border-emerald-300 text-emerald-950'
      }`}
    >
      {/* Background Animated Strobe for Alert */}
      {isAlert && (
        <motion.div
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-amber-400/10 pointer-events-none"
        />
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <motion.div
            id="farm-status-icon-container"
            animate={isAlert ? { scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] } : { scale: 1 }}
            transition={{ duration: 1.5, repeat: isAlert ? Infinity : 0 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xs shrink-0 ${
              isAlert ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-emerald-600 text-white shadow-emerald-200'
            }`}
          >
            {isAlert ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
          </motion.div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl font-black tracking-tight">
                {isAlert ? '🟠 FARM ALERT' : '🟢 FARM NORMAL'}
              </span>
              <span
                id="farm-status-badge-pill"
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs ${
                  isAlert
                    ? 'bg-amber-200 text-amber-950 border-amber-400'
                    : 'bg-emerald-200 text-emerald-950 border-emerald-400'
                }`}
              >
                {isAlert ? 'ACTION REQUIRED' : 'OPTIMAL CONDITIONS'}
              </span>
            </div>
            <p id="farm-status-description" className="text-sm font-medium mt-1 text-stone-700">
              {isAlert
                ? 'One or more farm parameters require immediate keeper attention.'
                : 'All environmental sensors and resources are within safe poultry thresholds.'}
            </p>
          </div>
        </div>

        {/* Right side stats & college viva simulation test button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
          {data?.timestamp && (
            <div className="text-xs text-stone-500 bg-white/80 px-3 py-1.5 rounded-xl border border-stone-200/80 font-mono">
              <span className="text-stone-400">Sample Time: </span>
              <strong className="text-stone-700 font-semibold">{data.timestamp}</strong>
            </div>
          )}

          {isSimulationActive && onTriggerSimulatedAlert && (
            <button
              onClick={onTriggerSimulatedAlert}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              title="Inject abnormal values to demonstrate alert response to professors"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Simulate Alert Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning Breakdown Chips */}
      <AnimatePresence>
        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            id="farm-warning-list"
            className="mt-4 pt-3 border-t border-amber-200/80 flex items-center gap-2 flex-wrap"
          >
            <div className="flex items-center gap-1 text-xs font-bold text-amber-900">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Triggered Thresholds:</span>
            </div>
            {warnings.map((w, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-200/90 text-amber-950 border border-amber-300 shadow-2xs font-mono"
              >
                {w}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
