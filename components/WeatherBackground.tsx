'use client';

import React from 'react';
import { motion } from 'motion/react';

interface WeatherBackgroundProps {
  condition: string;
}

const RAIN_DROPS = [...Array(50)].map((_, i) => ({
  id: i, x: (i * 2) + '%', duration: 0.5 + (i % 10) * 0.1, delay: (i % 20) * 0.1,
}));

const SNOW_FLAKES = [...Array(40)].map((_, i) => ({
  id: i, x: (i * 2.5) + '%', duration: 2 + (i % 15) * 0.2, delay: (i % 10) * 0.5, drift: Math.sin(i) * 10,
}));

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ condition }) => {
  const isRain = condition.toLowerCase().includes('rain');
  const isSnow = condition.toLowerCase().includes('snow');

  return (
    <>
      {/* Base gradient sky */}
      <div className="fixed inset-0 z-[-3]" style={{
        background: 'linear-gradient(180deg, #c8dff0 0%, #d8eaf5 30%, #e8f0e8 60%, #d4e8d0 80%, #c8e0c0 100%)',
      }} />

      {/* Animated SVG landscape */}
      <div className="fixed inset-0 z-[-2] overflow-hidden">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b8d4e8" />
              <stop offset="100%" stopColor="#d8eaf5" />
            </linearGradient>
            <linearGradient id="mtnFar" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8aacb8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a8c4c8" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="mtnMid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6a9a7a" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#8ab888" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="hillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7ab87a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#a8d4a0" />
            </linearGradient>
            <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#90c870" />
              <stop offset="100%" stopColor="#b8e098" />
            </linearGradient>
            <filter id="blur1"><feGaussianBlur stdDeviation="3" /></filter>
            <filter id="blur2"><feGaussianBlur stdDeviation="6" /></filter>
            <filter id="blur3"><feGaussianBlur stdDeviation="12" /></filter>
          </defs>

          {/* Sky */}
          <rect width="1440" height="900" fill="url(#skyGrad)" />

          {/* Far mountains */}
          <g filter="url(#blur2)" opacity="0.5">
            <path d="M0 520 Q180 320 360 420 Q540 280 720 380 Q900 260 1080 360 Q1260 300 1440 400 L1440 900 L0 900Z" fill="url(#mtnFar)" />
          </g>

          {/* Cloud 1 */}
          <motion.g animate={{ x: [0, 80, 0] }} transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }} filter="url(#blur1)" opacity="0.7">
            <ellipse cx="200" cy="180" rx="140" ry="55" fill="white" opacity="0.6" />
            <ellipse cx="280" cy="155" rx="100" ry="50" fill="white" opacity="0.7" />
            <ellipse cx="150" cy="195" rx="80" ry="40" fill="white" opacity="0.5" />
          </motion.g>

          {/* Cloud 2 */}
          <motion.g animate={{ x: [0, -60, 0] }} transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }} filter="url(#blur1)" opacity="0.6">
            <ellipse cx="800" cy="130" rx="120" ry="45" fill="white" opacity="0.6" />
            <ellipse cx="870" cy="110" rx="90" ry="40" fill="white" opacity="0.7" />
            <ellipse cx="740" cy="145" rx="70" ry="35" fill="white" opacity="0.5" />
          </motion.g>

          {/* Cloud 3 */}
          <motion.g animate={{ x: [0, 50, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} filter="url(#blur1)" opacity="0.5">
            <ellipse cx="1200" cy="160" rx="100" ry="40" fill="white" opacity="0.6" />
            <ellipse cx="1260" cy="140" rx="75" ry="35" fill="white" opacity="0.65" />
          </motion.g>

          {/* Cloud 4 - wispy */}
          <motion.g animate={{ x: [0, -40, 0] }} transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut', delay: 5 }} filter="url(#blur2)" opacity="0.4">
            <ellipse cx="550" cy="100" rx="160" ry="35" fill="white" opacity="0.5" />
            <ellipse cx="620" cy="85" rx="110" ry="30" fill="white" opacity="0.4" />
          </motion.g>

          {/* Mid mountains */}
          <g filter="url(#blur1)" opacity="0.8">
            <path d="M-100 600 Q200 380 400 500 Q600 360 800 480 Q1000 380 1200 460 Q1350 410 1540 500 L1540 900 L-100 900Z" fill="url(#mtnMid)" />
          </g>

          {/* Mist layer 1 */}
          <motion.g animate={{ opacity: [0.3, 0.6, 0.3], x: [0, 30, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}>
            <ellipse cx="400" cy="530" rx="350" ry="60" fill="white" opacity="0.25" filter="url(#blur3)" />
          </motion.g>

          {/* Mist layer 2 */}
          <motion.g animate={{ opacity: [0.2, 0.5, 0.2], x: [0, -25, 0] }} transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 3 }}>
            <ellipse cx="1000" cy="510" rx="400" ry="55" fill="white" opacity="0.2" filter="url(#blur3)" />
          </motion.g>

          {/* Mist layer 3 */}
          <motion.g animate={{ opacity: [0.15, 0.4, 0.15], x: [0, 20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 8 }}>
            <ellipse cx="700" cy="570" rx="500" ry="50" fill="white" opacity="0.2" filter="url(#blur3)" />
          </motion.g>

          {/* Hills */}
          <path d="M-100 700 Q200 550 450 640 Q700 520 950 620 Q1150 560 1300 620 Q1400 590 1540 640 L1540 900 L-100 900Z" fill="url(#hillGrad)" opacity="0.9" />

          {/* Trees left */}
          <g opacity="0.85">
            <rect x="60" y="600" width="12" height="80" fill="#5a7a3a" rx="3" />
            <ellipse cx="66" cy="590" rx="35" ry="55" fill="#4a7a3a" />
            <ellipse cx="66" cy="575" rx="25" ry="40" fill="#5a8a4a" />
            <rect x="110" y="620" width="10" height="60" fill="#4a6a2a" rx="3" />
            <ellipse cx="115" cy="608" rx="28" ry="45" fill="#3a6a2a" />
            <ellipse cx="115" cy="595" rx="20" ry="32" fill="#4a7a3a" />
            <rect x="155" y="570" width="14" height="100" fill="#5a7a3a" rx="3" />
            <ellipse cx="162" cy="558" rx="40" ry="65" fill="#4a7a3a" />
            <ellipse cx="162" cy="538" rx="28" ry="48" fill="#5a8a4a" />
          </g>

          {/* Trees right */}
          <g opacity="0.85">
            <rect x="1260" y="580" width="14" height="90" fill="#5a7a3a" rx="3" />
            <ellipse cx="1267" cy="567" rx="38" ry="60" fill="#4a7a3a" />
            <ellipse cx="1267" cy="550" rx="27" ry="44" fill="#5a8a4a" />
            <rect x="1310" y="600" width="11" height="70" fill="#4a6a2a" rx="3" />
            <ellipse cx="1316" cy="588" rx="30" ry="48" fill="#3a6a2a" />
            <ellipse cx="1316" cy="574" rx="21" ry="34" fill="#4a7a3a" />
            <rect x="1355" y="610" width="13" height="75" fill="#5a7a3a" rx="3" />
            <ellipse cx="1362" cy="596" rx="36" ry="55" fill="#4a7a3a" />
            <ellipse cx="1362" cy="580" rx="25" ry="40" fill="#5a8a4a" />
          </g>

          {/* Swaying tree left */}
          <motion.g style={{ transformOrigin: '240px 760px' }} animate={{ rotate: [-1.5, 1.5, -1.5] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <rect x="233" y="680" width="14" height="90" fill="#3a5a2a" rx="3" />
            <ellipse cx="240" cy="665" rx="42" ry="68" fill="#3a6a28" />
            <ellipse cx="240" cy="645" rx="30" ry="50" fill="#4a7a35" />
          </motion.g>

          {/* Swaying tree right */}
          <motion.g style={{ transformOrigin: '1180px 750px' }} animate={{ rotate: [1.5, -1.5, 1.5] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
            <rect x="1173" y="675" width="14" height="85" fill="#3a5a2a" rx="3" />
            <ellipse cx="1180" cy="660" rx="40" ry="65" fill="#3a6a28" />
            <ellipse cx="1180" cy="642" rx="28" ry="48" fill="#4a7a35" />
          </motion.g>

          {/* Foreground grass */}
          <path d="M0 820 Q360 780 720 810 Q1080 780 1440 800 L1440 900 L0 900Z" fill="url(#grassGrad)" />

          {/* Foreground mist */}
          <motion.g animate={{ opacity: [0.4, 0.7, 0.4], x: [0, 15, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}>
            <ellipse cx="720" cy="860" rx="800" ry="60" fill="white" opacity="0.3" filter="url(#blur3)" />
          </motion.g>

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.circle key={i} cx={150 + i * 160} cy={700 + (i % 3) * 40} r="2" fill="white" opacity="0.6"
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
            />
          ))}
        </svg>
      </div>

      {/* Overlay */}
      <div className="fixed inset-0 z-[-1] bg-slate-900/10" />

      {/* Weather particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {isRain && (
          <div className="absolute inset-0">
            {RAIN_DROPS.map((drop) => (
              <motion.div key={drop.id} initial={{ y: -20, x: drop.x }} animate={{ y: '110vh' }}
                transition={{ duration: drop.duration, repeat: Infinity, ease: 'linear', delay: drop.delay }}
                className="absolute w-[1px] h-4 bg-blue-300/50" />
            ))}
          </div>
        )}
        {isSnow && (
          <div className="absolute inset-0">
            {SNOW_FLAKES.map((flake) => (
              <motion.div key={flake.id} initial={{ y: -20, x: flake.x }}
                animate={{ y: '110vh', x: `calc(${flake.x} + ${flake.drift}px)` }}
                transition={{ duration: flake.duration, repeat: Infinity, ease: 'linear', delay: flake.delay }}
                className="absolute w-2 h-2 bg-white/70 blur-[1px] rounded-full" />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WeatherBackground;