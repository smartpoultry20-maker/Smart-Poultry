import React, { useState } from 'react';
import { Database, Key, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { saveThingSpeakCredentials } from '../config/thresholds';

interface UnconfiguredViewProps {
  onConfigured: (channelId: string, readApiKey: string) => void;
}

export const UnconfiguredView: React.FC<UnconfiguredViewProps> = ({ onConfigured }) => {
  const [channelId, setChannelId] = useState('');
  const [readApiKey, setReadApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelId.trim()) return;
    saveThingSpeakCredentials(channelId, readApiKey);
    onConfigured(channelId.trim(), readApiKey.trim());
  };

  return (
    <div id="unconfigured-view" className="max-w-2xl mx-auto my-12 px-4">
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs">
          🐔
        </div>

        <h2 className="text-2xl font-black text-stone-900 tracking-tight mb-2">
          ThingSpeak Configuration Required
        </h2>
        <p className="text-sm text-stone-600 mb-6 max-w-md mx-auto">
          Please enter your ThingSpeak Channel ID to connect to the live ESP32 Smart Poultry Farm sensor feed.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="text-left space-y-4 max-w-md mx-auto">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              ThingSpeak Channel ID <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Database className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                placeholder="e.g. 2684921"
                required
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-stone-900"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Can also be defined in <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">.env</code> as <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">VITE_THINGSPEAK_CHANNEL_ID</code>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              ThingSpeak Read API Key <span className="text-stone-400 font-normal">(Optional for public channels)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={readApiKey}
                onChange={(e) => setReadApiKey(e.target.value)}
                placeholder="e.g. 16-character alphanumeric Read Key"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-stone-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-sm mt-2"
          >
            <span>Connect & Start Monitoring</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Architecture Note */}
        <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-center gap-4 text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>ESP32 Wi-Fi Node</span>
          </div>
          <span>→</span>
          <div className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>ThingSpeak REST API</span>
          </div>
          <span>→</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Farm Status Web App</span>
          </div>
        </div>
      </div>
    </div>
  );
};
