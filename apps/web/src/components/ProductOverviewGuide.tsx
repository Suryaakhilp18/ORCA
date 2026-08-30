'use client';

import React, { useState } from 'react';
import {
  Compass, Brain, Waves, CloudSun, Fish, ShieldAlert, Network,
  CheckCircle2, ArrowRight, Sparkles, Ship, Radio, MapPin, Fuel,
  Layers, Volume2, Globe, ShieldCheck
} from 'lucide-react';
import { translations, SupportedLanguage } from '@/lib/i18n';

interface Props {
  onStartMission: () => void;
  language?: string;
}

export function ProductOverviewGuide({ onStartMission, language = 'en' }: Props) {
  const t = translations[(language as SupportedLanguage) || 'en'] || translations.en;
  const [activeTab, setActiveTab] = useState<'what_happens' | 'how_it_works' | 'agents' | 'vessel_safety'>('what_happens');

  return (
    <div className="rounded-3xl bg-gradient-to-b from-ocean-900/95 via-ocean-950 to-ocean-950 border border-slate-800 p-6 sm:p-9 shadow-2xl space-y-8 animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>ORCA SYSTEM ARCHITECTURE & PRODUCT ONBOARDING</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            How ORCA Works & What Happens During Every Mission
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            ORCA is an AI-powered multi-agent marine decision platform that transforms raw satellite, meteorological, oceanographic, and geospatial data into actionable, safe fishing decisions.
          </p>
        </div>

        <button
          onClick={onStartMission}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer shrink-0"
        >
          <span>Launch Mission Cockpit</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-ocean-950 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('what_happens')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all cursor-pointer ${
            activeTab === 'what_happens'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. What Is Going to Happen
        </button>
        <button
          onClick={() => setActiveTab('how_it_works')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all cursor-pointer ${
            activeTab === 'how_it_works'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Step-by-Step Data Flow
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all cursor-pointer ${
            activeTab === 'agents'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Multi-Agent Topology (7 Agents)
        </button>
        <button
          onClick={() => setActiveTab('vessel_safety')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all cursor-pointer ${
            activeTab === 'vessel_safety'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          4. Radar & AIS Vessel Avoidance
        </button>
      </div>

      {/* TAB 1: WHAT IS GOING TO HAPPEN */}
      {activeTab === 'what_happens' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-mono font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white">You Select or Ask</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Choose your home port (e.g. Visakhapatnam, Kochi, Goa) or speak your question in any of 10 Indian coastal languages (Telugu, Hindi, Tamil, Bengali, etc.).
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center font-mono font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Agents Deliberate in Parallel</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                7 specialized agents query INCOIS, IMD, MOSDAC Oceansat-3, Open-Meteo, and PostGIS to assess wave heights, cyclone alerts, and thermal chlorophyll fronts simultaneously.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center font-mono font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Get Go/No-Go Decision & Route</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Receive a clear verdict (🟢 Safe / 🟡 Caution / 🔴 Do Not Venture), exact high-yield PFZ coordinates, tactical safe route bypassing naval zones, and audio voice advisory.
              </p>
            </div>
          </div>

          {/* Key Value Highlights */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-ocean-950 via-cyan-950/40 to-ocean-950 border border-cyan-800/40 space-y-4">
            <h3 className="text-base font-bold text-cyan-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Key Operational Benefits for Fishermen
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono text-slate-200">
              <div className="p-3 rounded-2xl bg-ocean-900 border border-slate-800">
                <b className="text-cyan-400 block mb-1">⛽ 40–55% Fuel Saved</b>
                Avoids random wandering at sea by directing straight to high-density thermal fronts.
              </div>
              <div className="p-3 rounded-2xl bg-ocean-900 border border-slate-800">
                <b className="text-emerald-400 block mb-1">🛡️ 100% Safety Guarantee</b>
                Deterministic hard-gate automatically blocks departure if IMD cyclone alerts are active.
              </div>
              <div className="p-3 rounded-2xl bg-ocean-900 border border-slate-800">
                <b className="text-purple-400 block mb-1">🗺️ Naval Zone Standoff</b>
                3.5 km automated perimeter buffer prevents accidental entry into naval firing ranges.
              </div>
              <div className="p-3 rounded-2xl bg-ocean-900 border border-slate-800">
                <b className="text-teal-400 block mb-1">🗣️ 10 Coastal Languages</b>
                Full interface & voice advisory in Telugu, Hindi, Tamil, Malayalam, Bengali, etc.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STEP-BY-STEP DATA FLOW */}
      {activeTab === 'how_it_works' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
              ORCA Core Data Processing Pipeline
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-ocean-900/70 border border-slate-800">
                <span className="px-2.5 py-1 rounded-xl bg-cyan-500 text-slate-950 font-mono font-black text-xs shrink-0">
                  STEP 1
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm">Natural Language & Voice Parsing (Supervisor)</h4>
                  <p className="text-xs text-slate-300 mt-1 font-sans">
                    ORCA Supervisor extracts departure harbour, target timeframe (morning/evening), craft engine specs, and preferred fishing methods.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-ocean-900/70 border border-slate-800">
                <span className="px-2.5 py-1 rounded-xl bg-teal-400 text-slate-950 font-mono font-black text-xs shrink-0">
                  STEP 2
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm">Multi-Agent Ingestion & Front Detection</h4>
                  <p className="text-xs text-slate-300 mt-1 font-sans">
                    Specialist agents extract SST gradients (0.5–1.2°C drops), chlorophyll blooms (0.8–2.5 mg/m³), wave height spectrum, and commercial AIS shipping corridors.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-ocean-900/70 border border-slate-800">
                <span className="px-2.5 py-1 rounded-xl bg-rose-400 text-slate-950 font-mono font-black text-xs shrink-0">
                  STEP 3
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm">ISO 31010 Deterministic Safety Gate (Risk Engine)</h4>
                  <p className="text-xs text-slate-300 mt-1 font-sans">
                    Calculates the weighted 5-factor matrix (Weather 20%, Ocean 20%, PFZ 25%, Safety 25%, Route 10%). If dangerous waves (&gt;2.2m) or cyclone warnings exist, the safety gate forcibly overrides the score to DO NOT VENTURE.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-ocean-900/70 border border-slate-800">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-400 text-slate-950 font-mono font-black text-xs shrink-0">
                  STEP 4
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm">Tactical Safe Route & Explanations Generation</h4>
                  <p className="text-xs text-slate-300 mt-1 font-sans">
                    Geospatial routing generates waypoint polylines avoiding naval areas, and the explanation synthesizer translates the findings into natural speech in the user&apos;s mother tongue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AGENTS */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in text-xs">
          <div className="p-5 rounded-2xl bg-ocean-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono">
              <Brain className="w-4 h-4" />
              <span>ORCA Supervisor Agent</span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed">
              Orchestrates query decomposition, resolves port coordinates, and aggregates multi-agent outputs.
            </p>
            <span className="text-[10px] text-slate-500 font-mono block">Input Stage &bull; LangGraph</span>
          </div>

          <div className="p-5 rounded-2xl bg-ocean-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-teal-400 font-bold font-mono">
              <Waves className="w-4 h-4" />
              <span>Ocean Specialist Agent</span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed">
              Evaluates SWAN wave models, swell heights, sea surface temperature, and tidal current drift assistance.
            </p>
            <span className="text-[10px] text-slate-500 font-mono block">Source: INCOIS OSF & Copernicus</span>
          </div>

          <div className="p-5 rounded-2xl bg-ocean-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
              <CloudSun className="w-4 h-4" />
              <span>Weather & Cyclone Agent</span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed">
              Ingests IMD coastal bulletins, severe squall alerts, wind speed/gusts, and thunderstorm probabilities.
            </p>
            <span className="text-[10px] text-slate-500 font-mono block">Source: IMD & Open-Meteo</span>
          </div>

          <div className="p-5 rounded-2xl bg-ocean-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold font-mono">
              <Fish className="w-4 h-4" />
              <span>PFZ Fisheries Agent</span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed">
              Detects thermal & chlorophyll frontal boundaries from satellite telemetry to identify high-yield pelagic zones.
            </p>
            <span className="text-[10px] text-slate-500 font-mono block">Source: MOSDAC Oceansat-3 & INCOIS</span>
          </div>

          <div className="p-5 rounded-2xl bg-ocean-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
              <Compass className="w-4 h-4" />
              <span>Geospatial Routing Agent</span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed">
              Calculates shortest nautical distance while maintaining mandatory 3.5 km standoff buffers around naval defense zones.
            </p>
            <span className="text-[10px] text-slate-500 font-mono block">Source: PostGIS & OSRM Routing</span>
          </div>

          <div className="p-5 rounded-2xl bg-ocean-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold font-mono">
              <ShieldAlert className="w-4 h-4" />
              <span>Risk & Safety Gateway</span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed">
              Enforces non-negotiable safety hard-gates to eliminate human bias and prevent maritime disasters.
            </p>
            <span className="text-[10px] text-slate-500 font-mono block">Deterministic Rules Engine</span>
          </div>
        </div>
      )}

      {/* TAB 4: RADAR & AIS VESSEL AVOIDANCE */}
      {activeTab === 'vessel_safety' && (
        <div className="space-y-4 animate-in fade-in text-xs font-sans text-slate-300 leading-relaxed">
          <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-sm">
              <Radio className="w-4 h-4" />
              <span>How Marine Radar & AIS Tracking Works in ORCA</span>
            </div>
            <p>
              In busy Indian coastal transit lanes (such as Mumbai outer anchorage, Chennai shipping corridor, and Visakhapatnam naval harbour), small fishing boats frequently encounter large commercial container ships, chemical tankers, and naval vessels.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-mono text-[11px]">
              <div className="p-3 rounded-2xl bg-ocean-900 border border-slate-800">
                <b className="text-cyan-300 block mb-1">📡 Class-A AIS Querying</b>
                Broadcasts position, heading, SOG, and destination every 2-10 seconds.
              </div>
              <div className="p-3 rounded-2xl bg-ocean-900 border border-slate-800">
                <b className="text-emerald-300 block mb-1">⚠️ CPA & TCPA Calculation</b>
                Computes Closest Point of Approach in nautical miles and warns if CPA &lt; 1.0 NM.
              </div>
              <div className="p-3 rounded-2xl bg-ocean-900 border border-slate-800">
                <b className="text-rose-300 block mb-1">🛑 Collision Avoidance Vector</b>
                ORCA generates an immediate heading adjustment vector to prevent crossing dangerous bows.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
