export interface FarmSensorData {
  entryId: number;
  createdAt: string;
  timestamp: string; // formatted time string e.g. "14:23:05"
  temperature: number | null; // Field 1 (°C)
  humidity: number | null;    // Field 2 (%)
  light: number | null;       // Field 3 (lux)
  feedLevel: number | null;   // Field 4 (%)
  waterLevel: number | null;  // Field 5 (%)
  farmStatusRaw: number | null; // Field 6 (0 = NORMAL, 1 = ALERT)
}

export type ConnectionState = 'connected' | 'connecting' | 'offline' | 'unconfigured' | 'simulated';

export interface ThresholdConfig {
  temperatureLimit: number; // e.g. 30°C
  humidityLimit: number;    // e.g. 75%
  feedLowLimit: number;     // e.g. 20%
  waterLowLimit: number;    // e.g. 20%
  refreshInterval: number;  // in milliseconds (e.g. 20000)
}

export interface PoultryComfortAssessment {
  thi: number | null; // Temperature Humidity Index
  level: 'Comfortable' | 'Mild Stress' | 'Severe Stress' | 'Emergency' | 'Unknown';
  color: string;
  advice: string;
}

export interface ActivityMessage {
  id: string;
  type: 'normal' | 'warning' | 'alert' | 'info';
  category: 'Temperature' | 'Humidity' | 'Feed' | 'Water' | 'Light' | 'System';
  message: string;
  timestamp: string;
}

export interface ThingSpeakChannelInfo {
  id: number;
  name: string;
  description?: string;
  latitude?: string;
  longitude?: string;
  created_at?: string;
  updated_at?: string;
  last_entry_id?: number;
}

