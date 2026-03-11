'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Map, Settings } from 'lucide-react';

import Sidebar from '../components/Sidebar';
import SearchHeader from '../components/SearchHeader';
import WeatherBackground from '../components/WeatherBackground';
import HomeTab from '../components/HomeTab';
import MapTab from '../components/MapTab';
import SettingsTab from '../components/SettingsTab';
import ShareWidget from '../components/ShareWidget';
import { useWeather } from '@/hooks/useWeather';

export default function WeatherDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [isCelsius, setIsCelsius] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    currentTime, loading, weatherData, aqiData, alerts,
    coords, aiAdvice, lastUpdated, searchHistory,
    handleSearch, clearHistory,
  } = useWeather();

  const convert = (temp: number) =>
    isCelsius ? temp : Math.round((temp * 9) / 5 + 32);

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
        {/* Pakai WeatherBackground yang sama, bukan foto Unsplash */}
        <WeatherBackground condition="clear" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-white border-t-transparent rounded-full relative z-10"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-sans text-slate-900 overflow-x-hidden relative">
      <WeatherBackground condition={weatherData?.description || 'clear'} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchHeader
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              isCelsius={isCelsius}
              setIsCelsius={setIsCelsius}
              onSearch={handleSearch}
              searchHistory={searchHistory}
              clearHistory={clearHistory}
              city={weatherData?.city}
              country="ID"
            />
          </div>
          <div className="mb-6 md:mb-10 shrink-0">
            <ShareWidget weatherData={weatherData} isCelsius={isCelsius} convert={convert} />
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-4 right-4 bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 z-50 p-6 lg:hidden flex flex-col gap-4"
            >
              {[
                { tab: 'home',     label: 'Beranda',    Icon: Home },
                { tab: 'map',      label: 'Peta',       Icon: Map },
                { tab: 'settings', label: 'Pengaturan', Icon: Settings },
              ].map(({ tab, label, Icon }) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setIsMenuOpen(false); }}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activeTab === tab
                      ? 'bg-blue-500/20 text-blue-400 font-bold'
                      : 'text-white/50 font-medium hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span>{label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'home' && (
          <HomeTab
            currentTime={currentTime}
            isCelsius={isCelsius}
            convert={convert}
            weatherData={weatherData}
            aqiData={aqiData}
            alerts={alerts}
            coords={coords}
            aiAdvice={aiAdvice}
            lastUpdated={lastUpdated}
          />
        )}
        {activeTab === 'map' && (
          <MapTab lat={coords.lat} lon={coords.lon} city={weatherData?.city || 'Jakarta'} temp={weatherData?.temp || 24} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab isCelsius={isCelsius} setIsCelsius={setIsCelsius} searchHistory={searchHistory} clearHistory={clearHistory} />
        )}

        <footer className="mt-16 md:mt-20 pb-8 md:pb-12 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="h-[1px] w-8 md:w-12 bg-white/20" />
            <p className="text-white/40 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.5em]">
              SkyCast Dasbor Premium &bull; 2026
            </p>
            <div className="h-[1px] w-8 md:w-12 bg-white/20" />
          </div>
          <p className="text-white/30 text-[8px] md:text-[9px] font-medium">
            Dirancang untuk Kejelasan, Dibangun untuk Performa.
          </p>
        </footer>
      </main>
    </div>
  );
}