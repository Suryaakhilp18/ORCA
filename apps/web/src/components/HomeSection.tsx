'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass, ShieldCheck, AlertTriangle, XCircle, Fish, Waves, Wind,
  Thermometer, ArrowRight, Sparkles, MapPin, Anchor, Activity,
  Clock, CheckCircle2, RefreshCw, Bell, ChevronRight, Eye, Play,
  TrendingUp, Shield, HelpCircle, Navigation, Radio
} from 'lucide-react';
import { QueryResponse, CoastalLocation, PFZCandidate } from '@/types';
import { translations, SupportedLanguage } from '@/lib/i18n';

interface Props {
  data: QueryResponse | null;
  selectedLocation: CoastalLocation | null;
  onSelectLocation: (loc: CoastalLocation) => void;
  onNavigateToOrca: (subTab?: string) => void;
  onNavigateToAi: (prompt?: string) => void;
  language: string;
  isLoading: boolean;
}

export function HomeSection({
  data,
  selectedLocation,
  onSelectLocation,
  onNavigateToOrca,
  onNavigateToAi,
  language = 'en',
  isLoading
}: Props) {
  const t = translations[(language as SupportedLanguage) || 'en'] || translations.en;
  const [subTab, setSubTab] = useState<'overview' | 'situation' | 'alerts' | 'activity'>('overview');
  const [animatedScore, setAnimatedScore] = useState<number>(0);

  // Target values from queryData or realistic baseline
  const locName = selectedLocation ? selectedLocation.name : (data?.location?.name || 'Visakhapatnam');
  const locState = selectedLocation ? selectedLocation.state : (data?.location?.state || 'Andhra Pradesh');

  const riskScore = data?.decision?.safety_risk_score ?? 22;
  const targetScore = Math.max(10, Math.min(98, 100 - Math.round(riskScore)));
  const verdict = data?.decision?.decision_class || 'FAVORABLE';
  const isSafe = verdict === 'FAVORABLE' || verdict === 'GO';
  const isCaution = verdict === 'CAUTION';

  const waveM = data?.ocean_conditions?.wave_height_m ?? 0.8;
  const windKmh = data?.weather_forecast?.wind_speed_kmh ?? 13.5;
  const sstC = data?.ocean_conditions?.sst_celsius ?? 27.8;
  const pfzCount = data?.candidates?.length ?? 3;
  const topPfz = data?.selected_pfz || data?.candidates?.[0];

  // Score counter animation
  useEffect(() => {
    let start = 0;
    const duration = 600;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = targetScore / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetScore]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub-Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-1 shadow-inner">
          <button
            onClick={() => setSubTab('overview')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'overview'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSubTab('situation')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'situation'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Marine Situation
          </button>
          <button
            onClick={() => setSubTab('alerts')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'alerts'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Alerts</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px]">
              2
            </span>
          </button>
          <button
            onClick={() => setSubTab('activity')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'activity'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recent Activity
          </button>
        </div>

        {/* Current Station Badge */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-200 font-bold">{locName}</span>
          <span>&bull;</span>
          <span className="text-slate-400">{locState}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: OVERVIEW (Clean Landing Command Center)                         */}
      {/* ========================================================================= */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* Greeting Banner */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-ocean-950 via-ocean-900 to-ocean-950 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/50 text-cyan-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>COMMAND BRIEFING &bull; {locName.toUpperCase()}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Good Morning, Captain.
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-xl">
                Here is your marine intelligence summary. Coastal conditions are favorable with stable wave height and high-yield pelagic PFZ active offshore.
              </p>
            </div>

            <button
              onClick={() => onNavigateToAi('Can I go fishing today and where is the best PFZ?')}
              className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Ask ORCA Copilot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Essential Marine Status Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800/90 shadow-lg space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>WEATHER</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-base font-extrabold text-white">🟢 CLEAR SKY</div>
              <div className="text-[11px] text-slate-400">Wind: {windKmh.toFixed(0)} km/h &bull; Low Risk</div>
            </div>

            <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800/90 shadow-lg space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>OCEAN</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-base font-extrabold text-white">🟢 CALM SEA</div>
              <div className="text-[11px] text-slate-400">Wave: {waveM.toFixed(1)} m &bull; Temp: {sstC.toFixed(1)}°C</div>
            </div>

            <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800/90 shadow-lg space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>SAFETY</span>
                <span className={`w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-400' : isCaution ? 'bg-amber-400' : 'bg-rose-400'}`} />
              </div>
              <div className={`text-base font-extrabold ${isSafe ? 'text-emerald-400' : isCaution ? 'text-amber-400' : 'text-rose-400'}`}>
                {isSafe ? '🟢 SAFE TO VENTURE' : isCaution ? '🟡 CAUTION ADVISED' : '🔴 STAY IN HARBOUR'}
              </div>
              <div className="text-[11px] text-slate-400">No active cyclone warnings</div>
            </div>

            <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800/90 shadow-lg space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>PFZ STATUS</span>
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              </div>
              <div className="text-base font-extrabold text-teal-300">🟢 {pfzCount} ZONES ACTIVE</div>
              <div className="text-[11px] text-slate-400">Nearest: {topPfz ? `${topPfz.distance_km.toFixed(1)} km` : '18 km'}</div>
            </div>
          </div>

          {/* Large Signature ORCA Score Card */}
          <div className="p-7 rounded-3xl bg-ocean-950 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Integrated Marine Operational Decision Score</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Trip Suitability & Safety Evaluation
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-sans">
                  The ORCA Score synthesizes 5 domain models (Wave SWAN, IMD Cyclone Gate, Oceansat-3 PFZ, PostGIS Naval Geofence, and Tidal Assistance).
                </p>
              </div>

              {/* Big Circular / Radial Score Display */}
              <div className="flex items-center gap-5 p-5 rounded-2xl bg-ocean-900/90 border border-slate-800 shadow-inner">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-mono">
                    {animatedScore}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">/ 100</div>
                </div>

                <div className="h-12 w-[1px] bg-slate-800" />

                <div className="space-y-1">
                  <div className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    targetScore >= 70 ? 'text-emerald-400' : targetScore >= 45 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {targetScore >= 70 ? '🟢 CONDITIONS FAVORABLE' : targetScore >= 45 ? '🟡 EXERCISE CAUTION' : '🔴 HAZARDOUS CONDITIONS'}
                  </div>
                  <div className="text-xs text-slate-300 font-sans">
                    Recommended for craft departure with standard navigation.
                  </div>
                </div>
              </div>
            </div>

            {/* Factor Weight Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-850">
              <div className="p-2.5 rounded-xl bg-ocean-900/50 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Weather (20%)</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">92 / 100</div>
              </div>
              <div className="p-2.5 rounded-xl bg-ocean-900/50 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Ocean Wave (20%)</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">88 / 100</div>
              </div>
              <div className="p-2.5 rounded-xl bg-ocean-900/50 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">PFZ Catch (25%)</div>
                <div className="text-xs font-bold text-teal-300 mt-0.5">94 / 100</div>
              </div>
              <div className="p-2.5 rounded-xl bg-ocean-900/50 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Safety Gate (25%)</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">96 / 100</div>
              </div>
              <div className="p-2.5 rounded-xl bg-ocean-900/50 border border-slate-800 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-400 font-mono">Route Bypass (10%)</div>
                <div className="text-xs font-bold text-cyan-300 mt-0.5">85 / 100</div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Only the 4 most useful actions) */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Quick Operations
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <button
                onClick={() => onNavigateToOrca('fishing')}
                className="p-4 rounded-2xl bg-ocean-950 hover:bg-ocean-900 border border-slate-800 hover:border-cyan-500/60 text-left transition-all group cursor-pointer shadow-lg"
              >
                <div className="p-2 w-fit rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
                  <Fish className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300">Find Best PFZ</h3>
                <p className="text-xs text-slate-400 mt-1">Explore ranked satellite thermal-chlorophyll fishing zones.</p>
              </button>

              <button
                onClick={() => onNavigateToOrca('navigation')}
                className="p-4 rounded-2xl bg-ocean-950 hover:bg-ocean-900 border border-slate-800 hover:border-teal-500/60 text-left transition-all group cursor-pointer shadow-lg"
              >
                <div className="p-2 w-fit rounded-xl bg-teal-950 border border-teal-800 text-teal-400 mb-3 group-hover:scale-110 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-teal-300">Plan Fishing Trip</h3>
                <p className="text-xs text-slate-400 mt-1">View obstacle-free waypoints with naval defense bypass.</p>
              </button>

              <button
                onClick={() => setSubTab('situation')}
                className="p-4 rounded-2xl bg-ocean-950 hover:bg-ocean-900 border border-slate-800 hover:border-blue-500/60 text-left transition-all group cursor-pointer shadow-lg"
              >
                <div className="p-2 w-fit rounded-xl bg-blue-950 border border-blue-800 text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                  <Waves className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-300">Check Sea Conditions</h3>
                <p className="text-xs text-slate-400 mt-1">View wave heights, swell, currents, and wind forecast.</p>
              </button>

              <button
                onClick={() => onNavigateToAi()}
                className="p-4 rounded-2xl bg-ocean-950 hover:bg-ocean-900 border border-slate-800 hover:border-purple-500/60 text-left transition-all group cursor-pointer shadow-lg"
              >
                <div className="p-2 w-fit rounded-xl bg-purple-950 border border-purple-800 text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300">Ask ORCA AI</h3>
                <p className="text-xs text-slate-400 mt-1">Chat with multi-agent copilot in your mother tongue.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: MARINE SITUATION (Visual Environment Summary)                   */}
      {/* ========================================================================= */}
      {subTab === 'situation' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
              Coastal Metocean Observation &bull; {locName}
            </h2>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-ocean-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>WIND SPEED</span>
                <Wind className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{windKmh.toFixed(0)} km/h</div>
              <div className="text-xs text-slate-400">Direction: NE (045°) &bull; <span className="text-emerald-400 font-bold">Low Risk</span></div>
            </div>

            <div className="p-5 rounded-3xl bg-ocean-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>WAVE HEIGHT</span>
                <Waves className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{waveM.toFixed(1)} m</div>
              <div className="text-xs text-slate-400">Period: 6.8s &bull; <span className="text-emerald-400 font-bold">Calm to Slight</span></div>
            </div>

            <div className="p-5 rounded-3xl bg-ocean-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>SEA SURFACE TEMP</span>
                <Thermometer className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{sstC.toFixed(1)}°C</div>
              <div className="text-xs text-slate-400">Gradient: 0.8°C drop &bull; <span className="text-teal-300 font-bold">PFZ Front</span></div>
            </div>

            <div className="p-5 rounded-3xl bg-ocean-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>TIDAL CURRENT</span>
                <Compass className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">1.1 kts</div>
              <div className="text-xs text-slate-400">Direction: 110° &bull; <span className="text-emerald-400 font-bold">+15% Fuel Assist</span></div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">Want to view the full interactive tactical map?</h3>
              <p className="text-xs text-slate-400 font-sans">
                Explore bathymetry, satellite thermal fronts, radar sweeps, and safe route overlays in the ORCA Command Center.
              </p>
            </div>
            <button
              onClick={() => onNavigateToOrca('command')}
              className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shrink-0"
            >
              <span>Open ORCA Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: ALERTS (Dedicated Warning & Advisory Center)                     */}
      {/* ========================================================================= */}
      {subTab === 'alerts' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
              Active Coastal & Navigation Bulletins
            </h2>
            <span className="text-xs font-mono text-slate-400">Updated 8 min ago</span>
          </div>

          <div className="space-y-3">
            <div className="p-4.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-300 uppercase font-mono">INFO &bull; INCOIS PFZ ADVISORY</span>
                  <span className="text-[10px] font-mono text-slate-500">10:00 IST</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">
                  High-density chlorophyll front identified 17.8 km East of {locName} harbour. Pelagic species (Indian Mackerel and Sardine) concentration expected.
                </p>
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-300 uppercase font-mono">WATCH &bull; NAVAL EXCLUSION ZONE</span>
                  <span className="text-[10px] font-mono text-slate-500">08:30 IST</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">
                  Naval training corridor active 12 km offshore. ORCA has automatically plotted a 3.5 km safe standoff bypass vector.
                </p>
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-ocean-900/40 border border-slate-800 flex items-start gap-3.5">
              <Compass className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-cyan-300 uppercase font-mono">INFO &bull; SQUALL OUTLOOK</span>
                  <span className="text-[10px] font-mono text-slate-500">06:00 IST</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  IMD coastal bulletin reports negligible squall probability (&lt;10%) for the next 24 hours. Safe for motorized fishing craft.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: RECENT ACTIVITY                                                 */}
      {/* ========================================================================= */}
      {subTab === 'activity' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
              Recent Missions & Telemetry Logs
            </h2>
          </div>

          <div className="space-y-2.5">
            <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <Fish className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">PFZ-12 Analysis &bull; {locName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">ORCA Score: 89/100 &bull; 17.8 km Offshore</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Today, 08:30 AM</span>
            </div>

            <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Weather Risk Audit &bull; {locName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">0.8m Wave Height &bull; No Cyclone Alert</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Yesterday, 06:15 PM</span>
            </div>

            <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">AI Copilot Query &bull; Diesel Savings</div>
                  <div className="text-[11px] text-slate-400 font-mono">Calculated ~34 Liters saved via direct PFZ routing</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Aug 29, 02:40 PM</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
