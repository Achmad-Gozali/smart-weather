'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface WindCompassProps {
  degree: number;       // 0-360
  speed: number;        // km/h
  dir: string;          // e.g. "NNW"
  gustSpeed?: number;   // optional gust km/h
}

const DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];

function getWindLabel(speed: number): { label: string; color: string; bgColor: string } {
  if (speed < 5)   return { label: 'Tenang',        color: 'text-emerald-400',  bgColor: 'bg-emerald-400/15' };
  if (speed < 15)  return { label: 'Sepoi-sepoi',   color: 'text-sky-400',      bgColor: 'bg-sky-400/15'     };
  if (speed < 30)  return { label: 'Sedang',         color: 'text-blue-400',     bgColor: 'bg-blue-400/15'    };
  if (speed < 50)  return { label: 'Agak Kencang',  color: 'text-yellow-400',   bgColor: 'bg-yellow-400/15'  };
  if (speed < 70)  return { label: 'Kencang',       color: 'text-orange-400',   bgColor: 'bg-orange-400/15'  };
  return                  { label: 'Badai',          color: 'text-red-400',      bgColor: 'bg-red-400/15'     };
}

function getBeaufortScale(speed: number): number {
  const thresholds = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 117];
  return thresholds.findIndex(t => speed < t);
}

const WindCompass: React.FC<WindCompassProps> = ({ degree, speed, dir, gustSpeed }) => {
  const [prevDeg, setPrevDeg] = useState(degree);
  const [displayDeg, setDisplayDeg] = useState(degree);

  // Smooth rotation — always take shortest path
  useEffect(() => {
    let diff = degree - prevDeg;
    if (diff > 180)  diff -= 360;
    if (diff < -180) diff += 360;
    setDisplayDeg(prev => prev + diff);
    setPrevDeg(degree);
  }, [degree]);

  const wind  = getWindLabel(speed);
  const bft   = getBeaufortScale(speed);
  const size  = 200; // compass diameter

  // Cardinal tick marks
  const ticks = DIRS.map((d, i) => {
    const angle  = (i / 16) * 360;
    const isCard = i % 4 === 0;
    const isSemi = i % 2 === 0 && !isCard;
    const len    = isCard ? 12 : isSemi ? 8 : 5;
    const r1     = 88;
    const r2     = r1 - len;
    const rad    = (angle - 90) * (Math.PI / 180);
    return {
      name: d, isCard, isSemi,
      x1: 100 + r1 * Math.cos(rad),
      y1: 100 + r1 * Math.sin(rad),
      x2: 100 + r2 * Math.cos(rad),
      y2: 100 + r2 * Math.sin(rad),
      lx: 100 + (r1 + 13) * Math.cos(rad),
      ly: 100 + (r1 + 13) * Math.sin(rad),
    };
  });

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Kompas Angin</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xl font-black text-white`}>{speed} <span className="text-sm font-medium text-white/50">km/j</span></span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${wind.bgColor} ${wind.color}`}>{wind.label}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white/90">{dir}</p>
          <p className="text-[10px] text-white/40 mt-0.5">Beaufort {bft}</p>
        </div>
      </div>

      {/* Compass SVG */}
      <div className="flex justify-center">
        <svg width={size} height={size} viewBox="0 0 200 200" className="overflow-visible">
          <defs>
            <radialGradient id="compassBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#1e2a3a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f1a2a" stopOpacity="0.95" />
            </radialGradient>
            <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#3a8fef" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3a8fef" stopOpacity="0" />
            </radialGradient>
            <filter id="needleGlow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Outer ring */}
          <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          {/* Background disk */}
          <circle cx="100" cy="100" r="92" fill="url(#compassBg)" />
          {/* Inner glow */}
          <circle cx="100" cy="100" r="70" fill="url(#innerGlow)" />
          {/* Degree ring */}
          <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Tick marks */}
          {ticks.map(t => (
            <g key={t.name}>
              <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                stroke={t.isCard ? 'rgba(255,255,255,0.6)' : t.isSemi ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)'}
                strokeWidth={t.isCard ? 1.5 : 1}
              />
              {t.isCard && (
                <text x={t.lx} y={t.ly} textAnchor="middle" dominantBaseline="central"
                  fill={t.name === 'N' ? '#f87171' : 'rgba(255,255,255,0.7)'}
                  fontSize={t.name === 'N' ? '10' : '9'}
                  fontWeight={t.name === 'N' ? '900' : '700'}
                  fontFamily="system-ui">
                  {t.name}
                </text>
              )}
            </g>
          ))}

          {/* Speed rings (concentric, pulse with wind speed) */}
          {[60, 44, 28].map((r, i) => (
            <motion.circle key={i} cx="100" cy="100" r={r}
              fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"
              strokeDasharray="4 4"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}

          {/* ── Needle (rotates with wind direction) ─────────────── */}
          <motion.g
            style={{ transformOrigin: '100px 100px' }}
            animate={{ rotate: displayDeg }}
            transition={{ type: 'spring', damping: 20, stiffness: 60 }}
          >
            {/* North arrow (red) */}
            <polygon points="100,28 106,100 100,88 94,100"
              fill="#ef4444" opacity="0.95" filter="url(#needleGlow)" />
            {/* South arrow (white) */}
            <polygon points="100,172 94,100 100,112 106,100"
              fill="rgba(255,255,255,0.6)" />
            {/* Needle horizontal crossbar */}
            <line x1="82" y1="100" x2="118" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          </motion.g>

          {/* Center cap */}
          <circle cx="100" cy="100" r="7" fill="#1e2a3a" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="3" fill="white" opacity="0.8" />
        </svg>
      </div>

      {/* Wind stats row */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Arah</p>
          <p className="text-sm font-black text-white mt-1">{degree}°</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Kecepatan</p>
          <p className={`text-sm font-black mt-1 ${wind.color}`}>{speed} km/j</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Hembusan</p>
          <p className="text-sm font-black text-orange-300 mt-1">{gustSpeed ?? Math.round(speed * 1.3)} km/j</p>
        </div>
      </div>
    </div>
  );
};

export default WindCompass;