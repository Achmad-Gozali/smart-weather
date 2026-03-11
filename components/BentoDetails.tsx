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
}

const AQI_LEVELS = [
  { label: 'Good',      color: 'bg-emerald-500', text: 'text-emerald-500', desc: 'Healthy' },
  { label: 'Fair',      color: 'bg-lime-500',    text: 'text-lime-500',    desc: 'Acceptable' },
  { label: 'Moderate',  color: 'bg-yellow-500',  text: 'text-yellow-500',  desc: 'Moderate' },
  { label: 'Poor',      color: 'bg-orange-500',  text: 'text-orange-500',  desc: 'Unhealthy' },
  { label: 'Very Poor', color: 'bg-rose-500',    text: 'text-rose-500',    desc: 'Very Unhealthy' },
];

const AnimatedTemp = ({ value, unit, className = "" }: { value: number; unit: string; className?: string }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={`${value}-${unit}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {value}
    </motion.span>
  </AnimatePresence>
);

const BentoDetails: React.FC<BentoDetailsProps> = ({ metrics, isCelsius, convert, aqiData, compact = false }) => {
  const currentAQI = aqiData?.aqi ?? 1;
  const aqiInfo = AQI_LEVELS[Math.min(currentAQI - 1, 4)];

  const gridCols = compact
    ? 'grid-cols-2'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {metrics.map((metric, idx) => {
        // ── Air Quality ──────────────────────────────────────────────────────
        if (metric.label === 'Air Quality' && aqiData) {
          return (
            <BentoCard key={idx} className="p-5 flex flex-col justify-between group" delay={0.4 + idx * 0.05}>
              <div className="mb-3">
                <div className={`p-2 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform inline-flex ${metric.color}`}>
                  <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">{metric.icon}</div>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{metric.label}</p>
                <p className={`text-lg font-black mb-0.5 ${aqiInfo.text}`}>{aqiInfo.label}</p>
                <p className="text-[10px] font-bold text-slate-400 mb-1.5">AQI {currentAQI} / 5</p>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentAQI / 5) * 100}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full ${aqiInfo.color}`}
                  />
                </div>
                <p className="text-[9px] font-medium text-slate-400">{aqiInfo.desc}</p>
              </div>
            </BentoCard>
          );
        }

        // ── UV Index ─────────────────────────────────────────────────────────
        if (metric.label === 'UV Index') {
          const uvRaw = metric.value;
          const uvNum = typeof uvRaw === 'number' ? uvRaw : null;
          const uvLevel = uvNum != null ? getUVLevel(uvNum) : null;
          const uvPct = uvNum != null ? Math.min((uvNum / 11) * 100, 100) : 0;

          return (
            <BentoCard key={idx} className="p-5 flex flex-col justify-between group" delay={0.4 + idx * 0.05}>
              <div className="mb-3">
                <div className={`p-2 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform inline-flex ${metric.color}`}>
                  <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">{metric.icon}</div>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{metric.label}</p>
                {uvNum != null && uvLevel ? (
                  <>
                    <p className={`text-lg font-black mb-0.5 ${uvLevel.color}`}>{uvLevel.label}</p>
                    <p className="text-[10px] font-bold text-slate-400 mb-1.5">UV {uvNum} / 11</p>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uvPct}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-orange-400 rounded-full"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-lg font-black text-slate-300 mb-1">N/A</p>
                )}
                <p className="text-[9px] font-medium text-slate-400">{metric.sub}</p>
              </div>
            </BentoCard>
          );
        }

        // ── Sunrise / Sunset ──────────────────────────────────────────────────
        if (metric.label === 'Sunrise' || metric.label === 'Sunset') {
          return (
            <BentoCard key={idx} className="p-5 flex flex-col justify-between group" delay={0.4 + idx * 0.05}>
              <div className="mb-3">
                <div className={`p-2 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform inline-flex ${metric.color}`}>
                  <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">{metric.icon}</div>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{metric.label}</p>
                <p className="text-lg font-black text-slate-900 mb-1">
                  {metric.value !== 'N/A' && metric.value ? String(metric.value) : '—'}
                </p>
                <p className="text-[9px] font-medium text-slate-400">{metric.sub}</p>
              </div>
            </BentoCard>
          );
        }

        // ── Default ───────────────────────────────────────────────────────────
        return (
          <BentoCard key={idx} className="p-5 flex flex-col justify-between group" delay={0.4 + idx * 0.05}>
            <div className="mb-3">
              <div className={`p-2 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform inline-flex ${metric.color}`}>
                <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">{metric.icon}</div>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{metric.label}</p>
              <p className="text-lg font-black text-slate-900 mb-1">
                {metric.label === 'Feels Like' ? (
                  <><AnimatedTemp value={convert(typeof metric.value === 'number' ? metric.value : 26)} unit="" />°</>
                ) : metric.value}
              </p>
              <p className="text-[9px] font-medium text-slate-400 leading-tight">{metric.sub}</p>
            </div>
          </BentoCard>
        );
      })}
    </div>
  );
};

export default BentoDetails;