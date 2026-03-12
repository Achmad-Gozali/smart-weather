import React from 'react';
import {
  CloudRain, CloudSun, Sun, CloudLightning, Cloud,
  Wind, Droplets, Eye, Thermometer, Gauge, Sunrise, Sunset,
} from 'lucide-react';

export interface ForecastHour { time: string; temp: number; icon: React.ReactNode; humidity?: number; wind_speed?: number; rain_chance?: number; }
export interface DailyForecast { day: string; icon: React.ReactNode; high: number; low: number; }
export interface WeatherMetric { label: string; value: string | number; icon: React.ReactNode; sub: string; color: string; }
export interface AQIData { aqi: number; pm2_5: number; pm10: number; no2: number; o3: number; }
export interface WeatherAlert { headline: string; severity: 'minor' | 'moderate' | 'severe' | 'extreme'; event: string; desc: string; }
export interface WeatherData {
  temp: number; feels_like: number; temp_min: number; temp_max: number;
  humidity: number; wind_speed: number; visibility: number;
  city: string; description: string; icon?: string;
  uv_index?: number; sunrise?: string; sunset?: string;
  rain_chance?: number; alerts?: WeatherAlert[];
  wind_degree?: number; wind_dir?: string;
}

export const MOCK_HOURLY: ForecastHour[] = [
  { time: 'Kini',  temp: 24, icon: <CloudRain className="w-5 h-5 text-blue-500" />,   humidity: 88, wind_speed: 12, rain_chance: 70 },
  { time: '10.00', temp: 25, icon: <CloudSun  className="w-5 h-5 text-orange-400" />, humidity: 80, wind_speed: 10, rain_chance: 20 },
  { time: '11.00', temp: 26, icon: <Sun        className="w-5 h-5 text-yellow-500" />, humidity: 72, wind_speed: 8,  rain_chance: 5  },
  { time: '12.00', temp: 28, icon: <Sun        className="w-5 h-5 text-yellow-500" />, humidity: 65, wind_speed: 9,  rain_chance: 5  },
  { time: '13.00', temp: 29, icon: <Sun        className="w-5 h-5 text-yellow-500" />, humidity: 60, wind_speed: 11, rain_chance: 10 },
  { time: '14.00', temp: 30, icon: <Sun        className="w-5 h-5 text-yellow-500" />, humidity: 58, wind_speed: 13, rain_chance: 15 },
  { time: '15.00', temp: 29, icon: <CloudSun  className="w-5 h-5 text-orange-400" />, humidity: 65, wind_speed: 14, rain_chance: 30 },
  { time: '16.00', temp: 27, icon: <CloudRain className="w-5 h-5 text-blue-500" />,   humidity: 78, wind_speed: 16, rain_chance: 65 },
  { time: '17.00', temp: 25, icon: <CloudRain className="w-5 h-5 text-blue-500" />,   humidity: 85, wind_speed: 14, rain_chance: 75 },
  { time: '18.00', temp: 24, icon: <Cloud      className="w-5 h-5 text-slate-400" />, humidity: 82, wind_speed: 10, rain_chance: 40 },
];

const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const today = new Date().getDay();
const MOCK_DAILY_ICONS = [
  <CloudRain      className="w-5 h-5 text-blue-500" />,
  <CloudSun       className="w-5 h-5 text-orange-400" />,
  <Sun            className="w-5 h-5 text-yellow-500" />,
  <CloudLightning className="w-5 h-5 text-purple-500" />,
  <CloudRain      className="w-5 h-5 text-blue-500" />,
  <Cloud          className="w-5 h-5 text-slate-400" />,
  <CloudSun       className="w-5 h-5 text-orange-400" />,
];
export const MOCK_DAILY: DailyForecast[] = [
  { day: 'Hari Ini', icon: MOCK_DAILY_ICONS[0], high: 28, low: 22 },
  { day: HARI[(today + 1) % 7], icon: MOCK_DAILY_ICONS[1], high: 30, low: 23 },
  { day: HARI[(today + 2) % 7], icon: MOCK_DAILY_ICONS[2], high: 32, low: 24 },
  { day: HARI[(today + 3) % 7], icon: MOCK_DAILY_ICONS[3], high: 29, low: 22 },
  { day: HARI[(today + 4) % 7], icon: MOCK_DAILY_ICONS[4], high: 27, low: 21 },
  { day: HARI[(today + 5) % 7], icon: MOCK_DAILY_ICONS[5], high: 28, low: 22 },
  { day: HARI[(today + 6) % 7], icon: MOCK_DAILY_ICONS[6], high: 29, low: 23 },
];

export const MOCK_METRICS: WeatherMetric[] = [
  { label: 'UV Index',    value: 'N/A',       icon: <Sun />,         sub: 'Memuat...',                             color: 'text-orange-500' },
  { label: 'Humidity',    value: '88%',        icon: <Droplets />,    sub: 'Titik embun 22°',                       color: 'text-blue-500'   },
  { label: 'Wind',        value: '12 km/jam',  icon: <Wind />,        sub: 'Arah: Barat Laut',                      color: 'text-emerald-500'},
  { label: 'Feels Like',  value: 26,           icon: <Thermometer />, sub: 'Kelembaban membuat udara terasa panas', color: 'text-amber-500'  },
  { label: 'Visibility',  value: '8 km',       icon: <Eye />,         sub: 'Kabut tipis dilaporkan',                color: 'text-purple-500' },
  { label: 'Air Quality', value: '1 Baik',     icon: <Gauge />,       sub: 'Polutan utama: PM2.5',                  color: 'text-rose-500'   },
  { label: 'Sunrise',     value: '05:45',      icon: <Sunrise />,     sub: 'Matahari terbit',                       color: 'text-amber-400'  },
  { label: 'Sunset',      value: '17:55',      icon: <Sunset />,      sub: 'Matahari terbenam',                     color: 'text-orange-500' },
];

export const AI_ADVICE =
  'Halo! Hari ini Jakarta akan cukup terik di siang hari, tapi waspada hujan di sore hari ya. Jangan lupa bawa payung dan tetap terhidrasi!';