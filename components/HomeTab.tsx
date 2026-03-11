'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import MainWeather from './MainWeather';
import AIInsight from './AIInsight';
import HourlyForecast from './HourlyForecast';
import SevenDayForecast from './SevenDayForecast';
import BentoDetails from './BentoDetails';
import WeatherAlertBanner from './WeatherAlert';
import { MOCK_HOURLY, MOCK_DAILY, MOCK_METRICS, WeatherData, AQIData, WeatherAlert } from '../lib/mockData';

const WeatherMap = dynamic(() => import('./WeatherMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-700/50 animate-pulse rounded-[2.5rem]" />
  ),
});

const AQI_LABELS = ['Baik', 'Sedang', 'Tidak Sehat', 'Buruk', 'Sangat Buruk'];

interface HomeTabProps {
  currentTime: string;
  isCelsius: boolean;
  convert: (temp: number) => number;
  weatherData: WeatherData | null;
  aqiData: AQIData | null;
  alerts: WeatherAlert[];
  coords: { lat: number; lon: number };
  aiAdvice: string;
  lastUpdated: string;
}

const HomeTab: React.FC<HomeTabProps> = ({
  currentTime, isCelsius, convert, weatherData, aqiData, alerts, coords, aiAdvice, lastUpdated,
}) => {
  const metrics = weatherData ? [
    { ...MOCK_METRICS[0], value: weatherData.uv_index ?? 'N/A', sub: weatherData.uv_index != null ? `Index: ${weatherData.uv_index}` : 'Data unavailable' },
    { ...MOCK_METRICS[1], value: `${weatherData.humidity}%` },
    { ...MOCK_METRICS[2], value: `${weatherData.wind_speed} km/h` },
    { ...MOCK_METRICS[3], value: weatherData.feels_like },
    { ...MOCK_METRICS[4], value: `${weatherData.visibility} km` },
    { ...MOCK_METRICS[5], value: aqiData ? `${aqiData.aqi} ${AQI_LABELS[aqiData.aqi - 1] ?? 'Sedang'}` : '1 Baik' },
    { ...MOCK_METRICS[6], value: weatherData.sunrise ?? 'N/A', sub: 'Matahari terbit' },
    { ...MOCK_METRICS[7], value: weatherData.sunset ?? 'N/A', sub: 'Matahari terbenam' },
  ] : MOCK_METRICS;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">

      {/* Left Column */}
      <div className="lg:col-span-8 space-y-6 md:space-y-8">

        {alerts.length > 0 && <WeatherAlertBanner alerts={alerts} />}

        {/* Main Weather + AI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <MainWeather currentTime={currentTime} isCelsius={isCelsius} convert={convert} data={weatherData} lastUpdated={lastUpdated} />
          <AIInsight advice={aiAdvice} />
        </div>

        {/* Hourly */}
        <HourlyForecast data={MOCK_HOURLY} isCelsius={isCelsius} convert={convert} />

        {/* Map — lebar penuh, tinggi fixed */}
        <div className="h-[280px] rounded-[2.5rem] overflow-hidden">
          <WeatherMap lat={coords.lat} lon={coords.lon} city={weatherData?.city || 'Jakarta'} temp={weatherData?.temp || 24} mapId="home" />
        </div>

        {/* 8 Bento cards — 4 kolom x 2 baris */}
        <BentoDetails
          metrics={metrics}
          isCelsius={isCelsius}
          convert={convert}
          aqiData={aqiData || undefined}
          gridCols={4}
        />
      </div>

      {/* Right Column — 7 Hari, sticky */}
      <div className="lg:col-span-4 lg:sticky lg:top-8">
        <SevenDayForecast data={MOCK_DAILY} isCelsius={isCelsius} convert={convert} rainChance={weatherData?.rain_chance ?? 0} />
      </div>
    </div>
  );
};

export default HomeTab;