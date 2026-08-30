"use client";

import React, { useState } from "react";
import {
  Brain, Waves, CloudSun, Fish, Compass, ShieldAlert, Network, CheckCircle2,
  Clock, AlertTriangle, ChevronRight, Activity, Sparkles, ArrowRight, ArrowDownRight, Layers
} from "lucide-react";
import { AgentLifecycleStatus } from "@/types";
import { translations, SupportedLanguage } from "@/lib/i18n";

interface AgentStatusItem {
  status: AgentLifecycleStatus;
  message?: string;
  duration_ms?: number;
}

interface Props {
  agentStates: Record<string, AgentStatusItem>;
  isLoading: boolean;
  onOpenTrace?: () => void;
  language?: string;
}

const AGENTS_METADATA = [
  { id: "ORCA_PLANNER", name: "ORCA PLANNER", icon: Brain, role: "Intent & Orchestration", stage: "Input" },
  { id: "OCEAN_AGENT", name: "OCEAN AGENT", icon: Waves, role: "INCOIS SWAN & SST", stage: "Specialist" },
  { id: "WEATHER_AGENT", name: "WEATHER AGENT", icon: CloudSun, role: "IMD Weather & Cyclone", stage: "Specialist" },
  { id: "FISHERIES_AGENT", name: "FISHERIES AGENT", icon: Fish, role: "MOSDAC Oceansat-3 PFZ", stage: "Specialist" },
  { id: "GEO_AGENT", name: "GEO AGENT", icon: Compass, role: "PostGIS Defense Routing", stage: "Specialist" },
  { id: "RISK_ENGINE", name: "RISK GATEWAY", icon: ShieldAlert, role: "Deterministic Safety Gate", stage: "Governance" },
  { id: "EVIDENCE_GRAPH", name: "EVIDENCE AGENT", icon: Network, role: "Lineage Graph Assembly", stage: "Provenance" }
];

export function AgentExecutionPanel({ agentStates, isLoading, onOpenTrace, language = "en" }: Props) {
  const t = translations[(language as SupportedLanguage) || "en"] || translations.en;
  const [showTopology, setShowTopology] = useState(false);

  return (
    <div className="relative z-10 rounded-3xl bg-ocean-950 border border-slate-800 p-5 shadow-2xl space-y-4 overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-850">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shadow-md shadow-cyan-950/50">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-white font-mono tracking-wider">
                {t.agentPipelineTitle}
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono">
                {t.agentsActiveBadge}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-sans">
              {t.agentPipelineDesc}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTopology(!showTopology)}
            className="px-2.5 py-1 rounded-xl bg-ocean-900 border border-slate-800 hover:border-cyan-600 text-slate-300 text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showTopology ? t.hideTopology : t.showTopology}</span>
          </button>

          {onOpenTrace && (
            <button
              onClick={onOpenTrace}
              className="px-2.5 py-1 rounded-xl bg-ocean-900 border border-slate-800 hover:border-cyan-600 text-cyan-400 text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{t.viewTraceLogs}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Connected Interactive Architecture Topology (Expandable) */}
      {showTopology && (
        <div className="p-4 rounded-2xl bg-ocean-900/60 border border-cyan-800/40 space-y-3 animate-in fade-in">
          <div className="text-[11px] font-mono text-cyan-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTER-AGENT COLLABORATION FLOW & DATA CONTRACTS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
            {/* Stage 1: Input */}
            <div className="p-3 rounded-xl bg-ocean-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] text-cyan-400 font-bold block">STAGE 1 &bull; ORCHESTRATION</span>
              <div className="text-white font-bold">ORCA Planner</div>
              <p className="text-[10px] text-slate-400 font-sans">
                Parses natural language query, extracts port entities, resolves coordinates, and spawns parallel subagents.
              </p>
            </div>

            {/* Stage 2: 4 Parallel Domain Specialists */}
            <div className="p-3 rounded-xl bg-ocean-950 border border-slate-800 space-y-1.5 md:col-span-2">
              <span className="text-[10px] text-teal-400 font-bold block">STAGE 2 &bull; 4 SPECIALIST AGENTS (PARALLEL)</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-1.5 rounded bg-ocean-900 border border-slate-800 text-cyan-300">
                  <b>Ocean Agent</b>: Wave & SST
                </div>
                <div className="p-1.5 rounded bg-ocean-900 border border-slate-800 text-teal-300">
                  <b>Weather Agent</b>: IMD Cyclone Gate
                </div>
                <div className="p-1.5 rounded bg-ocean-900 border border-slate-800 text-purple-300">
                  <b>Fisheries Agent</b>: Oceansat-3 PFZ
                </div>
                <div className="p-1.5 rounded bg-ocean-900 border border-slate-800 text-emerald-300">
                  <b>Geo Agent</b>: Naval Obstacle Bypass
                </div>
              </div>
            </div>

            {/* Stage 3: Risk & Evidence Synthesis */}
            <div className="p-3 rounded-xl bg-ocean-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] text-rose-400 font-bold block">STAGE 3 &bull; GOVERNED SYNTHESIS</span>
              <div className="text-white font-bold">Risk Engine & Evidence</div>
              <p className="text-[10px] text-slate-400 font-sans">
                Applies ISO 31010 safety rules to lock unsafe missions and generates immutable DAG provenance evidence.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid of 7 Connected Agent Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {AGENTS_METADATA.map((agent, index) => {
          const state = agentStates[agent.id] || { status: "SUCCESS" };
          const Icon = agent.icon;
          const isDone = state.status === "SUCCESS";
          const isRunning = state.status === "RUNNING";
          const isFailed = state.status === "FAILED";

          return (
            <div
              key={agent.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between relative group ${
                isDone
                  ? "bg-ocean-900/90 border-slate-800 hover:border-cyan-700/60"
                  : isRunning
                  ? "bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/20"
                  : isFailed
                  ? "bg-rose-950/40 border-rose-700"
                  : "bg-ocean-950/60 border-slate-850 opacity-80"
              }`}
            >
              {/* Connected node sequence indicator */}
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <div className={`p-2 rounded-xl border ${
                  isDone
                    ? "bg-emerald-950/80 border-emerald-600/60 text-emerald-400"
                    : isRunning
                    ? "bg-cyan-900 border-cyan-400 text-cyan-300 animate-pulse"
                    : "bg-ocean-950 border-slate-800 text-slate-500"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="text-[10px] font-mono">
                  {isDone ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {state.duration_ms ? `${state.duration_ms}ms` : "Done"}
                    </span>
                  ) : isRunning ? (
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      Running
                    </span>
                  ) : (
                    <span className="text-slate-500">Queued</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-extrabold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {agent.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-sans mt-0.5" title={agent.role}>
                  {agent.role}
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-850 flex items-center justify-between text-[9px] font-mono text-slate-500">
                <span>Node {index + 1}/7</span>
                <span className="text-cyan-500 font-bold">{agent.stage}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

