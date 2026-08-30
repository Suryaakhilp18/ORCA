'use client';

import React, { useState } from 'react';
import {
  Compass, ArrowRight, Brain, Waves, CloudSun, Satellite, ShieldAlert,
  Network, Database, CheckCircle2, Sparkles, HelpCircle, Layers,
  Activity, Play, Check, Shield, MapPin, Globe, Server, Fish, FileText
} from 'lucide-react';
import { translations, SupportedLanguage } from '@/lib/i18n';

interface Props {
  onEnterOrca: () => void;
  language?: string;
}

export function HomeLandingPage({ onEnterOrca, language = 'en' }: Props) {
  const langKey = ((language && translations[language as SupportedLanguage]) ? language : 'en') as SupportedLanguage;
  const t = translations[langKey] || translations.en;

  // Interactive 5-Step Pipeline Active State
  const [activeStep, setActiveStep] = useState<number>(0);

  // Interactive Agent Network Inspection
  const [selectedAgent, setSelectedAgent] = useState<string | null>('orchestrator');

  // Interactive Demo Query State
  const [demoRunning, setDemoRunning] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  const steps = [
    {
      title: t.askStep || '1. Natural-Language Query',
      label: 'Natural Language Query',
      desc: 'Captain speaks or types an operational query in their native coastal language (e.g. "Assess safety of the marine corridor for the next 12 hours").'
    },
    {
      title: t.understandStep || '2. Supervisor Orchestration',
      label: 'Supervisor Intent Parsing',
      desc: 'ORCA Supervisor extracts marine entities, target coordinates, vessel parameters, and selects only relevant domain agents.'
    },
    {
      title: t.collaborateStep || '3. Multi-Agent Telemetry Ingestion',
      label: 'Multi-Agent Ingestion',
      desc: 'Specialized Weather, Ocean, Satellite, and Geospatial agents query live observational feeds in parallel across Indian waters.'
    },
    {
      title: t.reasonStep || '4. ISO 31010 Safety Gate Evaluation',
      label: 'Deterministic Risk Evaluation',
      desc: 'Safety Engine evaluates ISO 31010 criteria, wave thresholds, and cyclone bulletins to generate a non-negotiable safety gate.'
    },
    {
      title: t.assessStep || '5. Explainable Assessment Delivery',
      label: 'Explainable Decision',
      desc: 'ORCA delivers a verified Go/Caution/No-Go verdict, high-yield PFZ waypoints, safe obstacle-free route, and voice advisory.'
    }
  ];

  const agentDetails: Record<string, { title: string; desc: string }> = {
    orchestrator: {
      title: t.pipelineStep1 || '1. ORCHESTRATOR / PLANNER AGENT',
      desc: 'Parses natural-language queries, determines required domain specialists, and organizes the reasoning workflow.'
    },
    ocean: {
      title: t.pipelineStep2 || '2. OCEAN INTELLIGENCE AGENT',
      desc: 'Analyzes dynamic ocean physics including waves, currents, swell periods, and sea surface temperatures from INCOIS SWAN models.'
    },
    weather: {
      title: t.pipelineStep3 || '3. WEATHER AND HAZARD AGENT',
      desc: 'Monitors IMD meteorological bulletins, coastal gale warnings, squalls, cyclonic tracks, and barometric trends.'
    },
    fisheries: {
      title: t.pipelineStep4 || '4. FISHERIES AGENT',
      desc: 'Processes Oceansat-3 satellite ocean color, thermal front breaklines, and chlorophyll-a concentrations for pelagic habitat mapping.'
    },
    geospatial: {
      title: t.pipelineStep5 || '5. GEO SPATIAL AGENT',
      desc: 'Computes nautical corridors, ENC bathymetry clearances, and maintains mandatory 3.5 km standoff from naval defense polygons.'
    },
    risk: {
      title: t.pipelineStep6 || '6. RISK AGENT',
      desc: 'Synthesizes all multi-domain evidence against deterministic ISO 31010 safety criteria and 5 non-negotiable hard safety gates.'
    },
    explanation: {
      title: t.pipelineStep7 || '7. EXPLANATION AGENT',
      desc: 'Converts multi-agent telemetry and risk scores into explainable, evidence-backed natural-language operational guidance.'
    }
  };

  const handleRunDemo = () => {
    if (demoRunning) return;
    setDemoRunning(true);
    setDemoStep(1);

    setTimeout(() => setDemoStep(2), 700);
    setTimeout(() => setDemoStep(3), 1500);
    setTimeout(() => setDemoStep(4), 2300);
    setTimeout(() => {
      setDemoStep(5);
      setDemoRunning(false);
    }, 3200);
  };

  return (
    <div className="space-y-12 sm:space-y-16 py-4 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-6 sm:pt-10">
        <div className="space-y-3">
          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight font-mono">
            {t.appName || 'ORCA'}
          </h1>
          <p className="text-lg sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 tracking-wide font-mono uppercase">
            {t.heroHeadline || 'Marine Ecosystem Reasoning with Collaborative Agents'}
          </p>
        </div>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
          {t.heroDescription || 'Transform natural-language queries into intelligent, explainable marine safety assessments using collaborative AI agents reasoning across ocean, weather, satellite, and geospatial data.'}
        </p>

        {/* Primary CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onEnterOrca}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-sm tracking-wider shadow-[0_0_35px_rgba(34,211,238,0.35)] flex items-center justify-center gap-3 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 font-mono"
          >
            <span>{t.enterWorkspace || 'ENTER ORCA WORKSPACE'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. HOW ORCA WORKS (Interactive 5-Step Pipeline)                          */}
      {/* ========================================================================= */}
      <section className="p-7 sm:p-9 rounded-3xl bg-ocean-950 border border-slate-800/90 shadow-2xl space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Reasoning Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.howOrcaWorks || 'How ORCA Reasons from Query to Assessment'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            {t.howOrcaWorksSub || 'Multi-agent collaborative reasoning pipeline'}
          </p>
        </div>

        {/* 5-Step Horizontal Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-4">
          {steps.map((st, sidx) => {
            const isActive = activeStep === sidx;
            return (
              <button
                key={sidx}
                onClick={() => setActiveStep(sidx)}
                className={`p-4 rounded-2xl border text-left transition-all relative space-y-2 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-lg shadow-cyan-500/15 scale-[1.02]'
                    : 'bg-ocean-900/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    0{sidx + 1}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>
                <div className="font-mono font-bold text-white text-xs">
                  {st.title}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug font-sans">
                  {st.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. 7-AGENT COLLABORATIVE SYSTEM (Click-to-Inspect)                       */}
      {/* ========================================================================= */}
      <section className="p-7 sm:p-9 rounded-3xl bg-ocean-950 border border-slate-800/90 shadow-2xl space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">
            <Network className="w-3.5 h-3.5" />
            <span>Agent Network</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.agentNetworkTitle || '7 Specialized Collaborative Agents'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            {t.agentNetworkSub || 'Click any agent to inspect its reasoning responsibility'}
          </p>
        </div>

        {/* Interactive Visual Network Grid across 7 agents */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
          {[
            { id: 'orchestrator', name: '1. Orchestrator', icon: Brain, color: 'text-cyan-400' },
            { id: 'ocean', name: '2. Ocean Intel', icon: Waves, color: 'text-teal-400' },
            { id: 'weather', name: '3. Weather/Hazard', icon: CloudSun, color: 'text-amber-400' },
            { id: 'fisheries', name: '4. Fisheries', icon: Fish, color: 'text-purple-400' },
            { id: 'geospatial', name: '5. Geo Spatial', icon: Compass, color: 'text-blue-400' },
            { id: 'risk', name: '6. Risk Agent', icon: ShieldAlert, color: 'text-rose-400' },
            { id: 'explanation', name: '7. Explanation', icon: FileText, color: 'text-emerald-400' }
          ].map((ag) => {
            const Icon = ag.icon;
            const isSelected = selectedAgent === ag.id;

            return (
              <button
                key={ag.id}
                onClick={() => setSelectedAgent(ag.id)}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : 'bg-ocean-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl bg-ocean-950 border border-slate-800 ${ag.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-white font-mono leading-tight">{ag.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Agent Inspector */}
        {selectedAgent && agentDetails[selectedAgent] && (
          <div className="p-5 rounded-2xl bg-ocean-900/60 border border-slate-800 space-y-2 animate-in fade-in max-w-xl mx-auto text-center">
            <h3 className="font-bold text-white text-sm font-mono tracking-wider text-cyan-400">
              {agentDetails[selectedAgent].title}
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {agentDetails[selectedAgent].desc}
            </p>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. DATA ECOSYSTEM TRANSPARENCY                                           */}
      {/* ========================================================================= */}
      <section className="p-7 sm:p-9 rounded-3xl bg-ocean-950 border border-slate-800/90 shadow-2xl space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
            <Database className="w-3.5 h-3.5" />
            <span>Data Ingestion</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.dataEcosystemTitle || 'Authoritative Data Ecosystem'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Real-time integration with national space, meteorological, and oceanographic institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-ocean-900/40 border border-slate-800/80 space-y-2">
            <div className="text-xs font-mono font-bold text-cyan-400">INCOIS</div>
            <div className="text-sm font-bold text-white">Ocean State Forecast (OSF)</div>
            <p className="text-xs text-slate-400">
              High-resolution SWAN wave models, swell periods, surface currents, and sea surface temperatures.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-ocean-900/40 border border-slate-800/80 space-y-2">
            <div className="text-xs font-mono font-bold text-amber-400">IMD</div>
            <div className="text-sm font-bold text-white">Cyclone & Meteorological Bulletins</div>
            <p className="text-xs text-slate-400">
              Coastal gale warnings, squall line alerts, synoptic pressure gradients, and official storm advisories.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-ocean-900/40 border border-slate-800/80 space-y-2">
            <div className="text-xs font-mono font-bold text-purple-400">MOSDAC / ISRO</div>
            <div className="text-sm font-bold text-white">Oceansat-3 & INSAT-3D</div>
            <p className="text-xs text-slate-400">
              Multi-spectral ocean color, chlorophyll-a concentration gradients, and thermal front detections.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-ocean-900/40 border border-slate-800/80 space-y-2">
            <div className="text-xs font-mono font-bold text-blue-400">POSTGIS & OSRM</div>
            <div className="text-sm font-bold text-white">Geospatial Nautical Engine</div>
            <p className="text-xs text-slate-400">
              Electronic Navigational Charts (ENC), bathymetric clearances, and 3.5 km naval defense buffer polygons.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
