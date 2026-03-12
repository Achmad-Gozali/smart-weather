'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ForecastHour } from '../lib/mockData';

interface Props { data: ForecastHour[]; isCelsius: boolean; convert: (t: number) => number; }

type Key = 'temp' | 'humidity' | 'wind_speed';
const TABS: { key: Key; label: string; color: string; unit: string }[] = [
  { key: 'temp',       label: 'Suhu',      color: '#f97316', unit: '°'     },
  { key: 'humidity',   label: 'Lembab',    color: '#60a5fa', unit: '%'     },
  { key: 'wind_speed', label: 'Angin',     color: '#a78bfa', unit: ' km/h' },
];

const HourlyTempChart: React.FC<Props> = ({ data, isCelsius, convert }) => {
  const [tab, setTab] = useState<Key>('temp');
  const [hov, setHov] = useState<number | null>(null);
  const t = TABS.find(x => x.key === tab)!;

  const vals = data.map(h =>
    tab === 'temp' ? convert(h.temp) : tab === 'humidity' ? (h.humidity ?? 0) : (h.wind_speed ?? 0)
  );
  const maxV = Math.max(...vals, 1), minV = Math.min(...vals);
  const range = maxV - minV || 1;
  const W = 300, H = 90, PX = 10, PY = 12, iW = W - PX * 2, iH = H - PY * 2, n = data.length;
  const xp = (i: number) => PX + (i / Math.max(n - 1, 1)) * iW;
  const yp = (v: number) => PY + iH - ((v - minV) / range) * iH;
  const pts = vals.map((v, i) => `${xp(i)},${yp(v)}`).join(' ');
  const area = `M ${xp(0)},${yp(vals[0])} ${vals.slice(1).map((v,i)=>`L ${xp(i+1)},${yp(v)}`).join(' ')} L ${xp(n-1)},${H} L ${xp(0)},${H} Z`;

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Tren Per Jam</p>
        <div className="flex gap-1 bg-slate-900/60 rounded-xl p-1 border border-white/15">
          {TABS.map(x => (
            <button key={x.key} onClick={() => setTab(x.key)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${tab === x.key ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/50'}`}>
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 90 }}>
        <defs>
          <linearGradient id={`cg-${tab}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={t.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path key={tab + 'a'} d={area} fill={`url(#cg-${tab})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        <motion.polyline key={tab + 'l'} points={pts} fill="none" stroke={t.color} strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.7 }} />
        {vals.map((v, i) => (
          <g key={i}>
            <rect x={xp(i)-14} y={0} width={28} height={H} fill="transparent" className="cursor-pointer"
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} />
            <circle cx={xp(i)} cy={yp(v)} r={hov===i?5:2.5} fill={t.color}
              stroke={hov===i?'white':'none'} strokeWidth={1.5} style={{transition:'r .15s'}} />
            {hov === i && (
              <text x={xp(i)} y={yp(v)-8} textAnchor="middle" fill={t.color} fontSize="9" fontWeight="bold">
                {v}{t.unit}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Time labels */}
      <div className="flex justify-between mt-1">
        {data.map((h, i) => (
          <span key={i} className={`text-[8px] font-bold ${hov===i?'text-white':'text-white/35'} transition-colors`}
            style={{ width: `${100/n}%`, textAlign: 'center' }}>
            {h.time === 'Kini' ? 'Kini' : h.time.slice(0,-3)}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/12">
        {[
          { l: 'Sekarang', v: `${vals[0]}${t.unit}`, c: t.color },
          { l: 'Tertinggi', v: `${maxV}${t.unit}`, c: 'white' },
          { l: 'Terendah',  v: `${minV}${t.unit}`, c: 'rgba(255,255,255,0.4)' },
        ].map(({ l, v, c }) => (
          <div key={l} className="bg-white/10 rounded-2xl p-2.5 text-center">
            <p className="text-[8px] text-white/40 font-bold uppercase mb-1">{l}</p>
            <p className="text-sm font-black" style={{ color: c }}>{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourlyTempChart;