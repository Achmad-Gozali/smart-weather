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
    currentTime,
    loading,
    weatherData,
    aqiData,
    alerts,
    coords,
    aiAdvice,
    lastUpdated,
    searchHistory,
    handleSearch,
    clearHistory,
  } = useWeather();

  const convert = (temp: number) =>
    isCelsius ? temp : Math.round((temp * 9) / 5 + 32);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex font-sans text-slate-900 overflow-x-hidden relative">
      <WeatherBackground condition={weatherData?.description || 'clear'} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full relative">
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
          {/* Share Widget di sebelah SearchHeader */}
          <div className="mb-6 md:mb-10 shrink-0">
            <ShareWidget
              weatherData={weatherData}
              isCelsius={isCelsius}
              convert={convert}
            />
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-4 right-4 bg-white rounded-3xl shadow-xl border border-slate-100 z-50 p-6 lg:hidden flex flex-col gap-4"
            >
              {[
                { tab: 'home', label: 'Home', Icon: Home },
                { tab: 'map', label: 'Maps', Icon: Map },
                { tab: 'settings', label: 'Settings', Icon: Settings },
              ].map(({ tab, label, Icon }) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setIsMenuOpen(false); }}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activeTab === tab ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-400 font-medium'
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
          <MapTab
            lat={coords.lat}
            lon={coords.lon}
            city={weatherData?.city || 'Jakarta'}
            temp={weatherData?.temp || 24}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            isCelsius={isCelsius}
            setIsCelsius={setIsCelsius}
            searchHistory={searchHistory}
            clearHistory={clearHistory}
          />
        )}

        <footer className="mt-16 md:mt-20 pb-8 md:pb-12 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="h-[1px] w-8 md:w-12 bg-slate-200" />
            <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.5em]">
              SkyCast Premium Dashboard &bull; 2026
            </p>
            <div className="h-[1px] w-8 md:w-12 bg-slate-200" />
          </div>
          <p className="text-slate-300 text-[8px] md:text-[9px] font-medium">
            Designed for Clarity, Built for Performance.
          </p>
        </footer>
      </main>
    </div>
  );
}