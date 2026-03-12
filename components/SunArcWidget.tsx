'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SunArcWidgetProps {
  sunrise: string | null;
  sunset: string | null;
}

function parseTime(str: string | null): number {
  if (!str) return 0;
  const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

function fmt(str: string | null): string {
  if (!str) return '--:--';
  const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return str;
  let h = parseInt(match[1]);
  const m = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
}

const SunArcWidget: React.FC<SunArcWidgetProps> = ({ sunrise, sunset }) => {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const upd = () => { const d = new Date(); setNow(d.getHours() * 60 + d.getMinutes()); };
    upd(); const t = setInterval(upd, 60_000); return () => clearInterval(t);
  }, []);

  const riseMin = parseTime(sunrise);
  const setMin  = parseTime(sunset);
  const dayLen  = setMin - riseMin || 1;
  const rawPct  = (now - riseMin) / dayLen;
  const pct     = Math.max(0, Math.min(1, rawPct));
  const isDay   = rawPct >= 0 && rawPct <= 1;

  const W = 280, H = 100, cx = W / 2, cy = H + 4;
  const rx = W / 2 - 12, ry = H - 12;
  const angle = Math.PI - pct * Math.PI;
  const sx = cx + rx * Math.cos(angle);
  const sy = cy - ry * Math.sin(angle);

  const remaining = Math.max(0, setMin - now);
  const remH = Math.floor(remaining / 60), remM = remaining % 60;
  const remStr = remaining <= 0 ? 'Sudah terbenam' : `${remH > 0 ? remH + 'j ' : ''}${remM}m lagi`;

  const phase = now < riseMin ? '🌙' : pct < 0.25 ? '🌅' : pct < 0.75 ? '☀️' : pct <= 1 ? '🌇' : '🌙';

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Posisi Matahari</p>
        <span className="text-sm">{phase}</span>
      </div>

      <div className="flex justify-center">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ height: 90 }}>
          <defs>
            <filter id="glow2"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <line x1={12} y1={cy} x2={W - 12} y2={cy} stroke="white" strokeOpacity="0.08" strokeWidth="1" />
          <path d={`M ${cx - rx},${cy} A ${rx},${ry} 0 0 1 ${cx + rx},${cy}`}
            fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="1.5" strokeDasharray="3 4" />
          {isDay && pct > 0.01 && (
            <path d={`M ${cx - rx},${cy} A ${rx},${ry} 0 0 1 ${sx},${sy}`}
              fill="none" stroke="#f97316" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
          )}
          {isDay && (
            <>
              <circle cx={sx} cy={sy} r={14} fill="#f97316" fillOpacity="0.15" />
              <motion.circle cx={sx} cy={sy} r={6} fill="#fde68a" stroke="#f97316" strokeWidth="1.5"
                filter="url(#glow2)"
                animate={{ r: [6, 7, 6] }} transition={{ duration: 2, repeat: Infinity }} />
            </>
          )}
          <text x={cx - rx} y={cy + 13} textAnchor="middle" fill="white" fillOpacity="0.3" fontSize="8" fontWeight="700">{fmt(sunrise)}</text>
          <text x={cx + rx} y={cy + 13} textAnchor="middle" fill="white" fillOpacity="0.3" fontSize="8" fontWeight="700">{fmt(sunset)}</text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-1">
        {[
          { label: 'Terbit',   value: fmt(sunrise), color: 'text-orange-400' },
          { label: 'Sisa',     value: remStr,        color: 'text-white/60'   },
          { label: 'Terbenam', value: fmt(sunset),   color: 'text-blue-400'   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/10 rounded-2xl p-2.5 text-center">
            <p className="text-[8px] text-white/40 font-bold uppercase mb-1">{label}</p>
            <p className={`text-xs font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SunArcWidget;