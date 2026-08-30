"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Compass, Search, ArrowRight, Sparkles, MapPin, Anchor,
  CheckCircle2, AlertCircle, RefreshCw
} from "lucide-react";
import { CoastalLocation } from "@/types";
import { searchLocations } from "@/lib/apiClient";
import { translations, SupportedLanguage } from "@/lib/i18n";

interface Props {
  onSearch: (query: string, location?: CoastalLocation) => void;
  isLoading: boolean;
  selectedLocation?: CoastalLocation | null;
  onSelectLocation: (loc: CoastalLocation) => void;
  language: string;
}

export function HeroQueryConsole({
  onSearch,
  isLoading,
  selectedLocation,
  onSelectLocation,
  language
}: Props) {
  const t = translations[(language as SupportedLanguage) || "en"] || translations.en;
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CoastalLocation[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize initial query text when location or language changes
  useEffect(() => {
    const locName = selectedLocation ? selectedLocation.name : "Visakhapatnam";
    if (language === "te") {
      setQuery(`నేను రేపు ఉదయం ${locName} సమీపంలో చేపల వేటకు వెళ్ళవచ్చా? ఇది సురక్షితమేనా?`);
    } else if (language === "hi") {
      setQuery(`क्या मैं कल सुबह ${locName} के पास मछली पकड़ने जा सकता हूँ? क्या यह सुरक्षित है?`);
    } else if (language === "ta") {
      setQuery(`நான் நாளை காலை ${locName} அருகில் மீன்பிடிக்க செல்லலாமா? அது பாதுகாப்பானதா?`);
    } else if (language === "ml") {
      setQuery(`നാളെ രാവിലെ എനിക്ക് ${locName} സമീപം മത്സ്യബന്ധനത്തിന് പോകാമോ? ഇത് സുരക്ഷിതമാണോ?`);
    } else if (language === "mr") {
      setQuery(`मी उद्या सकाळी ${locName} जवळ मासेमारीला जाऊ शकतो का? हे सुरक्षित आहे का?`);
    } else if (language === "gu") {
      setQuery(`શું હું કાલે સવારે ${locName} નજીક માછીમારી માટે જઈ શકું? શું તે સલામત છે?`);
    } else if (language === "bn") {
      setQuery(`আমি কি কাল সকালে ${locName} এর কাছে মাছ ধরতে যেতে পারি? এটা কি নিরাপদ?`);
    } else if (language === "kn") {
      setQuery(`ನಾನು ನಾಳೆ ಬೆಳಿಗ್ಗೆ ${locName} ಬಳಿ ಮೀನುಗಾರಿಕೆಗೆ ಹೋಗಬಹುದೇ? ಇದು ಸುರಕ್ಷಿತವೇ?`);
    } else if (language === "or") {
      setQuery(`ମୁଁ କାଲି ସକାଳେ ${locName} ନିକଟରେ ମାଛ ଧରିବାକୁ ଯାଇପାରିବି କି? ଏହା ସୁରକ୍ଷିତ କି?`);
    } else {
      setQuery(`I'm fishing near ${locName} tomorrow morning. Is it safe, and where should I go?`);
    }
  }, [selectedLocation, language]);

  // Handle location search suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (showDropdown) {
        const results = await searchLocations(searchQuery);
        setSuggestions(results);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, showDropdown]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query, selectedLocation || undefined);
  };

  const handleQuickQuestion = (typeKey: "q1" | "q2" | "q3") => {
    const locName = selectedLocation ? selectedLocation.name : "Visakhapatnam";
    let formattedText = "";
    if (language === "te") {
      if (typeKey === "q1") formattedText = `నేను రేపు ఉదయం ${locName} దగ్గర చేపల వేటకు వెళ్ళవచ్చా?`;
      if (typeKey === "q2") formattedText = `${locName} నుండి సమీపంలోని చేపల నిల్వల జోన్ (PFZ) ఎక్కడ ఉంది?`;
      if (typeKey === "q3") formattedText = `నేను రేపు సాయంత్రం ${locName} వద్ద చేపల వేటకు వెళితే ఎలా ఉంటుంది?`;
    } else if (language === "hi") {
      if (typeKey === "q1") formattedText = `क्या मुझे कल सुबह ${locName} के पास मछली पकड़ने जाना चाहिए?`;
      if (typeKey === "q2") formattedText = `${locName} के निकटतम मत्स्य क्षेत्र (PFZ) कहाँ है?`;
      if (typeKey === "q3") formattedText = `अगर मैं कल शाम को ${locName} जाऊं तो क्या स्थिति होगी?`;
    } else {
      if (typeKey === "q1") formattedText = `Should I go fishing near ${locName} tomorrow morning?`;
      if (typeKey === "q2") formattedText = `Where is the nearest Potential Fishing Zone from ${locName}?`;
      if (typeKey === "q3") formattedText = `What if I go fishing near ${locName} tomorrow evening?`;
    }
    setQuery(formattedText);
    onSearch(formattedText, selectedLocation || undefined);
  };

  return (
    <div className="relative z-40 rounded-3xl bg-gradient-to-b from-ocean-900/95 via-ocean-950 to-ocean-950 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Hero Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-700/50 text-cyan-300 text-xs font-mono tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.heroBadge}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.heroTitle1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">{t.heroTitle2}</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {t.heroDescription}
        </p>
      </div>

      {/* Location Selector Bar */}
      <div className="flex flex-wrap items-center gap-3 pt-1 relative z-50" ref={dropdownRef}>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowDropdown(!showDropdown);
              setSearchQuery("");
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ocean-900 border border-slate-700 hover:border-cyan-400 text-xs text-slate-100 hover:text-white transition-all shadow-md cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">{selectedLocation ? selectedLocation.name : "Visakhapatnam"}</span>
            <span className="text-slate-400 text-[11px] font-mono">({selectedLocation ? selectedLocation.state : "Andhra Pradesh"})</span>
            <span className="text-cyan-400 text-[10px] ml-1">▼</span>
          </button>

          {/* Autocomplete Dropdown with Solid Opaque Background & High Z-Index */}
          {showDropdown && (
            <div className="absolute left-0 top-full mt-2 w-84 max-h-80 overflow-y-auto bg-slate-950 border-2 border-cyan-500/80 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,1)] z-[999] p-2 space-y-1 ring-2 ring-cyan-500/30">
              <div className="p-2 border-b border-slate-800 bg-slate-950 rounded-xl mb-1 sticky top-0 z-20">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.typePortOrDistrict}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-sans"
                  autoFocus
                />
              </div>
              <div className="py-1 space-y-0.5">
                {suggestions.length === 0 ? (
                  <div className="p-4 text-xs text-slate-400 text-center font-mono">
                    {t.noPortsFound}
                  </div>
                ) : (
                  suggestions.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        onSelectLocation(loc);
                        setShowDropdown(false);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-cyan-950/70 border border-transparent hover:border-cyan-800/60 flex items-center justify-between text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-900 group-hover:bg-cyan-900 border border-slate-800 group-hover:border-cyan-600 text-cyan-400">
                          {loc.category === "Port" ? <Anchor className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-200">
                            {loc.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-sans">
                            {loc.state} &bull; <span className="text-slate-500">{loc.category}</span>
                          </div>
                        </div>
                      </div>
                      {loc.is_demo_scenario && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300">
                          DEMO
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">&bull;</span>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          {selectedLocation ? `${selectedLocation.region} (${selectedLocation.category})` : "East Coast Offshore Sector"}
        </span>
      </div>

      {/* Main Natural Language Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center rounded-2xl bg-ocean-950 border border-slate-700 focus-within:border-cyan-400 shadow-xl transition-all p-2 pl-4">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer shrink-0 ml-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.analyzing}</span>
              </>
            ) : (
              <>
                <span>{t.askOrca}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Questions */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-mono text-slate-400 mr-1">{t.quickQuestionsLabel}</span>
        <button
          type="button"
          onClick={() => handleQuickQuestion("q1")}
          className="px-3 py-1.5 rounded-xl bg-ocean-900/80 hover:bg-ocean-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition-all font-sans cursor-pointer"
        >
          {t.quickQ1}
        </button>
        <button
          type="button"
          onClick={() => handleQuickQuestion("q2")}
          className="px-3 py-1.5 rounded-xl bg-ocean-900/80 hover:bg-ocean-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition-all font-sans cursor-pointer"
        >
          {t.quickQ2}
        </button>
        <button
          type="button"
          onClick={() => handleQuickQuestion("q3")}
          className="px-3 py-1.5 rounded-xl bg-ocean-900/80 hover:bg-ocean-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition-all font-sans cursor-pointer"
        >
          {t.quickQ3}
        </button>
      </div>
    </div>
  );
}
