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
    <div className="w-full h-full min-h-[300px] bg-slate-100 animate-pulse rounded-[2.5rem]" />
  ),
});

const AQI_LABELS = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

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
  currentTime,
  isCelsius,
  convert,
  weatherData,
  aqiData,
  alerts,
  coords,
  aiAdvice,
  lastUpdated,
}) => {
  const metrics = weatherData
    ? [
        {
          ...MOCK_METRICS[0],
          value: weatherData.uv_index ?? 'N/A',
          sub: weatherData.uv_index != null ? `Index: ${weatherData.uv_index}` : 'Data unavailable',
        },
        { ...MOCK_METRICS[1], value: `${weatherData.humidity}%` },
        { ...MOCK_METRICS[2], value: `${weatherData.wind_speed} km/h` },
        { ...MOCK_METRICS[3], value: weatherData.feels_like },
        { ...MOCK_METRICS[4], value: `${weatherData.visibility} km` },
        {
          ...MOCK_METRICS[5],
          value: aqiData
            ? `${aqiData.aqi} ${AQI_LABELS[aqiData.aqi - 1] ?? 'Moderate'}`
            : '1 Good',
        },
        {
          ...MOCK_METRICS[6],
          value: weatherData.sunrise ?? 'N/A',
          sub: 'Matahari terbit',
        },
        {
          ...MOCK_METRICS[7],
          value: weatherData.sunset ?? 'N/A',
          sub: 'Matahari terbenam',
        },
      ]
    : MOCK_METRICS;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8">
      {/* Left Column */}
      <div className="lg:col-span-8 space-y-6 md:space-y-8">

        {/* Weather Alerts */}
        {alerts.length > 0 && <WeatherAlertBanner alerts={alerts} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <MainWeather
            currentTime={currentTime}
            isCelsius={isCelsius}
            convert={convert}
            data={weatherData}
            lastUpdated={lastUpdated}
          />
          <AIInsight advice={aiAdvice} />
        </div>

        <HourlyForecast data={MOCK_HOURLY} isCelsius={isCelsius} convert={convert} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <WeatherMap
            lat={coords.lat}
            lon={coords.lon}
            city={weatherData?.city || 'Jakarta'}
            temp={weatherData?.temp || 24}
            mapId="home"
          />
          <BentoDetails
            metrics={metrics}
            isCelsius={isCelsius}
            convert={convert}
            aqiData={aqiData || undefined}
            compact
          />
        </div>
      </div>

      {/* Right Column – 7-Day Forecast */}
      <div className="lg:col-span-4">
        <SevenDayForecast data={MOCK_DAILY} isCelsius={isCelsius} convert={convert} />
      </div>
    </div>
  );
};

export default HomeTab;