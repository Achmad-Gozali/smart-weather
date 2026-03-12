import { useState, useEffect, useCallback, useRef } from 'react';
import React from 'react';
import { Sun, CloudSun, CloudRain, Cloud, CloudLightning, CloudSnow } from 'lucide-react';
import { WeatherData, AQIData, WeatherAlert, ForecastHour, DailyForecast, AI_ADVICE, MOCK_HOURLY, MOCK_DAILY } from '../lib/mockData';

const WAPI_KEY = process.env.NEXT_PUBLIC_WEATHERAPI_KEY!;
const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY!;

const DEFAULT_LAT = -6.2088;
const DEFAULT_LON = 106.8456;

const AQI_LABELS = [
  'Baik',
  'Sedang',
  'Tidak Sehat untuk Kelompok Sensitif',
  'Tidak Sehat',
  'Sangat Tidak Sehat',
];

const AQI_HEALTH_TIPS = [
  'Aman untuk semua aktivitas luar ruangan.',
  'Kelompok sensitif (lansia, anak-anak, penderita asma) sebaiknya kurangi aktivitas di luar.',
  'Kurangi aktivitas berat di luar ruangan. Pertimbangkan menggunakan masker.',
  'Hindari aktivitas luar ruangan. Gunakan masker N95 jika harus keluar.',
  'Darurat kesehatan — tetap di dalam ruangan, tutup semua ventilasi.',
];

// ── Icon helper ────────────────────────────────────────────────────────────
export function getWeatherIcon(code: number, isDay = 1, size = 'w-5 h-5') {
  if (code === 1000)
    return isDay
      ? React.createElement(Sun,   { className: `${size} text-yellow-400` })
      : React.createElement(Cloud, { className: `${size} text-slate-400` });
  if ([1003, 1006].includes(code))
    return React.createElement(CloudSun, { className: `${size} text-orange-400` });
  if ([1009, 1030, 1135, 1147].includes(code))
    return React.createElement(Cloud, { className: `${size} text-slate-400` });
  if ([1063,1150,1153,1180,1183,1186,1189,1192,1195,1240,1243,1246].includes(code))
    return React.createElement(CloudRain, { className: `${size} text-blue-400` });
  if ([1087,1273,1276,1279,1282].includes(code))
    return React.createElement(CloudLightning, { className: `${size} text-purple-400` });
  if ([1066,1114,1117,1210,1213,1216,1219,1222,1225,1255,1258].includes(code))
    return React.createElement(CloudSnow, { className: `${size} text-blue-200` });
  return React.createElement(Cloud, { className: `${size} text-slate-400` });
}

// ── UV level ───────────────────────────────────────────────────────────────
export function getUVLevel(uv: number): { label: string; color: string } {
  if (uv <= 2)  return { label: 'Rendah',       color: 'text-emerald-500' };
  if (uv <= 5)  return { label: 'Sedang',        color: 'text-yellow-500'  };
  if (uv <= 7)  return { label: 'Tinggi',        color: 'text-orange-500'  };
  if (uv <= 10) return { label: 'Sangat Tinggi', color: 'text-rose-500'    };
  return               { label: 'Ekstrem',       color: 'text-purple-600'  };
}

// ── Sanitize AI response ───────────────────────────────────────────────────
function sanitizeAIText(text: string): string {
  return text
    .replace(/[\u25C0-\u25FF\u2600-\u26FF\u2700-\u27BF]+\s*[!?.]*\s*$/u, '')
    .replace(/([!?.])\s*[◀▶◄►←→↑↓⬅➡⬆⬇]+\s*$/g, '$1')
    .trim();
}

// ── Build AI advice prompt ─────────────────────────────────────────────────
function buildAIAdvicePrompt(weather: WeatherData, aqi: AQIData, hourly: ForecastHour[]): string {
  const now      = new Date();
  const dateStr  = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr  = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const hour     = now.getHours();
  const timeOfDay =
    hour < 5  ? 'dini hari' :
    hour < 11 ? 'pagi' :
    hour < 15 ? 'siang' :
    hour < 18 ? 'sore' : 'malam';

  const aqiIdx   = Math.min((aqi.aqi ?? 1) - 1, 4);
  const aqiLabel = AQI_LABELS[aqiIdx];
  const aqiTip   = AQI_HEALTH_TIPS[aqiIdx];
  const uvLabel  = getUVLevel(weather.uv_index ?? 0).label;

  const nextRainHour = hourly.find(h => (h.rain_chance ?? 0) >= 60);
  const rainNote     = nextRainHour
    ? `⚠️ Peluang hujan tinggi (≥60%) mulai jam ${nextRainHour.time}`
    : 'Tidak ada hujan signifikan dalam beberapa jam ke depan';

  const tempTrend =
    hourly.length >= 3
      ? hourly[hourly.length - 1].temp < hourly[0].temp - 2 ? 'akan menurun'
      : hourly[hourly.length - 1].temp > hourly[0].temp + 2 ? 'akan meningkat'
      : 'relatif stabil'
    : 'tidak diketahui';

  const hourlySummary = hourly.slice(0, 6).map(h =>
    `  ${h.time}: ${h.temp}°C, hujan ${h.rain_chance ?? 0}%`
  ).join('\n');

  return `Kamu adalah asisten cuaca pribadi yang akurat dan peduli pengguna.
Tugas: Berikan SATU saran harian yang personal, spesifik, dan actionable.
Format: Bahasa Indonesia casual, MAKSIMAL 2 kalimat, boleh pakai 1-2 emoji di AWAL kalimat saja.
ATURAN KETAT: Hanya berdasarkan data di bawah. JANGAN mengarang. JANGAN tambah data yang tidak ada. JANGAN taruh emoji atau simbol di akhir kalimat.

═══ DATA CUACA REAL-TIME ═══
Waktu: ${timeStr} (${timeOfDay}), ${dateStr}
Kota: ${weather.city}

Kondisi saat ini:
- Suhu: ${weather.temp}°C (terasa ${weather.feels_like}°C)
- Cuaca: ${weather.description}
- Kelembaban: ${weather.humidity}%
- UV Index: ${weather.uv_index ?? 'N/A'} → ${uvLabel}
- Peluang hujan hari ini: ${weather.rain_chance}%
- ${rainNote}
- Tren suhu: ${tempTrend}

Prakiraan per jam:
${hourlySummary}

Kualitas Udara: ${aqiLabel} (AQI ${aqi.aqi}/5)
- Saran AQI: ${aqiTip}

Matahari: terbit ${weather.sunrise ?? 'N/A'} · terbenam ${weather.sunset ?? 'N/A'}
═══════════════════════════

Prioritas saran (pilih yang paling relevan):
1. Hujan akan terjadi → ingatkan bawa payung + jam berapa
2. UV Index Tinggi/Sangat Tinggi/Ekstrem → saran tabir surya
3. AQI Tidak Sehat atau lebih buruk → saran masker
4. Suhu ≥36°C → saran hindari panas
5. Kondisi normal → saran aktivitas yang cocok untuk ${timeOfDay}`;
}

// ── IMPROVED: Multi-strategy geolocation ──────────────────────────────────
//
// Strategy 1 — GPS High Accuracy (enableHighAccuracy: true)
//   Pakai GPS hardware + WiFi triangulation. Akurat ±5–50m.
//   Kekurangan: lambat (~5–10 detik), kadang fail di desktop.
//
// Strategy 2 — GPS Low Accuracy (enableHighAccuracy: false)
//   Pakai cell tower / WiFi. Akurat ±100–500m, lebih cepat.
//   Jadi "safety net" kalau strategy 1 lambat.
//
// Strategy 3 — WeatherAPI auto:ip
//   Deteksi kota berdasarkan IP. Akurat di level kota (~1–5 km).
//   Tidak butuh izin browser. Fallback kalau GPS diblokir.
//
// Strategy 4 — Default Jakarta
//   Last resort kalau semua gagal.
//
export type LocationSource = 'gps-high' | 'gps-low' | 'ip' | 'default' | 'search';

async function getBestCoords(wapiKey: string): Promise<{
  lat: number;
  lon: number;
  source: LocationSource;
}> {
  // ── GPS High Accuracy ─────────────────────────────────────────────────
  const gpsHigh = (): Promise<{ lat: number; lon: number; source: LocationSource }> =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({
          lat: coords.latitude,
          lon: coords.longitude,
          source: 'gps-high',
        }),
        reject,
        {
          enableHighAccuracy: true,
          timeout: 12_000,
          maximumAge: 0,          // always fresh reading
        }
      );
    });

  // ── GPS Low Accuracy (fast fallback, fires after 3s) ──────────────────
  const gpsLow = (): Promise<{ lat: number; lon: number; source: LocationSource }> =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => resolve({
            lat: coords.latitude,
            lon: coords.longitude,
            source: 'gps-low',
          }),
          reject,
          {
            enableHighAccuracy: false,
            timeout: 5_000,
            maximumAge: 120_000,  // accept 2-min old cached position
          }
        );
      }, 3_000);
    });

  // ── IP-based via WeatherAPI ────────────────────────────────────────────
  const ipBased = async (): Promise<{ lat: number; lon: number; source: LocationSource }> => {
    const res = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${wapiKey}&q=auto:ip&aqi=no`,
      { signal: AbortSignal.timeout(6_000) }
    );
    if (!res.ok) throw new Error(`IP geo failed: ${res.status}`);
    const data = await res.json();
    if (!data.location?.lat) throw new Error('No location in IP response');
    return { lat: data.location.lat, lon: data.location.lon, source: 'ip' };
  };

  // ── No GPS support → skip to IP ───────────────────────────────────────
  if (!navigator?.geolocation) {
    console.info('[Location] Geolocation API unavailable, trying IP...');
    try { return await ipBased(); }
    catch { return { lat: DEFAULT_LAT, lon: DEFAULT_LON, source: 'default' }; }
  }

  // ── Check existing permission (Chrome/Edge/Firefox 96+) ───────────────
  // If already denied, skip GPS entirely and go straight to IP.
  try {
    const perm = await navigator.permissions.query({ name: 'geolocation' });
    if (perm.state === 'denied') {
      console.info('[Location] Permission denied, falling back to IP...');
      try { return await ipBased(); }
      catch { return { lat: DEFAULT_LAT, lon: DEFAULT_LON, source: 'default' }; }
    }
  } catch {
    // permissions API not supported — proceed normally
  }

  // ── Race: High accuracy GPS vs. delayed low accuracy GPS ──────────────
  // Whichever resolves first wins.
  try {
    const result = await Promise.race([gpsHigh(), gpsLow()]);
    console.info(`[Location] Got position via ${result.source}`);
    return result;
  } catch (gpsErr) {
    // Both GPS strategies failed (timeout / user denied mid-prompt)
    console.warn('[Location] GPS failed, trying IP...', gpsErr);
    try { return await ipBased(); }
    catch (ipErr) {
      console.warn('[Location] IP geo also failed, using default', ipErr);
      return { lat: DEFAULT_LAT, lon: DEFAULT_LON, source: 'default' };
    }
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useWeather() {
  const [currentTime,     setCurrentTime]     = useState('');
  const [loading,         setLoading]         = useState(true);
  const [weatherData,     setWeatherData]     = useState<WeatherData | null>(null);
  const [aqiData,         setAqiData]         = useState<AQIData | null>(null);
  const [alerts,          setAlerts]          = useState<WeatherAlert[]>([]);
  const [coords,          setCoords]          = useState({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
  const [aiAdvice,        setAiAdvice]        = useState<string>(AI_ADVICE);
  const [lastUpdated,     setLastUpdated]     = useState('');
  const [searchHistory,   setSearchHistory]   = useState<string[]>([]);
  const [hourlyData,      setHourlyData]      = useState<ForecastHour[]>(MOCK_HOURLY);
  const [dailyData,       setDailyData]       = useState<DailyForecast[]>(MOCK_DAILY);
  const [locationStatus,  setLocationStatus]  = useState<'detecting' | 'granted' | 'denied' | 'idle'>('idle');
  const [locationSource,  setLocationSource]  = useState<LocationSource | null>(null);

  const fetchingRef = useRef(false);

  // ── Clock ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () =>
      setCurrentTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  // ── Restore search history ─────────────────────────────────────────────
  useEffect(() => {
    try {
      const s = localStorage.getItem('weather_search_history');
      if (s) setSearchHistory(JSON.parse(s));
    } catch {}
  }, []);

  // ── AI Advice ──────────────────────────────────────────────────────────
  const fetchAIAdvice = useCallback(async (
    weather: WeatherData,
    aqi: AQIData,
    hourly: ForecastHour[]
  ) => {
    const rainHour = hourly.find(h => (h.rain_chance ?? 0) >= 60);
    const fallback =
      rainHour
        ? `Siapkan payung, hujan diprediksi sekitar jam ${rainHour.time} di ${weather.city} ☔ Suhu saat ini ${weather.temp}°C.`
        : weather.uv_index != null && weather.uv_index >= 6
        ? `UV Index ${weather.uv_index} cukup tinggi di ${weather.city}, pakai tabir surya sebelum keluar ya ☀️`
        : `Cuaca di ${weather.city} ${weather.description}, suhu ${weather.temp}°C. ${(weather.rain_chance ?? 0) > 50 ? 'Bawa payung untuk jaga-jaga 🌂' : 'Nikmati harimu! 😊'}`;

    if (!GROQ_KEY) { setAiAdvice(fallback); return; }

    const prompt = buildAIAdvicePrompt(weather, aqi, hourly);
    const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'];

    for (const model of models) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
          body: JSON.stringify({
            model,
            max_tokens: 100,
            temperature: 0.3,
            top_p: 0.9,
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        if (!res.ok) { console.warn(`[AI Advice] ${model} → ${res.status}`); continue; }
        const data = await res.json();
        const raw  = data.choices?.[0]?.message?.content?.trim();
        if (raw) { setAiAdvice(sanitizeAIText(raw)); return; }
      } catch (e) {
        console.warn(`[AI Advice] ${model} error:`, e);
      }
    }
    setAiAdvice(fallback);
  }, []);

  // ── Fetch weather data ─────────────────────────────────────────────────
  const fetchData = useCallback(async (
    lat: number,
    lon: number,
    citySearch?: string
  ) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    const sLat  = isNaN(lat) ? DEFAULT_LAT : lat;
    const sLon  = isNaN(lon) ? DEFAULT_LON : lon;
    const query = citySearch
      ? encodeURIComponent(citySearch.trim())
      : `${sLat},${sLon}`;

    setLoading(true);
    setAiAdvice('Sedang menganalisis cuaca...');

    try {
      const [curRes, fcRes] = await Promise.all([
        fetch(`https://api.weatherapi.com/v1/current.json?key=${WAPI_KEY}&q=${query}&aqi=yes&lang=id`),
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WAPI_KEY}&q=${query}&days=7&aqi=yes&alerts=yes&lang=id`),
      ]);

      if (!curRes.ok) {
        const errText = await curRes.text().catch(() => '');
        throw new Error(`WeatherAPI ${curRes.status}: ${errText}`);
      }

      const [cur, fc] = await Promise.all([
        curRes.json(),
        fcRes.ok ? fcRes.json() : Promise.resolve(null),
      ]);

      const today      = fc?.forecast?.forecastday?.[0];
      const tomorrow   = fc?.forecast?.forecastday?.[1];
      const uvIndex    = today?.day?.uv ?? fc?.current?.uv ?? cur.current?.uv ?? null;
      const rainChance = today?.day?.daily_chance_of_rain ?? 0;

      const rawAlerts: WeatherAlert[] = (fc?.alerts?.alert ?? []).map((a: any) => ({
        headline: a.headline ?? a.event ?? 'Peringatan Cuaca',
        severity: (a.severity?.toLowerCase() ?? 'moderate') as WeatherAlert['severity'],
        event:    a.event ?? '',
        desc:     a.desc  ?? '',
      }));

      const localAlerts: WeatherAlert[] = [];
      const tNow = Math.round(cur.current.temp_c);
      const wNow = Math.round(cur.current.wind_kph);
      const uNow = uvIndex ?? 0;
      if (tNow >= 38)       localAlerts.push({ headline: 'Suhu Sangat Tinggi',   severity: 'severe',   event: 'Panas Ekstrem', desc: `Suhu ${tNow}°C sangat berbahaya. Hindari aktivitas luar dan perbanyak minum air.` });
      if (wNow >= 60)       localAlerts.push({ headline: 'Angin Kencang',        severity: 'moderate', event: 'Angin Kuat',    desc: `Kecepatan angin ${wNow} km/jam. Waspadai pohon tumbang dan berkendara hati-hati.` });
      if (uNow >= 8)        localAlerts.push({ headline: 'UV Index Berbahaya',   severity: 'moderate', event: 'UV Tinggi',     desc: `UV Index ${uNow}. Gunakan tabir surya SPF 30+ dan hindari paparan matahari pukul 10.00–16.00.` });
      if (rainChance >= 80) localAlerts.push({ headline: 'Hujan Lebat Hari Ini', severity: 'moderate', event: 'Hujan Deras',   desc: `Peluang hujan ${rainChance}%. Siapkan payung dan waspadai genangan.` });

      const allAlerts = [...rawAlerts, ...localAlerts];
      setAlerts(allAlerts);

      const weather: WeatherData = {
        temp:        Math.round(cur.current.temp_c),
        feels_like:  Math.round(cur.current.feelslike_c),
        temp_min:    Math.round(today?.day?.mintemp_c  ?? cur.current.temp_c),
        temp_max:    Math.round(today?.day?.maxtemp_c  ?? cur.current.temp_c),
        humidity:    cur.current.humidity,
        wind_speed:  Math.round(cur.current.wind_kph),
        visibility:  Math.round(cur.current.vis_km),
        city:        cur.location.name,
        description: cur.current.condition.text,
        icon:        `https:${cur.current.condition.icon}`,
        uv_index:    uvIndex,
        sunrise:     today?.astro?.sunrise ?? null,
        sunset:      today?.astro?.sunset  ?? null,
        rain_chance:  rainChance,
        alerts:       allAlerts,
        wind_degree:  cur.current.wind_degree ?? 0,
        wind_dir:     cur.current.wind_dir ?? 'N',
      };
      setWeatherData(weather);
      setCoords({ lat: cur.location.lat, lon: cur.location.lon });

      const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const days = fc?.forecast?.forecastday ?? [];
      if (days.length > 0) {
        setDailyData(days.map((d: any, i: number) => ({
          day:  i === 0 ? 'Hari Ini' : HARI[new Date(d.date).getDay()],
          icon: getWeatherIcon(d.day.condition.code),
          high: Math.round(d.day.maxtemp_c),
          low:  Math.round(d.day.mintemp_c),
        })));
      }

      const curHour   = new Date().getHours();
      const todayHrs  = (today?.hour ?? []).slice(curHour);
      const tomHrs    = (tomorrow?.hour ?? []).slice(0, 10);
      const combined  = [...todayHrs, ...tomHrs].slice(0, 10);

      const parsedHourly: ForecastHour[] = combined.length >= 3
        ? combined.map((h: any, i: number) => ({
            time:        i === 0 ? 'Kini' : new Date(h.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            temp:        Math.round(h.temp_c),
            icon:        getWeatherIcon(h.condition.code, h.is_day),
            humidity:    h.humidity,
            wind_speed:  Math.round(h.wind_kph),
            rain_chance: h.chance_of_rain,
          }))
        : MOCK_HOURLY;
      setHourlyData(parsedHourly);

      const aqiSrc = cur.current.air_quality ?? today?.day?.air_quality ?? {};
      const aqi: AQIData = {
        aqi:   Math.min(aqiSrc?.['us-epa-index'] ?? 1, 5),
        pm2_5: aqiSrc?.pm2_5   ?? 0,
        pm10:  aqiSrc?.pm10    ?? 0,
        no2:   aqiSrc?.no2_ppb ?? aqiSrc?.no2 ?? 0,
        o3:    aqiSrc?.o3_ppb  ?? aqiSrc?.o3  ?? 0,
      };
      setAqiData(aqi);
      setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));

      fetchAIAdvice(weather, aqi, parsedHourly);

      if (citySearch) {
        setLocationSource('search');
        setSearchHistory(prev => {
          const next = [citySearch, ...prev.filter(c => c !== citySearch)].slice(0, 5);
          try { localStorage.setItem('weather_search_history', JSON.stringify(next)); } catch {}
          return next;
        });
      }

    } catch (err) {
      console.error('[fetchData]', err);
      setAiAdvice('Gagal memuat data cuaca. Periksa koneksi internet kamu.');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [fetchAIAdvice]);

  // ── IMPROVED: Smart multi-strategy geolocation on mount ───────────────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setLocationStatus('detecting');

      const { lat, lon, source } = await getBestCoords(WAPI_KEY);
      if (cancelled) return;

      setLocationSource(source);

      if (source === 'gps-high' || source === 'gps-low') {
        setLocationStatus('granted');
      } else if (source === 'ip') {
        // IP masih bisa detect kota dengan benar, tapi kurang presisi
        setLocationStatus('granted');
      } else {
        setLocationStatus('denied');
      }

      fetchData(lat, lon);
    };

    init();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-refresh every 10 min ──────────────────────────────────────────
  useEffect(() => {
    const { lat, lon } = coords;
    const t = setInterval(() => fetchData(lat, lon), 10 * 60 * 1000);
    return () => clearInterval(t);
  }, [coords, fetchData]);

  const handleSearch = useCallback(
    (city: string) => fetchData(DEFAULT_LAT, DEFAULT_LON, city),
    [fetchData]
  );

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try { localStorage.removeItem('weather_search_history'); } catch {}
  }, []);

  // ── Re-request location ────────────────────────────────────────────────
  // Langsung minta GPS fresh, maximumAge: 0 = wajib baru (no cache)
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setLocationStatus('granted');
        setLocationSource('gps-high');
        // FIX: reset fetchingRef dulu supaya fetchData tidak ter-block
        fetchingRef.current = false;
        fetchData(latitude, longitude);
      },
      (err) => {
        // Kalau GPS masih gagal setelah user klik, jangan silent fallback ke IP
        // Biarkan banner tetap kelihatan supaya user tahu harus ubah setting
        console.warn('[requestLocation] GPS failed:', err.message);
        setLocationStatus('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 0,
      }
    );
  }, [fetchData]);

  return {
    currentTime, loading, weatherData, aqiData, alerts, coords,
    aiAdvice, lastUpdated, searchHistory, hourlyData, dailyData,
    locationStatus, locationSource, handleSearch, clearHistory, fetchData,
    requestLocation,
  };
}