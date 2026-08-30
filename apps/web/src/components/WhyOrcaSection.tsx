"use client";

import React from "react";
import {
  CheckCircle2, AlertTriangle, Database, ShieldCheck, Waves, Wind,
  Thermometer, Fish, Sparkles, BookOpen, Compass, ExternalLink
} from "lucide-react";
import { QueryResponse, WhyExplanation } from "@/types";
import { translations, SupportedLanguage } from "@/lib/i18n";

interface Props {
  data: QueryResponse;
  onOpenEvidenceGraph?: () => void;
  language?: string;
}

export function WhyOrcaSection({ data, onOpenEvidenceGraph, language = "en" }: Props) {
  const t = translations[(language as SupportedLanguage) || "en"] || translations.en;
  const { why_explanation, ocean_conditions, weather_forecast, selected_pfz, route, location } = data;

  return (
    <div className="rounded-3xl bg-ocean-950/90 border border-slate-800/80 p-6 sm:p-7 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-lg">
              {t.whyOrcaTitle}
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              {t.whyOrcaSubtitle}
            </p>
          </div>
        </div>

        {onOpenEvidenceGraph && (
          <button
            onClick={onOpenEvidenceGraph}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ocean-900 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-cyan-300 hover:text-white transition-all cursor-pointer"
          >
            <span>{t.navEvidenceGraph}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Summary Prose */}
      <div className="p-4 rounded-2xl bg-ocean-900/60 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
        <span className="font-bold text-cyan-300 mr-1.5">{why_explanation.headline}:</span>
        {why_explanation.summary_prose}
      </div>

      {/* 3-4 Concise Key Bullet Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {why_explanation.positive_factors.map((factor, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-emerald-300">{factor.category}</div>
              <div className="text-slate-300 leading-snug">{factor.detail}</div>
              <div className="text-[10px] font-mono text-slate-400 pt-1">
                Source: {factor.source_authority}
              </div>
            </div>
          </div>
        ))}

        {why_explanation.risk_factors.map((factor, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-amber-300">{factor.category}</div>
              <div className="text-slate-300 leading-snug">{factor.detail}</div>
              <div className="text-[10px] font-mono text-slate-400 pt-1">
                Source: {factor.source_authority}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Structured Evidence Breakdown by Primary Authority */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Primary Source Evidence Breakdown
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* INCOIS Card */}
          <div className="p-4 rounded-2xl bg-ocean-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-100 font-mono">INCOIS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-1 text-xs text-slate-300 font-mono text-[11px]">
              <div>SST: <span className="text-cyan-300">{ocean_conditions.sst_celsius}°C</span></div>
              <div>Chlorophyll: <span className="text-emerald-400">{ocean_conditions.chlorophyll_mg_m3} mg/m³</span></div>
              <div>PFZ: <span className="text-slate-200">2 active fronts</span></div>
            </div>
          </div>

          {/* IMD Card */}
          <div className="p-4 rounded-2xl bg-ocean-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-100 font-mono">IMD Weather</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-1 text-xs text-slate-300 font-mono text-[11px]">
              <div>Wind: <span className="text-teal-300">{weather_forecast.wind_speed_kmh} km/h {weather_forecast.wind_direction}</span></div>
              <div>Waves: <span className="text-cyan-300">{ocean_conditions.wave_height_m} m</span></div>
              <div>Alerts: <span className="text-emerald-400">{weather_forecast.cyclone_alert_level}</span></div>
            </div>
          </div>

          {/* MOSDAC / ISRO Card */}
          <div className="p-4 rounded-2xl bg-ocean-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-100 font-mono">MOSDAC / ISRO</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <div className="space-y-1 text-xs text-slate-300 font-mono text-[11px]">
              <div>Sensors: <span className="text-slate-200">Oceansat-3 / INSAT-3D</span></div>
              <div>Front: <span className="text-cyan-300">Optimal Thermal Shift</span></div>
              <div>Coverage: <span className="text-emerald-400">High Confidence</span></div>
            </div>
          </div>

          {/* PostGIS Card */}
          <div className="p-4 rounded-2xl bg-ocean-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-100 font-mono">PostGIS / Geo</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-1 text-xs text-slate-300 font-mono text-[11px]">
              <div>Target: <span className="text-cyan-300">{selected_pfz ? `${selected_pfz.distance_km.toFixed(1)} km` : "N/A"}</span></div>
              <div>Geofence: <span className={route.conflict_resolution_applied ? "text-amber-400" : "text-emerald-400"}>
                {route.conflict_resolution_applied ? "3.5km Buffer Applied" : "Clear Passage"}
              </span></div>
              <div>Route: <span className="text-slate-200">{route.safe_distance_km.toFixed(1)} km</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
