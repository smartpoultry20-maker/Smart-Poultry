import React from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { FarmSensorData } from '../types';

interface SensorChartProps {
  id: string;
  title: string;
  data: FarmSensorData[];
  dataKey: keyof FarmSensorData;
  unit: string;
  color: string; // Tailwind hex or rgb code e.g. '#059669'
  gradientId: string;
  yDomain?: [number | 'auto' | 'dataMin', number | 'auto' | 'dataMax'];
  threshold?: number;
  thresholdLabel?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string;
  unit: string;
  title: string;
}

// Custom tooltip renderer
const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  unit,
  title,
}) => {
  if (active && payload && payload.length) {
    const rawVal = payload[0]?.value;
    const formattedVal = typeof rawVal === 'number' ? rawVal.toFixed(1) : rawVal;

    return (
      <div className="bg-stone-900/95 text-white p-2.5 rounded-xl text-xs shadow-lg border border-stone-700">
        <p className="text-stone-400 font-mono text-[11px] mb-1">Time: {label}</p>
        <p className="font-bold flex items-center gap-1.5">
          <span className="text-stone-300">{title}:</span>
          <span className="text-emerald-400 font-mono text-sm">{formattedVal} {unit}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const SensorChart: React.FC<SensorChartProps> = ({
  id,
  title,
  data,
  dataKey,
  unit,
  color,
  gradientId,
  yDomain = ['auto', 'auto'],
  threshold,
  thresholdLabel,
}) => {
  // Filter only entries that have valid numeric values for this dataKey
  const validData = data
    .filter((d) => typeof d[dataKey] === 'number' && !isNaN(d[dataKey] as number))
    .map((d) => ({
      timestamp: d.timestamp,
      [dataKey]: d[dataKey],
    }));

  const latestVal = validData.length > 0 ? (validData[validData.length - 1][dataKey] as number) : null;
  const minVal = validData.length > 0 ? Math.min(...validData.map((d) => d[dataKey] as number)) : null;
  const maxVal = validData.length > 0 ? Math.max(...validData.map((d) => d[dataKey] as number)) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      id={`chart-container-${id}`}
      className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all"
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 id={`chart-title-${id}`} className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <span>{title}</span>
            {threshold !== undefined && thresholdLabel && (
              <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                {thresholdLabel}
              </span>
            )}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">Historical trend across recent readings</p>
        </div>

        {/* Quick Min / Max / Current Pill */}
        {latestVal !== null && (
          <div className="flex items-center gap-2.5 text-xs bg-stone-50 px-2.5 py-1 rounded-xl border border-stone-200">
            <span className="text-stone-500">
              Min: <strong className="text-stone-800 font-mono">{minVal?.toFixed(1)}</strong>
            </span>
            <span className="text-stone-300">|</span>
            <span className="text-stone-500">
              Max: <strong className="text-stone-800 font-mono">{maxVal?.toFixed(1)}</strong>
            </span>
            <span className="text-stone-300">|</span>
            <span className="text-stone-700 font-semibold">
              Now: <strong className="text-emerald-700 font-mono">{latestVal.toFixed(1)}{unit}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="h-56 sm:h-64 w-full">
        {validData.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-stone-400 text-xs border border-dashed border-stone-200 rounded-xl bg-stone-50">
            <p>No historical data recorded yet.</p>
            <p className="text-[11px] text-stone-400 mt-1">Readings will plot as ESP32 sends feeds.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={validData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 11, fill: '#78716c' }}
                axisLine={{ stroke: '#e7e5e4' }}
                tickLine={false}
                minTickGap={25}
              />

              <YAxis
                domain={yDomain}
                unit={unit}
                tick={{ fontSize: 11, fill: '#78716c' }}
                axisLine={false}
                tickLine={false}
                width={45}
              />

              <Tooltip
                content={(props) => (
                  <CustomTooltip
                    active={props.active}
                    payload={props.payload as unknown as Array<{ value?: number | string }>}
                    label={typeof props.label === 'string' || typeof props.label === 'number' ? String(props.label) : undefined}
                    unit={unit}
                    title={title}
                  />
                )}
              />

              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                dot={validData.length <= 25 ? { r: 3, fill: color, strokeWidth: 1, stroke: '#fff' } : false}
                activeDot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 2 }}
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};
