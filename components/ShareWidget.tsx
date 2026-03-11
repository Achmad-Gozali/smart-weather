'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Copy, Check, X } from 'lucide-react';
import { WeatherData } from '../lib/mockData';
import { getUVLevel } from '../hooks/useWeather';

interface ShareWidgetProps {
  weatherData: WeatherData | null;
  isCelsius: boolean;
  convert: (temp: number) => number;
}

const ShareWidget: React.FC<ShareWidgetProps> = ({ weatherData, isCelsius, convert }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!weatherData) return null;

  const temp = convert(weatherData.temp);
  const unit = isCelsius ? '°C' : '°F';
  const uvLevel = weatherData.uv_index != null ? getUVLevel(weatherData.uv_index) : null;

  const shareText =
    `🌤️ Cuaca di ${weatherData.city}\n` +
    `🌡️ ${temp}${unit} — ${weatherData.description}\n` +
    `💧 Kelembaban: ${weatherData.humidity}%\n` +
    `💨 Angin: ${weatherData.wind_speed} km/jam\n` +
    (uvLevel ? `☀️ UV: ${weatherData.uv_index} (${uvLevel.label})\n` : '') +
    (weatherData.sunrise ? `🌅 Matahari Terbit: ${weatherData.sunrise}\n` : '') +
    (weatherData.sunset  ? `🌇 Matahari Terbenam: ${weatherData.sunset}\n` : '') +
    `\nvia SkyCast Dashboard`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `Cuaca ${weatherData.city}`, text: shareText });
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-100 text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-100 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Bagikan</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-6 relative">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-base font-black text-slate-900 mb-1">Bagikan Cuaca</h3>
                <p className="text-xs text-slate-400 mb-4">Bagikan kondisi cuaca saat ini</p>

                {/* Kartu Pratinjau */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 mb-4 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold opacity-70 uppercase tracking-widest mb-1">SkyCast</p>
                      <h4 className="text-xl font-black">{weatherData.city}</h4>
                      <p className="text-sm opacity-80 capitalize">{weatherData.description}</p>
                    </div>
                    {weatherData.icon && (
                      <img src={weatherData.icon} alt="" className="w-14 h-14 -mt-1 -mr-1" />
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-black">{temp}{unit}</span>
                    <div className="text-right text-xs opacity-70 space-y-0.5">
                      <p>💧 {weatherData.humidity}%</p>
                      <p>💨 {weatherData.wind_speed} km/jam</p>
                      {weatherData.uv_index != null && <p>☀️ UV {weatherData.uv_index}</p>}
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-sm font-bold text-slate-700 transition-colors border border-slate-100"
                  >
                    {copied ? (
                      <><Check className="w-4 h-4 text-emerald-500" /><span className="text-emerald-500">Tersalin!</span></>
                    ) : (
                      <><Copy className="w-4 h-4" /><span>Salin Teks</span></>
                    )}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNativeShare}
                    className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl text-sm font-bold text-white transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Bagikan</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShareWidget;