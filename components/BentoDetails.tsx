'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import BentoCard from './BentoCard';
import { WeatherMetric, AQIData } from '../lib/mockData';
import { getUVLevel } from '../hooks/useWeather';

interface BentoDetailsProps {
  metrics: WeatherMetric[];
  isCelsius: boolean;
  convert: (temp: number) => number;
  aqiData?: AQIData;
  compact?: boolean;
  gridCols?: 2 | 4;
}

const AQI_LEVELS = [
  { label: 'Baik',         color: 'bg-emerald-500', text: 'text-emerald-400', desc: 'Sehat'            },
  { label: 'Sedang',       color: 'bg-lime-500',    text: 'text-lime-400',    desc: 'Dapat Diterima'   },
  { label: 'Tidak Sehat',  color: 'bg-yellow-500',  text: 'text-yellow-400',  desc: 'Cukup Berbahaya'  },
  { label: 'Buruk',        color: 'bg-orange-500',  text: 'text-orange-400',  desc: 'Tidak Sehat'      },
  { label: 'Sangat Buruk', color: 'bg-rose-500',    text: 'text-rose-400',    desc: 'Sangat Berbahaya' },
];

const labelMap: Record<string, string> = {
  'Humidity':   'Kelembaban',
  'Wind':       'Kecepatan Angin',
  'Feels Like': 'Terasa Seperti',
  'Visibility': 'Jarak Pandang',
};

const AnimatedTemp = ({ value, unit, className = "" }: { value: number; unit: string; className?: string }) => (
  <AnimatePresence mode="wait">
    <motion.span key={`${value}-${unit}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className={className}>
      {value}
    </motion.span>
  </AnimatePresence>
);

const BentoDetails: React.FC<BentoDetailsProps> = ({ metrics, isCelsius, convert, aqiData, compact = false, gridCols = 2 }) => {
  const currentAQI = aqiData?.aqi ?? 1;
  const aqiInfo = AQI_LEVELS[Math.min(currentAQI - 1, 4)];

  const colClass = gridCols === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2';

  return (
    <div className={`grid ${colClass} gap-4`}>
      {metrics.map((metric, idx) => {

        // ── Kualitas Udara ──────────────────────────────────────────────────
        if (metric.label === 'Air Quality' && aqiData) {
          return (
            <BentoCard key={idx} className="p-5 flex flex-col justify-between group" delay={0.4 + idx * 0.05}>
              <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform inline-flex mb-3 ${metric.color}`}>
                <div className="w-4 h-4 flex items-center justify-center">{metric.icon}</div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Kualitas Udara</p>
                <p className={`text-lg font-black mb-0.5 ${aqiInfo.text}`}>{aqiInfo.label}</p>
                <p className="text-[10px] font-bold text-white/40 mb-1.5">AQI {currentAQI} / 5</p>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(currentAQI / 5) * 100}%` }} transition={{ duration: 1 }} className={`h-full ${aqiInfo.color}`} />
                </div>
                <p className="text-[9px] font-medium text-white/30">{aqiInfo.desc}</p>
              </div>
            </BentoCard>
          );
        }

        // ── Indeks UV ───────────────────────────────────────────────────────
        if (metric.label === 'UV Index') {
          const uvRaw = metric.value;
          const uvNum = typeof uvRaw === 'number' ? uvRaw : null;
          const uvLevel = uvNum != null ? getUVLevel(uvNum) : null;
          const uvPct = uvNum != null ? Math.min((uvNum / 11) * 100, 100) : 0;
          return (
            <BentoCard key={idx} className="p-5 flex flex-col justify-between group" delay={0.4 + idx * 0.05}>
              <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform inline-flex mb-3 ${metric.color}`}>
                <div className="w-4 h-4 flex items-center justify-center">{metric.icon}</div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Indeks UV</p>
                {uvNum != null && uvLevel ? (
                  <>
                    <p className={`text-lg font-black mb-0.5 ${uvLevel.color}`}>{uvLevel.label}</p>
                    <p className="text-[10px] font-bold text-white/40 mb-1.5">UV {uvNum} / 11</p>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${uvPct}%` }} transition={{ duration: 1 }} className="h-full bg-orange-400 rounded-full" />
                    </div>
                  </>
                ) : (
                  <p className="text-lg font-black text-white/30 mb-1">N/A</p>
                )}
                <p className="text-[9px] font-medium text-white/30">{metric.sub}</p>
              </div>
            </BentoCard>
          );
        }

        // ── Matahari Terbit / Terbenam ──────────────────────────────────────
        if (metric.label === 'Sunrise' || metric.label === 'Sunset') {
          return (
            <BentoCard key={idx} className="p-5 flex flex-col justify-between group" delay={0.4 + idx * 0.05}>
              <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform inline-flex mb-3 ${metric.color}`}>
                <div className="w-4 h-4 flex items-center justify-center">{metric.icon}</div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">
                  {metric.label === 'Sunrise' ? 'Matahari Terbit' : 'Matahari Terbenam'}
                </p>
                <p className="text-lg font-black text-white mb-1">
                  {metric.value !== 'N/A' && metric.value ? String(metric.value) : '—'}
                </p>
                <p className="text-[9px] font-medium text-white/30">{metric.sub}</p>
              </div>
            </BentoCard>
          );
        }

        // ── Default ─────────────────────────────────────────────────────────
        return (
          <BentoCard key={idx} className="p-5 flex flex-col justify-between group" delay={0.4 + idx * 0.05}>
            <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform inline-flex mb-3 ${metric.color}`}>
              <div className="w-4 h-4 flex items-center justify-center">{metric.icon}</div>
            </div>
            <div>
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">
                {labelMap[metric.label] ?? metric.label}
              </p>
              <p className="text-lg font-black text-white mb-1">
                {metric.label === 'Feels Like' ? (
                  <><AnimatedTemp value={convert(typeof metric.value === 'number' ? metric.value : 26)} unit="" />°</>
                ) : metric.value}
              </p>
              <p className="text-[9px] font-medium text-white/30 leading-tight">{metric.sub}</p>
            </div>
          </BentoCard>
        );
      })}
    </div>
  );
};

export default BentoDetails;