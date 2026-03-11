'use client';

import React from 'react';

export const WeatherSkeleton = () => {
  return (
    <div className="w-full max-w-md space-y-6">
      {/* Main Card Skeleton */}
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 animate-pulse">
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-4">
            <div className="h-4 bg-white/10 rounded-full w-24" />
            <div className="h-20 bg-white/10 rounded-3xl w-32" />
          </div>
          <div className="h-24 bg-white/10 rounded-full w-24" />
        </div>
        
        <div className="h-6 bg-white/10 rounded-full w-40 mb-10" />

        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 bg-white/10 rounded-full" />
              <div className="h-3 bg-white/10 rounded-full w-12" />
              <div className="h-4 bg-white/10 rounded-full w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* AI Card Skeleton */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 animate-pulse">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-white/10 rounded-lg" />
          <div className="h-4 bg-white/10 rounded-full w-32" />
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-white/10 rounded-full w-full" />
          <div className="h-4 bg-white/10 rounded-full w-4/5" />
        </div>
      </div>
    </div>
  );
};
