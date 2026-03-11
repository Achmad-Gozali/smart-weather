'use client';

import React from 'react';
import { motion } from 'motion/react';

interface SettingsTabProps {
  isCelsius: boolean;
  setIsCelsius: (v: boolean) => void;
  searchHistory: string[];
  clearHistory: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ isCelsius, setIsCelsius, searchHistory, clearHistory }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="max-w-lg mx-auto mt-8 bg-slate-800/70 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/10 text-white">
    <h2 className="text-xl font-black text-white mb-8">Pengaturan</h2>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-white text-sm">Satuan Suhu</p>
          <p className="text-xs text-white/40 mt-1">Ganti antara Celsius dan Fahrenheit</p>
        </div>
        <button onClick={() => setIsCelsius(!isCelsius)}
          className="bg-blue-500/20 px-4 py-2 rounded-xl font-bold text-blue-400 text-sm border border-blue-400/20 hover:bg-blue-500/30 transition-colors">
          Sekarang: {isCelsius ? '°C' : '°F'}
        </button>
      </div>
      <div className="border-t border-white/10 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white text-sm">Riwayat Pencarian</p>
            <p className="text-xs text-white/40 mt-1">{searchHistory.length} pencarian tersimpan</p>
          </div>
          <button onClick={clearHistory}
            className="bg-rose-500/20 px-4 py-2 rounded-xl font-bold text-rose-400 text-sm border border-rose-400/20 hover:bg-rose-500/30 transition-colors">
            Hapus Semua
          </button>
        </div>
        {searchHistory.length > 0 && (
          <ul className="mt-4 space-y-2">
            {searchHistory.map((city, i) => (
              <li key={i} className="text-sm text-white/70 bg-white/10 px-4 py-2 rounded-xl font-medium">{city}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </motion.div>
);

export default SettingsTab;