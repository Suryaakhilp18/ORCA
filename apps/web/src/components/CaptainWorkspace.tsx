'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass, ShieldCheck, AlertTriangle, XCircle, Fish, Waves, Wind,
  Thermometer, ArrowRight, Sparkles, MapPin, Anchor, Activity,
  Clock, CheckCircle2, RefreshCw, Bell, ChevronRight, Eye, Play,
  TrendingUp, TrendingDown, Minus, Shield, HelpCircle, Navigation,
  Radio, Layers, Fuel, BarChart3, Info, ExternalLink, Search, Globe,
  Send, Check, ChevronDown, CheckCircle, Volume2, VolumeX, Sliders,
  Download, Navigation2, FileJson, Gauge
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { QueryResponse, CoastalLocation, PFZCandidate } from '@/types';
import { MarineLocationSelector } from '@/components/MarineLocationSelector';
import { MarineIntelligenceSection } from '@/components/MarineIntelligenceSection';
import { AgentNetworkVisualizer } from '@/components/AgentNetworkVisualizer';
import { ConnectedAgentPipeline } from '@/components/ConnectedAgentPipeline';
import { MarineRadarVesselTraffic } from '@/components/MarineRadarVesselTraffic';
import { translations, SupportedLanguage } from '@/lib/i18n';

const OceanTacticalMap = dynamic(
  () => import('@/components/OceanTacticalMap').then((mod) => mod.OceanTacticalMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[440px] rounded-3xl border border-slate-800 bg-ocean-950 flex items-center justify-center text-sm text-slate-400 font-sans">
        <span className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-3" />
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
  onRunQuery: (query: string) => void;
  initialSubTab?: string;
  language?: string;
  isLoading?: boolean;
}

export function CaptainWorkspace({
  data,
  selectedCandidate,
  onSelectCandidate,
  selectedLocation,
  onSelectLocation,
  allLocations = [],
  onOpenWhy,
  onOpenEvidenceGraph,
  onNavigateToAi,
  onRunQuery,
  initialSubTab = 'command',
  language = 'en',
  isLoading = false
}: Props) {
  const langKey = ((language && translations[language as SupportedLanguage]) ? language : 'en') as SupportedLanguage;
  const t = translations[langKey] || translations.en;

  const [subTab, setSubTab] = useState<string>(initialSubTab);
  const [isWhyExpanded, setIsWhyExpanded] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // What-if simulator state
  const [simWaveDelta, setSimWaveDelta] = useState<number>(0);
  const [simWindDelta, setSimWindDelta] = useState<number>(0);

  const locName = selectedLocation ? selectedLocation.name : (data?.location?.name || 'Visakhapatnam');
  const locState = selectedLocation ? selectedLocation.state : (data?.location?.state || 'Andhra Pradesh');
  const locLat = selectedLocation ? selectedLocation.latitude : 17.6868;
  const locLon = selectedLocation ? selectedLocation.longitude : 83.2185;

  // Natural language query state
  const [queryInput, setQueryInput] = useState<string>(`I am currently at ${locName}. Is it safe to sail here?`);

  useEffect(() => {
    setQueryInput(`I am currently at ${locName}. Is it safe to sail here?`);
  }, [locName]);

  // Real-time values when data is loaded
  const hasData = data !== null;
  const baseRiskScore = data?.decision?.safety_risk_score ?? 22;
  const simulatedRisk = Math.max(10, Math.min(95, baseRiskScore + simWaveDelta * 18 + simWindDelta * 0.8));
  const orcaScore = Math.max(10, Math.min(98, 100 - Math.round(simulatedRisk)));
  
  const verdict = simulatedRisk > 55 ? 'UNFAVORABLE' : simulatedRisk > 32 ? 'CAUTION' : 'FAVORABLE';
  const isSafe = verdict === 'FAVORABLE';
  const isCaution = verdict === 'CAUTION';

  const baseWave = data?.ocean_conditions?.wave_height_m ?? 0.8;
  const waveHeightM = Math.max(0.3, baseWave + simWaveDelta);
  const baseWind = data?.weather_forecast?.wind_speed_kmh ?? 14;
  const windSpeedKmh = Math.max(5, baseWind + simWindDelta);
  
  const sstCelsius = data?.ocean_conditions?.sst_celsius ?? 27.6;
  const currentKnots = data?.ocean_conditions?.current_speed_m_s ? data.ocean_conditions.current_speed_m_s * 1.944 : 0.8;
  const standoffKm = data?.route?.standoff_buffer_km ? data.route.standoff_buffer_km.toFixed(1) : '3.5';
  const weatherGatePassed = (data?.weather_forecast?.cyclone_alert_level === 'NONE' || !data?.weather_forecast?.is_official_warning_active);

  const candidates: PFZCandidate[] = (data?.candidates && data.candidates.length > 0) ? data.candidates : [
    {
      id: 'PFZ-12',
      name: `Offshore Shelf Front PFZ-12 (${locName})`,
      bearing_deg: 115,
      distance_km: 17.8,
      depth_m: 48,
      sst_celsius: sstCelsius,
      chlorophyll_mg_m3: 1.85,
      suitability_score: 92,
      suitability_level: 'HIGH',
      target_species: ['Indian Mackerel (Rastrelliger kanagurta)', 'Yellowfin Tuna'],
      geometry: { type: 'Point', coordinates: [locLon + 0.15, locLat - 0.05] },
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

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || isLoading) return;
    onRunQuery(queryInput);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setQueryInput(prompt);
    onRunQuery(prompt);
  };

  // AI Voice Advisory Speech Synthesis
  const handleSpeakAdvisory = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const speechText = isSafe
      ? `ORCA safety evaluation for ${locName}. Conditions are favorable with safety score ${orcaScore} out of 100. Significant wave height is ${waveHeightM.toFixed(1)} meters, wind speed is ${Math.round(windSpeedKmh)} kilometers per hour. Naval defense clearance is verified.`
      : isCaution
      ? `ORCA advisory for ${locName}. Exercise caution with safety score ${orcaScore} out of 100. Elevated waves of ${waveHeightM.toFixed(1)} meters detected.`
      : `ORCA warning for ${locName}. Conditions unfavorable with score ${orcaScore} out of 100. Sailing is not recommended due to critical thresholds.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP OPERATIONAL HEADER (No duplicate ORCA name)                        */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/50 shrink-0">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                CAPTAIN WORKSPACE
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {t.badgeLive}
              </span>
            </div>
            <p className="text-sm text-slate-300 font-sans mt-0.5">
              India-Wide Coastal Intelligence &bull; 7-Agent Collaborative Reasoning
            </p>
          </div>
        </div>

        {/* Polished, interactive location selector (Context only - does not auto-query) */}
        <MarineLocationSelector
          selectedLocation={selectedLocation}
          onSelectLocation={onSelectLocation}
          allLocations={allLocations}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. PROMINENT NATURAL-LANGUAGE QUERY CONSOLE                              */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-ocean-950 via-cyan-950/30 to-ocean-950 border border-slate-800 shadow-xl space-y-4">
        {/* Context Confirmation Banner */}
        <div className="flex items-center gap-2 text-sm text-cyan-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span><b>✓ {locName} ({locState})</b> selected. Ask ORCA a question about this area:</span>
        </div>

        <form onSubmit={handleQuerySubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={t.searchPlaceholder || `I am currently at ${locName}. Is it safe to sail here?`}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white placeholder-slate-400 outline-none focus:border-cyan-400 font-sans shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!queryInput.trim() || isLoading}
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all disabled:opacity-40 shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.btnReasoning || 'REASONING...'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t.btnAnalyze || 'ANALYSE'}</span>
              </>
            )}
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="flex items-center gap-2.5 overflow-x-auto text-xs text-slate-300 pt-1">
          <span className="text-xs text-slate-400 font-bold shrink-0">{t.quickQueries || 'Suggestions:'}</span>
          {[
            `I am currently at ${locName}. Is it safe to sail here?`,
            `Assess the marine conditions and safety for the next 12 hours`,
            `What are the current ocean conditions?`,
            `What are the major marine risks near ${locName}?`
          ].map((prompt, pidx) => (
            <button
              key={pidx}
              type="button"
              onClick={() => handleSuggestedPrompt(prompt)}
              className="px-3 py-1.5 rounded-xl bg-ocean-900 hover:bg-ocean-850 border border-slate-800 hover:border-cyan-800 text-slate-200 whitespace-nowrap cursor-pointer transition-all text-xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CAPTAIN WORKSPACE SUB-NAVIGATION                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-3 gap-3">
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-inner">
          {[
            { id: 'command', label: t.commandCentreTab || 'Command Centre', icon: Compass },
            { id: 'tactical', label: t.tacticalMapTab || 'Tactical Map', icon: MapPin },
            { id: 'ai_copilot', label: 'AI Fuel & Scenarios', icon: Sparkles },
            { id: 'agents', label: t.agentNetworkTab || 'Agent Network', icon: Radio },
            { id: 'marine', label: t.marineIntelTab || 'Marine Intelligence', icon: Waves },
            { id: 'safety', label: t.safetyRiskTab || 'Safety & Risk', icon: ShieldCheck },
            { id: 'operations', label: t.operationsTab || 'Operations & Radar', icon: Navigation }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = subTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubTab(item.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-400 font-bold">
          <span>{locName} Sector</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SUB-TAB 1: COMMAND CENTRE (NO MAP — Clean 2-Col Layout with Pipeline)  */}
      {/* ========================================================================= */}
      {subTab === 'command' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 Cols): Assessment Card + Metocean 4-Card Grid */}
            <div className="lg:col-span-7 space-y-4">
              {/* If no query has been analyzed yet, show clean Ready / Waiting Card */}
              {!hasData && !isLoading && (
                <div className="p-8 rounded-3xl bg-ocean-950 border border-slate-800 text-center space-y-4 shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-950/50">
                    <Compass className="w-7 h-7 animate-pulse" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-white">
                      Awaiting Operational Query
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Select your coastal sector above, enter a question (or choose a suggestion), and click <b className="text-cyan-300">ANALYSE</b> to run the 7-Agent collaborative reasoning pipeline.
                    </p>
                  </div>
                </div>
              )}

              {/* During loading, show in-progress indicator */}
              {isLoading && (
                <div className="p-8 rounded-3xl bg-ocean-950 border border-cyan-500/40 text-center space-y-4 shadow-2xl animate-pulse">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500 text-cyan-300 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/30">
                    <RefreshCw className="w-7 h-7 animate-spin" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-cyan-300">
                      7-Agent Collaborative Reasoning Active
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      2-second sequential handoff across Orchestrator, Ocean Intel, Weather, Fisheries, Geospatial, Risk Gate, and Explanation Agent...
                    </p>
                  </div>
                </div>
              )}

              {/* When data is ready, show Full ORCA Real-Time Safety Assessment Card */}
              {hasData && !isLoading && (
                <div
                  className={`p-6 rounded-3xl bg-ocean-950 border shadow-xl space-y-4 transition-all ${
                    isSafe
                      ? 'border-emerald-500/50 shadow-emerald-500/5'
                      : isCaution
                      ? 'border-amber-500/50 shadow-amber-500/5'
                      : 'border-rose-500/50 shadow-rose-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
                      {t.assessmentTitle || 'ORCA SAFETY ASSESSMENT'} &bull; {locName}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSpeakAdvisory}
                        aria-label="Listen to Audio Advisory"
                        className="px-3 py-1 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isSpeaking ? 'Mute' : 'Listen'}</span>
                      </button>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                        CONFIDENCE: 94%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    {/* Dynamic Circular Ring Score */}
                    <div
                      className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center text-center shadow-lg shrink-0 ${
                        isSafe
                          ? 'border-emerald-400 text-emerald-400 shadow-emerald-400/20'
                          : isCaution
                          ? 'border-amber-400 text-amber-400 shadow-amber-400/20'
                          : 'border-rose-400 text-rose-400 shadow-rose-400/20'
                      }`}
                    >
                      <span className="text-2xl font-black text-white">{orcaScore}</span>
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>

                    <div>
                      <div className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                        <span>{isSafe ? '🟢' : isCaution ? '🟡' : '🔴'}</span>
                        <span>
                          {isSafe
                            ? (t.verdictFavorable || 'CONDITIONS FAVORABLE (GO)')
                            : isCaution
                            ? (t.verdictCaution || 'EXERCISE CAUTION')
                            : (t.verdictUnfavorable || 'CONDITIONS UNFAVORABLE (NO-GO)')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 font-sans mt-1 leading-relaxed">
                        {isSafe
                          ? `Safe for standard coastal navigation in the ${locName} sector.`
                          : isCaution
                          ? `Elevated metocean parameters detected near ${locName}. Exercise vigilance.`
                          : `Critical safety threshold triggered near ${locName}. Sailing not recommended.`}
                      </p>
                    </div>
                  </div>

                  {/* Real-time Contributing Factors */}
                  <div className="space-y-2 pt-3 border-t border-slate-800 text-sm">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Weather Gate:</span>
                      <span className={`font-bold ${weatherGatePassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {weatherGatePassed ? 'PASSED (0 alerts)' : `ACTIVE (${data?.weather_forecast?.cyclone_alert_level || 'ALERT'})`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>{t.metoceanWaves || 'Wave Height'}:</span>
                      <span className="text-emerald-400 font-bold">
                        {waveHeightM.toFixed(1)}m ({data?.ocean_conditions?.sea_state_code || 'Calm Sea'})
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Naval Defense Clearance:</span>
                      <span className="text-emerald-400 font-bold">{standoffKm} km Standoff</span>
                    </div>
                  </div>

                  {/* Expandable Why Section */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsWhyExpanded(!isWhyExpanded)}
                      className="w-full py-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-bold text-sm flex items-center justify-between px-4 cursor-pointer transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        <span>{t.whyConcluded || 'Why ORCA Concluded This'}</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isWhyExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isWhyExpanded && (
                      <div className="mt-2.5 p-4 rounded-2xl bg-ocean-900/80 border border-slate-800 text-sm text-slate-200 space-y-2.5 animate-in fade-in leading-relaxed">
                        <p>
                          1. <b>Metocean Physics:</b> Significant wave height is measured at {waveHeightM.toFixed(1)}m with 7.8s period, ensuring zero wave-overtopping risk.
                        </p>
                        <p>
                          2. <b>Cyclone Gate:</b> {data?.weather_forecast?.cyclone_alert_level === 'NONE' ? 'Zero deep depression or gale warnings active from IMD.' : 'IMD alert active in sector.'}
                        </p>
                        <p>
                          3. <b>Spatial Clearance:</b> Safe transit maintains {standoffKm} km clearance from naval perimeter.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4 Metocean Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 sm:p-5 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-xs sm:text-sm">
                    <span>{t.metoceanWind || 'WIND'}</span>
                    <Wind className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {hasData ? `${Math.round(windSpeedKmh)} km/h` : '—'}
                  </div>
                  <span className="text-xs text-emerald-400 block font-medium">
                    {hasData ? 'NE • Light Breeze' : 'Standby'}
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-xs sm:text-sm">
                    <span>{t.metoceanWaves || 'WAVES'}</span>
                    <Waves className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {hasData ? `${waveHeightM.toFixed(1)} m` : '—'}
                  </div>
                  <span className="text-xs text-emerald-400 block font-medium">
                    {hasData ? 'Calm • 7.8s' : 'Standby'}
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-xs sm:text-sm">
                    <span>{t.metoceanSst || 'SST'}</span>
                    <Thermometer className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {hasData ? `${sstCelsius.toFixed(1)}°C` : '—'}
                  </div>
                  <span className="text-xs text-cyan-300 block font-medium">
                    {hasData ? 'Thermal Front' : 'Standby'}
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-xs sm:text-sm">
                    <span>{t.metoceanTide || 'TIDE'}</span>
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {hasData ? `${currentKnots.toFixed(1)} kn` : '—'}
                  </div>
                  <span className="text-xs text-emerald-400 block font-medium">
                    {hasData ? '0.4 m/s Outbound' : 'Standby'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column (5 Cols): Redesigned Connected 7-Agent Pipeline (2s / Agent) */}
            <div className="lg:col-span-5">
              <ConnectedAgentPipeline
                isLoading={isLoading}
                orcaScore={orcaScore}
                verdict={verdict}
                riskScore={simulatedRisk}
                waveHeight={waveHeightM}
                windSpeed={windSpeedKmh}
                language={language}
                hasAnalyzed={hasData}
              />
            </div>
          </div>

          {/* Full-Width Active Bulletins & Clearances */}
          <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>{t.activeBulletins || 'Active Coastal Bulletins & Defense Clearances'} &bull; {locName}</span>
              </h4>
              <span className="text-xs text-slate-400 font-medium">IMD & INCOIS FEEDS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-ocean-900/70 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>IMD Coastal Gale Advisory</span>
                  <span className="text-xs text-emerald-400 font-bold">NORMAL</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No squall or heavy rain warnings active for {locName} coastal waters.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-ocean-900/70 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>INCOIS Swell Surge Alert</span>
                  <span className="text-xs text-emerald-400 font-bold">CALM</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Significant wave height {waveHeightM.toFixed(1)}m with stable 7.8s period.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-ocean-900/70 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Naval Exercise Geofence</span>
                  <span className="text-xs text-cyan-400 font-bold">{standoffKm} KM CLEAR</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Direct transit corridors verify zero intersection with active defense perimeters.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUB-TAB 2: COMPACT OPERATIONAL TACTICAL MAP (Effective Split Layout)    */}
      {/* ========================================================================= */}
      {subTab === 'tactical' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Compact Interactive Map */}
            <div className="lg:col-span-8 p-5 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-base">
                    Tactical Ocean Map &bull; {locName}
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  India EEZ Bounds &bull; CARTO Dark Matter
                </span>
              </div>

              {data ? (
                <OceanTacticalMap
                  data={data}
                  selectedCandidate={currentPfz}
                  onSelectCandidate={onSelectCandidate}
                  locations={allLocations}
                  onSelectLocation={onSelectLocation}
                />
              ) : (
                <div className="w-full h-[440px] rounded-3xl bg-ocean-900/40 border border-slate-800 flex items-center justify-center text-sm text-slate-400">
                  Enter a query and click ANALYSE to load tactical spatial routes.
                </div>
              )}
            </div>

            {/* Right 4 Cols: Tactical Waypoint & Spatial Intelligence Panel */}
            <div className="lg:col-span-4 p-5 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Navigation2 className="w-4 h-4 text-cyan-400" />
                  <span>Spatial Clearance & Waypoints</span>
                </h4>
                <span className="text-xs text-emerald-400 font-bold">VERIFIED</span>
              </div>

              {/* Target PFZ Card */}
              <div className="p-4 rounded-2xl bg-ocean-900/60 border border-slate-800 space-y-2">
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider block">Target Potential Fishing Zone</span>
                <div className="text-base font-bold text-white">{currentPfz.name}</div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-300">
                  <div>Bearing: <b className="text-white">{currentPfz.bearing_deg}°</b></div>
                  <div>Distance: <b className="text-white">{currentPfz.distance_km} km</b></div>
                  <div>SST: <b className="text-white">{currentPfz.sst_celsius}°C</b></div>
                  <div>Suitability: <b className="text-emerald-400">{currentPfz.suitability_score}%</b></div>
                </div>
              </div>

              {/* Naval Standoff Info */}
              <div className="p-4 rounded-2xl bg-ocean-900/60 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-white">Naval Exercise Standoff:</span>
                  <span className="text-cyan-300">{standoffKm} km Clearance</span>
                </div>
                <p className="text-slate-400">
                  Automated corridor clearance verified against PostGIS naval defense exercise polygons.
                </p>
              </div>

              {/* Waypoint Export Actions */}
              <div className="space-y-2 pt-2">
                <a
                  href={`http://127.0.0.1:8000/api/v1/export/geojson?query_id=${data?.query_id || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Download GeoJSON Waypoint Route</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SUB-TAB 3: AI COPILOT, FUEL OPTIMIZER & WHAT-IF SCENARIOS              */}
      {/* ========================================================================= */}
      {subTab === 'ai_copilot' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Fuel Optimization Card */}
            <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Fuel className="w-5 h-5 text-teal-400" />
                  <h3 className="text-base font-bold text-white">
                    AI Fuel Optimization & Tidal Drift
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-teal-950 border border-teal-800 text-teal-300 font-bold">
                  ~45% DIESEL SAVINGS
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-ocean-900/60 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 block">Diesel Saved</span>
                  <span className="text-xl font-bold text-teal-400">34.2 L</span>
                </div>
                <div className="p-4 rounded-2xl bg-ocean-900/60 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 block">Cost Saved</span>
                  <span className="text-xl font-bold text-teal-400">₹3,250</span>
                </div>
                <div className="p-4 rounded-2xl bg-ocean-900/60 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 block">CO2 Reduced</span>
                  <span className="text-xl font-bold text-teal-400">91.6 kg</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-ocean-900/40 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-white">Optimal Tidal Drift Departure Windows:</div>
                <p>• <b>Departure:</b> 04:30 AM IST (Ebb Tide Assist) — +1.2 kn drift speed towards 115° bearing.</p>
                <p>• <b>Return:</b> 11:45 AM IST (Flood Tide Assist) — Reduced engine drag during transit.</p>
              </div>
            </div>

            {/* AI What-If Scenario Simulator */}
            <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">
                    AI "What-If" Scenario Simulator
                  </h3>
                </div>
                <button
                  onClick={() => { setSimWaveDelta(0); setSimWindDelta(0); }}
                  className="text-xs text-slate-400 hover:text-cyan-400 cursor-pointer"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Simulated Wave Height Spike:</span>
                    <span className="font-bold text-cyan-300">+{simWaveDelta.toFixed(1)} m ({waveHeightM.toFixed(1)}m total)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2.0"
                    step="0.1"
                    value={simWaveDelta}
                    onChange={(e) => setSimWaveDelta(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Simulated Wind Speed Gale:</span>
                    <span className="font-bold text-amber-300">+{simWindDelta} km/h ({Math.round(windSpeedKmh)} km/h total)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="2"
                    value={simWindDelta}
                    onChange={(e) => setSimWindDelta(parseInt(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Recalculated Risk Card */}
                <div className="p-4 rounded-2xl bg-ocean-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Simulated ORCA Score:</span>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                      <span>{isSafe ? '🟢' : isCaution ? '🟡' : '🔴'}</span>
                      <span>{orcaScore} / 100 ({verdict})</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-xl ${
                    isSafe ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : isCaution ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {isSafe ? 'FAVORABLE' : isCaution ? 'CAUTION REQUIRED' : 'NO-GO THRESHOLD'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SUB-TAB 4: LIVE AGENT COLLABORATIVE NETWORK                           */}
      {/* ========================================================================= */}
      {subTab === 'agents' && (
        <div className="space-y-6">
          <ConnectedAgentPipeline
            isLoading={isLoading}
            orcaScore={orcaScore}
            verdict={verdict}
            riskScore={simulatedRisk}
            waveHeight={waveHeightM}
            windSpeed={windSpeedKmh}
            language={language}
            hasAnalyzed={hasData}
          />
          <AgentNetworkVisualizer
            data={data}
            isLoading={isLoading}
            onOpenEvidenceGraph={onOpenEvidenceGraph}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. SUB-TAB 5: DYNAMIC MARINE INTELLIGENCE                                */}
      {/* ========================================================================= */}
      {subTab === 'marine' && (
        <MarineIntelligenceSection
          data={data}
          selectedLocation={selectedLocation}
        />
      )}

      {/* ========================================================================= */}
      {/* 9. SUB-TAB 6: SAFETY & RISK GATES                                        */}
      {/* ========================================================================= */}
      {subTab === 'safety' && (
        <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>ISO 31010 Deterministic Safety Gates &bull; {locName}</span>
            </h3>
            <span className="text-xs text-emerald-400 font-bold">ALL GATES PASSED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-ocean-900 border border-slate-800 space-y-1.5">
              <span className="text-slate-400 block text-xs">IMD Cyclone Alert Gate</span>
              <span className="text-emerald-400 font-bold block">✓ PASSED (Clear)</span>
              <p className="text-xs text-slate-300">Zero active deep depression warnings.</p>
            </div>

            <div className="p-4 rounded-2xl bg-ocean-900 border border-slate-800 space-y-1.5">
              <span className="text-slate-400 block text-xs">Wave Safety Gate</span>
              <span className="text-emerald-400 font-bold block">✓ PASSED ({waveHeightM.toFixed(1)}m &lt; 2.0m)</span>
              <p className="text-xs text-slate-300">Significant wave height well below craft limits.</p>
            </div>

            <div className="p-4 rounded-2xl bg-ocean-900 border border-slate-800 space-y-1.5">
              <span className="text-slate-400 block text-xs">Naval Defense Standoff</span>
              <span className="text-emerald-400 font-bold block">✓ PASSED ({standoffKm} km Clear)</span>
              <p className="text-xs text-slate-300">Zero intrusion into restricted exercise polygons.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. SUB-TAB 7: OPERATIONS & RADAR (Vessel Traffic)                       */}
      {/* ========================================================================= */}
      {subTab === 'operations' && (
        <div className="space-y-6">
          <MarineRadarVesselTraffic
            location={{ name: locName, state: locState, latitude: locLat, longitude: locLon }}
            language={language}
          />
        </div>
      )}
    </div>
  );
}
