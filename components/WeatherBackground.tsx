'use client';

import React from 'react';
import { motion } from 'motion/react';

interface WeatherBackgroundProps {
  condition: string;
}

// Generate stable random values outside the component to satisfy purity rules
const RAIN_DROPS = [...Array(50)].map((_, i) => ({
  id: i,
  x: (i * 2) + '%',
  duration: 0.5 + (i % 10) * 0.1,
  delay: (i % 20) * 0.1
}));

const CLOUDS = [...Array(5)].map((_, i) => ({
  id: i,
  y: (i * 20) + '%',
  duration: 30 + (i * 5),
  delay: i * 2
}));

const SNOW_FLAKES = [...Array(40)].map((_, i) => ({
  id: i,
  x: (i * 2.5) + '%',
  duration: 2 + (i % 15) * 0.2,
  delay: (i % 10) * 0.5,
  drift: Math.sin(i) * 10
}));

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ condition }) => {
  const isRain = condition.toLowerCase().includes('rain');
  const isClouds = condition.toLowerCase().includes('cloud');
  const isClear = condition.toLowerCase().includes('clear');
  const isSnow = condition.toLowerCase().includes('snow');

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-30">
      {/* Rain Effect */}
      {isRain && (
        <div className="absolute inset-0">
          {RAIN_DROPS.map((drop) => (
            <motion.div
              key={drop.id}
              initial={{ y: -20, x: drop.x }}
              animate={{ y: '110vh' }}
              transition={{
                duration: drop.duration,
                repeat: Infinity,
                ease: "linear",
                delay: drop.delay
              }}
              className="absolute w-[1px] h-4 bg-blue-400/50"
            />
          ))}
        </div>
      )}

      {/* Clouds Effect */}
      {isClouds && (
        <div className="absolute inset-0">
          {CLOUDS.map((cloud) => (
            <motion.div
              key={cloud.id}
              initial={{ x: '-20%', y: cloud.y }}
              animate={{ x: '120%' }}
              transition={{
                duration: cloud.duration,
                repeat: Infinity,
                ease: "linear",
                delay: cloud.delay
              }}
              className="absolute w-64 h-32 bg-white/20 blur-3xl rounded-full"
            />
          ))}
        </div>
      )}

      {/* Clear/Sun Effect */}
      {isClear && (
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-yellow-200/20 blur-[100px] rounded-full"
        />
      )}

      {/* Snow Effect */}
      {isSnow && (
        <div className="absolute inset-0">
          {SNOW_FLAKES.map((flake) => (
            <motion.div
              key={flake.id}
              initial={{ y: -20, x: flake.x }}
              animate={{ 
                y: '110vh',
                x: `calc(${flake.x} + ${flake.drift}px)`
              }}
              transition={{
                duration: flake.duration,
                repeat: Infinity,
                ease: "linear",
                delay: flake.delay
              }}
              className="absolute w-2 h-2 bg-white/60 blur-[1px] rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherBackground;
