'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface WeatherBackgroundProps {
  condition: string;
  hour?: number;
}

function getSkyColors(h: number, isRain: boolean, isStormy: boolean): {
  top: string; mid: string; bottom: string;
  groundTop: string; groundBot: string;
  overlayOpacity: number; overlayColor: string;
  sunOpacity: number; moonOpacity: number;
  cloudColor: string; cloudOpacity: number;
} {
  if (isStormy)  return {
    top: '#1a1f2e', mid: '#2a3040', bottom: '#3a3f50',
    groundTop: '#3a4a3a', groundBot: '#2a3a2a',
    overlayOpacity: 0.45, overlayColor: '#0a0f1e',
    sunOpacity: 0, moonOpacity: 0,
    cloudColor: '#4a5060', cloudOpacity: 0.9,
  };
  if (isRain) return {
    top: '#2a3a50', mid: '#3a4a60', bottom: '#4a5a70',
    groundTop: '#3a4a38', groundBot: '#2a3a28',
    overlayOpacity: 0.35, overlayColor: '#1a2030',
    sunOpacity: 0, moonOpacity: 0,
    cloudColor: '#5a6070', cloudOpacity: 0.85,
  };
  if (h >= 0  && h < 4)  return {
    top: '#020814', mid: '#061020', bottom: '#0a1830',
    groundTop: '#0a1208', groundBot: '#060c04',
    overlayOpacity: 0.55, overlayColor: '#010408',
    sunOpacity: 0, moonOpacity: 1,
    cloudColor: '#1a2030', cloudOpacity: 0.6,
  };
  if (h >= 4  && h < 6)  return {
    top: '#0d1b3e', mid: '#1a2850', bottom: '#2a3860',
    groundTop: '#0f1a0d', groundBot: '#080f06',
    overlayOpacity: 0.45, overlayColor: '#080e20',
    sunOpacity: 0.1, moonOpacity: 0.6,
    cloudColor: '#2a3048', cloudOpacity: 0.7,
  };
  if (h >= 6  && h < 7)  return {
    top: '#e8501a', mid: '#f07030', bottom: '#f8c060',
    groundTop: '#3a5020', groundBot: '#2a3a14',
    overlayOpacity: 0.12, overlayColor: '#200808',
    sunOpacity: 0.9, moonOpacity: 0,
    cloudColor: '#f0b060', cloudOpacity: 0.8,
  };
  if (h >= 7  && h < 10) return {
    top: '#4a90d0', mid: '#6ab0e8', bottom: '#90d0f8',
    groundTop: '#4a7030', groundBot: '#3a5820',
    overlayOpacity: 0.08, overlayColor: '#001020',
    sunOpacity: 0.8, moonOpacity: 0,
    cloudColor: '#ffffff', cloudOpacity: 0.75,
  };
  if (h >= 10 && h < 14) return {
    top: '#1a70c8', mid: '#3a90e0', bottom: '#70c0f8',
    groundTop: '#508040', groundBot: '#3a6030',
    overlayOpacity: 0.05, overlayColor: '#000818',
    sunOpacity: 1, moonOpacity: 0,
    cloudColor: '#ffffff', cloudOpacity: 0.7,
  };
  if (h >= 14 && h < 16) return {
    top: '#2880d0', mid: '#50a0e8', bottom: '#80c8f8',
    groundTop: '#488038', groundBot: '#386028',
    overlayOpacity: 0.08, overlayColor: '#001018',
    sunOpacity: 0.95, moonOpacity: 0,
    cloudColor: '#ffe8c0', cloudOpacity: 0.65,
  };
  if (h >= 16 && h < 18) return {
    top: '#d06020', mid: '#e88030', bottom: '#f8b060',
    groundTop: '#406030', groundBot: '#304820',
    overlayOpacity: 0.15, overlayColor: '#180800',
    sunOpacity: 0.85, moonOpacity: 0,
    cloudColor: '#f09040', cloudOpacity: 0.8,
  };
  if (h >= 18 && h < 19) return {
    top: '#8a2010', mid: '#c84020', bottom: '#f07830',
    groundTop: '#302818', groundBot: '#201808',
    overlayOpacity: 0.25, overlayColor: '#180600',
    sunOpacity: 0.6, moonOpacity: 0.1,
    cloudColor: '#e06030', cloudOpacity: 0.85,
  };
  if (h >= 19 && h < 21) return {
    top: '#1a1030', mid: '#2a1a48', bottom: '#3a2858',
    groundTop: '#1a2010', groundBot: '#100e08',
    overlayOpacity: 0.38, overlayColor: '#080408',
    sunOpacity: 0, moonOpacity: 0.5,
    cloudColor: '#3a2848', cloudOpacity: 0.7,
  };
  return {
    top: '#050a18', mid: '#080f22', bottom: '#0d1530',
    groundTop: '#0c1208', groundBot: '#060a04',
    overlayOpacity: 0.5, overlayColor: '#020408',
    sunOpacity: 0, moonOpacity: 0.9,
    cloudColor: '#141c2c', cloudOpacity: 0.65,
  };
}

const STARS = [...Array(80)].map((_, i) => ({
  id: i,
  cx: (i * 19.7 + 13) % 1440,
  cy: (i * 11.3 + 7)  % 300,
  r: i % 5 === 0 ? 1.8 : i % 3 === 0 ? 1.3 : 0.9,
  dur: 2 + (i % 7) * 0.4,
  del: (i % 11) * 0.3,
}));

const RAIN_DROPS = [...Array(60)].map((_, i) => ({
  id: i, x: (i * 1.67) + '%',
  dur: 0.4 + (i % 8) * 0.07, del: (i % 20) * 0.08,
}));

const SNOW_FLAKES = [...Array(40)].map((_, i) => ({
  id: i, x: (i * 2.5) + '%',
  dur: 2.5 + (i % 12) * 0.25, del: (i % 10) * 0.4,
  drift: Math.sin(i) * 12,
}));

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ condition, hour }) => {
  const [h, setH] = useState(hour ?? new Date().getHours());

  useEffect(() => {
    if (hour !== undefined) { setH(hour); return; }
    const t = setInterval(() => setH(new Date().getHours()), 60_000);
    return () => clearInterval(t);
  }, [hour]);

  const cond    = condition.toLowerCase();
  const isRain  = cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower');
  const isSnow  = cond.includes('snow') || cond.includes('blizzard') || cond.includes('sleet');
  const isStormy= cond.includes('thunder') || cond.includes('storm');
  const isNight = h < 6 || h >= 19;
  const isSunrise = h >= 6 && h < 7;
  const isSunset  = h >= 18 && h < 19;

  const sky = getSkyColors(h, isRain, isStormy);

  const mtnFar = isNight ? '#0a1020' : isSunrise || isSunset ? '#6a4030' : '#7a9cac';
  const mtnMid = isNight ? '#0e1810' : isSunrise ? '#5a4030' : isSunset ? '#4a3828' : '#5a8060';
  const hillCol = isNight ? '#0c1a0a' : isSunrise ? '#5a5830' : isSunset ? '#4a4828' : '#60a050';
  const grassCol= isNight ? '#0a1408' : isSunrise ? '#6a6030' : isSunset ? '#5a5028' : '#78c058';

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[-3]"
        animate={{ background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.mid} 45%, ${sky.bottom} 100%)` }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />

      <div className="fixed inset-0 z-[-2] overflow-hidden">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blur1"><feGaussianBlur stdDeviation="3" /></filter>
            <filter id="blur2"><feGaussianBlur stdDeviation="7" /></filter>
            <filter id="blur3"><feGaussianBlur stdDeviation="14" /></filter>
            <filter id="glow"><feGaussianBlur stdDeviation="18" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#fff8d0" stopOpacity="1" />
              <stop offset="40%"  stopColor="#ffe060" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ff9020" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="moonGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#f0f0e8" stopOpacity="1" />
              <stop offset="60%"  stopColor="#d0d0c8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a0a0a0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sunHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ffe090" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffe090" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g opacity={isNight && !isRain && !isStormy ? 1 : 0} style={{ transition: 'opacity 2s' }}>
            {STARS.map(s => (
              <motion.circle key={s.id} cx={s.cx} cy={s.cy} r={s.r} fill="white"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: s.dur, repeat: Infinity, delay: s.del, ease: 'easeInOut' }}
              />
            ))}
          </g>

          {sky.sunOpacity > 0 && (
            <g opacity={sky.sunOpacity}>
              <motion.ellipse cx="1100" cy="160" rx="120" ry="120" fill="url(#sunHalo)"
                animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '1100px 160px' }}
              />
              <circle cx="1100" cy="160" r="52" fill="url(#sunGrad)" filter="url(#glow)" />
              <circle cx="1100" cy="160" r="30" fill="#fffbe0" opacity="0.9" />
            </g>
          )}

          {sky.moonOpacity > 0 && (
            <g opacity={sky.moonOpacity}>
              <motion.g animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 6, repeat: Infinity }}>
                <circle cx="1100" cy="130" r="42" fill="url(#moonGrad)" filter="url(#blur1)" />
                <circle cx="1100" cy="130" r="36" fill="#e8e8e0" />
                <circle cx="1088" cy="122" r="5" fill="#d0d0c8" opacity="0.5" />
                <circle cx="1108" cy="138" r="3" fill="#d0d0c8" opacity="0.4" />
                <circle cx="1095" cy="142" r="4" fill="#d0d0c8" opacity="0.35" />
                <circle cx="1115" cy="125" r="30" fill={sky.top} opacity="0.55" />
              </motion.g>
            </g>
          )}

          <motion.path
            d="M0 520 Q180 320 360 420 Q540 280 720 380 Q900 260 1080 360 Q1260 300 1440 400 L1440 900 L0 900Z"
            animate={{ fill: mtnFar + 'aa' }}
            transition={{ duration: 3 }}
            filter="url(#blur2)" opacity="0.55"
          />

          <motion.g animate={{ x: [0, 70, 0] }} transition={{ duration: 38, repeat: Infinity, ease: 'easeInOut' }}
            filter="url(#blur1)" opacity={sky.cloudOpacity}>
            <ellipse cx="200" cy="175" rx="140" ry="52" fill={sky.cloudColor} />
            <ellipse cx="278" cy="150" rx="105" ry="48" fill={sky.cloudColor} />
            <ellipse cx="148" cy="192" rx="78" ry="38" fill={sky.cloudColor} />
          </motion.g>
          <motion.g animate={{ x: [0, -55, 0] }} transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            filter="url(#blur1)" opacity={sky.cloudOpacity * 0.85}>
            <ellipse cx="800" cy="125" rx="118" ry="44" fill={sky.cloudColor} />
            <ellipse cx="870" cy="106" rx="88" ry="40" fill={sky.cloudColor} />
            <ellipse cx="738" cy="142" rx="70" ry="33" fill={sky.cloudColor} />
          </motion.g>
          <motion.g animate={{ x: [0, 45, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            filter="url(#blur1)" opacity={sky.cloudOpacity * 0.7}>
            <ellipse cx="1200" cy="155" rx="98" ry="38" fill={sky.cloudColor} />
            <ellipse cx="1262" cy="136" rx="74" ry="34" fill={sky.cloudColor} />
          </motion.g>
          <motion.g animate={{ x: [0, -38, 0] }} transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
            filter="url(#blur2)" opacity={sky.cloudOpacity * 0.5}>
            <ellipse cx="540" cy="95" rx="160" ry="30" fill={sky.cloudColor} />
          </motion.g>

          <motion.path
            d="M-100 600 Q200 380 400 500 Q600 360 800 480 Q1000 380 1200 460 Q1350 410 1540 500 L1540 900 L-100 900Z"
            animate={{ fill: mtnMid + 'cc' }}
            transition={{ duration: 3 }}
            filter="url(#blur1)" opacity="0.88"
          />

          {[
            { cx: 400, cy: 530, rx: 350, ry: 60, dur: 18, del: 0 },
            { cx: 1000, cy: 510, rx: 400, ry: 55, dur: 24, del: 3 },
            { cx: 700, cy: 568, rx: 500, ry: 50, dur: 20, del: 8 },
          ].map((m, i) => (
            <motion.ellipse key={i} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry}
              fill="white" opacity="0"
              animate={{ opacity: [0.12, 0.28, 0.12], x: [0, i % 2 === 0 ? 28 : -22, 0] }}
              transition={{ duration: m.dur, repeat: Infinity, ease: 'easeInOut', delay: m.del }}
              filter="url(#blur3)"
            />
          ))}

          <motion.path
            d="M-100 700 Q200 550 450 640 Q700 520 950 620 Q1150 560 1300 620 Q1400 590 1540 640 L1540 900 L-100 900Z"
            animate={{ fill: hillCol + 'ee' }}
            transition={{ duration: 3 }}
            opacity="0.92"
          />

          <motion.g animate={{ fill: isNight ? '#0a1a0a' : '#4a7a3a' }} transition={{ duration: 3 }} opacity="0.88">
            <rect x="60" y="600" width="12" height="80" fill={isNight ? '#0a1208' : '#3a5a2a'} rx="3" />
            <ellipse cx="66" cy="590" rx="35" ry="55" fill={isNight ? '#0d1a0a' : '#4a7a3a'} />
            <ellipse cx="66" cy="575" rx="25" ry="40" fill={isNight ? '#102010' : '#5a8a4a'} />
            <rect x="110" y="620" width="10" height="60" fill={isNight ? '#080e06' : '#3a5020'} rx="3" />
            <ellipse cx="115" cy="608" rx="28" ry="45" fill={isNight ? '#0a1808' : '#3a6a2a'} />
            <ellipse cx="115" cy="595" rx="20" ry="32" fill={isNight ? '#0e1e0c' : '#4a7a3a'} />
          </motion.g>

          <motion.g opacity="0.88">
            <rect x="1260" y="580" width="14" height="90" fill={isNight ? '#0a1208' : '#4a6a2a'} rx="3" />
            <ellipse cx="1267" cy="567" rx="38" ry="60" fill={isNight ? '#0d1a0a' : '#4a7a3a'} />
            <ellipse cx="1267" cy="550" rx="27" ry="44" fill={isNight ? '#102010' : '#5a8a4a'} />
            <rect x="1310" y="600" width="11" height="70" fill={isNight ? '#080c06' : '#3a5020'} rx="3" />
            <ellipse cx="1316" cy="588" rx="30" ry="48" fill={isNight ? '#0a1608' : '#3a6a2a'} />
          </motion.g>

          <motion.g style={{ transformOrigin: '240px 760px' }}
            animate={{ rotate: [-1.5, 1.5, -1.5] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <rect x="233" y="680" width="14" height="90" fill={isNight ? '#090f07' : '#3a5a2a'} rx="3" />
            <ellipse cx="240" cy="665" rx="42" ry="68" fill={isNight ? '#0c1a08' : '#3a6a28'} />
            <ellipse cx="240" cy="645" rx="30" ry="50" fill={isNight ? '#102010' : '#4a7a35'} />
          </motion.g>
          <motion.g style={{ transformOrigin: '1180px 750px' }}
            animate={{ rotate: [1.5, -1.5, 1.5] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
            <rect x="1173" y="675" width="14" height="85" fill={isNight ? '#090f07' : '#3a5a2a'} rx="3" />
            <ellipse cx="1180" cy="660" rx="40" ry="65" fill={isNight ? '#0c1a08' : '#3a6a28'} />
            <ellipse cx="1180" cy="642" rx="28" ry="48" fill={isNight ? '#102010' : '#4a7a35'} />
          </motion.g>

          <motion.path d="M0 820 Q360 780 720 810 Q1080 780 1440 800 L1440 900 L0 900Z"
            animate={{ fill: grassCol }} transition={{ duration: 3 }} />

          <motion.ellipse cx="720" cy="858" rx="800" ry="58" fill="white"
            animate={{ opacity: [0.25, 0.45, 0.25], x: [0, 12, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            filter="url(#blur3)"
          />

          {isNight && !isRain && [...Array(10)].map((_, i) => (
            <motion.circle key={i}
              cx={200 + i * 110} cy={700 + (i % 4) * 30} r="2.5"
              fill={i % 3 === 0 ? '#c0f060' : '#a0e040'}
              animate={{ opacity: [0, 1, 0], y: [0, -10, 0] }}
              transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
            />
          ))}

          {!isNight && [...Array(8)].map((_, i) => (
            <motion.circle key={i} cx={150 + i * 165} cy={700 + (i % 3) * 42} r="1.8"
              fill="white" opacity="0.5"
              animate={{ y: [0, -18, 0], opacity: [0.15, 0.6, 0.15] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
            />
          ))}
        </svg>
      </div>

      <motion.div
        className="fixed inset-0 z-[-1] pointer-events-none"
        animate={{ backgroundColor: sky.overlayColor, opacity: sky.overlayOpacity }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <AnimatePresence>
          {isRain && (
            <motion.div key="rain" className="absolute inset-0"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {RAIN_DROPS.map(d => (
                <motion.div key={d.id}
                  initial={{ y: -20 }}
                  animate={{ y: '110vh' }}
                  transition={{ duration: d.dur, repeat: Infinity, ease: 'linear', delay: d.del }}
                  // FIX: opacity dari /40 → /25 agar tidak terlalu mengganggu konten
                  className="absolute w-[1px] h-5 bg-blue-300/25"
                  style={{ left: d.x }}
                />
              ))}
            </motion.div>
          )}
          {isSnow && (
            <motion.div key="snow" className="absolute inset-0"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {SNOW_FLAKES.map(f => (
                <motion.div key={f.id}
                  animate={{ y: '110vh', x: f.drift }}
                  transition={{ duration: f.dur, repeat: Infinity, ease: 'linear', delay: f.del }}
                  className="absolute w-2 h-2 bg-white/70 blur-[1px] rounded-full"
                  style={{ left: f.x, top: -10 }}
                />
              ))}
            </motion.div>
          )}
          {isStormy && (
            <motion.div key="lightning" className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 0, 0.6, 0, 0, 0, 0.3, 0] }}
              transition={{ duration: 8, repeat: Infinity, delay: 3 }}
              style={{ background: 'white' }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default WeatherBackground;