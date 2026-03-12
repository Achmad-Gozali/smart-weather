'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wind, Droplets, Eye, AlertTriangle } from 'lucide-react';
import BentoCard from './BentoCard';
import { WeatherMetric, AQIData } from '../lib/mockData';
import { getUVLevel } from '../hooks/useWeather';

interface BentoDetailsProps {
  metrics: WeatherMetric[];
  isCelsius: boolean;
  convert: (temp: number) => number;
  aqiData?: AQIData;
  compact?: boolean;
  gridCols?: 2 | 4;
}

const AQI_LEVELS = [
  { label: 'Baik',         color: 'bg-emerald-500', text: 'text-emerald-400', desc: 'Sehat',            range: '0–50'   },
  { label: 'Sedang',       color: 'bg-lime-500',    text: 'text-lime-400',    desc: 'Dapat Diterima',   range: '51–100' },
  { label: 'Tidak Sehat',  color: 'bg-yellow-500',  text: 'text-yellow-400',  desc: 'Cukup Berbahaya',  range: '101–150'},
  { label: 'Buruk',        color: 'bg-orange-500',  text: 'text-orange-400',  desc: 'Tidak Sehat',      range: '151–200'},
  { label: 'Sangat Buruk', color: 'bg-rose-500',    text: 'text-rose-400',    desc: 'Sangat Berbahaya', range: '201+'   },
];

const labelMap: Record<string, string> = {
  'Humidity':   'Kelembaban',
  'Wind':       'Kecepatan Angin',
  'Feels Like': 'Terasa Seperti',
  'Visibility': 'Jarak Pandang',
};

const AnimatedTemp = ({ value, className = "" }: { value: number; className?: string }) => (
  <AnimatePresence mode="wait">
    <motion.span key={value} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className={className}>
      {value}
    </motion.span>
  </AnimatePresence>
);

// ── AQI Detail Modal ───────────────────────────────────────────────────────
const PolutanRow = ({ label, value, unit, status, statusColor }: { label: string; value: number; unit: string; status: string; statusColor: string }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <div>
      <p className="text-sm font-bold text-white">{label}</p>
      <p className={`text-xs font-semibold ${statusColor}`}>{status}</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-black text-white">{value.toFixed(1)}</p>
      <p className="text-xs text-white/40">{unit}</p>
    </div>
  </div>
);

const getStatus = (val: number, thresholds: number[]): { label: string; color: string } => {
  if (val <= thresholds[0]) return { label: 'Baik',         color: 'text-emerald-400' };
  if (val <= thresholds[1]) return { label: 'Sedang',       color: 'text-lime-400'    };
  if (val <= thresholds[2]) return { label: 'Tidak Sehat',  color: 'text-yellow-400'  };
  if (val <= thresholds[3]) return { label: 'Buruk',        color: 'text-orange-400'  };
  return                           { label: 'Sangat Buruk', color: 'text-rose-400'    };
};

const AQIModal = ({ aqiData, aqiInfo, currentAQI, onClose }: { aqiData: AQIData; aqiInfo: typeof AQI_LEVELS[0]; currentAQI: number; onClose: () => void }) => {
  const pm25Status  = getStatus(aqiData.pm2_5, [12, 35.4, 55.4, 150.4]);
  const pm10Status  = getStatus(aqiData.pm10,  [54, 154,  254,  354]);
  const no2Status   = getStatus(aqiData.no2,   [40, 70,   150,  200]);
  const o3Status    = getStatus(aqiData.o3,    [60, 100,  140,  180]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-white">Kualitas Udara</h2>
            <p className="text-xs text-white/40 mt-0.5">Indeks & detail polutan</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* AQI Score */}
        <div className={`rounded-2xl p-4 mb-5 bg-white/5 border border-white/10`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Indeks Kualitas Udara</p>
              <p className={`text-3xl font-black ${aqiInfo.text}`}>{aqiInfo.label}</p>
              <p className="text-xs text-white/40 mt-1">{aqiInfo.desc} · Skala {aqiInfo.range}</p>
            </div>
            <div className={`w-16 h-16 rounded-2xl ${aqiInfo.color} flex items-center justify-center`}>
              <span className="text-2xl font-black text-white">{currentAQI}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(currentAQI / 5) * 100}%` }} transition={{ duration: 1 }} className={`h-full ${aqiInfo.color} rounded-full`} />
          </div>
          <div className="flex justify-between mt-1">
            {AQI_LEVELS.map((l, i) => (
              <span key={i} className={`text-[8px] font-bold ${i + 1 === currentAQI ? aqiInfo.text : 'text-white/20'}`}>{l.label}</span>
            ))}
          </div>
        </div>

        {/* Polutan Detail */}
        <div className="mb-4">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Semua Polutan</p>
          <div className="bg-white/5 rounded-2xl px-4">
            <PolutanRow label="PM2.5 (Partikulat halus)" value={aqiData.pm2_5} unit="µg/m³" status={pm25Status.label} statusColor={pm25Status.color} />
            <PolutanRow label="PM10 (Partikulat kasar)" value={aqiData.pm10}  unit="µg/m³" status={pm10Status.label} statusColor={pm10Status.color} />
            <PolutanRow label="NO₂ (Nitrogen Dioksida)"  value={aqiData.no2}  unit="µg/m³" status={no2Status.label}  statusColor={no2Status.color}  />
            <PolutanRow label="O₃ (Ozon)"                value={aqiData.o3}   unit="µg/m³" status={o3Status.label}   statusColor={o3Status.color}   />
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 bg-white/5 rounded-2xl p-3">
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-white/50 leading-relaxed">
            {currentAQI >= 4
              ? 'Kualitas udara tidak sehat. Disarankan mengurangi aktivitas luar ruangan dan menggunakan masker.'
              : currentAQI === 3
              ? 'Kelompok sensitif (lansia, anak-anak, penderita asma) sebaiknya membatasi aktivitas luar.'
              : 'Kualitas udara cukup baik. Aman untuk beraktivitas di luar ruangan.'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const BentoDetails: React.FC<BentoDetailsProps> = ({ metrics, isCelsius, convert, aqiData, compact = false, gridCols = 2 }) => {
  const [showAQIModal, setShowAQIModal] = useState(false);
  const currentAQI = aqiData?.aqi ?? 1;
  const aqiInfo = AQI_LEVELS[Math.min(currentAQI - 1, 4)];
  const colClass = gridCols === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2';

  return (
    <>
      <div className={`grid ${colClass} gap-4`}>
        {metrics.map((metric, idx) => {

          // ── Kualitas Udara (clickable) ────────────────────────────────────
          if (metric.label === 'Air Quality') {
            return (
              <BentoCard key={idx} className="p-5 flex flex-col justify-between group cursor-pointer" delay={0.4 + idx * 0.05}>
                <motion.div className="h-full flex flex-col justify-between" onClick={() => aqiData && setShowAQIModal(true)} whileTap={{ scale: 0.98 }}>
                  <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform inline-flex mb-3 ${metric.color}`}>
                    <div className="w-4 h-4 flex items-center justify-center">{metric.icon}</div>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Kualitas Udara</p>
                    {aqiData ? (
                      <>
                        <p className={`text-lg font-black mb-0.5 ${aqiInfo.text}`}>{aqiInfo.label}</p>
                        <p className="text-[10px] font-bold text-white/40 mb-1.5">AQI {currentAQI} / 5</p>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(currentAQI / 5) * 100}%` }} transition={{ duration: 1 }} className={`h-full ${aqiInfo.color}`} />
                        </div>
                        <p className="text-[9px] font-medium text-blue-400 mt-1.5">Tap untuk detail →</p>
                      </>
                    ) : (
                      <p className="text-lg font-black text-white/30">N/A</p>
                    )}
                  </div>
                </motion.div>
              </BentoCard>
            );
          }

          // ── Indeks UV ────────────────────────────────────────────────────
          if (metric.label === 'UV Index') {
            const uvRaw = metric.value;
            const uvNum = typeof uvRaw === 'number' ? uvRaw : null;
            const uvLevel = uvNum != null ? getUVLevel(uvNum) : null;
            const uvPct = uvNum != null ? Math.min((uvNum / 11) * 100, 100) : 0;
            return (
              <BentoCard key={idx} className="p-5 flex flex-col justify-between group" delay={0.4 + idx * 0.05}>
                <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform inline-flex mb-3 ${metric.color}`}>
                  <div className="w-4 h-4 flex items-center justify-center">{metric.icon}</div>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Indeks UV</p>
                  {uvNum != null && uvLevel ? (
                    <>
                      <p className={`text-lg font-black mb-0.5 ${uvLevel.color}`}>{uvLevel.label}</p>
                      <p className="text-[10px] font-bold text-white/40 mb-1.5">UV {uvNum} / 11</p>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${uvPct}%` }} transition={{ duration: 1 }} className="h-full bg-orange-400 rounded-full" />
                      </div>
                    </>
                  ) : (
                    <p className="text-lg font-black text-white/30 mb-1">N/A</p>
                  )}
                  <p className="text-[9px] font-medium text-white/30">{metric.sub}</p>
                </div>
              </BentoCard>
            );
          }

          // ── Matahari Terbit / Terbenam ────────────────────────────────────
          if (metric.label === 'Sunrise' || metric.label === 'Sunset') {
            return (
              <BentoCard key={idx} className="p-5 flex flex-col justify-between group" delay={0.4 + idx * 0.05}>
                <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform inline-flex mb-3 ${metric.color}`}>
                  <div className="w-4 h-4 flex items-center justify-center">{metric.icon}</div>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">
                    {metric.label === 'Sunrise' ? 'Matahari Terbit' : 'Matahari Terbenam'}
                  </p>
                  <p className="text-lg font-black text-white mb-1">{metric.value !== 'N/A' && metric.value ? String(metric.value) : '—'}</p>
                  <p className="text-[9px] font-medium text-white/30">{metric.sub}</p>
                </div>
              </BentoCard>
            );
          }

          // ── Default ──────────────────────────────────────────────────────
          return (
            <BentoCard key={idx} className="p-5 flex flex-col justify-between group" delay={0.4 + idx * 0.05}>
              <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform inline-flex mb-3 ${metric.color}`}>
                <div className="w-4 h-4 flex items-center justify-center">{metric.icon}</div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">
                  {labelMap[metric.label] ?? metric.label}
                </p>
                <p className="text-lg font-black text-white mb-1">
                  {metric.label === 'Feels Like'
                    ? <><AnimatedTemp value={convert(typeof metric.value === 'number' ? metric.value : 26)} />°</>
                    : metric.value}
                </p>
                <p className="text-[9px] font-medium text-white/30 leading-tight">{metric.sub}</p>
              </div>
            </BentoCard>
          );
        })}
      </div>

      {/* AQI Modal */}
      <AnimatePresence>
        {showAQIModal && aqiData && (
          <AQIModal aqiData={aqiData} aqiInfo={aqiInfo} currentAQI={currentAQI} onClose={() => setShowAQIModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default BentoDetails;