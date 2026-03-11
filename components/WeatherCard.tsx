'use client';

import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Wind, Droplets, Eye } from 'lucide-react';
// FIX: was importing from '../src/types/weather' which doesn't exist.
// WeatherData is defined in mockData — use that single source of truth.
import { WeatherData } from '../lib/mockData';

interface WeatherCardProps {
  data: WeatherData;
}

export const WeatherCard = ({ data }: WeatherCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group"
    >
      {/* Subtle Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] group-hover:bg-blue-400/30 transition-colors duration-700" />

      {/* Top Section: Hero Info */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-blue-200/80 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-widest uppercase">
              {data.city}
            </span>
          </div>
          <div className="flex items-start">
            <h2 className="text-8xl font-black tracking-tighter text-white drop-shadow-2xl">
              {data.temp}
            </h2>
            <span className="text-4xl font-light text-blue-200 mt-2">°C</span>
          </div>
        </div>

        {/* icon is optional — only render if present */}
        {data.icon && (
          <div className="flex flex-col items-end">
            <motion.img
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 15,
                repeat: Infinity,
                repeatType: 'reverse',
                duration: 4,
              }}
              src={data.icon}
              alt={data.description}
              className="w-32 h-32 -mt-4 -mr-4 drop-shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
            />
          </div>
        )}
      </div>

      <div className="mt-4 mb-10 relative z-10">
        <h3 className="text-2xl font-bold text-white/90 capitalize tracking-tight">
          {data.description}
        </h3>
        <p className="text-blue-200/50 text-sm font-medium">
          Terasa seperti {data.feels_like}°C
        </p>
      </div>

      {/* Bottom Section: Details Grid */}
      <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10 relative z-10">
        <div className="flex flex-col items-center text-center group/item">
          <div className="bg-white/5 p-3 rounded-2xl mb-3 group-hover/item:bg-white/10 transition-colors">
            <Droplets className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-1">
            Humidity
          </span>
          <span className="text-lg font-bold text-white">{data.humidity}%</span>
        </div>

        <div className="flex flex-col items-center text-center group/item">
          <div className="bg-white/5 p-3 rounded-2xl mb-3 group-hover/item:bg-white/10 transition-colors">
            <Wind className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-1">
            Wind
          </span>
          <span className="text-lg font-bold text-white">
            {data.wind_speed}{' '}
            <span className="text-xs font-medium text-white/40">km/h</span>
          </span>
        </div>

        <div className="flex flex-col items-center text-center group/item">
          <div className="bg-white/5 p-3 rounded-2xl mb-3 group-hover/item:bg-white/10 transition-colors">
            <Eye className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-1">
            Visibility
          </span>
          <span className="text-lg font-bold text-white">
            {data.visibility ?? 10}{' '}
            <span className="text-xs font-medium text-white/40">km</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};