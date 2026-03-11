'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Home, Map, Settings, CloudRain, LucideIcon } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SidebarItem = ({
  icon: Icon,
  active = false,
  onClick,
}: {
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
}) => (
  <motion.div
    whileTap={{ scale: 0.9 }}
    whileHover={{ scale: 1.1 }}
    onClick={onClick}
    className={`p-4 rounded-2xl cursor-pointer transition-all relative group ${
      active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
        : 'text-white/60 hover:bg-white/20 hover:text-white'
    }`}
  >
    <Icon className="w-6 h-6" />
    {active && (
      <motion.div
        layoutId="sidebar-active"
        className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full hidden lg:block"
      />
    )}
  </motion.div>
);

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="hidden lg:flex flex-col items-center py-10 px-6 w-24 space-y-8 sticky top-0 h-screen z-40 bg-white/10 backdrop-blur-xl border-r border-white/20">
      <motion.div
        whileHover={{ rotate: 15 }}
        className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/30 mb-8"
      >
        <CloudRain className="text-white w-7 h-7" />
      </motion.div>
      <SidebarItem icon={Home}     active={activeTab === 'home'}     onClick={() => setActiveTab('home')} />
      <SidebarItem icon={Map}      active={activeTab === 'map'}      onClick={() => setActiveTab('map')} />
      <SidebarItem icon={Settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
    </aside>
  );
};

export default Sidebar;