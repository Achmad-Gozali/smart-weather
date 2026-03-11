'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import BentoCard from './BentoCard';

interface AIInsightProps {
  advice: string;
}

const AIInsight: React.FC<AIInsightProps> = ({ advice }) => {
  const isLoading = advice === 'Sedang menganalisis cuaca...';

  return (
    <BentoCard
      isAI
      className="border-2 border-blue-100 bg-blue-50/30 p-8 md:p-10 flex flex-col justify-between"
      delay={0.2}
    >
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: isLoading ? 360 : [0, 10, -10, 0] }}
            transition={isLoading
              ? { repeat: Infinity, duration: 1, ease: 'linear' }
              : { repeat: Infinity, duration: 2 }
            }
            className="bg-blue-600 p-2.5 md:p-3 rounded-2xl shadow-lg shadow-blue-200"
          >
            <Sparkles className="text-white w-5 h-5 md:w-6 md:h-6" />
          </motion.div>
          <span className="text-[10px] md:text-xs font-black text-blue-600 uppercase tracking-widest">
            AI Assistant
          </span>
        </div>

        {isLoading ? (
          // Loading skeleton
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-blue-100 rounded-full w-full" />
            <div className="h-4 bg-blue-100 rounded-full w-5/6" />
            <div className="h-4 bg-blue-100 rounded-full w-4/6" />
          </div>
        ) : (
          <motion.p
            key={advice}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-lg md:text-xl font-medium text-slate-700 leading-relaxed italic"
          >
            &quot;{advice}&quot;
          </motion.p>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        disabled={isLoading}
        className="w-full py-3 md:py-4 bg-white hover:bg-blue-600 hover:text-white transition-all rounded-2xl text-[10px] md:text-xs font-bold text-blue-600 tracking-widest border border-blue-100 shadow-sm disabled:opacity-40"
      >
        LIHAT DETAIL
      </motion.button>
    </BentoCard>
  );
};

export default AIInsight;