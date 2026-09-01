import React from 'react';
import { motion } from 'motion/react';
import { ListFilter, CheckCircle2, AlertTriangle, Info, Check, Clock, Cpu, Wifi } from 'lucide-react';
import { FarmSensorData, ThresholdConfig } from '../types';

interface FarmActivityProps {
  data: FarmSensorData | null;
  thresholds: ThresholdConfig;
}

interface ActivityItem {
  id: string;
  category: string;
  status: 'normal' | 'warning' | 'alert' | 'info';
  message: string;
  details: string;
}

export const FarmActivity: React.FC<FarmActivityProps> = ({ data, thresholds }) => {
  if (!data) {
    return (
      <section id="farm-activity-section" className="mb-8 scroll-mt-20">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <ListFilter className="w-5 h-5 text-stone-500" />
            <h2 className="text-base font-bold text-stone-900">Farm Activity & Diagnostic Status</h2>
          </div>
          <p className="text-xs text-stone-500">Awaiting live reading to compute farm diagnostics...</p>
        </div>
      </section>
    );
  }

  const activities: ActivityItem[] = [];

  // 1. Temperature diagnostic
  if (data.temperature !== null) {
    if (data.temperature >= thresholds.temperatureLimit) {
      activities.push({
        id: 'temp-alert',
        category: 'Temperature',
        status: 'warning',
        message: 'Temperature is above the configured safe limit.',
        details: `Current: ${data.temperature}°C (Limit: < ${thresholds.temperatureLimit}°C)`,
      });
    } else {
      activities.push({
        id: 'temp-normal',
        category: 'Temperature',
        status: 'normal',
        message: 'Temperature is optimal for poultry growth.',
        details: `Current: ${data.temperature}°C (Limit: < ${thresholds.temperatureLimit}°C)`,
      });
    }
  }

  // 2. Humidity diagnostic
  if (data.humidity !== null) {
    if (data.humidity >= thresholds.humidityLimit) {
      activities.push({
        id: 'hum-alert',
        category: 'Humidity',
        status: 'warning',
        message: 'Relative humidity is high; danger of wet litter.',
        details: `Current: ${data.humidity}% (Limit: < ${thresholds.humidityLimit}%)`,
      });
    } else {
      activities.push({
        id: 'hum-normal',
        category: 'Humidity',
        status: 'normal',
        message: 'Humidity is balanced and within safe range.',
        details: `Current: ${data.humidity}% (Limit: < ${thresholds.humidityLimit}%)`,
      });
    }
  }

  // 3. Feed level diagnostic
  if (data.feedLevel !== null) {
    if (data.feedLevel <= thresholds.feedLowLimit) {
      activities.push({
        id: 'feed-alert',
        category: 'Feed Level',
        status: 'warning',
        message: 'Silo feed level is low — replenishment required.',
        details: `Current: ${data.feedLevel}% (Low threshold: ≤ ${thresholds.feedLowLimit}%)`,
      });
    } else {
      activities.push({
        id: 'feed-normal',
        category: 'Feed Level',
        status: 'normal',
        message: 'Sufficient poultry feed in dispensers.',
        details: `Current: ${data.feedLevel}% (Safe > ${thresholds.feedLowLimit}%)`,
      });
    }
  }

  // 4. Water level diagnostic
  if (data.waterLevel !== null) {
    if (data.waterLevel <= thresholds.waterLowLimit) {
      activities.push({
        id: 'water-alert',
        category: 'Water Level',
        status: 'warning',
        message: 'Header tank water is low — check automatic refills.',
        details: `Current: ${data.waterLevel}% (Low threshold: ≤ ${thresholds.waterLowLimit}%)`,
      });
    } else {
      activities.push({
        id: 'water-normal',
        category: 'Water Level',
        status: 'normal',
        message: 'Adequate drinker line water supply.',
        details: `Current: ${data.waterLevel}% (Safe > ${thresholds.waterLowLimit}%)`,
      });
    }
  }

  // 5. Lighting diagnostic
  if (data.light !== null) {
    activities.push({
      id: 'light-normal',
      category: 'Lighting',
      status: 'normal',
      message: 'Coop photoperiod lighting is active.',
      details: `Current: ${data.light} lux`,
    });
  }

  return (
    <section id="farm-activity-section" className="mb-8 scroll-mt-20">
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200">
              <ListFilter className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <h2 id="activity-heading" className="text-base font-black text-stone-900 tracking-tight">
                Farm Activity & Subsystem Diagnostics
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Automatic rule-based health checks on latest telemetry packet #{data.entryId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 font-mono bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Updated: {data.timestamp}</span>
          </div>
        </div>

        {/* Diagnostic Activity Items List */}
        <div id="activity-items-list" className="space-y-3">
          {activities.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              id={`activity-item-${item.id}`}
              className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                item.status === 'warning'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                  : 'bg-stone-50/70 border-stone-200/80 text-stone-800 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                    item.status === 'warning'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {item.status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-600 font-mono">
                      [{item.category}]
                    </span>
                    <span className="text-xs sm:text-sm font-semibold">{item.message}</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-mono font-medium text-stone-500 bg-white px-2.5 py-1 rounded-lg border border-stone-200/80 self-start sm:self-auto shrink-0 shadow-2xs">
                {item.details}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
