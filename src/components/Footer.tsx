import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer id="main-footer" className="bg-white border-t border-stone-200 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐔</span>
          <div>
            <p className="text-xs sm:text-sm font-bold text-stone-800">
              Farm Status — Smart Poultry Farm Monitoring System
            </p>
            <p className="text-[11px] text-stone-500 font-medium">
              ESP32 + ThingSpeak IoT Monitoring Architecture
            </p>
          </div>
        </div>

        <div className="text-[11px] text-stone-400 font-mono">
          College Mini-Project Demonstration
        </div>
      </div>
    </footer>
  );
};
