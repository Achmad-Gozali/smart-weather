'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { WeatherData, AQIData, DailyForecast, ForecastHour } from '../lib/mockData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface WeatherChatbotProps {
  weatherData: WeatherData | null;
  aqiData: AQIData | null;
  dailyData: DailyForecast[];
  hourlyData?: ForecastHour[];
  isCelsius: boolean;
}

const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY!;

const AQI_LABELS    = ['Baik', 'Sedang', 'Tidak Sehat untuk Kelompok Sensitif', 'Tidak Sehat', 'Sangat Tidak Sehat'];
const AQI_ADVICE    = [
  'Aman untuk semua aktivitas luar ruangan.',
  'Kelompok sensitif sebaiknya kurangi waktu di luar.',
  'Hindari aktivitas berat di luar ruangan. Gunakan masker jika perlu.',
  'Semua orang sebaiknya batasi aktivitas luar. Gunakan masker N95.',
  'Darurat kesehatan. Tetap di dalam ruangan dan tutup ventilasi.',
];

function getNowId() {
  const d = new Date();
  return {
    dateStr: d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    timeStr: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    hour: d.getHours(),
  };
}

function buildSystemPrompt(
  weatherData: WeatherData,
  aqiData: AQIData | null,
  dailyData: DailyForecast[],
  hourlyData: ForecastHour[],
  isCelsius: boolean
): string {
  const { dateStr, timeStr, hour } = getNowId();
  const cv = (t: number) => isCelsius ? `${t}°C` : `${Math.round(t * 9/5 + 32)}°F`;
  const unit = isCelsius ? '°C' : '°F';

  const aqiIdx    = Math.min((aqiData?.aqi ?? 1) - 1, 4);
  const aqiLabel  = AQI_LABELS[aqiIdx];
  const aqiTip    = AQI_ADVICE[aqiIdx];

  const hourlyStr = hourlyData.slice(0, 8).map(h =>
    `  ${h.time}: ${cv(h.temp)}, hujan ${h.rain_chance ?? 0}%, lembab ${h.humidity ?? '-'}%, angin ${h.wind_speed ?? '-'} km/j`
  ).join('\n');

  const dailyStr = dailyData.slice(0, 7).map(d =>
    `  ${d.day}: maks ${cv(d.high)}, min ${cv(d.low)}`
  ).join('\n');

  const timeOfDay = hour < 5 ? 'dini hari' : hour < 11 ? 'pagi' : hour < 15 ? 'siang' : hour < 18 ? 'sore' : 'malam';

  return `Kamu adalah SkyCast AI — asisten cuaca yang akurat, ramah, dan berbicara dalam Bahasa Indonesia yang casual.

ATURAN WAJIB:
1. Jawab HANYA berdasarkan data cuaca di bawah. JANGAN mengarang, berasumsi, atau menggunakan pengetahuan umum yang bertentangan dengan data.
2. Jika ditanya di luar topik cuaca/iklim, tolak dengan sopan dan arahkan kembali ke topik cuaca.
3. Jawaban singkat dan to-the-point (maks 3 kalimat). Gunakan emoji 1-2x per jawaban.
4. Saat menyebut suhu, SELALU gunakan satuan ${unit}.
5. JANGAN pernah bilang "saya tidak tahu" jika datanya ada di bawah.

═══ DATA CUACA REAL-TIME ═══
📅 Waktu: ${timeStr} (${timeOfDay}), ${dateStr}
📍 Kota: ${weatherData.city}

KONDISI SEKARANG:
- Suhu: ${cv(weatherData.temp)} (terasa ${cv(weatherData.feels_like)})
- Suhu hari ini: maks ${cv(weatherData.temp_max)}, min ${cv(weatherData.temp_min)}
- Cuaca: ${weatherData.description}
- Kelembaban: ${weatherData.humidity}%
- Angin: ${weatherData.wind_speed} km/jam
- Jarak pandang: ${weatherData.visibility} km
- UV Index: ${weatherData.uv_index ?? 'N/A'}/11
- Peluang hujan hari ini: ${weatherData.rain_chance}%
- Matahari terbit: ${weatherData.sunrise ?? 'N/A'}
- Matahari terbenam: ${weatherData.sunset ?? 'N/A'}

KUALITAS UDARA:
- Status: ${aqiLabel} (AQI ${aqiData?.aqi ?? 'N/A'}/5)
- PM2.5: ${aqiData?.pm2_5?.toFixed(1) ?? 'N/A'} µg/m³
- PM10: ${aqiData?.pm10?.toFixed(1) ?? 'N/A'} µg/m³
- NO₂: ${aqiData?.no2?.toFixed(1) ?? 'N/A'} µg/m³
- Saran: ${aqiTip}

PRAKIRAAN PER JAM (berikutnya):
${hourlyStr}

PRAKIRAAN 7 HARI:
${dailyStr}
═══════════════════════════`;
}

// FIX: Strip leading emoji lebih akurat menggunakan Unicode property escapes
function stripLeadingEmoji(text: string): string {
  return text.replace(/^[\p{Emoji}\s]+/u, '').trim();
}

const SUGGESTED = [
  '🌧️ Besok hujan ga?',
  '🏃 Cocok buat olahraga?',
  '👕 Pakai baju apa?',
  '😷 Kualitas udara aman?',
  '🌡️ Kapan suhu paling panas?',
  '☂️ Perlu bawa payung?',
];

const WeatherChatbot: React.FC<WeatherChatbotProps> = ({
  weatherData, aqiData, dailyData, hourlyData = [], isCelsius
}) => {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const welcomeMsg: Message = {
    id: 'welcome',
    role: 'assistant',
    content: weatherData
      ? `Halo! Gua SkyCast AI 🌤️ Cuaca di **${weatherData.city}** sekarang ${weatherData.description}, ${weatherData.temp}°${isCelsius ? 'C' : 'F'}. Ada yang mau ditanya?`
      : 'Halo! Gua SkyCast AI 🌤️ Tanya apa aja soal cuaca ya!',
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 300); }, [isOpen]);

  const reset = useCallback(() => setMessages([]), []);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || !weatherData) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(weatherData, aqiData, dailyData, hourlyData, isCelsius);
      const history = [...messages, userMsg].slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'];
      let reply = '';

      for (const model of models) {
        try {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
            body: JSON.stringify({
              model,
              max_tokens: 250,
              temperature: 0.4,
              messages: [
                { role: 'system', content: systemPrompt },
                ...history,
              ],
            }),
          });

          if (!res.ok) { console.warn(`[Chatbot] ${model} failed (${res.status})`); continue; }
          const data = await res.json();
          reply = data.choices?.[0]?.message?.content?.trim() ?? '';
          if (reply) break;
        } catch (e) { console.warn(`[Chatbot] ${model} error:`, e); }
      }

      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply || 'Maaf, gua lagi ga bisa jawab. Coba lagi ya! 🙏',
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: 'Koneksi bermasalah nih. Coba lagi sebentar ya! 🙏',
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, weatherData, aqiData, dailyData, hourlyData, isCelsius, messages]);

  const allMessages = [welcomeMsg, ...messages];

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute inset-0 rounded-2xl bg-blue-400 animate-ping opacity-20 pointer-events-none" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-6 right-6 z-50 w-[370px] h-[560px] bg-slate-900/98 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-gradient-to-r from-blue-600/15 to-violet-600/15 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">SkyCast AI</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-[10px] text-white/40">Online · Groq {weatherData?.city ? `· ${weatherData.city}` : ''}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={reset} title="Reset chat"
                  className="p-2 rounded-xl hover:bg-white/8 transition-colors text-white/30 hover:text-white/60">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/8 transition-colors text-white/30 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {allMessages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === 'assistant' ? 'bg-gradient-to-br from-blue-500 to-violet-600' : 'bg-white/10'
                  }`}>
                    {msg.role === 'assistant'
                      ? <Bot className="w-3.5 h-3.5 text-white" />
                      : <User className="w-3.5 h-3.5 text-white/60" />
                    }
                  </div>
                  <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white/8 border border-white/8 text-white/85 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white/8 border border-white/8 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={endRef} />
            </div>

            {/* FIX: Kirim pertanyaan dengan emoji (bukan strip pakai regex salah) */}
            {messages.length === 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTED.map((q, i) => (
                  <motion.button key={i}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => send(stripLeadingEmoji(q))}
                    className="text-[11px] font-medium bg-white/8 hover:bg-white/15 text-white/60 hover:text-white px-2.5 py-1.5 rounded-full transition-all border border-white/8">
                    {q}
                  </motion.button>
                ))}
              </div>
            )}

            <div className="px-4 pb-4 shrink-0">
              <div className="flex gap-2 bg-white/8 rounded-2xl p-1.5 border border-white/10 focus-within:border-white/20 transition-colors">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  placeholder={weatherData ? `Tanya soal cuaca ${weatherData.city}...` : 'Tanya soal cuaca...'}
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/25 px-2 outline-none font-medium"
                  disabled={isLoading || !weatherData}
                />
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => send(input)}
                  disabled={!input.trim() || isLoading || !weatherData}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-blue-500/20"
                >
                  {isLoading
                    ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    : <Send className="w-3.5 h-3.5 text-white" />
                  }
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WeatherChatbot;