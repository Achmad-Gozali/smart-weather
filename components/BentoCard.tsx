'use client';

import React from 'react';
import { motion } from 'motion/react';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

const BentoCard: React.FC<BentoCardProps> = ({ children, className = '', delay = 0, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    onClick={onClick}
    className={`bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

export default BentoCard;