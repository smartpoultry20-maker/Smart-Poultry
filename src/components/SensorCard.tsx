import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, Check, AlertCircle } from 'lucide-react';

export interface SensorCardProps {
  id: string;
  icon: string;
  title: string;
  value: number | string | null;
  unit?: string;
  statusText: string;
  statusType: 'normal' | 'warning' | 'low' | 'alert' | 'info';
  thresholdNote: string;
  progressPercent?: number | null;
  progressColor?: string;
  trend?: 'up' | 'down' | 'stable' | null;
  index?: number;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  id,
  icon,
  title,
  value,
  unit,
  statusText,
  statusType,
  thresholdNote,
  progressPercent,
  progressColor = 'bg-emerald-500',
  trend = null,
  index = 0,
}) => {
  const getBadgeStyle = () => {
    switch (statusType) {
      case 'normal':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'warning':
      case 'low':
      case 'alert':
        return 'bg-amber-100 text-amber-950 border-amber-400 font-extrabold shadow-2xs';
      case 'info':
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  const getBorderAccent = () => {
    switch (statusType) {
      case 'warning':
      case 'low':
      case 'alert':
        return 'border-amber-300 ring-2 ring-amber-200 bg-amber-50/20';
      case 'normal':
        return 'border-stone-200 hover:border-emerald-300 hover:shadow-md';
      default:
        return 'border-stone-200 hover:border-stone-300';
    }
  };

  // Safe formatting: never display NaN, undefined, or null directly
  const displayValue = () => {
    if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
      return '--';
    }
    if (typeof value === 'number') {
      return Number.isInteger(value) ? value.toString() : value.toFixed(1);
    }
    return String(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      id={`sensor-card-${id}`}
      className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between relative overflow-hidden ${getBorderAccent()}`}
    >
      {/* Top subtle highlight */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-stone-100 to-transparent" />

      <div>
        {/* Card Header: Icon, Title, Status Tag */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <motion.span
              whileHover={{ rotate: 10, scale: 1.1 }}
              id={`sensor-icon-${id}`}
              className="text-2xl select-none w-10 h-10 rounded-xl bg-stone-100/90 flex items-center justify-center border border-stone-200/60 shadow-2xs"
            >
              {icon}
            </motion.span>
            <h3
              id={`sensor-title-${id}`}
              className="text-sm font-bold text-stone-800 tracking-tight"
            >
              {title}
            </h3>
          </div>

          <span
            id={`sensor-status-badge-${id}`}
            className={`px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider border ${getBadgeStyle()}`}
          >
            {statusText}
          </span>
        </div>

        {/* Card Main Value & Unit */}
        <div className="my-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <motion.span
              key={String(value)}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              id={`sensor-value-${id}`}
              className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight font-mono"
            >
              {displayValue()}
            </motion.span>
            {unit && (
              <span
                id={`sensor-unit-${id}`}
                className="text-base font-bold text-stone-500 font-sans"
              >
                {unit}
              </span>
            )}
          </div>

          {/* Trend Indicator badge */}
          {trend && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                trend === 'up'
                  ? 'text-amber-700 bg-amber-50'
                  : trend === 'down'
                  ? 'text-sky-700 bg-sky-50'
                  : 'text-stone-500 bg-stone-50'
              }`}
            >
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend === 'stable' && <Minus className="w-3 h-3" />}
              <span>{trend === 'up' ? 'Rising' : trend === 'down' ? 'Falling' : 'Stable'}</span>
            </span>
          )}
        </div>

        {/* Optional Progress visual for percentage / level sensors */}
        {typeof progressPercent === 'number' && !isNaN(progressPercent) && (
          <div className="w-full bg-stone-100 rounded-full h-2.5 mb-2 overflow-hidden border border-stone-200/50 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-1.5 rounded-full ${
                statusType === 'low' || statusType === 'warning'
                  ? 'bg-amber-500'
                  : progressColor
              }`}
            />
          </div>
        )}
      </div>

      {/* Card Footer: Threshold / Info note */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
        <span id={`sensor-threshold-${id}`} className="truncate max-w-[200px]">
          {thresholdNote}
        </span>
        {value === null && (
          <span className="text-amber-600 font-bold text-[11px] flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            No signal
          </span>
        )}
      </div>
    </motion.div>
  );
};
