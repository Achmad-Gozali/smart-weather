'use client';

import React from 'react';
import { motion } from 'motion/react';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  isAI?: boolean;
}

const BentoCard: React.FC<BentoCardProps> = ({ 
  children, 
  className = "", 
  delay = 0,
  isAI = false
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={isAI ? { 
      opacity: 1, 
      y: 0,
      boxShadow: [
        "0 8px 30px rgb(0,0,0,0.04)",
        "0 8px 30px rgba(59, 130, 246, 0.15)",
        "0 8px 30px rgb(0,0,0,0.04)"
      ]
    } : { opacity: 1, y: 0 }}
    whileHover={{ scale: 1.01, y: -4 }}
    transition={isAI ? { 
      opacity: { duration: 0.4, delay },
      y: { duration: 0.4, delay },
      boxShadow: { repeat: Infinity, duration: 3, ease: "easeInOut" }
    } : { duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
    className={`bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 ${className}`}
  >
    {children}
  </motion.div>
);

export default BentoCard;
