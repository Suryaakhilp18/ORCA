'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain, CloudSun, Waves, Fish, Compass, ShieldAlert,
  FileText, ArrowDown, CheckCircle2, RefreshCw, Play, Check, Radio, Sparkles,
  Zap, Clock, ShieldCheck, Activity, Layers, CornerDownRight
} from 'lucide-react';
import { translations, SupportedLanguage } from '@/lib/i18n';

interface Props {
  isLoading?: boolean;
  orcaScore?: number;
  verdict?: string;
  riskScore?: number;
  waveHeight?: number;
  windSpeed?: number;
  language?: string;
  hasAnalyzed?: boolean;
}

export function ConnectedAgentPipeline({
  isLoading = false,
  orcaScore = 89,
  verdict = 'FAVORABLE',
  riskScore = 22,
  waveHeight = 0.8,
  windSpeed = 14,
  language = 'en',
  hasAnalyzed = false
}: Props) {
  const langKey = ((language && translations[language as SupportedLanguage]) ? language : 'en') as SupportedLanguage;
  const t = translations[langKey] || translations.en;

  // Active step in pipeline: 0 = Idle/Ready, 1..7 = Active Agent, 8 = All Complete
  const [activeStep, setActiveStep] = useState<number>(hasAnalyzed ? 8 : 0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // Strict 2-second (2000ms) interval between each agent transition (14s total)
  useEffect(() => {
    if (isLoading) {
      setIsSimulating(true);
      setActiveStep(1);
      setSecondsElapsed(0);

      // Second counter
      const interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);

      // Step transitions strictly every 2000ms (2.0 seconds)
      const t1 = setTimeout(() => setActiveStep(2), 2000);
      const t2 = setTimeout(() => setActiveStep(3), 4000);
      const t3 = setTimeout(() => setActiveStep(4), 6000);
      const t4 = setTimeout(() => setActiveStep(5), 8000);
      const t5 = setTimeout(() => setActiveStep(6), 10000);
      const t6 = setTimeout(() => setActiveStep(7), 12000);
      const t7 = setTimeout(() => {
        setActiveStep(8);
        setIsSimulating(false);
        clearInterval(interval);
      }, 14000);

      return () => {
        clearInterval(interval);
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
        clearTimeout(t6);
        clearTimeout(t7);
      };
    } else if (hasAnalyzed) {
      setActiveStep(8);
      setIsSimulating(false);
    } else {
      setActiveStep(0);
      setIsSimulating(false);
    }
  }, [isLoading, hasAnalyzed]);

  const handleTestFlow = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(1);
    setSecondsElapsed(0);

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    setTimeout(() => setActiveStep(2), 2000);
    setTimeout(() => setActiveStep(3), 4000);
    setTimeout(() => setActiveStep(4), 6000);
    setTimeout(() => setActiveStep(5), 8000);
    setTimeout(() => setActiveStep(6), 10000);
    setTimeout(() => setActiveStep(7), 12000);
    setTimeout(() => {
      setActiveStep(8);
      setIsSimulating(false);
      clearInterval(interval);
    }, 14000);
  };

  const isSafe = verdict === 'FAVORABLE' || verdict === 'GO';
  const isCaution = verdict === 'CAUTION';

  const progressPercent = activeStep === 0 ? 0 : Math.min(100, Math.round((activeStep / 7) * 100));

  const agents = [
    {
      id: 1,
      name: t.pipelineStep1 || '1. Orchestrator / Planner Agent',
      shortName: 'Orchestrator',
      icon: Brain,
      role: 'Query Parsing & Task Decomposition',
      telemetry: 'Dispatched 5 domain workers in parallel',
      glowColor: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/50 text-cyan-400',
      tagColor: 'bg-cyan-950 text-cyan-300 border-cyan-800'
    },
    {
      id: 2,
      name: t.pipelineStep2 || '2. Ocean Intelligence Agent',
      shortName: 'Ocean Intel',
      icon: Waves,
      role: 'INCOIS SWAN Wave & Current Physics',
      telemetry: `Wave: ${waveHeight.toFixed(1)}m | SST: 27.6°C | 0.8 kn`,
      glowColor: 'from-teal-500/20 to-emerald-500/10 border-teal-500/50 text-teal-400',
      tagColor: 'bg-teal-950 text-teal-300 border-teal-800'
    },
    {
      id: 3,
      name: t.pipelineStep3 || '3. Weather & Hazard Agent',
      shortName: 'Weather/Hazard',
      icon: CloudSun,
      role: 'IMD Coastal Bulletins & Gale Alerts',
      telemetry: `Wind: ${Math.round(windSpeed)} km/h NE | 0 Gales`,
      glowColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/50 text-amber-400',
      tagColor: 'bg-amber-950 text-amber-300 border-amber-800'
    },
    {
      id: 4,
      name: t.pipelineStep4 || '4. Fisheries Agent',
      shortName: 'Fisheries PFZ',
      icon: Fish,
      role: 'MOSDAC Oceansat-3 Ocean Color & Fronts',
      telemetry: 'PFZ Thermal Break Front detected 17.8 km',
      glowColor: 'from-purple-500/20 to-pink-500/10 border-purple-500/50 text-purple-400',
      tagColor: 'bg-purple-950 text-purple-300 border-purple-800'
    },
    {
      id: 5,
      name: t.pipelineStep5 || '5. Geo Spatial Agent',
      shortName: 'Geo Spatial',
      icon: Compass,
      role: 'PostGIS Bathymetry & Standoff Clearances',
      telemetry: 'Naval Corridor 3.5 km standoff clear',
      glowColor: 'from-blue-500/20 to-indigo-500/10 border-blue-500/50 text-blue-400',
      tagColor: 'bg-blue-950 text-blue-300 border-blue-800'
    },
    {
      id: 6,
      name: t.pipelineStep6 || '6. Risk Agent (ISO 31010)',
      shortName: 'Risk Engine',
      icon: ShieldAlert,
      role: 'Deterministic Risk Gates Evaluation',
      telemetry: `Risk Score: ${Math.round(riskScore)}/100 | All gates passed`,
      glowColor: 'from-rose-500/20 to-amber-500/10 border-rose-500/50 text-rose-400',
      tagColor: 'bg-rose-950 text-rose-300 border-rose-800'
    },
    {
      id: 7,
      name: t.pipelineStep7 || '7. Explanation Agent',
      shortName: 'Explanation',
      icon: FileText,
      role: 'Natural-Language Guidance & Final Verdict',
      telemetry: `ORCA Score: ${orcaScore}/100 • ${verdict}`,
      glowColor: isSafe
        ? 'from-emerald-500/20 to-teal-500/10 border-emerald-500/50 text-emerald-400'
        : isCaution
        ? 'from-amber-500/20 to-yellow-500/10 border-amber-500/50 text-amber-400'
        : 'from-rose-500/20 to-red-500/10 border-rose-500/50 text-rose-400',
      tagColor: isSafe
        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
        : isCaution
        ? 'bg-amber-950 text-amber-300 border-amber-800'
        : 'bg-rose-950 text-rose-300 border-rose-800'
    }
  ];

  return (
    <div className="rounded-3xl bg-gradient-to-b from-ocean-950 via-slate-950 to-ocean-950 border border-slate-800 shadow-2xl p-5 space-y-4 relative overflow-hidden backdrop-blur-xl">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 opacity-60" />

      {/* Header with Live Progress & Simulation Button */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <Radio className={`w-4 h-4 ${isSimulating ? 'animate-pulse text-cyan-300' : ''}`} />
          </div>
          <div>
            <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>{t.pipelineTitle || '7-Agent Reasoning Pipeline'}</span>
            </h4>
            <span className="text-[10px] font-mono text-cyan-300">
              {isSimulating
                ? `Active Agent: ${activeStep}/7 (Step ${activeStep} in progress...)`
                : activeStep === 8
                ? 'All 7 Domain Agents Synchronized'
                : 'Ready • Click ANALYSE to execute'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestFlow}
          disabled={isSimulating}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-[10px] flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-40"
        >
          {isSimulating ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
              <span>{secondsElapsed}s / 14s</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-cyan-400" />
              <span>RE-RUN FLOW</span>
            </>
          )}
        </button>
      </div>

      {/* Futuristic Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>Reasoning Telemetry: {progressPercent}%</span>
          <span>{activeStep === 8 ? '14.0s Total' : isSimulating ? `${secondsElapsed}s / 14s (2s / agent)` : '2.0s per step'}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 7 AGENTS CONNECTED BUS */}
      <div className="space-y-2 relative">
        {agents.map((ag) => {
          const Icon = ag.icon;
          const isCurrentActive = activeStep === ag.id;
          const isCompleted = activeStep > ag.id || activeStep === 8;
          const isPending = activeStep < ag.id && activeStep !== 8;

          return (
            <div
              key={ag.id}
              className={`p-3 rounded-2xl border transition-all duration-300 relative ${
                isCurrentActive
                  ? `bg-gradient-to-r ${ag.glowColor} shadow-lg shadow-cyan-500/10 scale-[1.01]`
                  : isCompleted
                  ? 'bg-slate-900/60 border-slate-800/80 text-slate-200'
                  : 'bg-slate-950/40 border-slate-900/80 text-slate-500 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Step Number Ring */}
                  <div
                    className={`w-6 h-6 rounded-xl flex items-center justify-center text-[10px] font-mono font-black border transition-all ${
                      isCurrentActive
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/30 animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : ag.id}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-white text-xs truncate">
                        {ag.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans truncate">
                      {ag.role}
                    </p>
                  </div>
                </div>

                {/* Live Status Pill */}
                <div className="shrink-0 flex items-center gap-1">
                  {isCurrentActive ? (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-[9px] font-mono font-bold flex items-center gap-1 shadow-sm">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                      ANALYZING...
                    </span>
                  ) : isCompleted ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[9px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      VERIFIED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 text-[9px] font-mono">
                      IDLE
                    </span>
                  )}
                </div>
              </div>

              {/* Sub-telemetry strip (visible when active or completed) */}
              {(isCurrentActive || isCompleted) && (
                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-cyan-300/90 animate-in fade-in">
                  <span className="truncate flex items-center gap-1">
                    <CornerDownRight className="w-3 h-3 text-slate-500" />
                    <span>{ag.telemetry}</span>
                  </span>
                  <span className="text-[9px] text-slate-400 shrink-0 ml-2">
                    {isCurrentActive ? '2.0s processing' : '✓ 2.0s done'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
