'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { WeatherAlert } from '../lib/mockData';

interface WeatherAlertBannerProps {
  alerts: WeatherAlert[];
}

// FIX: Ganti light theme (bg-yellow-50, border-yellow-200) → dark/glass theme
const SEVERITY_STYLES = {
  minor:    { bg: 'bg-yellow-500/15',  border: 'border-yellow-400/30', icon: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300' },
  moderate: { bg: 'bg-orange-500/15',  border: 'border-orange-400/30', icon: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
  severe:   { bg: 'bg-rose-500/15',    border: 'border-rose-400/30',   icon: 'text-rose-400',   badge: 'bg-rose-500/20 text-rose-300'     },
  extreme:  { bg: 'bg-purple-500/15',  border: 'border-purple-400/30', icon: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
};

const SEVERITY_LABELS: Record<string, string> = {
  minor:    'Ringan',
  moderate: 'Sedang',
  severe:   'Parah',
  extreme:  'Ekstrem',
};

const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({ alerts }) => {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);

  const visible = alerts.filter((_, i) => !dismissed.includes(i));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      <AnimatePresence>
        {alerts.map((alert, idx) => {
          if (dismissed.includes(idx)) return null;
          const style = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.moderate;
          const isExpanded = expanded.includes(idx);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl border backdrop-blur-xl ${style.bg} ${style.border} p-4 md:p-5`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`mt-0.5 shrink-0 ${style.icon}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-black text-white">{alert.headline}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${style.badge}`}>
                        {SEVERITY_LABELS[alert.severity] ?? alert.severity}
                      </span>
                    </div>
                    {alert.event && (
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
                        {alert.event}
                      </p>
                    )}
                    <AnimatePresence>
                      {isExpanded && alert.desc && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-white/60 leading-relaxed mt-2"
                        >
                          {alert.desc}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {alert.desc && (
                    <button
                      onClick={() => setExpanded(prev =>
                        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                      )}
                      className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white/40"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => setDismissed(prev => [...prev, idx])}
                    className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white/40"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default WeatherAlertBanner;