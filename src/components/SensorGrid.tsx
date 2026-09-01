import React from 'react';
import { motion } from 'motion/react';
import { FarmSensorData, ThresholdConfig } from '../types';
import { SensorCard } from './SensorCard';

interface SensorGridProps {
  data: FarmSensorData | null;
  previousData?: FarmSensorData | null;
  thresholds: ThresholdConfig;
}

export const SensorGrid: React.FC<SensorGridProps> = ({ data, previousData, thresholds }) => {
  // Helper to compute trends between current and previous telemetry
  const computeTrend = (curr: number | null, prev: number | null | undefined): 'up' | 'down' | 'stable' | null => {
    if (curr === null || prev === null || prev === undefined) return null;
    const diff = curr - prev;
    if (Math.abs(diff) < 0.1) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  // Temperature evaluation
  const temp = data?.temperature ?? null;
  const prevTemp = previousData?.temperature ?? null;
  const isTempWarning = temp !== null && temp >= thresholds.temperatureLimit;
  const tempStatusText = temp === null ? 'NO DATA' : isTempWarning ? 'WARNING' : 'NORMAL';
  const tempStatusType = temp === null ? 'info' : isTempWarning ? 'warning' : 'normal';
  const tempTrend = computeTrend(temp, prevTemp);

  // Humidity evaluation
  const humidity = data?.humidity ?? null;
  const prevHumidity = previousData?.humidity ?? null;
  const isHumidityWarning = humidity !== null && humidity >= thresholds.humidityLimit;
  const humidityStatusText = humidity === null ? 'NO DATA' : isHumidityWarning ? 'WARNING' : 'NORMAL';
  const humidityStatusType = humidity === null ? 'info' : isHumidityWarning ? 'warning' : 'normal';
  const humidityTrend = computeTrend(humidity, prevHumidity);

  // Light evaluation
  const light = data?.light ?? null;
  const prevLight = previousData?.light ?? null;
  const lightStatusText = light === null ? 'NO DATA' : 'NORMAL';
  const lightStatusType = light === null ? 'info' : 'normal';
  const lightTrend = computeTrend(light, prevLight);

  // Feed evaluation
  const feed = data?.feedLevel ?? null;
  const prevFeed = previousData?.feedLevel ?? null;
  const isFeedLow = feed !== null && feed <= thresholds.feedLowLimit;
  const feedStatusText = feed === null ? 'NO DATA' : isFeedLow ? 'LOW' : 'AVAILABLE';
  const feedStatusType = feed === null ? 'info' : isFeedLow ? 'low' : 'normal';
  const feedTrend = computeTrend(feed, prevFeed);

  // Water evaluation
  const water = data?.waterLevel ?? null;
  const prevWater = previousData?.waterLevel ?? null;
  const isWaterLow = water !== null && water <= thresholds.waterLowLimit;
  const waterStatusText = water === null ? 'NO DATA' : isWaterLow ? 'LOW' : 'AVAILABLE';
  const waterStatusType = water === null ? 'info' : isWaterLow ? 'low' : 'normal';
  const waterTrend = computeTrend(water, prevWater);

  // Overall Farm Status evaluation (Field 6 or individual sensor violations)
  const isField6Alert = data?.farmStatusRaw === 1;
  const isFarmAlert = isField6Alert || isTempWarning || isHumidityWarning || isFeedLow || isWaterLow;
  const farmStatusValue = data === null ? 'NO DATA' : isFarmAlert ? 'ALERT' : 'NORMAL';
  const farmStatusBadge = data === null ? 'NO DATA' : isFarmAlert ? 'ALERT' : 'NORMAL';
  const farmStatusType = data === null ? 'info' : isFarmAlert ? 'alert' : 'normal';

  return (
    <section id="sensor-grid-section" className="mb-8 scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 id="sensor-grid-heading" className="text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>Live Sensor Readings</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
              6 Channels
            </span>
          </h2>
          <p className="text-xs text-stone-500 font-medium">Real-time parameters received from ESP32</p>
        </div>
      </div>

      <div
        id="sensor-cards-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
      >
        {/* 1. Temperature Card */}
        <SensorCard
          id="temperature"
          icon="🌡️"
          title="Temperature"
          value={temp}
          unit="°C"
          statusText={tempStatusText}
          statusType={tempStatusType}
          thresholdNote={`Threshold: < ${thresholds.temperatureLimit}°C`}
          trend={tempTrend}
          index={0}
        />

        {/* 2. Humidity Card */}
        <SensorCard
          id="humidity"
          icon="💧"
          title="Humidity"
          value={humidity}
          unit="%"
          statusText={humidityStatusText}
          statusType={humidityStatusType}
          thresholdNote={`Threshold: < ${thresholds.humidityLimit}%`}
          progressPercent={humidity}
          progressColor="bg-sky-500"
          trend={humidityTrend}
          index={1}
        />

        {/* 3. Light Intensity Card */}
        <SensorCard
          id="light"
          icon="☀️"
          title="Light Intensity"
          value={light}
          unit="lux"
          statusText={lightStatusText}
          statusType={lightStatusType}
          thresholdNote="Ambient illumination"
          trend={lightTrend}
          index={2}
        />

        {/* 4. Feed Level Card */}
        <SensorCard
          id="feed"
          icon="🌾"
          title="Feed Level"
          value={feed}
          unit="%"
          statusText={feedStatusText}
          statusType={feedStatusType}
          thresholdNote={`Threshold: > ${thresholds.feedLowLimit}%`}
          progressPercent={feed}
          progressColor="bg-amber-500"
          trend={feedTrend}
          index={3}
        />

        {/* 5. Water Level Card */}
        <SensorCard
          id="water"
          icon="🚰"
          title="Water Level"
          value={water}
          unit="%"
          statusText={waterStatusText}
          statusType={waterStatusType}
          thresholdNote={`Threshold: > ${thresholds.waterLowLimit}%`}
          progressPercent={water}
          progressColor="bg-blue-500"
          trend={waterTrend}
          index={4}
        />

        {/* 6. Farm Status Raw / Combined State Card */}
        <SensorCard
          id="overall-status"
          icon="📊"
          title="Farm Status State"
          value={farmStatusValue}
          statusText={farmStatusBadge}
          statusType={farmStatusType}
          thresholdNote="Field 6 / Combined Monitor"
          index={5}
        />
      </div>
    </section>
  );
};
