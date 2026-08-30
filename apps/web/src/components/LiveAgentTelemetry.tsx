"use client";

import React from "react";
import {
  Brain, Waves, Wind, Fish, MapPin, ShieldCheck, Network,
  CheckCircle2, Clock, AlertCircle, Loader2
} from "lucide-react";
import { AgentLifecycleStatus } from "@/types";

interface AgentState {
  status: AgentLifecycleStatus;
  message?: string;
  duration_ms?: number;
}

interface Props {
  agentStates: Record<string, AgentState>;
  isLoading: boolean;
}

const AGENTS = [
  { key: "ORCA_PLANNER", name: "Planner & NLP Agent", icon: Brain, authority: "Intent & Disambiguation" },
  { key: "OCEAN_AGENT", name: "Ocean Intelligence", icon: Waves, authority: "INCOIS OSF / Wave / SST" },
  { key: "WEATHER_AGENT", name: "Weather & Hazard Agent", icon: Wind, authority: "IMD Coastal Warnings" },
  { key: "FISHERIES_AGENT", name: "Fisheries Intelligence", icon: Fish, authority: "INCOIS PFZ Advisories" },
  { key: "GEO_AGENT", name: "Geospatial Navigation", icon: MapPin, authority: "PostGIS / Standoff Bypass" },
  { key: "RISK_ENGINE", name: "Deterministic Risk Engine", icon: ShieldCheck, authority: "risk-2026-08-v1 Rules" },
  { key: "EVIDENCE_GRAPH", name: "Evidence & Lineage", icon: Network, authority: "Provenance Synthesizer" },
];

export function LiveAgentTelemetry({ agentStates, isLoading }: Props) {
  return (
    <div className="bg-ocean-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Collaborative Multi-Agent Telemetry
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Stateful LangGraph DAG Engine
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
        {AGENTS.map((agent) => {
          const state = agentStates[agent.key] || { status: "QUEUED" };
          const Icon = agent.icon;

          const isRunning = state.status === "RUNNING";
          const isSuccess = state.status === "SUCCESS";
          const isWarning = state.status === "WARNING";
          const isFailed = state.status === "FAILED";

          let borderClass = "border-slate-800/80 bg-ocean-950/60 text-slate-500";
          if (isRunning) borderClass = "border-cyan-500/80 bg-cyan-950/30 text-cyan-300 shadow-md shadow-cyan-500/10";
          if (isSuccess) borderClass = "border-emerald-500/50 bg-emerald-950/20 text-emerald-300";
          if (isWarning) borderClass = "border-amber-500/50 bg-amber-950/20 text-amber-300";
          if (isFailed) borderClass = "border-rose-500/50 bg-rose-950/20 text-rose-300";

          return (
            <div
              key={agent.key}
              className={`rounded-xl border p-2.5 flex flex-col justify-between transition-all duration-300 min-h-[90px] ${borderClass}`}
            >
              <div className="flex items-center justify-between">
                <div className="p-1.5 rounded-lg bg-ocean-900 border border-slate-800 text-slate-300">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {isRunning && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
                {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {isWarning && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                {!isRunning && !isSuccess && !isWarning && !isFailed && (
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>

              <div className="my-1">
                <div className="font-bold text-xs text-slate-200 line-clamp-1">
                  {agent.name}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {state.message || agent.authority}
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 border-t border-slate-800/60 pt-1">
                <span>{state.status}</span>
                {state.duration_ms && <span>{state.duration_ms.toFixed(0)}ms</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
