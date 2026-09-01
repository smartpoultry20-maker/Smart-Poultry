import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Settings, Volume2, VolumeX, Download, Play, Square, Layers } from 'lucide-react';
import { ConnectionState } from '../types';

interface HeaderProps {
  connectionState: ConnectionState;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  channelId: string;
  isAudioAlertEnabled: boolean;
  onToggleAudioAlert: () => void;
  isSimulationActive: boolean;
  onToggleSimulation: () => void;
  onExportCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connectionState,
  isRefreshing,
  onRefresh,
  onOpenSettings,
  channelId,
  isAudioAlertEnabled,
  onToggleAudioAlert,
  isSimulationActive,
  onToggleSimulation,
  onExportCSV,
}) => {
  const getStatusBadge = () => {
    if (isSimulationActive) {
      return (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          id="status-simulated-badge"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-xs"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600"></span>
          </span>
          <span>DEMO SIMULATION</span>
        </motion.div>
      );
    }

    switch (connectionState) {
      case 'connected':
        return (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            id="status-live-badge"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>LIVE</span>
          </motion.div>
        );
      case 'connecting':
        return (
          <div
            id="status-connecting-badge"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
          >
            <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
            <span>CONNECTING</span>
          </div>
        );
      case 'offline':
      default:
        return (
          <div
            id="status-offline-badge"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            <span>OFFLINE</span>
          </div>
        );
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      id="main-header"
      className="bg-white/95 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.95 }}
            id="farm-logo-icon"
            className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs text-2xl select-none cursor-pointer"
            aria-label="Poultry Icon"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            🐔
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 id="app-title" className="text-xl font-black text-stone-900 tracking-tight">
                Farm Status
              </h1>
              {channelId && (
                <span
                  id="channel-tag"
                  className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-stone-100 text-stone-600 border border-stone-200"
                  title="ThingSpeak Channel ID"
                >
                  Ch #{channelId}
                </span>
              )}
            </div>
            <p id="app-subtitle" className="text-xs sm:text-sm font-semibold text-emerald-800">
              Smart Poultry Farm Monitoring System
            </p>
          </div>
        </div>

        {/* Middle Quick Section Anchor Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-stone-100/80 p-1 rounded-xl border border-stone-200/80 text-xs font-semibold text-stone-600">
          <button
            onClick={() => scrollToSection('farm-status-banner')}
            className="px-3 py-1 rounded-lg hover:text-stone-900 hover:bg-white transition-all cursor-pointer"
          >
            Overview
          </button>
          <button
            onClick={() => scrollToSection('sensor-grid-section')}
            className="px-3 py-1 rounded-lg hover:text-stone-900 hover:bg-white transition-all cursor-pointer"
          >
            Sensors
          </button>
          <button
            onClick={() => scrollToSection('analytics-section')}
            className="px-3 py-1 rounded-lg hover:text-stone-900 hover:bg-white transition-all cursor-pointer"
          >
            Analytics
          </button>
          <button
            onClick={() => scrollToSection('farm-activity-section')}
            className="px-3 py-1 rounded-lg hover:text-stone-900 hover:bg-white transition-all cursor-pointer"
          >
            Activity
          </button>
        </nav>

        {/* Right Controls & Live Badge */}
        <div className="flex items-center gap-2 sm:gap-2.5 w-full md:w-auto justify-between md:justify-end flex-wrap">
          {getStatusBadge()}

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Buzzer Alarm Toggle for College Demo */}
            <button
              id="audio-toggle-btn"
              onClick={onToggleAudioAlert}
              className={`p-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                isAudioAlertEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200'
                  : 'bg-stone-50 text-stone-400 border-stone-200 hover:bg-stone-100'
              }`}
              title={isAudioAlertEnabled ? 'Audio Alert Siren Enabled' : 'Audio Alert Muted'}
            >
              {isAudioAlertEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
            </button>

            {/* Test Simulation Toggle */}
            <button
              id="simulation-toggle-btn"
              onClick={onToggleSimulation}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                isSimulationActive
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-300'
              }`}
              title="Toggle Simulated Sensor Stream (Viva Demo Mode)"
            >
              {isSimulationActive ? (
                <>
                  <Square className="w-3.5 h-3.5 text-purple-700 fill-purple-700" />
                  <span className="hidden sm:inline">Stop Demo</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-stone-600" />
                  <span className="hidden sm:inline">Demo Mode</span>
                </>
              )}
            </button>

            {/* Export CSV */}
            <button
              id="export-csv-btn"
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-50 hover:bg-stone-100 active:bg-stone-200 rounded-xl border border-stone-300 transition-colors cursor-pointer"
              title="Download Historical Telemetry CSV"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Manual Refresh */}
            <button
              id="refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing || isSimulationActive}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-50 hover:bg-stone-100 active:bg-stone-200 rounded-xl border border-stone-300 transition-colors disabled:opacity-50 cursor-pointer"
              title="Fetch fresh readings from ThingSpeak"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Channel & Threshold Setup */}
            <button
              id="settings-btn"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl border border-stone-300 transition-colors cursor-pointer"
              title="ThingSpeak Channel & Thresholds Setup"
            >
              <Settings className="w-3.5 h-3.5 text-stone-700" />
              <span className="hidden sm:inline">Config</span>
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
