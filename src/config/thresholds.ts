/// <reference types="vite/client" />
import { ThresholdConfig, PoultryComfortAssessment, FarmSensorData } from '../types';

/**
 * Centralized Threshold Configuration
 * Easily configurable for college project demonstrations and lab testing.
 */
export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  // Temperature: Below 30°C is NORMAL, 30°C or above is WARNING
  temperatureLimit: 30, // in °C

  // Humidity: Below 75% is NORMAL, 75% or above is WARNING
  humidityLimit: 75, // in %

  // Feed: Above 20% is AVAILABLE, 20% or below is LOW
  feedLowLimit: 20, // in %

  // Water: Above 20% is AVAILABLE, 20% or below is LOW
  waterLowLimit: 20, // in %

  // Polling refresh interval in milliseconds (20 seconds default)
  refreshInterval: 20000,
};

/**
 * Historical Chart fetch options
 */
export const HISTORY_OPTIONS = [
  { label: 'Last 20 readings', value: 20 },
  { label: 'Last 50 readings', value: 50 },
  { label: 'Last 100 readings', value: 100 },
] as const;

/**
 * Calculate Poultry Temperature-Humidity Index (THI) and Heat Stress
 * THI = 0.8 * T + (RH/100) * (T - 14.4) + 46.4
 * Standard agricultural bio-meteorological formula for poultry welfare.
 */
export function calculatePoultryTHI(temperature: number | null, humidity: number | null): PoultryComfortAssessment {
  if (temperature === null || humidity === null || isNaN(temperature) || isNaN(humidity)) {
    return {
      thi: null,
      level: 'Unknown',
      color: 'text-stone-400',
      advice: 'Awaiting temperature & humidity data to compute flock comfort.',
    };
  }

  const thi = 0.8 * temperature + (humidity / 100) * (temperature - 14.4) + 46.4;
  const roundedTHI = Math.round(thi * 10) / 10;

  if (roundedTHI < 70) {
    return {
      thi: roundedTHI,
      level: 'Comfortable',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      advice: 'Optimal thermal comfort for broilers and layers. Growth rate unaffected.',
    };
  } else if (roundedTHI < 76) {
    return {
      thi: roundedTHI,
      level: 'Mild Stress',
      color: 'text-amber-800 bg-amber-50 border-amber-200',
      advice: 'Mild heat strain. Ensure continuous ventilation fans and fresh cool water.',
    };
  } else if (roundedTHI < 82) {
    return {
      thi: roundedTHI,
      level: 'Severe Stress',
      color: 'text-orange-800 bg-orange-50 border-orange-200',
      advice: 'High heat stress! Activate evaporative cooling pads and misting systems immediately.',
    };
  } else {
    return {
      thi: roundedTHI,
      level: 'Emergency',
      color: 'text-rose-800 bg-rose-50 border-rose-200',
      advice: 'Critical emergency! Extreme mortality risk from heat prostration. Maximum airflow required.',
    };
  }
}

/**
 * Generate simulated realistic ESP32 poultry readings for demonstration/viva mode
 */
export function generateSimulatedTelemetry(baseEntryId = 100, triggerAlert = false): FarmSensorData {
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  if (triggerAlert) {
    // Deliberate warning values to demo the alert system in college
    return {
      entryId: baseEntryId + 1,
      createdAt: now.toISOString(),
      timestamp: timeFormatted,
      temperature: 32.4 + (Math.random() * 0.8 - 0.4),
      humidity: 82 + Math.round(Math.random() * 4),
      light: 410 + Math.round(Math.random() * 20),
      feedLevel: 14 + Math.round(Math.random() * 3), // Low feed
      waterLevel: 12 + Math.round(Math.random() * 3), // Low water
      farmStatusRaw: 1,
    };
  }

  // Normal realistic farm readings
  return {
    entryId: baseEntryId + 1,
    createdAt: now.toISOString(),
    timestamp: timeFormatted,
    temperature: +(27.2 + Math.random() * 1.6).toFixed(1),
    humidity: 62 + Math.round(Math.random() * 6),
    light: 340 + Math.round(Math.random() * 30),
    feedLevel: 76 + Math.round(Math.random() * 8),
    waterLevel: 84 + Math.round(Math.random() * 6),
    farmStatusRaw: 0,
  };
}

/**
 * Storage keys for runtime configuration in browser
 */
const STORAGE_CHANNEL_ID_KEY = 'farm_status_channel_id';
const STORAGE_READ_KEY_KEY = 'farm_status_read_key';
const STORAGE_THRESHOLDS_KEY = 'farm_status_custom_thresholds';

/**
 * Retrieves the configured ThingSpeak credentials.
 */
export function getThingSpeakCredentials(): { channelId: string; readApiKey: string } {
  let envChannel = '';
  let envKey = '';
  try {
    envChannel = import.meta.env.VITE_THINGSPEAK_CHANNEL_ID || '';
    envKey = import.meta.env.VITE_THINGSPEAK_READ_API_KEY || '';
  } catch {
    // ignore env access errors in special environments
  }

  let storedChannel: string | null = null;
  let storedKey: string | null = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      storedChannel = localStorage.getItem(STORAGE_CHANNEL_ID_KEY);
      storedKey = localStorage.getItem(STORAGE_READ_KEY_KEY);
    }
  } catch {
    // localStorage might be unavailable or restricted (e.g. in sandboxed iframes)
  }

  return {
    channelId: (storedChannel !== null ? storedChannel : envChannel).trim(),
    readApiKey: (storedKey !== null ? storedKey : envKey).trim(),
  };
}

/**
 * Saves custom ThingSpeak credentials to localStorage for runtime demo flexibility
 */
export function saveThingSpeakCredentials(channelId: string, readApiKey: string) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (channelId.trim()) {
        localStorage.setItem(STORAGE_CHANNEL_ID_KEY, channelId.trim());
      } else {
        localStorage.removeItem(STORAGE_CHANNEL_ID_KEY);
      }

      if (readApiKey.trim()) {
        localStorage.setItem(STORAGE_READ_KEY_KEY, readApiKey.trim());
      } else {
        localStorage.removeItem(STORAGE_READ_KEY_KEY);
      }
    }
  } catch {
    // Gracefully handle storage errors
  }
}

/**
 * Load customized thresholds if set in localStorage
 */
export function getStoredThresholds(): ThresholdConfig {
  if (typeof window === 'undefined') return DEFAULT_THRESHOLDS;
  try {
    if (!window.localStorage) return DEFAULT_THRESHOLDS;
    const raw = localStorage.getItem(STORAGE_THRESHOLDS_KEY);
    if (!raw) return DEFAULT_THRESHOLDS;
    const parsed = JSON.parse(raw);
    return {
      temperatureLimit: Number(parsed.temperatureLimit) || DEFAULT_THRESHOLDS.temperatureLimit,
      humidityLimit: Number(parsed.humidityLimit) || DEFAULT_THRESHOLDS.humidityLimit,
      feedLowLimit: Number(parsed.feedLowLimit) || DEFAULT_THRESHOLDS.feedLowLimit,
      waterLowLimit: Number(parsed.waterLowLimit) || DEFAULT_THRESHOLDS.waterLowLimit,
      refreshInterval: Number(parsed.refreshInterval) || DEFAULT_THRESHOLDS.refreshInterval,
    };
  } catch {
    return DEFAULT_THRESHOLDS;
  }
}

/**
 * Save customized thresholds
 */
export function saveStoredThresholds(config: ThresholdConfig) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_THRESHOLDS_KEY, JSON.stringify(config));
    }
  } catch {
    // Gracefully ignore storage failures
  }
}

