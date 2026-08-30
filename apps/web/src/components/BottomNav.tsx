'use client';

import React from 'react';
import { Home, Compass, Sparkles } from 'lucide-react';
import { PrimaryTab } from '@/components/NavigationHeader';

interface Props {
  activeTab: PrimaryTab;
  onTabChange: (tab: PrimaryTab) => void;
}

export function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 py-2 px-4 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto font-mono text-[11px]">
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-cyan-400 bg-cyan-950/70 border border-cyan-700/60 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>HOME</span>
        </button>

        <button
          onClick={() => onTabChange('orca')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'orca'
              ? 'text-cyan-400 bg-cyan-950/70 border border-cyan-700/60 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          <span>ORCA</span>
        </button>

        <button
          onClick={() => onTabChange('ai')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'text-teal-400 bg-teal-950/70 border border-teal-700/60 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span>AI</span>
        </button>
      </div>
    </div>
  );
}
