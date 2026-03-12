'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, List } from 'lucide-react';
import { DailyForecast } from '../lib/mockData';

interface SevenDayForecastProps {
  data: DailyForecast[];
  isCelsius: boolean;
  convert: (temp: number) => number;
  rainChance?: number;
}

// ── Temp Chart ─────────────────────────────────────────────────────────────
const TempChart = ({ data, convert }: { data: DailyForecast[]; convert: (t: number) => number }) => {
  const [hov, setHov] = useState<number | null>(null);
  const highs = data.map(d => convert(d.high));
  const lows  = data.map(d => convert(d.low));
  const all   = [...highs, ...lows];
  const maxT  = Math.max(...all), minT = Math.min(...all);
  const range = maxT - minT || 1;
  const W = 300, H = 110, PX = 14, PY = 16;
  const iW = W - PX * 2, iH = H - PY * 2;
  const xp = (i: number) => PX + (i / (data.length - 1)) * iW;
  const yp = (t: number) => PY + iH - ((t - minT) / range) * iH;
  const hp  = data.map((d, i) => `${xp(i)},${yp(convert(d.high))}`).join(' ');
  const lp  = data.map((d, i) => `${xp(i)},${yp(convert(d.low))}`).join(' ');
  const area = `M ${xp(0)},${yp(highs[0])} ${highs.slice(1).map((v,i)=>`L ${xp(i+1)},${yp(v)}`).join(' ')} L ${xp(data.length-1)},${H} L ${xp(0)},${H} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 110 }}>
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path d={area} fill="url(#sg)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        <motion.polyline points={lp} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
        <motion.polyline points={hp} fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
        {data.map((d, i) => {
          const hx = xp(i), hy = yp(convert(d.high)), ly = yp(convert(d.low));
          const isHov = hov === i;
          return (
            <g key={i}>
              <rect x={hx - 16} y={PY} width={32} height={iH} fill="transparent" className="cursor-pointer"
                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} />
              {isHov && <line x1={hx} y1={PY} x2={hx} y2={H - PY} stroke="white" strokeOpacity="0.1" strokeWidth="1" />}
              <circle cx={hx} cy={hy} r={isHov ? 5 : 3} fill="#f97316" stroke={isHov ? 'white' : 'none'} strokeWidth={1.5} style={{ transition: 'r .15s' }} />
              <circle cx={hx} cy={ly} r={isHov ? 4 : 2} fill="#60a5fa" stroke={isHov ? 'white' : 'none'} strokeWidth={1.5} style={{ transition: 'r .15s' }} />
              {isHov && <>
                <text x={hx} y={hy - 8} textAnchor="middle" fill="#f97316" fontSize="9" fontWeight="bold">{convert(d.high)}°</text>
                <text x={hx} y={ly + 14} textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="bold">{convert(d.low)}°</text>
              </>}
              <text x={hx} y={H - 2} textAnchor="middle" fill="white" fillOpacity="0.3" fontSize="8" fontWeight="600">{d.day}</text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-orange-400 rounded" /><span className="text-[9px] text-white/50">Maks</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-400 rounded opacity-60" /><span className="text-[9px] text-white/50">Min</span></div>
      </div>
    </div>
  );
};

// ── Main ───────────────────────────────────────────────────────────────────
const SevenDayForecast: React.FC<SevenDayForecastProps> = ({ data, isCelsius, convert, rainChance = 0 }) => {
  const [view, setView] = useState<'list' | 'chart'>('list');

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">7 Hari ke Depan</p>
        <div className="flex items-center gap-1 bg-slate-900/60 rounded-xl p-1 border border-white/15">
          {[{v:'list' as const, I: List},{v:'chart' as const, I: TrendingUp}].map(({v, I}) => (
            <button key={v} onClick={() => setView(v)}
              className={`p-1.5 rounded-lg transition-all ${view === v ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/50'}`}>
              <I className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
            {data.map((day, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-2 rounded-2xl hover:bg-white/10 transition-colors group">
                <span className="text-sm font-bold text-white/60 w-14 shrink-0">{day.day}</span>
                <div className="flex-1 flex justify-center">
                  <div className="p-1.5 bg-slate-900/60 rounded-xl group-hover:scale-110 transition-transform">{day.icon}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-black text-orange-400">{convert(day.high)}°</span>
                  <span className="text-sm font-bold text-blue-400/50">{convert(day.low)}°</span>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TempChart data={data} convert={convert} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rain chance */}
      <div className="mt-5 pt-5 border-t border-white/12">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Peluang Hujan Hari Ini</span>
          <span className="text-xs font-black text-blue-400">{rainChance}%</span>
        </div>
        <div className="h-1.5 bg-slate-900/60 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${rainChance}%` }} transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-blue-500 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default SevenDayForecast;