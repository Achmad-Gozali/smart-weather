'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Home, Map, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = [
  { id: 'home',     Icon: Home,     label: 'Beranda'    },
  { id: 'map',      Icon: Map,      label: 'Peta'       },
  { id: 'settings', Icon: Settings, label: 'Pengaturan' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => (
  <aside className="hidden lg:flex flex-col items-center gap-3 w-16 py-8 px-3 relative z-20">
    {/* Logo */}
    <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
      <span className="text-white text-lg">🌤</span>
    </div>

    {/* Nav */}
    <nav className="flex flex-col gap-2">
      {TABS.map(({ id, Icon, label }) => {
        const active = activeTab === id;
        return (
          <motion.button
            key={id}
            whileTap={{ scale: 0.92 }}
            onClick={() => setActiveTab(id)}
            title={label}
            className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              active ? 'bg-white text-slate-900 shadow-lg' : 'text-white/30 hover:text-white/60 hover:bg-white/10'
            }`}
          >
            <Icon className="w-[18px] h-[18px]" />
            {active && (
              <motion.div layoutId="activeTab"
                className="absolute inset-0 rounded-2xl bg-white -z-10"
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  </aside>
);

export default Sidebar;