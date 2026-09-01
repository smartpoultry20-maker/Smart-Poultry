import { FarmSensorData, ThresholdConfig } from '../types';

/**
 * Exports historical sensor dataset to a clean CSV file
 */
export function exportToCSV(data: FarmSensorData[], channelId: string) {
  if (!data || data.length === 0) return;

  const headers = [
    'Entry ID',
    'Timestamp (ISO)',
    'Local Time',
    'Temperature (°C)',
    'Humidity (%)',
    'Light (lux)',
    'Feed Level (%)',
    'Water Level (%)',
    'Farm Status (Raw)',
  ];

  const rows = data.map((d) => [
    d.entryId,
    `"${d.createdAt}"`,
    `"${d.timestamp}"`,
    d.temperature !== null ? d.temperature : '',
    d.humidity !== null ? d.humidity : '',
    d.light !== null ? d.light : '',
    d.feedLevel !== null ? d.feedLevel : '',
    d.waterLevel !== null ? d.waterLevel : '',
    d.farmStatusRaw !== null ? d.farmStatusRaw : '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `farm_status_channel_${channelId || 'telemetry'}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers clean browser print for a demonstration Inspection Report
 */
export function printFarmReport() {
  window.print();
}
