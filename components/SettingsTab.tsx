'use client';

import React from 'react';
import { motion } from 'motion/react';

interface SettingsTabProps {
  isCelsius: boolean;
  setIsCelsius: (v: boolean) => void;
  searchHistory: string[];
  clearHistory: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  isCelsius,
  setIsCelsius,
  searchHistory,
  clearHistory,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-lg mx-auto mt-8 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100"
  >
    <h2 className="text-xl font-black text-slate-900 mb-8">Settings</h2>
    <div className="space-y-6">
      {/* Temperature Unit */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-900 text-sm">Temperature Unit</p>
          <p className="text-xs text-slate-400 mt-1">Switch between Celsius and Fahrenheit</p>
        </div>
        <button
          onClick={() => setIsCelsius(!isCelsius)}
          className="bg-blue-50 px-4 py-2 rounded-xl font-bold text-blue-600 text-sm border border-blue-100 hover:bg-blue-100 transition-colors"
        >
          Currently: {isCelsius ? '°C' : '°F'}
        </button>
      </div>

      {/* Search History */}
      <div className="border-t border-slate-100 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900 text-sm">Search History</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchHistory.length} recent searches saved
            </p>
          </div>
          <button
            onClick={clearHistory}
            className="bg-rose-50 px-4 py-2 rounded-xl font-bold text-rose-500 text-sm border border-rose-100 hover:bg-rose-100 transition-colors"
          >
            Clear All
          </button>
        </div>
        {searchHistory.length > 0 && (
          <ul className="mt-4 space-y-2">
            {searchHistory.map((city, i) => (
              <li key={i} className="text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-xl font-medium">
                {city}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </motion.div>
);

export default SettingsTab;