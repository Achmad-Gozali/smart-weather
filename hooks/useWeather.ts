import { useState, useEffect, useCallback } from 'react';
import { WeatherData, AQIData, WeatherAlert, AI_ADVICE } from '../lib/mockData';

const WAPI_KEY = process.env.NEXT_PUBLIC_WEATHERAPI_KEY!;
const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY!;

const DEFAULT_LAT = -6.2088;
const DEFAULT_LON = 106.8456;

export function getUVLevel(uv: number): { label: string; color: string } {
  if (uv <= 2)  return { label: 'Rendah',       color: 'text-emerald-500' };
  if (uv <= 5)  return { label: 'Sedang',        color: 'text-yellow-500'  };
  if (uv <= 7)  return { label: 'Tinggi',        color: 'text-orange-500'  };
  if (uv <= 10) return { label: 'Sangat Tinggi', color: 'text-rose-500'    };
  return           { label: 'Ekstrem',        color: 'text-purple-600'  };
}

export function useWeather() {
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
  const [aiAdvice, setAiAdvice] = useState<string>(AI_ADVICE);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('weather_search_history');
      if (saved) setSearchHistory(JSON.parse(saved));
    } catch {}
  }, []);

  const buildFallbackAdvice = (weather: WeatherData) =>
    `Cuaca di ${weather.city} saat ini ${weather.description} dengan suhu ${weather.temp}°C dan kelembaban ${weather.humidity}%. Angin ${weather.wind_speed} km/jam.`;

  const fetchAIAdvice = useCallback(async (weather: WeatherData, aqi: AQIData) => {
    if (!GROQ_KEY) { setAiAdvice(buildFallbackAdvice(weather)); return; }
    const models = ['llama-3.1-8b-instant', 'llama3-8b-8192', 'gemma2-9b-it'];
    for (const model of models) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: `Berikan saran cuaca singkat dan personal dalam Bahasa Indonesia (maksimal 2 kalimat, nada ramah dan casual) untuk kondisi berikut: Kota ${weather.city}, suhu ${weather.temp}°C, kelembaban ${weather.humidity}%, angin ${weather.wind_speed} km/jam, kondisi "${weather.description}", UV index ${weather.uv_index ?? 'N/A'}, kualitas udara AQI ${aqi.aqi}/5.` }],
            max_tokens: 150,
          }),
        });
        if (!res.ok) { console.warn(`Model ${model} gagal (${res.status})`); continue; }
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) { setAiAdvice(content); return; }
      } catch (err) { console.warn(`Error model ${model}:`, err); }
    }
    setAiAdvice(buildFallbackAdvice(weather));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = useCallback(async (lat: number, lon: number, citySearch?: string) => {
    const safeLat = isNaN(lat) ? DEFAULT_LAT : lat;
    const safeLon = isNaN(lon) ? DEFAULT_LON : lon;
    const query = citySearch ? encodeURIComponent(citySearch) : `${safeLat},${safeLon}`;

    setLoading(true);
    setAiAdvice('Sedang menganalisis cuaca...');

    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`https://api.weatherapi.com/v1/current.json?key=${WAPI_KEY}&q=${query}&aqi=yes&lang=id`),
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WAPI_KEY}&q=${query}&days=1&aqi=yes&alerts=yes&lang=id`),
      ]);

      if (!currentRes.ok) throw new Error(`WeatherAPI error: ${currentRes.status}`);

      const json = await currentRes.json();
      const forecastJson = forecastRes.ok ? await forecastRes.json() : null;
      const forecastDay = forecastJson?.forecast?.forecastday?.[0];
      const uvIndex     = forecastJson?.current?.uv ?? json.current?.uv ?? null;
      const rainChance  = forecastDay?.day?.daily_chance_of_rain ?? 0;

      const rawAlerts: WeatherAlert[] = (forecastJson?.alerts?.alert ?? []).map((a: any) => ({
        headline: a.headline ?? a.event ?? 'Peringatan Cuaca',
        severity: (a.severity?.toLowerCase() ?? 'moderate') as WeatherAlert['severity'],
        event: a.event ?? '',
        desc: a.desc ?? '',
      }));

      const localAlerts: WeatherAlert[] = [];
      const tempVal = Math.round(json.current.temp_c);
      const windVal = Math.round(json.current.wind_kph);
      const uvVal   = uvIndex ?? 0;
      if (tempVal >= 38) localAlerts.push({ headline: 'Suhu Sangat Tinggi', severity: 'severe',   event: 'Panas Ekstrem', desc: `Suhu ${tempVal}°C sangat berbahaya. Hindari aktivitas luar ruangan.` });
      if (windVal >= 60) localAlerts.push({ headline: 'Angin Kencang',      severity: 'moderate', event: 'Angin Kuat',    desc: `Kecepatan angin ${windVal} km/jam. Waspadai potensi pohon tumbang.` });
      if (uvVal   >= 8)  localAlerts.push({ headline: 'UV Index Berbahaya', severity: 'moderate', event: 'UV Tinggi',     desc: `UV Index ${uvVal}. Gunakan tabir surya dan hindari paparan matahari langsung.` });

      const allAlerts = [...rawAlerts, ...localAlerts];
      setAlerts(allAlerts);

      const weather: WeatherData = {
        temp:        Math.round(json.current.temp_c),
        feels_like:  Math.round(json.current.feelslike_c),
        temp_min:    Math.round(forecastDay?.day?.mintemp_c ?? json.current.temp_c),
        temp_max:    Math.round(forecastDay?.day?.maxtemp_c ?? json.current.temp_c),
        humidity:    json.current.humidity,
        wind_speed:  Math.round(json.current.wind_kph),
        visibility:  Math.round(json.current.vis_km),
        city:        citySearch ?? json.location.name,
        description: json.current.condition.text,
        icon:        `https:${json.current.condition.icon}`,
        uv_index:    uvIndex,
        sunrise:     forecastDay?.astro?.sunrise ?? null,
        sunset:      forecastDay?.astro?.sunset  ?? null,
        rain_chance: rainChance,
        alerts:      allAlerts,
      };

      setWeatherData(weather);
      setCoords({ lat: json.location.lat, lon: json.location.lon });

      const aqiRaw = json.current.air_quality;
      const aqi: AQIData = {
        aqi:   Math.min(aqiRaw?.['us-epa-index'] ?? 1, 5),
        pm2_5: aqiRaw?.pm2_5   ?? 0,
        pm10:  aqiRaw?.pm10    ?? 0,
        no2:   aqiRaw?.no2_ppb ?? 0,
        o3:    aqiRaw?.o3_ppb  ?? 0,
      };
      setAqiData(aqi);
      setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      fetchAIAdvice(weather, aqi);

      if (citySearch) {
        setSearchHistory((prev) => {
          const next = [citySearch, ...prev.filter((c) => c !== citySearch)].slice(0, 5);
          try { localStorage.setItem('weather_search_history', JSON.stringify(next)); } catch {}
          return next;
        });
      }
    } catch (error) {
      console.error('Gagal memuat data cuaca:', error);
      setAiAdvice('Gagal memuat data cuaca. Periksa koneksi internet kamu.');
    } finally {
      setLoading(false);
    }
  }, [fetchAIAdvice]);

  useEffect(() => {
    if (!navigator.geolocation) { fetchData(DEFAULT_LAT, DEFAULT_LON); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        if (!isNaN(latitude) && !isNaN(longitude)) fetchData(latitude, longitude);
        else fetchData(DEFAULT_LAT, DEFAULT_LON);
      },
      () => fetchData(DEFAULT_LAT, DEFAULT_LON)
    );
  }, [fetchData]);

  useEffect(() => {
    const { lat, lon } = coords;
    const refresh = setInterval(() => fetchData(lat, lon), 10 * 60 * 1000);
    return () => clearInterval(refresh);
  }, [coords, fetchData]);

  const handleSearch = useCallback((city: string) => fetchData(DEFAULT_LAT, DEFAULT_LON, city), [fetchData]);
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try { localStorage.removeItem('weather_search_history'); } catch {}
  }, []);

  return { currentTime, loading, weatherData, aqiData, alerts, coords, aiAdvice, lastUpdated, searchHistory, handleSearch, clearHistory, fetchData };
}