'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import BentoCard from './BentoCard';
import { WeatherData } from '../lib/mockData';

interface MainWeatherProps {
  currentTime: string;
  isCelsius: boolean;
  convert: (temp: number) => number;
  data: WeatherData | null;
  lastUpdated?: string;
}

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

const MainWeather: React.FC<MainWeatherProps> = ({ currentTime, isCelsius, convert, data, lastUpdated }) => {
  if (!data) return null;

  return (
    <BentoCard className="p-8 md:p-10 flex flex-col justify-between min-h-[300px] md:min-h-[350px]" delay={0.1}>
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-blue-600 font-bold uppercase tracking-widest text-[9px] md:text-[10px] bg-blue-50 px-3 md:px-4 py-1.5 rounded-full w-fit">
            <Navigation className="w-3 h-3 fill-current" />
            <span>Current Location</span>
          </div>
          {/* Real-time last updated indicator */}
          {lastUpdated && (
            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
              <RefreshCw className="w-3 h-3" />
              <span>{lastUpdated}</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">{data.city}</h2>
          <p className="text-sm md:text-base text-slate-400 font-medium capitalize">
            {currentTime} • {data.description}
          </p>
        </div>
      </div>
      <div>
        <div className="flex items-baseline">
          <AnimatedTemp
            value={convert(data.temp)}
            unit={isCelsius ? '°C' : '°F'}
            className="text-7xl md:text-8xl font-black tracking-tighter text-slate-900"
          />
          <span className="text-2xl md:text-4xl font-light text-slate-300 ml-2">
            {isCelsius ? '°C' : '°F'}
          </span>
        </div>
        <div className="flex items-center space-x-4 mt-4 text-slate-500 font-bold text-sm md:text-base">
          <div className="flex items-center space-x-1">
            <ArrowUp className="w-4 h-4 text-rose-500" />
            <span><AnimatedTemp value={convert(data.temp_max)} unit="" />°</span>
          </div>
          <div className="flex items-center space-x-1">
            <ArrowDown className="w-4 h-4 text-blue-500" />
            <span><AnimatedTemp value={convert(data.temp_min)} unit="" />°</span>
          </div>
        </div>
      </div>
    </BentoCard>
  );
};

export default MainWeather;