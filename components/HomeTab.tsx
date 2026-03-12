'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { Wind, Droplets, Eye, Thermometer, Sun, Sunrise, Sunset, Shield } from 'lucide-react';
import { MOCK_HOURLY, MOCK_DAILY, WeatherData, AQIData, WeatherAlert, ForecastHour, DailyForecast } from '../lib/mockData';
import HourlyForecast from './HourlyForecast';
import SevenDayForecast from './SevenDayForecast';
import AIInsight from './AIInsight';
import SunArcWidget from './SunArcWidget';
import HourlyTempChart from './HourlyTempChart';
import WeatherAlertBanner from './WeatherAlert';
import LocationPermissionBanner from './LocationPermissionBanner';
import { getUVLevel } from '../hooks/useWeather';
import WindCompass from './WindCompass';

const WeatherMap = dynamic(() => import('./WeatherMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-white/10 animate-pulse rounded-3xl" />,
});

const AQI_LABELS = ['Baik', 'Sedang', 'Tidak Sehat', 'Buruk', 'Sangat Buruk'];
const AQI_COLORS = ['text-emerald-400', 'text-yellow-400', 'text-orange-400', 'text-red-400', 'text-purple-400'];
const AQI_BG    = ['bg-emerald-500/10', 'bg-yellow-500/10', 'bg-orange-500/10', 'bg-red-500/10', 'bg-purple-500/10'];

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
  hourlyData?: ForecastHour[];
  dailyData?: DailyForecast[];
  locationStatus?: 'detecting' | 'granted' | 'denied' | 'idle';
  locationSource?: string | null;
  requestLocation?: () => void;
}

// ── FIX: Convert "6:06 PM" → "18:06" (24-hour format) ─────────────────────
function fmtTo24(str: string | null): string {
  if (!str) return '—';
  const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return str;
  let h = parseInt(match[1]);
  const m = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
}

// ── Stat pill ──────────────────────────────────────────────────────────────
const Stat = ({ icon: Icon, label, value, color = 'text-white/60' }: {
  icon: React.ElementType; label: string; value: string; color?: string;
}) => (
  <div className="flex items-center gap-3 bg-white/10 hover:bg-slate-900/60 transition-colors rounded-2xl px-4 py-3">
    <div className="w-8 h-8 rounded-xl bg-white/12 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-white/50" />
    </div>
    <div>
      <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

// ── Section label ──────────────────────────────────────────────────────────
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">{children}</p>
);

// ── Main Component ─────────────────────────────────────────────────────────
const HomeTab: React.FC<HomeTabProps> = ({
  currentTime, isCelsius, convert, weatherData, aqiData, alerts,
  coords, aiAdvice, lastUpdated, hourlyData, dailyData,
  locationStatus, locationSource, requestLocation,
}) => {
  const wd = weatherData;
  const uvLevel = wd?.uv_index != null ? getUVLevel(wd.uv_index) : null;
  const aqiIdx  = (aqiData?.aqi ?? 1) - 1;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">

      {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
      <div className="space-y-5">

        {/* Location permission banner */}
        <LocationPermissionBanner
          locationStatus={locationStatus ?? 'idle'}
          locationSource={locationSource}
          onRequestLocation={requestLocation ?? (() => {})}
        />

        {/* Alert */}
        {alerts.length > 0 && <WeatherAlertBanner alerts={alerts} />}

        {/* ① Hero Card — suhu utama */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-7 flex flex-col md:flex-row gap-6 md:items-center">

          {/* Kiri: suhu besar */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Lokasi Saat Ini</span>
              {lastUpdated && <span className="text-[9px] text-white/35 font-medium">· Diperbarui {lastUpdated}</span>}
            </div>
            <h1 className="text-4xl font-black text-white mb-1">{wd?.city ?? '—'}</h1>
            <p className="text-sm text-white/40 font-medium mb-6">{currentTime} · {wd?.description ?? '—'}</p>

            <div className="flex items-end gap-4">
              <div className="flex items-start leading-none">
                <span className="text-8xl font-black text-white tracking-tighter">{convert(wd?.temp ?? 0)}</span>
                <span className="text-2xl font-bold text-white/40 mt-3">°{isCelsius ? 'C' : 'F'}</span>
              </div>
              {wd?.icon && (
                <img src={wd.icon} alt={wd.description} className="w-16 h-16 object-contain mb-1" />
              )}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm text-orange-400 font-bold">↑ {convert(wd?.temp_max ?? 0)}°</span>
              <span className="text-white/35">·</span>
              <span className="text-sm text-blue-400 font-bold">↓ {convert(wd?.temp_min ?? 0)}°</span>
            </div>
          </div>

          {/* Kanan: stat grid 2×2 */}
          <div className="grid grid-cols-2 gap-3 md:w-[280px] shrink-0">
            <Stat icon={Droplets}    label="Kelembaban"    value={`${wd?.humidity ?? '—'}%`} />
            <Stat icon={Wind}        label="Angin"         value={`${wd?.wind_speed ?? '—'} km/h`} />
            <Stat icon={Thermometer} label="Terasa"        value={`${convert(wd?.feels_like ?? 0)}°`} />
            <Stat icon={Eye}         label="Jarak Pandang" value={`${wd?.visibility ?? '—'} km`} />
          </div>
        </motion.div>

        {/* ② Baris info: UV + AQI + Sunrise/Sunset */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {/* UV */}
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-orange-400" />
              <span className="text-[9px] font-black text-white/50 uppercase tracking-wider">UV Index</span>
            </div>
            <p className={`text-xl font-black ${uvLevel?.color ?? 'text-white'}`}>{uvLevel?.label ?? '—'}</p>
            <p className="text-xs text-white/50 mt-0.5">{wd?.uv_index ?? '—'} / 11</p>
            <div className="mt-2 h-1 bg-white/12 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${((wd?.uv_index ?? 0) / 11) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }} className="h-full bg-orange-400 rounded-full" />
            </div>
          </div>

          {/* AQI */}
          <div className={`${AQI_BG[aqiIdx]} backdrop-blur-2xl border border-white/15 rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-white/40" />
              <span className="text-[9px] font-black text-white/50 uppercase tracking-wider">Kualitas Udara</span>
            </div>
            <p className={`text-xl font-black ${AQI_COLORS[aqiIdx]}`}>{AQI_LABELS[aqiIdx]}</p>
            <p className="text-xs text-white/50 mt-0.5">AQI {aqiData?.aqi ?? '—'} / 5</p>
            <div className="mt-2 h-1 bg-white/12 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${((aqiData?.aqi ?? 0) / 5) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }} className={`h-full ${['bg-emerald-400','bg-yellow-400','bg-orange-400','bg-red-400','bg-purple-400'][aqiIdx]} rounded-full`} />
            </div>
          </div>

          {/* FIX: Sunrise — gunakan fmtTo24() bukan replace AM/PM */}
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sunrise className="w-4 h-4 text-orange-300" />
              <span className="text-[9px] font-black text-white/50 uppercase tracking-wider">Matahari Terbit</span>
            </div>
            <p className="text-xl font-black text-white">{fmtTo24(wd?.sunrise ?? null)}</p>
            <p className="text-xs text-white/50 mt-0.5">Pagi hari</p>
          </div>

          {/* FIX: Sunset — gunakan fmtTo24() bukan replace AM/PM */}
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sunset className="w-4 h-4 text-purple-400" />
              <span className="text-[9px] font-black text-white/50 uppercase tracking-wider">Matahari Terbenam</span>
            </div>
            <p className="text-xl font-black text-white">{fmtTo24(wd?.sunset ?? null)}</p>
            <p className="text-xs text-white/50 mt-0.5">Sore hari</p>
          </div>
        </motion.div>

        {/* ③ AI Insight */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}>
          <AIInsight advice={aiAdvice} />
        </motion.div>

        {/* ④ Perkiraan 24 Jam */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}>
          <SectionLabel>Perkiraan 24 Jam</SectionLabel>
          <HourlyForecast data={hourlyData ?? MOCK_HOURLY} isCelsius={isCelsius} convert={convert} />
        </motion.div>

        {/* ⑥ Peta Lokasi */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}>
          <SectionLabel>Peta Lokasi</SectionLabel>
          <div className="h-[260px] rounded-3xl overflow-hidden border border-white/15">
            <WeatherMap lat={coords.lat} lon={coords.lon} city={wd?.city ?? 'Jakarta'} temp={wd?.temp ?? 24} mapId="home" />
          </div>
        </motion.div>

        {/* ⑦ Kompas Angin + Detail AQI side by side */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <SectionLabel>Kompas Angin</SectionLabel>
            <WindCompass
              degree={wd?.wind_degree ?? 0}
              speed={wd?.wind_speed ?? 0}
              dir={wd?.wind_dir ?? 'N'}
            />
          </div>

          <div>
            <SectionLabel>Detail Kualitas Udara</SectionLabel>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 space-y-3">
              {[
                { label: 'PM2.5', value: aqiData?.pm2_5?.toFixed(1) ?? '—', unit: 'µg/m³', safe: 12,  warn: 35,  bad: 55  },
                { label: 'PM10',  value: aqiData?.pm10?.toFixed(1)  ?? '—', unit: 'µg/m³', safe: 54,  warn: 154, bad: 254 },
                { label: 'NO₂',   value: aqiData?.no2?.toFixed(1)   ?? '—', unit: 'µg/m³', safe: 40,  warn: 70,  bad: 150 },
                { label: 'O₃',    value: aqiData?.o3?.toFixed(1)    ?? '—', unit: 'µg/m³', safe: 60,  warn: 100, bad: 140 },
              ].map(({ label, value, unit, safe, warn, bad }) => {
                const num = parseFloat(value);
                const color = isNaN(num) ? 'text-white/40' : num <= safe ? 'text-emerald-400' : num <= warn ? 'text-yellow-400' : num <= bad ? 'text-orange-400' : 'text-red-400';
                const pct   = isNaN(num) ? 0 : Math.min((num / (bad * 1.5)) * 100, 100);
                const barC  = isNaN(num) ? 'bg-white/20' : num <= safe ? 'bg-emerald-400' : num <= warn ? 'bg-yellow-400' : num <= bad ? 'bg-orange-400' : 'bg-red-400';
                return (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-white/50">{label}</span>
                      <span className={`text-xs font-black ${color}`}>{value} <span className="text-white/30 font-medium">{unit}</span></span>
                    </div>
                    <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.4 }}
                        className={`h-full ${barC} rounded-full`} />
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>

        </motion.div>

      </div>

      {/* ── RIGHT COLUMN ──────────────────────────────────────────── */}
      <div className="xl:sticky xl:top-8 space-y-5">

        {/* 7-Day Forecast */}
        <SectionLabel>Perkiraan 7 Hari</SectionLabel>
        <SevenDayForecast
          data={dailyData ?? MOCK_DAILY}
          isCelsius={isCelsius}
          convert={convert}
          rainChance={wd?.rain_chance ?? 0}
        />

        {/* Sun Arc */}
        <SectionLabel>Posisi Matahari</SectionLabel>
        <SunArcWidget sunrise={wd?.sunrise ?? null} sunset={wd?.sunset ?? null} />

        {/* Hourly Temp Chart */}
        <SectionLabel>Tren Per Jam</SectionLabel>
        <HourlyTempChart data={hourlyData ?? MOCK_HOURLY} isCelsius={isCelsius} convert={convert} />

      </div>

    </div>
  );
};

export default HomeTab;