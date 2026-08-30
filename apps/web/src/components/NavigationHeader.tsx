'use client';

import React from 'react';
import {
  Compass, Radio, Sparkles, User, Globe, Home,
  Anchor, Bot, ShieldCheck
} from 'lucide-react';
import { translations, SupportedLanguage } from '@/lib/i18n';

export type PrimaryTab = 'home' | 'orca' | 'ai';

interface Props {
  activeTab: PrimaryTab;
  onTabChange: (tab: PrimaryTab) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onOpenProfile: () => void;
  onQuickSearch?: (query: string) => void;
}

export function NavigationHeader({
  activeTab,
  onTabChange,
  language = 'en',
  onLanguageChange,
  onOpenProfile
}: Props) {
  const langKey = ((language && translations[language as SupportedLanguage]) ? language : 'en') as SupportedLanguage;
  const t = translations[langKey] || translations.en;

  const languages: { code: SupportedLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        {/* BRAND IDENTITY */}
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 cursor-pointer group text-left"
        >
          <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/50 group-hover:scale-105 transition-all shrink-0">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white font-mono tracking-tight group-hover:text-cyan-300 transition-colors">
                {t.appName || 'ORCA'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold hidden sm:inline-block">
                {t.badgeLive || 'SYSTEM OPERATIONAL'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-wide truncate max-w-[200px] sm:max-w-md">
              {t.appSubtitle || 'Marine Ecosystem Reasoning with Collaborative Agents'}
            </p>
          </div>
        </button>

        {/* PRIMARY 3 NAVIGATION TABS */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-inner">
          <button
            onClick={() => onTabChange('home')}
            className={`px-5 py-2 rounded-xl text-xs font-mono font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.navHome || 'HOME'}</span>
          </button>

          <button
            onClick={() => onTabChange('orca')}
            className={`px-5 py-2 rounded-xl text-xs font-mono font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orca'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Anchor className="w-3.5 h-3.5" />
            <span>{t.navOrca || 'ORCA / CAPTAIN'}</span>
          </button>

          <button
            onClick={() => onTabChange('ai')}
            className={`px-5 py-2 rounded-xl text-xs font-mono font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{t.navAi || 'AI ASSISTANCE'}</span>
          </button>
        </nav>

        {/* RIGHT CONTROLS: 10-LANGUAGE SELECTOR & PROFILE */}
        <div className="flex items-center gap-2.5">
          {/* Custom Language Dropdown */}
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 hover:border-cyan-800 transition-all">
            <Globe className="w-3.5 h-3.5 text-cyan-400 mr-2 shrink-0" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              aria-label="Select Language"
              className="bg-transparent text-xs font-mono font-bold text-slate-200 outline-none cursor-pointer pr-1"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenProfile}
            aria-label="User Profile"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-800 text-slate-400 hover:text-cyan-400 cursor-pointer transition-all"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
