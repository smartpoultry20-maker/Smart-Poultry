import React from 'react';
import { motion } from 'motion/react';
import { ThermometerSun, Info, ShieldAlert, Sparkles, Wind } from 'lucide-react';
import { calculatePoultryTHI } from '../config/thresholds';

interface PoultryComfortCardProps {
  temperature: number | null;
  humidity: number | null;
}

export const PoultryComfortCard: React.FC<PoultryComfortCardProps> = ({
  temperature,
  humidity,
}) => {
  const assessment = calculatePoultryTHI(temperature, humidity);

  // Position on gauge from 60 to 90 THI
  const clampedTHI = assessment.thi !== null ? Math.min(90, Math.max(60, assessment.thi)) : 65;
  const gaugePercent = ((clampedTHI - 60) / (90 - 60)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      id="poultry-comfort-widget"
      className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 mb-8 shadow-xs hover:shadow-sm transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Info */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <ThermometerSun className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight">
              Flock Heat Stress & Comfort Index (THI)
            </h3>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Bio-Meteorology Standard
            </span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            Evaluates poultry thermal welfare combining real-time Temperature ({temperature !== null ? `${temperature}°C` : '--'}) and Relative Humidity ({humidity !== null ? `${humidity}%` : '--'}).
          </p>
        </div>

        {/* Right Gauge & Assessment Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200/80">
          <div className="text-center sm:text-left min-w-[130px]">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-0.5">
              Current THI
            </div>
            <div className="text-3xl font-black font-mono text-stone-900 tracking-tight flex items-baseline gap-1">
              <span>{assessment.thi !== null ? assessment.thi : '--'}</span>
              <span className="text-xs font-medium text-stone-400 font-sans">Index</span>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-stone-700">Flock Welfare:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide border ${assessment.color}`}>
                {assessment.level}
              </span>
            </div>

            {/* Visual Color Spectrum Bar */}
            <div className="relative w-full h-2.5 rounded-full bg-stone-200 overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full"
              />
              {/* Pointer Marker */}
              {assessment.thi !== null && (
                <motion.div
                  initial={{ left: '0%' }}
                  animate={{ left: `${gaugePercent}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                  className="absolute top-0 bottom-0 w-2.5 bg-stone-900 border-2 border-white rounded-full shadow-md -translate-x-1/2"
                />
              )}
            </div>

            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>&lt;70 Optimal</span>
              <span>76-82 Stress</span>
              <span>&gt;82 Danger</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Actionable Guidance */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-start gap-2 text-xs text-stone-600">
        <Wind className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="font-medium">
          <strong className="text-stone-800 font-semibold">Agronomic Advice: </strong>
          {assessment.advice}
        </p>
      </div>
    </motion.div>
  );
};
