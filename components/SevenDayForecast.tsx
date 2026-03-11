'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import BentoCard from './BentoCard';
import { DailyForecast } from '../lib/mockData';

interface SevenDayForecastProps {
  data: DailyForecast[];
  isCelsius: boolean;
  convert: (temp: number) => number;
  rainChance?: number;
}

const AnimatedTemp = ({ value, unit, className = "" }: { value: number, unit: string, className?: string }) => (
  <AnimatePresence mode="wait">
    <motion.span key={`${value}-${unit}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className={className}>{value}</motion.span>
  </AnimatePresence>
);

const SevenDayForecast: React.FC<SevenDayForecastProps> = ({ data, isCelsius, convert, rainChance = 0 }) => (
  <BentoCard className="p-8 md:p-10" delay={0.5}>
    <h3 className="text-[10px] md:text-sm font-black text-white/40 uppercase tracking-widest mb-8 md:mb-10">Perkiraan 7 Hari</h3>
    <div className="space-y-6 md:space-y-8">
      {data.map((day, idx) => (
        <motion.div key={idx} whileHover={{ x: 5 }} className="flex items-center justify-between group cursor-pointer">
          <span className="text-xs md:text-sm font-bold text-white w-12 md:w-16">{day.day}</span>
          <div className="flex-1 flex items-center justify-center">
            <div className="p-2 md:p-2.5 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">{day.icon}</div>
          </div>
          <div className="flex items-center space-x-3 md:space-x-4 w-20 md:w-24 justify-end">
            <span className="text-xs md:text-sm font-black text-white"><AnimatedTemp value={convert(day.high)} unit="" />°</span>
            <span className="text-xs md:text-sm font-bold text-white/30"><AnimatedTemp value={convert(day.low)} unit="" />°</span>
          </div>
        </motion.div>
      ))}
    </div>
    <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-white/10">
      <div className="bg-white/5 rounded-3xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] md:text-xs font-bold text-white/50">Peluang hujan</span>
          <span className="text-[10px] md:text-xs font-black text-blue-400">{rainChance}%</span>
        </div>
        <div className="w-full h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${rainChance}%` }} transition={{ duration: 1, delay: 1 }} className="h-full bg-blue-500 rounded-full" />
        </div>
      </div>
    </div>
  </BentoCard>
);

export default SevenDayForecast;