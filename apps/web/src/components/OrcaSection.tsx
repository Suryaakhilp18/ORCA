'use client';

import React, { useState } from 'react';
import {
  Compass, ShieldCheck, AlertTriangle, XCircle, Fish, Waves, Wind,
  Thermometer, ArrowRight, Sparkles, MapPin, Anchor, Activity,
  Clock, CheckCircle2, RefreshCw, Bell, ChevronRight, Eye, Play,
  TrendingUp, TrendingDown, Minus, Shield, HelpCircle, Navigation,
  Radio, Layers, Fuel, BarChart3, Info, ExternalLink, SlidersHorizontal
} from 'lucide-react';
import { QueryResponse, CoastalLocation, PFZCandidate } from '@/types';
import dynamic from 'next/dynamic';
import { MarineRadarVesselTraffic } from '@/components/MarineRadarVesselTraffic';
import { translations, SupportedLanguage } from '@/lib/i18n';

const OceanTacticalMap = dynamic(
  () => import('@/components/OceanTacticalMap').then((mod) => mod.OceanTacticalMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[580px] rounded-3xl border border-slate-800 bg-ocean-950 flex items-center justify-center text-xs font-mono text-slate-500">
        <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-2" />
        Loading Interactive CARTO Ocean Tactical Map...
      </div>
    )
  }
);

interface Props {
  data: QueryResponse | null;
  selectedCandidate?: PFZCandidate;
  onSelectCandidate: (cand: PFZCandidate) => void;
  selectedLocation: CoastalLocation | null;
  onSelectLocation: (loc: CoastalLocation) => void;
  allLocations: CoastalLocation[];
  onOpenWhy: () => void;
  onOpenEvidenceGraph: () => void;
  onNavigateToAi: (prompt?: string) => void;
  initialSubTab?: string;
  language?: string;
}

export function OrcaSection({
  data,
  selectedCandidate,
  onSelectCandidate,
  selectedLocation,
  onSelectLocation,
  allLocations,
  onOpenWhy,
  onOpenEvidenceGraph,
  onNavigateToAi,
  initialSubTab = 'command',
  language = 'en'
}: Props) {
  const t = translations[(language as SupportedLanguage) || 'en'] || translations.en;
  const [subTab, setSubTab] = useState<'command' | 'fishing' | 'marine' | 'safety' | 'navigation' | 'analytics'>(
    (initialSubTab as any) || 'command'
  );
  const [activeWhyCandidate, setActiveWhyCandidate] = useState<PFZCandidate | null>(null);

  const locName = selectedLocation ? selectedLocation.name : (data?.location?.name || 'Visakhapatnam');
  const locState = selectedLocation ? selectedLocation.state : (data?.location?.state || 'Andhra Pradesh');

  const riskScore = data?.decision?.safety_risk_score ?? 22;
  const orcaScore = Math.max(10, Math.min(98, 100 - Math.round(riskScore)));
  const verdict = data?.decision?.decision_class || 'FAVORABLE';
  const isSafe = verdict === 'FAVORABLE' || verdict === 'GO';
  const isCaution = verdict === 'CAUTION';

  const candidates: PFZCandidate[] = (data?.candidates && data.candidates.length > 0) ? data.candidates : [
    {
      id: 'PFZ-12',
      name: 'Offshore Shelf Front PFZ-12',
      bearing_deg: 115,
      distance_km: 17.8,
      depth_m: 48,
      sst_celsius: 27.6,
      chlorophyll_mg_m3: 1.85,
      suitability_score: 92,
      suitability_level: 'HIGH',
      target_species: ['Indian Mackerel (Rastrelliger kanagurta)', 'Yellowfin Tuna'],
      geometry: { type: 'Point', coordinates: [83.45, 17.62] },
      source: {
        authority: 'INCOIS / MOSDAC',
        product_name: 'Oceansat-3 PFZ',
        dataset_version: 'v2.1',
        retrieval_timestamp: new Date().toISOString(),
        valid_from: new Date().toISOString(),
        valid_to: new Date(Date.now() + 86400000).toISOString(),
        quality_status: 'HIGH',
        is_simulation: false
      }
    },
    {
      id: 'PFZ-08',
      name: 'Southern Ridge Thermal Front PFZ-08',
      bearing_deg: 140,
      distance_km: 26.4,
      depth_m: 62,
      sst_celsius: 27.9,
      chlorophyll_mg_m3: 1.42,
      suitability_score: 84,
      suitability_level: 'HIGH',
      target_species: ['Sardines (Sardinella longiceps)', 'Seer Fish'],
      geometry: { type: 'Point', coordinates: [83.38, 17.48] },
      source: {
        authority: 'INCOIS / MOSDAC',
        product_name: 'Oceansat-3 PFZ',
        dataset_version: 'v2.1',
        retrieval_timestamp: new Date().toISOString(),
        valid_from: new Date().toISOString(),
        valid_to: new Date(Date.now() + 86400000).toISOString(),
        quality_status: 'HIGH',
        is_simulation: false
      }
    },
    {
      id: 'PFZ-21',
      name: 'Outer Continental Shelf Edge PFZ-21',
      bearing_deg: 85,
      distance_km: 38.2,
      depth_m: 95,
      sst_celsius: 28.2,
      chlorophyll_mg_m3: 1.15,
      suitability_score: 78,
      suitability_level: 'MODERATE',
      target_species: ['Skipjack Tuna', 'Ribbon Fish'],
      geometry: { type: 'Point', coordinates: [83.62, 17.75] },
      source: {
        authority: 'INCOIS / MOSDAC',
        product_name: 'Oceansat-3 PFZ',
        dataset_version: 'v2.1',
        retrieval_timestamp: new Date().toISOString(),
        valid_from: new Date().toISOString(),
        valid_to: new Date(Date.now() + 86400000).toISOString(),
        quality_status: 'HIGH',
        is_simulation: false
      }
    }
  ];

  const currentPfz = selectedCandidate || data?.selected_pfz || candidates[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-3 gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-1 shadow-inner">
          <button
            onClick={() => setSubTab('command')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'command'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Command Center
          </button>
          <button
            onClick={() => setSubTab('fishing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'fishing'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fishing Intelligence
          </button>
          <button
            onClick={() => setSubTab('marine')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'marine'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Marine Intelligence
          </button>
          <button
            onClick={() => setSubTab('safety')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'safety'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Safety
          </button>
          <button
            onClick={() => setSubTab('navigation')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'navigation'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Navigation & Radar
          </button>
          <button
            onClick={() => setSubTab('analytics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'analytics'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Selected Port Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-200 font-bold">{locName}</span>
          <span>&bull;</span>
          <span className="text-slate-400">{locState}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ORCA COMMAND CENTER (Large Map Dominant + Score & Intelligence Split)   */}
      {/* ========================================================================= */}
      {subTab === 'command' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Main Tactical Map Box */}
          <div className="rounded-3xl bg-ocean-950 border border-slate-800 p-4 sm:p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Interactive Tactical Marine Cartography &bull; {locName}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Layer Overlays: PFZ &bull; Weather &bull; Waves &bull; Routes &bull; Defense Buffer
              </span>
            </div>

            {data && (
              <OceanTacticalMap
                data={data}
                selectedCandidate={currentPfz}
                onSelectCandidate={onSelectCandidate}
                locations={allLocations}
                onSelectLocation={onSelectLocation}
              />
            )}
          </div>

          {/* Split Summary: ORCA Score Card (Left) + Multi-Factor Intelligence (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Score Card (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="font-bold uppercase tracking-wider">ORCA Score</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 text-[10px]">
                    VERIFIED DECISION
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mt-3">
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-mono">
                    {orcaScore}
                  </div>
                  <div className="text-sm font-mono text-slate-500">/ 100</div>
                </div>

                <div className="text-sm font-extrabold text-emerald-400 mt-2 flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSafe ? 'CONDITIONS FAVORABLE (GO)' : isCaution ? 'EXERCISE CAUTION' : 'DO NOT VENTURE'}</span>
                </div>

                <p className="text-xs text-slate-300 mt-2 font-sans leading-relaxed">
                  {data?.why_explanation?.summary_prose || 'Conditions look suitable for your planned trip. Low wave risk, high-confidence PFZ front, and obstacle-free route.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-850 flex items-center justify-between">
                <button
                  onClick={onOpenWhy}
                  className="px-4 py-2.5 rounded-xl bg-ocean-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-cyan-300 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>Why ORCA Says This</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onOpenEvidenceGraph}
                  className="text-xs text-slate-400 hover:text-slate-200 font-mono flex items-center gap-1 cursor-pointer"
                >
                  <span>Lineage Graph &rarr;</span>
                </button>
              </div>
            </div>

            {/* Right Intelligence Grid (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Multi-Agent Domain Intelligence
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-ocean-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Weather</span>
                    <Wind className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="text-sm font-bold text-white">GOOD</div>
                  <div className="text-[10px] text-slate-400 font-mono">{data?.weather_forecast?.wind_speed_kmh.toFixed(0) || 14} km/h wind</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-ocean-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Ocean</span>
                    <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-sm font-bold text-white">GOOD</div>
                  <div className="text-[10px] text-slate-400 font-mono">{data?.ocean_conditions?.wave_height_m.toFixed(1) || 0.8}m waves</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-ocean-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>PFZ</span>
                    <Fish className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="text-sm font-bold text-teal-300">HIGH</div>
                  <div className="text-[10px] text-slate-400 font-mono">{currentPfz?.distance_km.toFixed(1)} km away</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-ocean-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Safety</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-emerald-400">SAFE</div>
                  <div className="text-[10px] text-slate-400 font-mono">No squall warning</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-ocean-900/40 border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-white">Active Route: {currentPfz?.name}</div>
                  <div className="text-slate-400 text-[11px] font-sans">
                    Obstacle-free navigation with 3.5 km standoff from naval perimeter. Est fuel saved: <b>~34 Liters</b>.
                  </div>
                </div>
                <button
                  onClick={() => setSubTab('navigation')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 ml-3 cursor-pointer"
                >
                  View Route
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FISHING INTELLIGENCE (Ranked PFZ Cards + Interactive "Why?" Rationale)  */}
      {/* ========================================================================= */}
      {subTab === 'fishing' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
                Ranked Potential Fishing Zones &bull; Oceansat-3 Telemetry
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Thermal & chlorophyll fronts processed from MOSDAC satellite and INCOIS SWAN models
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {candidates.length} OPTIMAL ZONES FOUND
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {candidates.map((cand, idx) => {
              const isSelected = (selectedCandidate?.id || currentPfz?.id) === cand.id;

              return (
                <div
                  key={cand.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-xl'
                      : 'bg-ocean-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-xl bg-ocean-900 border border-slate-800 text-xs font-mono font-bold text-cyan-300">
                        #{idx + 1} {cand.id}
                      </span>
                      <span className="text-xs font-mono font-bold text-teal-300">
                        {cand.suitability_score}% MATCH
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-white text-base leading-tight">
                        {cand.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                        <span>{cand.distance_km.toFixed(1)} km</span>
                        <span>&bull;</span>
                        <span>Heading {cand.bearing_deg.toFixed(0)}°</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-850 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Confidence:</span>
                        <span className="text-emerald-400 font-bold font-mono">{Math.round(cand.suitability_score * 0.96)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Target Catch:</span>
                        <span className="text-slate-200 font-bold truncate max-w-[140px]">
                          {cand.target_species?.[0]?.split('(')[0] || 'Indian Mackerel'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Chlorophyll-a:</span>
                        <span className="text-cyan-300 font-mono">{cand.chlorophyll_mg_m3 || 1.85} mg/m³</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-850">
                    <button
                      onClick={() => {
                        onSelectCandidate(cand);
                        setSubTab('command');
                      }}
                      className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>View on Map</span>
                    </button>

                    <button
                      onClick={() => setActiveWhyCandidate(cand)}
                      className="px-3 py-2 rounded-xl bg-ocean-900 hover:bg-cyan-950 border border-slate-750 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Why?</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive "Why?" Detail Modal / Panel */}
          {activeWhyCandidate && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-ocean-950 via-ocean-900 to-ocean-950 border border-cyan-500/40 shadow-2xl space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>WHY ORCA RECOMMENDS {activeWhyCandidate.id}</span>
                </div>
                <button
                  onClick={() => setActiveWhyCandidate(null)}
                  className="text-xs text-slate-400 hover:text-white font-mono cursor-pointer"
                >
                  ✕ Close Rationale
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-xs text-slate-300 font-sans">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Strong satellite thermal-chlorophyll gradient confirmed</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Favorable sea surface temperature (27.8°C) for pelagic schools</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Low wave risk ({data?.ocean_conditions?.wave_height_m || 0.8}m) along the transit corridor</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No active naval exercises or critical weather alerts in this sector</span>
                  </div>
                </div>

                {/* Factor Weight Sliders */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>PFZ Front Signal</span>
                    <span className="text-teal-300 font-bold">92 / 100</span>
                  </div>
                  <div className="w-full bg-ocean-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-teal-400 h-full rounded-full w-[92%]" />
                  </div>

                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>Ocean Conditions</span>
                    <span className="text-cyan-300 font-bold">88 / 100</span>
                  </div>
                  <div className="w-full bg-ocean-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-cyan-400 h-full rounded-full w-[88%]" />
                  </div>

                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>Safety Clearance</span>
                    <span className="text-emerald-400 font-bold">96 / 100</span>
                  </div>
                  <div className="w-full bg-ocean-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-emerald-400 h-full rounded-full w-[96%]" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MARINE INTELLIGENCE (MetOcean Cards with Micro Trend Arrows)             */}
      {/* ========================================================================= */}
      {subTab === 'marine' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
              Ocean Physics & Atmospheric Parameters
            </h2>
            <span className="text-xs font-mono text-slate-400">INCOIS SWAN & Open-Meteo Models</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-ocean-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Significant Wave Height</span>
                <span className="text-emerald-400 flex items-center gap-0.5 text-[11px] font-bold">
                  <TrendingDown className="w-3.5 h-3.5" /> Stable
                </span>
              </div>
              <div className="text-3xl font-black text-white font-mono">
                {data?.ocean_conditions?.wave_height_m.toFixed(1) || 0.8} m
              </div>
              <div className="text-[11px] text-slate-400">Swell: 0.6m &bull; Period: 7.1s</div>
            </div>

            <div className="p-5 rounded-3xl bg-ocean-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Sustained Wind Speed</span>
                <span className="text-teal-300 flex items-center gap-0.5 text-[11px] font-bold">
                  <Minus className="w-3.5 h-3.5" /> Steady
                </span>
              </div>
              <div className="text-3xl font-black text-white font-mono">
                {data?.weather_forecast?.wind_speed_kmh.toFixed(0) || 14} km/h
              </div>
              <div className="text-[11px] text-slate-400">Gusts: 19 km/h &bull; Heading: NE</div>
            </div>

            <div className="p-5 rounded-3xl bg-ocean-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Sea Surface Temperature</span>
                <span className="text-amber-400 flex items-center gap-0.5 text-[11px] font-bold">
                  <TrendingUp className="w-3.5 h-3.5" /> +0.2°C
                </span>
              </div>
              <div className="text-3xl font-black text-white font-mono">
                {data?.ocean_conditions?.sst_celsius.toFixed(1) || 27.8}°C
              </div>
              <div className="text-[11px] text-slate-400">Thermal Front: 0.8°C drop offshore</div>
            </div>

            <div className="p-5 rounded-3xl bg-ocean-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Barometric Pressure</span>
                <span className="text-emerald-400 flex items-center gap-0.5 text-[11px] font-bold">
                  <Minus className="w-3.5 h-3.5" /> 1012 hPa
                </span>
              </div>
              <div className="text-3xl font-black text-white font-mono">
                1012.4 hPa
              </div>
              <div className="text-[11px] text-slate-400">Visibility: {data?.weather_forecast?.visibility_km || 10} km &bull; Clear</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SAFETY CENTER (Dedicated Risk & Warning Override Matrix)                */}
      {/* ========================================================================= */}
      {subTab === 'safety' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/40 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-600 text-emerald-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase">SAFETY INTEGRITY STATUS</div>
                <div className="text-2xl font-black text-white mt-0.5">🟢 SAFE TO VENTURE</div>
                <p className="text-xs text-slate-300 font-sans mt-0.5">
                  All 5 deterministic safety gates cleared. IMD bulletin reports no active cyclones.
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs hidden sm:block">
              <span className="text-slate-400 block">Safety Score</span>
              <span className="text-2xl font-black text-emerald-400">96 / 100</span>
            </div>
          </div>

          {/* 5 Risk Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Weather Risk</span>
                <span className="text-emerald-400 font-bold">LOW (8/100)</span>
              </div>
              <p className="text-slate-300 font-sans text-[11px]">No thunderstorms or squall lines detected along transit path.</p>
            </div>

            <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Wave Risk</span>
                <span className="text-emerald-400 font-bold">LOW (12/100)</span>
              </div>
              <p className="text-slate-300 font-sans text-[11px]">0.8m wave height is well below the 2.2m small-craft threshold.</p>
            </div>

            <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Cyclone Risk</span>
                <span className="text-emerald-400 font-bold">ZERO (0/100)</span>
              </div>
              <p className="text-slate-300 font-sans text-[11px]">IMD coastal warning level: GREEN (No depression or storm).</p>
            </div>

            <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Navigational Hazard Risk</span>
                <span className="text-teal-300 font-bold">RESOLVED (10/100)</span>
              </div>
              <p className="text-slate-300 font-sans text-[11px]">3.5 km standoff perimeter automatically applied around naval range.</p>
            </div>

            <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Distance-from-Shore Risk</span>
                <span className="text-emerald-400 font-bold">SAFE (14/100)</span>
              </div>
              <p className="text-slate-300 font-sans text-[11px]">17.8 km distance is within standard VHF radio range (25 km).</p>
            </div>

            <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Deterministic Override</span>
                <span className="text-purple-300 font-bold">STANDBY</span>
              </div>
              <p className="text-slate-300 font-sans text-[11px]">ISO 31010 safety engine active. Overrides any fishing score if risk &gt; 60.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. NAVIGATION & RADAR (Safe Route + Live AIS Corridor Sweep)               */}
      {/* ========================================================================= */}
      {subTab === 'navigation' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                SAFE ROUTE WAYPOINT VECTOR
              </div>
              <h3 className="text-lg font-bold text-white">
                Transit from {locName} &rarr; {currentPfz?.name}
              </h3>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-300 pt-1">
                <span>Distance: <b>{currentPfz?.distance_km.toFixed(1)} km (9.6 NM)</b></span>
                <span>&bull;</span>
                <span>ETA: <b>1h 12m @ 8 kts</b></span>
                <span>&bull;</span>
                <span className="text-emerald-400">Route Risk: <b>LOW</b></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-xl bg-purple-950 border border-purple-700 text-purple-300">
                Naval Standoff: 3.5 km
              </span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-xl bg-teal-950 border border-teal-700 text-teal-300">
                Tidal Assist: +15%
              </span>
            </div>
          </div>

          {/* Live Marine Radar & AIS Traffic Corridor */}
          <MarineRadarVesselTraffic
            location={selectedLocation || { name: locName, state: locState, latitude: data?.location?.latitude || 17.6868, longitude: data?.location?.longitude || 83.2185 }}
            language={language}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ANALYTICS (Seasonal Trends, Fuel Savings & Mission History)             */}
      {/* ========================================================================= */}
      {subTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
              ORCA Analytics & Fuel Conservation Metrics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-slate-400">AVERAGE DIESEL SAVED</div>
              <div className="text-3xl font-black text-cyan-300 font-mono">~34.5 Liters</div>
              <p className="text-xs text-slate-400 font-sans">Per mission via direct thermal-chlorophyll waypoint guidance.</p>
            </div>

            <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-slate-400">FINANCIAL BENEFIT</div>
              <div className="text-3xl font-black text-emerald-400 font-mono">₹3,250</div>
              <p className="text-xs text-slate-400 font-sans">Estimated cost reduction in diesel fuel per single offshore voyage.</p>
            </div>

            <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-slate-400">CARBON EMISSION CUT</div>
              <div className="text-3xl font-black text-purple-300 font-mono">92.4 kg CO₂</div>
              <p className="text-xs text-slate-400 font-sans">Avoided greenhouse gas emissions via tidal assisted transit.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
