'use client';

import React from 'react';
import { motion } from 'motion/react';
import dynamic from 'next/dynamic';

const WeatherMap = dynamic(() => import('./WeatherMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] bg-slate-100 animate-pulse rounded-[2.5rem]" />
  ),
});

interface MapTabProps {
  lat: number;
  lon: number;
  city: string;
  temp: number;
}

const MapTab: React.FC<MapTabProps> = ({ lat, lon, city, temp }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full h-[70vh] rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100"
  >
    <WeatherMap lat={lat} lon={lon} city={city} temp={temp} mapId="maptab" />
  </motion.div>
);

export default MapTab;