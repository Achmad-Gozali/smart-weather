'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Wind } from 'lucide-react';
import { ForecastHour } from '../lib/mockData';

interface HourlyForecastProps {
  data: ForecastHour[];
  isCelsius: boolean;
  convert: (t: number) => number;
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ data, isCelsius, convert }) => {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5">
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {data.map((h, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            className={`flex flex-col items-center gap-2.5 shrink-0 rounded-2xl px-4 py-3.5 min-w-[72px] transition-all cursor-default ${
              i === 0 ? 'bg-white/15 border border-white/20' : hov === i ? 'bg-white/12' : 'bg-white/10'
            }`}
          >
            <span className={`text-[10px] font-black uppercase tracking-wide ${i === 0 ? 'text-white' : 'text-white/40'}`}>
              {h.time}
            </span>
            <div className="w-8 h-8 flex items-center justify-center">{h.icon}</div>
            <span className={`text-base font-black ${i === 0 ? 'text-white' : 'text-white/70'}`}>
              {convert(h.temp)}°
            </span>

            {/* Mini stats on hover */}
            <AnimatePresence>
              {hov === i && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col items-center gap-1 overflow-hidden">
                  {h.humidity != null && (
                    <div className="flex items-center gap-1">
                      <Droplets className="w-2.5 h-2.5 text-blue-400" />
                      <span className="text-[9px] text-white/40 font-bold">{h.humidity}%</span>
                    </div>
                  )}
                  {h.wind_speed != null && (
                    <div className="flex items-center gap-1">
                      <Wind className="w-2.5 h-2.5 text-white/50" />
                      <span className="text-[9px] text-white/40 font-bold">{h.wind_speed}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HourlyForecast;