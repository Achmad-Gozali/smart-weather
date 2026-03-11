'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Menu, X, Clock, Trash2 } from 'lucide-react';

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
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  isCelsius,
  setIsCelsius,
  onSearch,
  searchHistory,
  clearHistory,
  city = 'Jakarta',
  country = 'ID',
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [showHistory, setShowHistory] = React.useState(false);

  const formattedDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
      setInputValue('');
      setShowHistory(false);
    }
  };

  return (
    <header className="flex justify-between items-center mb-6 md:mb-10 gap-4 relative z-50">
      <div className="flex items-center gap-4 flex-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-3 bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 text-slate-700"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>

        <div className="relative w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 200)}
              placeholder="Cari kota..."
              className="w-full bg-white/90 backdrop-blur-xl border-none rounded-2xl py-3 md:py-4 pl-12 md:pl-14 pr-6 shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 font-medium text-sm md:text-base"
            />
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 md:w-5 md:h-5" />
          </form>

          {/* Dropdown Riwayat Pencarian */}
          <AnimatePresence>
            {showHistory && searchHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
              >
                <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Pencarian Terakhir
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); clearHistory(); }}
                    className="text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {searchHistory.map((c, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { onSearch(c); setShowHistory(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <Clock className="w-4 h-4 text-slate-300" />
                      <span className="text-sm font-medium text-slate-600">{c}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsCelsius(!isCelsius)}
          className="bg-white/90 backdrop-blur-xl px-3 md:px-4 py-2 md:py-3 rounded-2xl shadow-sm border border-white/50 text-xs md:text-sm font-bold text-blue-600 flex items-center gap-2"
        >
          <span className={isCelsius ? 'opacity-100' : 'opacity-30'}>°C</span>
          <div className="w-[1px] h-3 bg-slate-200" />
          <span className={!isCelsius ? 'opacity-100' : 'opacity-30'}>°F</span>
        </motion.button>

        <div className="hidden sm:flex items-center space-x-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-white">{city}, {country}</p>
            <p className="text-xs text-white/70 font-medium">{formattedDate}</p>
          </div>
          <motion.div
            whileHover={{ rotate: 15 }}
            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/90 backdrop-blur-xl shadow-sm flex items-center justify-center"
          >
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default SearchHeader;