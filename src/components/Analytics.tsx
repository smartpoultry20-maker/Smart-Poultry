import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Download, Sparkles, SlidersHorizontal, Eye } from 'lucide-react';
import { FarmSensorData, ThresholdConfig } from '../types';
import { HISTORY_OPTIONS } from '../config/thresholds';
import { SensorChart } from './SensorChart';

interface AnalyticsProps {
  historicalData: FarmSensorData[];
  selectedLimit: number;
  onSelectLimit: (limit: number) => void;
  isLoading: boolean;
  thresholds: ThresholdConfig;
  onExportCSV: () => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({
  historicalData,
  selectedLimit,
  onSelectLimit,
  isLoading,
  thresholds,
  onExportCSV,
}) => {
  const [selectedSensorFilter, setSelectedSensorFilter] = useState<'all' | 'climate' | 'resources'>('all');

  return (
    <section id="analytics-section" className="mb-8 scroll-mt-20">
      {/* Section Header with History Selector and Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-2xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 id="analytics-heading" className="text-lg font-black text-stone-900 tracking-tight">
              Live Sensor Analytics & Trends
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Historical telemetry curves rendered directly from ThingSpeak REST API
            </p>
          </div>
        </div>

        {/* Action Controls: Category Filter + History Limit Pills + CSV Export */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Category Tab */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
            <button
              onClick={() => setSelectedSensorFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedSensorFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All (4)
            </button>
            <button
              onClick={() => setSelectedSensorFilter('climate')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedSensorFilter === 'climate'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Climate
            </button>
            <button
              onClick={() => setSelectedSensorFilter('resources')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedSensorFilter === 'resources'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Feed & Water
            </button>
          </div>

          {/* History Limit Pills */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
            {HISTORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                id={`history-filter-${opt.value}`}
                onClick={() => onSelectLimit(opt.value)}
                disabled={isLoading}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedLimit === opt.value
                    ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={onExportCSV}
            className="p-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 rounded-xl border border-stone-300 shadow-2xs transition-all cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-stone-600" />
          </button>
        </div>
      </motion.div>

      {/* Grid of Charts */}
      <div id="analytics-charts-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Temperature History */}
        {(selectedSensorFilter === 'all' || selectedSensorFilter === 'climate') && (
          <SensorChart
            id="temperature-chart"
            title="Temperature History"
            data={historicalData}
            dataKey="temperature"
            unit="°C"
            color="#f97316" // Orange
            gradientId="tempGrad"
            threshold={thresholds.temperatureLimit}
            thresholdLabel={`Limit < ${thresholds.temperatureLimit}°C`}
            yDomain={['auto', 'auto']}
          />
        )}

        {/* 2. Humidity History */}
        {(selectedSensorFilter === 'all' || selectedSensorFilter === 'climate') && (
          <SensorChart
            id="humidity-chart"
            title="Humidity History"
            data={historicalData}
            dataKey="humidity"
            unit="%"
            color="#0284c7" // Sky Blue
            gradientId="humidityGrad"
            threshold={thresholds.humidityLimit}
            thresholdLabel={`Limit < ${thresholds.humidityLimit}%`}
            yDomain={[0, 100]}
          />
        )}

        {/* 3. Feed Level History */}
        {(selectedSensorFilter === 'all' || selectedSensorFilter === 'resources') && (
          <SensorChart
            id="feed-chart"
            title="Feed Level History"
            data={historicalData}
            dataKey="feedLevel"
            unit="%"
            color="#10b981" // Emerald green
            gradientId="feedGrad"
            threshold={thresholds.feedLowLimit}
            thresholdLabel={`Low Alert ≤ ${thresholds.feedLowLimit}%`}
            yDomain={[0, 100]}
          />
        )}

        {/* 4. Water Level History */}
        {(selectedSensorFilter === 'all' || selectedSensorFilter === 'resources') && (
          <SensorChart
            id="water-chart"
            title="Water Level History"
            data={historicalData}
            dataKey="waterLevel"
            unit="%"
            color="#3b82f6" // Blue
            gradientId="waterGrad"
            threshold={thresholds.waterLowLimit}
            thresholdLabel={`Low Alert ≤ ${thresholds.waterLowLimit}%`}
            yDomain={[0, 100]}
          />
        )}
      </div>
    </section>
  );
};
