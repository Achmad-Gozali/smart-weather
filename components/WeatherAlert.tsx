'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { WeatherAlert } from '../lib/mockData';

interface WeatherAlertBannerProps {
  alerts: WeatherAlert[];
}

const SEVERITY_STYLES = {
  minor:    { bg: 'bg-yellow-50',  border: 'border-yellow-200', icon: 'text-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
  moderate: { bg: 'bg-orange-50',  border: 'border-orange-200', icon: 'text-orange-500', badge: 'bg-orange-100 text-orange-700' },
  severe:   { bg: 'bg-rose-50',    border: 'border-rose-200',   icon: 'text-rose-500',   badge: 'bg-rose-100 text-rose-700'     },
  extreme:  { bg: 'bg-purple-50',  border: 'border-purple-200', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
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
          const style = SEVERITY_STYLES[alert.severity];
          const isExpanded = expanded.includes(idx);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl border ${style.bg} ${style.border} p-4 md:p-5`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`mt-0.5 shrink-0 ${style.icon}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-black text-slate-900">{alert.headline}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${style.badge}`}>
                        {alert.severity}
                      </span>
                    </div>
                    {alert.event && (
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        {alert.event}
                      </p>
                    )}
                    <AnimatePresence>
                      {isExpanded && alert.desc && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-slate-600 leading-relaxed mt-2"
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
                      className="p-1.5 rounded-xl hover:bg-white/60 transition-colors text-slate-400"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => setDismissed(prev => [...prev, idx])}
                    className="p-1.5 rounded-xl hover:bg-white/60 transition-colors text-slate-400"
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