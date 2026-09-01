import React from 'react';
import { motion } from 'motion/react';
import { Wifi, WifiOff, Clock, Activity, Database, Sparkles } from 'lucide-react';
import { ConnectionState } from '../types';

interface ConnectionStatusProps {
  connectionState: ConnectionState;
  lastUpdatedTime: string | null;
  secondsUntilNextRefresh: number;
  channelId: string;
  totalHistoricalCount: number;
  refreshIntervalSeconds?: number;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionState,
  lastUpdatedTime,
  secondsUntilNextRefresh,
  channelId,
  totalHistoricalCount,
  refreshIntervalSeconds = 20,
}) => {
  const getConnectionPill = () => {
    if (connectionState === 'simulated') {
      return (
        <div className="flex items-center gap-2 text-purple-700 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
          <span>Simulation Active</span>
        </div>
      );
    }

    switch (connectionState) {
      case 'connected':
        return (
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Connected to ESP32</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-2 text-amber-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            <span>Polling ThingSpeak...</span>
          </div>
        );
      case 'offline':
      default:
        return (
          <div className="flex items-center gap-2 text-rose-700 font-semibold">
            <WifiOff className="w-4 h-4 text-rose-500" />
            <span>Telemetry Offline</span>
          </div>
        );
    }
  };

  const progressPercent = Math.max(0, Math.min(100, ((refreshIntervalSeconds - secondsUntilNextRefresh) / refreshIntervalSeconds) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      id="connection-status-panel"
      className="bg-white border border-stone-200 rounded-2xl p-4 mb-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-stone-600 relative overflow-hidden"
    >
      {/* Top subtle countdown progress line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-stone-100">
        <div
          className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Left: Status & Channel */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-medium">Link Status:</span>
          {getConnectionPill()}
        </div>

        <div className="flex items-center gap-1.5 text-stone-700">
          <Database className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-400">ThingSpeak Channel:</span>
          <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-200 shadow-2xs">
            {channelId || 'Not Configured'}
          </span>
        </div>

        {totalHistoricalCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 text-stone-600">
            <Activity className="w-3.5 h-3.5 text-stone-400" />
            <span>
              <strong className="font-mono text-stone-800">{totalHistoricalCount}</strong> telemetry points
            </span>
          </div>
        )}
      </div>

      {/* Right: Last Updated Time & Refresh Countdown */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-400">Last Synced:</span>
          <span
            id="last-updated-timestamp"
            className="font-bold text-stone-800 font-mono"
          >
            {lastUpdatedTime || 'Awaiting initial fetch'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-stone-500 bg-stone-50 px-2.5 py-1 rounded-xl border border-stone-200">
          <span>Poll In:</span>
          <span className="font-black text-emerald-700 font-mono">
            {secondsUntilNextRefresh}s
          </span>
        </div>
      </div>
    </motion.div>
  );
};
