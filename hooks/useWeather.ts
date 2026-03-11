import { useState, useEffect, useCallback } from 'react';
import { WeatherData, AQIData, WeatherAlert, AI_ADVICE } from '../lib/mockData';

const WAPI_KEY = process.env.NEXT_PUBLIC_WEATHERAPI_KEY!;
const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY!;

// UV Index level helper
export function getUVLevel(uv: number): { label: string; color: string } {
  if (uv <= 2)  return { label: 'Low',       color: 'text-emerald-500' };
  if (uv <= 5)  return { label: 'Moderate',  color: 'text-yellow-500'  };
  if (uv <= 7)  return { label: 'High',      color: 'text-orange-500'  };
  if (uv <= 10) return { label: 'Very High', color: 'text-rose-500'    };
  return           { label: 'Extreme',   color: 'text-purple-600'  };
}

export function useWeather() {
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({
    lat: -6.2088,
    lon: 106.8456,
  });
  const [aiAdvice, setAiAdvice] = useState<string>(AI_ADVICE);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // ─── Clock ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Load search history
  useEffect(() => {
    const saved = localStorage.getItem('weather_search_history');
    if (saved) setSearchHistory(JSON.parse(saved));
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const buildFallbackAdvice = (weather: WeatherData) =>
    `Cuaca di ${weather.city} saat ini ${weather.description} dengan suhu ${weather.temp}°C dan kelembaban ${weather.humidity}%. Angin ${weather.wind_speed} km/h.`;

  // ─── Groq AI ──────────────────────────────────────────────────────────────
  const fetchAIAdvice = useCallback(async (weather: WeatherData, aqi: AQIData) => {
    const models = ['llama-3.1-8b-instant', 'llama3-8b-8192', 'gemma2-9b-it'];
    for (const model of models) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
          body: JSON.stringify({
            model,
            messages: [{
              role: 'user',
              content: `Berikan saran cuaca singkat dan personal dalam Bahasa Indonesia (maksimal 2 kalimat, nada ramah dan casual) untuk kondisi berikut: Kota ${weather.city}, suhu ${weather.temp}°C, kelembaban ${weather.humidity}%, angin ${weather.wind_speed} km/h, kondisi "${weather.description}", UV index ${weather.uv_index ?? 'N/A'}, kualitas udara AQI ${aqi.aqi}/5.`,
            }],
            max_tokens: 150,
          }),
        });
        if (!res.ok) { console.warn(`Model ${model} failed`); continue; }
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) { setAiAdvice(content); return; }
      } catch (err) { console.warn(`Model ${model} error:`, err); }
    }
    setAiAdvice(buildFallbackAdvice(weather));
  }, []);

  // ─── Main fetch ───────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (lat: number, lon: number, citySearch?: string) => {
      const safeLat = isNaN(lat) ? -6.2088 : lat;
      const safeLon = isNaN(lon) ? 106.8456 : lon;
      const query = citySearch ? encodeURIComponent(citySearch) : `${safeLat},${safeLon}`;

      setLoading(true);
      setAiAdvice('Sedang menganalisis cuaca...');

      try {
        // Pakai forecast.json — include UV, sunrise/sunset, dan alerts sekaligus
        const [currentRes, forecastRes] = await Promise.all([
          fetch(`https://api.weatherapi.com/v1/current.json?key=${WAPI_KEY}&q=${query}&aqi=yes&lang=id`),
          fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WAPI_KEY}&q=${query}&days=1&aqi=yes&alerts=yes&lang=id`),
        ]);

        if (!currentRes.ok) throw new Error(`WeatherAPI error: ${currentRes.status}`);

        const json = await currentRes.json();
        const forecastJson = forecastRes.ok ? await forecastRes.json() : null;

        // UV Index & Sunrise/Sunset dari forecast
        const forecastDay = forecastJson?.forecast?.forecastday?.[0];
        const uvIndex = forecastJson?.current?.uv ?? json.current?.uv ?? null;
        const sunriseRaw = forecastDay?.astro?.sunrise ?? null;
        const sunsetRaw  = forecastDay?.astro?.sunset  ?? null;

        // WeatherAPI alerts
        const rawAlerts: WeatherAlert[] = (forecastJson?.alerts?.alert ?? []).map((a: any) => ({
          headline: a.headline ?? a.event ?? 'Weather Alert',
          severity: (a.severity?.toLowerCase() ?? 'moderate') as WeatherAlert['severity'],
          event: a.event ?? '',
          desc: a.desc ?? '',
        }));

        // Detect extreme conditions locally as fallback alerts
        const localAlerts: WeatherAlert[] = [];
        const tempVal = Math.round(json.current.temp_c);
        const windVal = Math.round(json.current.wind_kph);
        const uvVal   = uvIndex ?? 0;
        if (tempVal >= 38)  localAlerts.push({ headline: 'Suhu Sangat Tinggi', severity: 'severe',   event: 'Extreme Heat',  desc: `Suhu ${tempVal}°C sangat berbahaya. Hindari aktivitas luar ruangan.` });
        if (windVal >= 60)  localAlerts.push({ headline: 'Angin Kencang',       severity: 'moderate', event: 'Strong Wind',   desc: `Kecepatan angin ${windVal} km/h. Waspadai potensi pohon tumbang.` });
        if (uvVal >= 8)     localAlerts.push({ headline: 'UV Index Berbahaya',  severity: 'moderate', event: 'High UV',       desc: `UV Index ${uvVal}. Gunakan tabir surya dan hindari paparan matahari langsung.` });

        const allAlerts = [...rawAlerts, ...localAlerts];
        setAlerts(allAlerts);

        const weather: WeatherData = {
          temp: tempVal,
          feels_like: Math.round(json.current.feelslike_c),
          temp_min: Math.round(forecastDay?.day?.mintemp_c ?? json.current.temp_c),
          temp_max: Math.round(forecastDay?.day?.maxtemp_c ?? json.current.temp_c),
          humidity: json.current.humidity,
          wind_speed: Math.round(json.current.wind_kph),
          visibility: Math.round(json.current.vis_km),
          city: citySearch ?? json.location.name,
          description: json.current.condition.text,
          icon: `https:${json.current.condition.icon}`,
          uv_index: uvIndex,
          sunrise: sunriseRaw,
          sunset: sunsetRaw,
          alerts: allAlerts,
        };
        setWeatherData(weather);
        setCoords({ lat: json.location.lat, lon: json.location.lon });

        const aqiRaw = json.current.air_quality;
        const aqi: AQIData = {
          aqi: Math.min(aqiRaw?.['us-epa-index'] ?? 1, 5),
          pm2_5: aqiRaw?.pm2_5 ?? 0,
          pm10:  aqiRaw?.pm10  ?? 0,
          no2:   aqiRaw?.no2_ppb ?? 0,
          o3:    aqiRaw?.o3_ppb  ?? 0,
        };
        setAqiData(aqi);
        setLastUpdated(
          new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        );

        fetchAIAdvice(weather, aqi);

        if (citySearch) {
          setSearchHistory((prev) => {
            const next = [citySearch, ...prev.filter((c) => c !== citySearch)].slice(0, 5);
            localStorage.setItem('weather_search_history', JSON.stringify(next));
            return next;
          });
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setLoading(false);
      }
    },
    [fetchAIAdvice]
  );

  // ─── Geolocation ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) { fetchData(-6.2088, 106.8456); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        if (!isNaN(latitude) && !isNaN(longitude)) fetchData(latitude, longitude);
        else fetchData(-6.2088, 106.8456);
      },
      () => fetchData(-6.2088, 106.8456)
    );
  }, [fetchData]);

  // ─── Auto-refresh ─────────────────────────────────────────────────────────
  useEffect(() => {
    const { lat, lon } = coords;
    const refresh = setInterval(() => fetchData(lat, lon), 10 * 60 * 1000);
    return () => clearInterval(refresh);
  }, [coords, fetchData]);

  // ─── Search ───────────────────────────────────────────────────────────────
  const handleSearch = useCallback(
    async (city: string) => { fetchData(-6.2088, 106.8456, city); },
    [fetchData]
  );

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('weather_search_history');
  };

  return {
    currentTime, loading, weatherData, aqiData, alerts,
    coords, aiAdvice, lastUpdated, searchHistory,
    handleSearch, clearHistory, fetchData,
  };
}