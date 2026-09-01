import { FarmSensorData, ThingSpeakChannelInfo } from '../types';

/**
 * Parses raw sensor string/number from ThingSpeak payload safely.
 * Returns null if missing, undefined, NaN, or blank.
 */
function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === '' || str.toLowerCase() === 'nan' || str.toLowerCase() === 'null') {
    return null;
  }
  const num = Number(str);
  return isNaN(num) ? null : num;
}

/**
 * Formats ISO timestamp to human-readable time string for charts & UI
 */
function formatTime(isoString?: string): string {
  if (!isoString) return new Date().toLocaleTimeString();
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return new Date().toLocaleTimeString();
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return new Date().toLocaleTimeString();
  }
}

/**
 * Transforms a raw ThingSpeak feed record into clean FarmSensorData
 */
export function transformFeed(raw: Record<string, unknown>): FarmSensorData {
  const createdAt = typeof raw.created_at === 'string' ? raw.created_at : new Date().toISOString();
  const entryId = typeof raw.entry_id === 'number' ? raw.entry_id : Number(raw.entry_id) || 0;

  return {
    entryId,
    createdAt,
    timestamp: formatTime(createdAt),
    temperature: parseNumber(raw.field1),
    humidity: parseNumber(raw.field2),
    light: parseNumber(raw.field3),
    feedLevel: parseNumber(raw.field4),
    waterLevel: parseNumber(raw.field5),
    farmStatusRaw: parseNumber(raw.field6),
  };
}

/**
 * Fetches the latest reading from ThingSpeak for the sensor cards
 */
export async function getLatestReading(
  channelId: string,
  apiKey: string
): Promise<{ success: boolean; data?: FarmSensorData; error?: string }> {
  if (!channelId) {
    return { success: false, error: 'ThingSpeak Channel ID is required' };
  }

  try {
    let url = `https://api.thingspeak.com/channels/${encodeURIComponent(channelId)}/feeds/last.json`;
    if (apiKey) {
      url += `?api_key=${encodeURIComponent(apiKey)}`;
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Channel not found (404). Verify your Channel ID.' };
      }
      if (response.status === 400 || response.status === 403) {
        return { success: false, error: 'Access denied. Please check your ThingSpeak Read API Key.' };
      }
      return { success: false, error: `ThingSpeak API returned status ${response.status}` };
    }

    const json = await response.json();

    // When ThingSpeak returns -1 or empty object, channel is either empty or key is invalid
    if (json === -1 || json === '-1' || (typeof json === 'object' && Object.keys(json).length === 0)) {
      return { success: false, error: 'No sensor data available in ThingSpeak channel yet.' };
    }

    const data = transformFeed(json);
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network failure contacting ThingSpeak';
    return { success: false, error: `Unable to retrieve farm data: ${message}` };
  }
}

/**
 * Fetches historical readings from ThingSpeak for the analytics charts
 */
export async function getHistoricalReadings(
  channelId: string,
  apiKey: string,
  resultsCount: number = 30
): Promise<{
  success: boolean;
  feeds?: FarmSensorData[];
  channel?: ThingSpeakChannelInfo;
  error?: string;
}> {
  if (!channelId) {
    return { success: false, error: 'ThingSpeak Channel ID is required' };
  }

  try {
    let url = `https://api.thingspeak.com/channels/${encodeURIComponent(channelId)}/feeds.json?results=${resultsCount}`;
    if (apiKey) {
      url += `&api_key=${encodeURIComponent(apiKey)}`;
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Channel not found (404).' };
      }
      if (response.status === 400 || response.status === 403) {
        return { success: false, error: 'Invalid API Key or unauthorized channel.' };
      }
      return { success: false, error: `ThingSpeak API returned status ${response.status}` };
    }

    const json = await response.json();

    if (json === -1 || json === '-1') {
      return { success: false, error: 'Access unauthorized or channel is private. Read API Key required.' };
    }

    if (!json || !Array.isArray(json.feeds)) {
      return { success: false, error: 'Invalid response format received from ThingSpeak.' };
    }

    const feeds: FarmSensorData[] = json.feeds.map((item: Record<string, unknown>) => transformFeed(item));

    return {
      success: true,
      feeds,
      channel: json.channel,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: `Unable to retrieve farm historical data: ${message}` };
  }
}
