'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity } from 'lucide-react';
import BentoCard from './BentoCard';
import { ForecastHour } from '../lib/mockData';

interface HourlyForecastProps {
  data: ForecastHour[];
  isCelsius: boolean;
  convert: (temp: number) => number;
}

const AnimatedTemp = ({
  value,
  unit,
  className = '',
}: {
  value: number;
  unit: string;
  className?: string;
}) => (
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

const TempChart = ({ data }: { data: ForecastHour[] }) => {
  const maxTemp = Math.max(...data.map((d) => d.temp));
  const minTemp = Math.min(...data.map((d) => d.temp));
  const range = maxTemp - minTemp || 1;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 80 - ((d.temp - minTemp) / range) * 60;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-full h-16 mt-4 opacity-40">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <motion.polyline
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
};

const HourlyForecast: React.FC<HourlyForecastProps> = ({
  data,
  isCelsius,
  convert,
}) => {
  return (
    <BentoCard className="p-8 md:p-10" delay={0.3}>
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h3 className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest">
          24-Hour Forecast
        </h3>
        <div className="flex items-center space-x-2 text-blue-600 font-bold text-[10px] md:text-xs">
          {/* FIX: was `md:w-4 h-4` (missing `md:` prefix on h-4) */}
          <Activity className="w-3 h-3 md:w-4 md:h-4" />
          <span>LIVE TREND</span>
        </div>
      </div>
      <div className="overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex space-x-8 md:space-x-10 min-w-max">
          {data.map((hour, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center space-y-3 md:space-y-4"
            >
              <span className="text-[10px] md:text-xs font-bold text-slate-400">
                {hour.time}
              </span>
              <div className="p-2.5 md:p-3 bg-slate-50 rounded-2xl">
                {hour.icon}
              </div>
              <span className="text-base md:text-lg font-black text-slate-900">
                <AnimatedTemp value={convert(hour.temp)} unit="" />°
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      <TempChart data={data} />
    </BentoCard>
  );
};

export default HourlyForecast;