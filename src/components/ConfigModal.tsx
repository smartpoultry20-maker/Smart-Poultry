import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, Database, HelpCircle, Check, Info, Sliders, Cpu, RotateCcw, Shield } from 'lucide-react';
import { ThresholdConfig } from '../types';
import { saveThingSpeakCredentials, saveStoredThresholds, DEFAULT_THRESHOLDS } from '../config/thresholds';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentChannelId: string;
  currentReadApiKey: string;
  currentThresholds: ThresholdConfig;
  onSave: (channelId: string, readApiKey: string, thresholds: ThresholdConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  currentChannelId,
  currentReadApiKey,
  currentThresholds,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'architecture'>('settings');
  const [channelId, setChannelId] = useState(currentChannelId);
  const [readApiKey, setReadApiKey] = useState(currentReadApiKey);
  const [tempLimit, setTempLimit] = useState(currentThresholds.temperatureLimit);
  const [humLimit, setHumLimit] = useState(currentThresholds.humidityLimit);
  const [feedLimit, setFeedLimit] = useState(currentThresholds.feedLowLimit);
  const [waterLimit, setWaterLimit] = useState(currentThresholds.waterLowLimit);
  const [refreshInterval, setRefreshInterval] = useState(currentThresholds.refreshInterval / 1000);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleResetDefaults = () => {
    setTempLimit(DEFAULT_THRESHOLDS.temperatureLimit);
    setHumLimit(DEFAULT_THRESHOLDS.humidityLimit);
    setFeedLimit(DEFAULT_THRESHOLDS.feedLowLimit);
    setWaterLimit(DEFAULT_THRESHOLDS.waterLowLimit);
    setRefreshInterval(DEFAULT_THRESHOLDS.refreshInterval / 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedThresholds: ThresholdConfig = {
      temperatureLimit: Number(tempLimit) || 30,
      humidityLimit: Number(humLimit) || 75,
      feedLowLimit: Number(feedLimit) || 20,
      waterLowLimit: Number(waterLimit) || 20,
      refreshInterval: (Number(refreshInterval) || 20) * 1000,
    };

    saveThingSpeakCredentials(channelId, readApiKey);
    saveStoredThresholds(updatedThresholds);
    onSave(channelId.trim(), readApiKey.trim(), updatedThresholds);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-stone-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚙️</span>
            <div>
              <h3 className="text-base font-bold text-stone-900">Farm System Configuration</h3>
              <p className="text-xs text-stone-500">ThingSpeak credentials, safety limits, & hardware guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-stone-200 gap-2 bg-stone-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Credentials & Limits</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>ESP32 Hardware Guide</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'settings' ? (
            <form id="config-form" onSubmit={handleSubmit} className="space-y-5">
              {/* ThingSpeak API Credentials */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ThingSpeak IoT Feed</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Channel ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    placeholder="e.g. 2684921"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-stone-900"
                    required
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Found on your ThingSpeak channel overview header.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Read API Key <span className="text-stone-400 font-normal">(Optional if channel is Public)</span>
                  </label>
                  <input
                    type="password"
                    value={readApiKey}
                    onChange={(e) => setReadApiKey(e.target.value)}
                    placeholder="16-character alphanumeric Read Key"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-stone-900"
                  />
                </div>
              </div>

              {/* Poultry Safety Thresholds */}
              <div className="pt-4 border-t border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Safety Thresholds & Rules</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Standards</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Max Temperature Limit (°C)
                    </label>
                    <input
                      type="number"
                      value={tempLimit}
                      onChange={(e) => setTempLimit(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-xl font-mono"
                    />
                    <span className="text-[10px] text-stone-400">Triggers alert if ≥ {tempLimit}°C</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Max Humidity Limit (%)
                    </label>
                    <input
                      type="number"
                      value={humLimit}
                      onChange={(e) => setHumLimit(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-xl font-mono"
                    />
                    <span className="text-[10px] text-stone-400">Triggers alert if ≥ {humLimit}%</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Low Feed Threshold (%)
                    </label>
                    <input
                      type="number"
                      value={feedLimit}
                      onChange={(e) => setFeedLimit(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-xl font-mono"
                    />
                    <span className="text-[10px] text-stone-400">Triggers alert if ≤ {feedLimit}%</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Low Water Threshold (%)
                    </label>
                    <input
                      type="number"
                      value={waterLimit}
                      onChange={(e) => setWaterLimit(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-xl font-mono"
                    />
                    <span className="text-[10px] text-stone-400">Triggers alert if ≤ {waterLimit}%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Auto-Refresh Polling Interval (Seconds)
                  </label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-xl font-mono bg-white"
                  >
                    <option value={15}>15 Seconds (ThingSpeak standard limit)</option>
                    <option value={20}>20 Seconds (Recommended)</option>
                    <option value={30}>30 Seconds</option>
                    <option value={60}>60 Seconds</option>
                  </select>
                </div>
              </div>
            </form>
          ) : (
            /* Architecture & Hardware Guide Tab */
            <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <h4 className="font-black text-emerald-900 text-sm mb-1">
                  📡 Smart Poultry Farm System Pipeline
                </h4>
                <p className="text-emerald-800">
                  ESP32 Microcontroller → Wi-Fi HTTP Post → ThingSpeak Cloud Channel → Farm Status Frontend Application.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                  Hardware Sensor Integration Scheme:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                    <strong className="text-emerald-700 block">Field 1: Temperature</strong>
                    <span>DHT11 / DHT22 Sensor (GPIO 4)</span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                    <strong className="text-sky-700 block">Field 2: Humidity</strong>
                    <span>DHT11 / DHT22 Sensor (GPIO 4)</span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                    <strong className="text-amber-700 block">Field 3: Light Intensity</strong>
                    <span>LDR + 10k Divider (ADC GPIO 34)</span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                    <strong className="text-orange-700 block">Field 4: Feed Level</strong>
                    <span>HC-SR04 Ultrasonic Sensor (Trig/Echo)</span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                    <strong className="text-blue-700 block">Field 5: Water Level</strong>
                    <span>Submersible Float / Capacitive (GPIO 35)</span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                    <strong className="text-rose-700 block">Field 6: Farm Status</strong>
                    <span>0 = Normal, 1 = Alarm Trip</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200/70 rounded-xl border border-stone-300 cursor-pointer"
          >
            Close
          </button>
          {activeTab === 'settings' && (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
