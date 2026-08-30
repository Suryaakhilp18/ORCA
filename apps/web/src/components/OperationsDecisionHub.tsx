"use client";

import React from "react";
import {
  ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle,
  Waves, Wind, Thermometer, Sparkles, Navigation,
  Fish, ExternalLink, Compass, Activity, ArrowUpRight
} from "lucide-react";
import { QueryResponse, PFZCandidate } from "@/types";

interface Props {
  data: QueryResponse;
  onOpenWhy: () => void;
  onSelectCandidate: (candidate: PFZCandidate) => void;
}

export function OperationsDecisionHub({ data, onOpenWhy, onSelectCandidate }: Props) {
  const { decision, selected_pfz, ocean_conditions, weather_forecast, route, location } = data;

  const getVerdictStyle = () => {
    switch (decision.decision_class) {
      case "GO":
        return {
          bg: "bg-emerald-950/40 border-emerald-500/50 text-emerald-300",
          icon: <ShieldCheck className="w-7 h-7 text-emerald-400" />,
          title: "GO — CONDITIONS FAVORABLE",
          desc: "Metocean and meteorological variables are within safe operational limits."
        };
      case "CAUTION":
        return {
          bg: "bg-amber-950/40 border-amber-500/50 text-amber-300",
          icon: <AlertTriangle className="w-7 h-7 text-amber-400" />,
          title: "CAUTION — ELEVATED RISK",
          desc: "Heightened wave agitation, wind gusts, or military exercise bypass active."
        };
      case "DO_NOT_VENTURE":
        return {
          bg: "bg-rose-950/40 border-rose-500/50 text-rose-300",
          icon: <ShieldAlert className="w-7 h-7 text-rose-400" />,
          title: "DO NOT VENTURE — PROHIBITED",
          desc: decision.gate_reason || "Severe weather alert or wave survivability cutoff exceeded."
        };
      default:
        return {
          bg: "bg-slate-900 border-slate-700 text-slate-300",
          icon: <HelpCircle className="w-7 h-7 text-slate-400" />,
          title: "UNKNOWN / CANNOT VERIFY",
          desc: "Critical sensor feeds unavailable. Do not assume safety."
        };
    }
  };

  const verdict = getVerdictStyle();

  return (
    <div className="space-y-4">
      {/* Top Operations Decision Banner */}
      <div className={`border rounded-2xl p-5 shadow-2xl backdrop-blur-md transition-all ${verdict.bg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-ocean-950/80 border border-slate-800 shadow-inner">
              {verdict.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-ocean-950/90 border border-slate-700 uppercase">
                  {location.name} Sector
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Rule: {decision.rule_version}
                </span>
              </div>
              <h2 className="text-xl font-extrabold tracking-wide text-white mt-1">
                {verdict.title}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                {verdict.desc}
              </p>
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={onOpenWhy}
            className="self-start md:self-center flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold text-xs shadow-lg shadow-cyan-500/10 transition-all"
          >
            <span>Why ORCA Says This</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Core Independent Meters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5 pt-5 border-t border-slate-800/80">
          {/* 1. Safety Risk Score */}
          <div className="bg-ocean-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                Safety Risk Score
              </span>
              <span className="font-mono font-bold text-rose-300">
                {decision.risk_level}
              </span>
            </div>
            <div className="my-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-white">
                  {decision.safety_risk_score.toFixed(0)}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    decision.safety_risk_score > 50
                      ? "bg-rose-500"
                      : decision.safety_risk_score > 25
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${decision.safety_risk_score}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-400">
              Deterministic Metocean Burden
            </span>
          </div>

          {/* 2. Fishing Potential Score */}
          <div className="bg-ocean-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium flex items-center gap-1.5">
                <Fish className="w-3.5 h-3.5 text-teal-400" />
                Fishing Potential
              </span>
              <span className="font-mono font-bold text-teal-300">
                {decision.fishing_level}
              </span>
            </div>
            <div className="my-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-white">
                  {decision.fishing_suitability_score.toFixed(0)}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-teal-400 transition-all duration-700"
                  style={{ width: `${decision.fishing_suitability_score}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-400">
              Thermal & Chlorophyll Front Alignment
            </span>
          </div>

          {/* 3. Tactical Routing Status */}
          <div className="bg-ocean-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Tactical Routing
              </span>
              <span className="font-mono font-bold text-cyan-300 text-[10px]">
                {route.conflict_resolution_applied ? "BYPASS APPLIED" : "DIRECT CLEAR"}
              </span>
            </div>
            <div className="my-2">
              <div className="text-base font-bold text-white font-mono truncate">
                {route.safe_distance_km.toFixed(1)} km to Target
              </div>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                {route.conflicts_detected.length > 0
                  ? route.conflicts_detected[0]
                  : "Zero naval geofence conflicts."}
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Buffer: {route.standoff_buffer_km.toFixed(1)} km
            </span>
          </div>
        </div>
      </div>

      {/* Sensor Micro-Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
        <div className="bg-ocean-900/90 border border-slate-800 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wave Height</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {ocean_conditions.wave_height_m.toFixed(1)} m
          </div>
          <span className="text-[10px] text-slate-400">INCOIS OSF</span>
        </div>

        <div className="bg-ocean-900/90 border border-slate-800 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span>Wind Speed</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {weather_forecast.wind_speed_kmh.toFixed(1)} km/h
          </div>
          <span className="text-[10px] text-slate-400">IMD Marine</span>
        </div>

        <div className="bg-ocean-900/90 border border-slate-800 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>SST</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {ocean_conditions.sst_celsius.toFixed(1)} °C
          </div>
          <span className="text-[10px] text-slate-400">MOSDAC TIR</span>
        </div>

        <div className="bg-ocean-900/90 border border-slate-800 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chlorophyll-a</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {ocean_conditions.chlorophyll_mg_m3.toFixed(2)} mg/m³
          </div>
          <span className="text-[10px] text-slate-400">Oceansat-3</span>
        </div>

        <div className="bg-ocean-900/90 border border-slate-800 rounded-xl p-2.5 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Warning</span>
          </div>
          <div className={`text-sm font-bold mt-1 ${weather_forecast.is_official_warning_active ? "text-rose-400" : "text-emerald-400"}`}>
            {weather_forecast.is_official_warning_active ? "ACTIVE WARNING" : "NONE ACTIVE"}
          </div>
          <span className="text-[10px] text-slate-400">IMD Fishermen</span>
        </div>
      </div>
    </div>
  );
}
