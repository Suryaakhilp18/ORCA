"use client";

import React from "react";
import {
  ShieldCheck, AlertTriangle, XCircle, HelpCircle, Waves, Wind,
  Thermometer, Fish, Compass, Navigation, ArrowRight, ShieldAlert, Sparkles
} from "lucide-react";
import { QueryResponse, PFZCandidate } from "@/types";

interface Props {
  data: QueryResponse;
  onOpenWhy: () => void;
  onSelectCandidate?: (cand: PFZCandidate) => void;
}

export function CoreDecisionCard({ data, onOpenWhy, onSelectCandidate }: Props) {
  const { decision, ocean_conditions, weather_forecast, route, selected_pfz, location } = data;

  // Normalize human-readable verdict
  const verdict = decision.decision_class;
  const isFavorable = verdict === "FAVORABLE" || verdict === "GO";
  const isCaution = verdict === "CAUTION";
  const isUnsafe = verdict === "UNSAFE" || verdict === "DO_NOT_VENTURE";

  const getVerdictDetails = () => {
    if (isFavorable) {
      return {
        title: "FAVORABLE",
        subtitle: "Conditions look suitable for your planned trip.",
        badgeColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        icon: ShieldCheck,
        cardBorder: "border-emerald-500/30 shadow-emerald-500/5",
        accentText: "text-emerald-400"
      };
    } else if (isCaution) {
      return {
        title: "CAUTION",
        subtitle: "Conditions require additional care and active monitoring.",
        badgeColor: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        icon: AlertTriangle,
        cardBorder: "border-amber-500/30 shadow-amber-500/5",
        accentText: "text-amber-400"
      };
    } else if (isUnsafe) {
      return {
        title: "UNSAFE",
        subtitle: decision.gate_reason || "Do not recommend the trip under current conditions.",
        badgeColor: "bg-rose-500/10 border-rose-500/30 text-rose-400",
        icon: XCircle,
        cardBorder: "border-rose-500/30 shadow-rose-500/5",
        accentText: "text-rose-400"
      };
    } else {
      return {
        title: "INSUFFICIENT DATA",
        subtitle: "ORCA cannot confidently assess the situation.",
        badgeColor: "bg-slate-500/10 border-slate-500/30 text-slate-400",
        icon: HelpCircle,
        cardBorder: "border-slate-800",
        accentText: "text-slate-400"
      };
    }
  };

  const vInfo = getVerdictDetails();
  const Icon = vInfo.icon;

  return (
    <div className={`rounded-3xl bg-ocean-950/90 border ${vInfo.cardBorder} p-6 sm:p-7 shadow-2xl space-y-6 transition-all`}>
      {/* Header & Status Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Operational Decision &bull; {location.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-ocean-900 border border-slate-800 text-slate-400">
            {location.is_supported_coastal_zone ? "DEMO BENCHMARK" : "REGIONAL DATA"}
          </span>
        </div>
      </div>

      {/* Hero Decision Banner */}
      <div className={`p-5 rounded-2xl border ${vInfo.badgeColor} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-ocean-950/80 border border-current">
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider opacity-80">
              CORE DECISION
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
              {vInfo.title}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {vInfo.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenWhy}
          className="px-4 py-2.5 rounded-xl bg-ocean-950 hover:bg-ocean-900 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <span>Why ORCA Says This</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Strictly Decoupled Scores: Safety vs Fishing Potential */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Safety Risk Meter */}
        <div className="p-4 rounded-2xl bg-ocean-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase">Safety Score</span>
            <span className={`font-bold ${
              decision.safety_risk_score <= 30 ? "text-emerald-400" :
              decision.safety_risk_score <= 60 ? "text-amber-400" : "text-rose-400"
            }`}>
              {100 - decision.safety_risk_score} / 100 ({decision.risk_level} RISK)
            </span>
          </div>

          <div className="w-full bg-ocean-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all ${
                decision.safety_risk_score <= 30 ? "bg-emerald-400" :
                decision.safety_risk_score <= 60 ? "bg-amber-400" : "bg-rose-400"
              }`}
              style={{ width: `${Math.max(10, 100 - decision.safety_risk_score)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Evaluated against IMD warnings, wave limits, and marine hazards.
          </div>
        </div>

        {/* Fishing Potential Meter */}
        <div className="p-4 rounded-2xl bg-ocean-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase">Fishing Potential</span>
            <span className="font-bold text-teal-300">
              {decision.fishing_level || "HIGH"} POTENTIAL ({decision.fishing_suitability_score.toFixed(0)}/100)
            </span>
          </div>

          <div className="w-full bg-ocean-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all"
              style={{ width: `${Math.max(10, decision.fishing_suitability_score)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Based on INCOIS / MOSDAC Oceansat-3 thermal & chlorophyll front.
          </div>
        </div>
      </div>

      {/* Supporting Key Marine Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        <div className="p-3 rounded-2xl bg-ocean-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Fish className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nearest PFZ</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1 font-mono">
            {selected_pfz ? `${selected_pfz.distance_km.toFixed(1)} km` : "N/A"}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-ocean-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wave Height</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1 font-mono">
            {ocean_conditions.wave_height_m.toFixed(1)} m
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-ocean-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span>Wind Speed</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1 font-mono">
            {weather_forecast.wind_speed_kmh.toFixed(0)} km/h
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-ocean-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>Sea Surface Temp</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1 font-mono">
            {ocean_conditions.sst_celsius.toFixed(1)}°C
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-ocean-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chlorophyll-a</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1 font-mono">
            {ocean_conditions.chlorophyll_mg_m3.toFixed(2)} mg/m³
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-ocean-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Restricted Zone</span>
          </div>
          <div className="text-xs font-bold text-slate-100 mt-1 truncate">
            {route.conflict_resolution_applied ? "Bypassed (3.5km)" : "Clear Passage"}
          </div>
        </div>
      </div>
    </div>
  );
}
