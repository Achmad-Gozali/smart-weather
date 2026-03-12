'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Clock, Trash2, MapPin, Loader2, MapPinOff, Wifi } from 'lucide-react';
import { LocationSource } from '@/hooks/useWeather';

interface SearchHeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  isCelsius: boolean;
  setIsCelsius: (celsius: boolean) => void;
  onSearch: (city: string) => void;
  searchHistory: string[];
  clearHistory: () => void;
  city?: string;
  country?: string;
  locationStatus?: 'detecting' | 'granted' | 'denied' | 'idle';
  locationSource?: LocationSource | null;
}

// Label + warna berdasarkan sumber lokasi
const SOURCE_BADGE: Record<LocationSource, { label: string; color: string; icon: React.ElementType }> = {
  'gps-high': { label: 'GPS Akurat',   color: 'text-emerald-400', icon: MapPin  },
  'gps-low':  { label: 'GPS Cepat',    color: 'text-blue-400',    icon: MapPin  },
  'ip':       { label: 'Via IP',       color: 'text-yellow-400',  icon: Wifi    },
  'default':  { label: 'Lokasi default', color: 'text-white/35',  icon: MapPinOff },
  'search':   { label: 'Hasil pencarian', color: 'text-blue-400', icon: Search  },
};

const SearchHeader: React.FC<SearchHeaderProps> = ({
  isMenuOpen, setIsMenuOpen, isCelsius, setIsCelsius,
  onSearch, searchHistory, clearHistory,
  city = 'Jakarta', country = 'ID',
  locationStatus = 'idle', locationSource,
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [showHistory, setShowHistory] = React.useState(false);

  const formattedDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) { onSearch(inputValue.trim()); setInputValue(''); setShowHistory(false); }
  };

  const sourceBadge = locationSource ? SOURCE_BADGE[locationSource] : null;

  return (
    <header className="flex items-center gap-3 mb-8 relative z-50">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 bg-white/12 backdrop-blur-2xl border border-white/15 rounded-2xl px-4 py-3 focus-within:border-white/30 transition-colors">
            <Search className="w-4 h-4 text-white/50 shrink-0" />
            <input
              type="text" value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 200)}
              placeholder="Cari kota..."
              className="bg-transparent text-sm text-white placeholder-white/30 outline-none flex-1 font-medium"
            />
            {inputValue && (
              <button type="button" onClick={() => setInputValue('')}>
                <X className="w-3.5 h-3.5 text-white/50" />
              </button>
            )}
          </div>
        </form>

        {/* Location status badge */}
        <div className="absolute -bottom-6 left-0">
          <AnimatePresence mode="wait">
            {locationStatus === 'detecting' && (
              <motion.div key="detecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                <span className="text-[10px] font-bold text-white/50">Mendeteksi lokasi...</span>
              </motion.div>
            )}
            {locationStatus === 'granted' && sourceBadge && (
              <motion.div key="granted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5" title={`Sumber: ${sourceBadge.label}`}>
                <sourceBadge.icon className={`w-3 h-3 ${sourceBadge.color}`} />
                <span className={`text-[10px] font-bold ${sourceBadge.color} opacity-70`}>
                  {sourceBadge.label}
                </span>
              </motion.div>
            )}
            {locationStatus === 'denied' && (
              <motion.div key="denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5">
                <MapPinOff className="w-3 h-3 text-white/35" />
                <span className="text-[10px] font-bold text-white/35">Lokasi diblokir</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History dropdown */}
        <AnimatePresence>
          {showHistory && searchHistory.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-white/15 overflow-hidden shadow-xl">
              <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Terakhir Dicari</span>
                <button onClick={e => { e.stopPropagation(); clearHistory(); }} className="text-white/35 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {searchHistory.map((c, i) => (
                <button key={i} onClick={() => { onSearch(c); setShowHistory(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left">
                  <Clock className="w-3.5 h-3.5 text-white/35" />
                  <span className="text-sm font-medium text-white/50">{c}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side: °C/°F + city info */}
      <div className="flex items-center gap-3 ml-auto">
        <button onClick={() => setIsCelsius(!isCelsius)}
          className="flex items-center gap-1.5 bg-white/12 border border-white/15 rounded-2xl px-3 py-2.5 text-xs font-bold hover:bg-white/15 transition-colors">
          <span className={isCelsius ? 'text-white' : 'text-white/50'}>°C</span>
          <span className="text-white/35">/</span>
          <span className={!isCelsius ? 'text-white' : 'text-white/50'}>°F</span>
        </button>

        <div className="hidden md:block text-right">
          <p className="text-sm font-bold text-white">{city}, {country}</p>
          <p className="text-[11px] text-white/50 font-medium">{formattedDate}</p>
        </div>
      </div>
    </header>
  );
};

export default SearchHeader;