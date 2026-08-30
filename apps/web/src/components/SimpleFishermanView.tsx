"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Compass,
  Fish,
  Wind,
  Waves,
  Eye,
  Thermometer,
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  Fuel,
  Info
} from "lucide-react";
import { QueryResponse, PFZCandidate } from "@/types";
import { translations, SupportedLanguage } from "@/lib/i18n";

interface Props {
  data: QueryResponse;
  selectedCandidate?: PFZCandidate;
  onSelectCandidate: (candidate: PFZCandidate) => void;
  onSwitchToMap: () => void;
  onOpenAiAssistant: () => void;
  language?: string;
}

export function SimpleFishermanView({
  data,
  selectedCandidate,
  onSelectCandidate,
  onSwitchToMap,
  onOpenAiAssistant,
  language = "en"
}: Props) {
  const t = translations[(language as SupportedLanguage) || "en"] || translations.en;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const targetPfz = selectedCandidate || data.selected_pfz || data.candidates[0];

  const verdict = data.decision.decision_class;
  const isSafe = verdict === "FAVORABLE" || verdict === "GO";
  const isCaution = verdict === "CAUTION";
  const isUnsafe = verdict === "UNSAFE" || verdict === "DO_NOT_VENTURE";

  // Web Speech API for Multilingual Audio Voice Advisory
  const handleSpeakAdvisory = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Audio speech synthesis is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const langCodeMap: Record<string, string> = {
      hi: "hi-IN",
      te: "te-IN",
      ta: "ta-IN",
      ml: "ml-IN",
      mr: "mr-IN",
      gu: "gu-IN",
      bn: "bn-IN",
      kn: "kn-IN",
      or: "or-IN",
      en: "en-IN"
    };

    const activeLang = data.why_explanation?.language || language || "en";
    const speechLang = langCodeMap[activeLang] || "en-IN";

    // Use native translated prose if available
    const textToSpeak = data.why_explanation?.summary_prose
      ? `${data.why_explanation.headline}. ${data.why_explanation.summary_prose}`
      : `Advisory for ${data.location.name}. Safety status is ${
          isSafe
            ? "Favorable. Sea conditions are safe for fishing."
            : isCaution
            ? "Caution. Moderate waves and wind observed. Exercise caution."
            : "Unsafe. Rough sea conditions. Stay within harbour."
        } Significant wave height is ${data.ocean_conditions.wave_height_m} meters. Wind speed is ${
          data.weather_forecast.wind_speed_kmh
        } kilometers per hour. Recommended fishing zone is ${
          targetPfz?.name || "Offshore Shelf"
        }, located ${targetPfz?.distance_km.toFixed(1)} kilometers away at bearing ${targetPfz?.bearing_deg.toFixed(0)} degrees.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = speechLang;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* 4 Essential Answers Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. WHERE AM I? */}
        <div className="p-5 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden group hover:border-cyan-700/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-400 font-mono tracking-wider flex items-center gap-1.5 uppercase">
              <MapPin className="w-4 h-4 text-cyan-400" />
              {t.locCardTitle}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px] font-mono">
              {data.location.state}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
              {data.location.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {data.location.harbour_name || "Main Fishing Harbour"}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{t.locCoastSector}</span>
            <span className="text-slate-300 font-bold">{data.location.shelf_azimuth_deg}° Offshore</span>
          </div>
        </div>

        {/* 2. WHAT ARE THE CONDITIONS? */}
        <div className="p-5 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden group hover:border-teal-700/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-400 font-mono tracking-wider flex items-center gap-1.5 uppercase">
              <Waves className="w-4 h-4 text-teal-400" />
              {t.conditionsCardTitle}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-[10px] font-mono">
              {data.ocean_conditions.wave_height_m <= 1.0 ? t.condCalm : data.ocean_conditions.wave_height_m <= 1.8 ? t.condModerate : t.condRough}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-xl bg-ocean-900/80 border border-slate-850">
              <span className="text-[10px] text-slate-400 block">{t.condWaves}</span>
              <span className="text-sm font-bold text-cyan-300 font-mono">
                {data.ocean_conditions.wave_height_m} m
              </span>
            </div>
            <div className="p-2 rounded-xl bg-ocean-900/80 border border-slate-850">
              <span className="text-[10px] text-slate-400 block">{t.condWind}</span>
              <span className="text-sm font-bold text-teal-300 font-mono">
                {data.weather_forecast.wind_speed_kmh} km/h
              </span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{t.condSst}: <b className="text-slate-200">{data.ocean_conditions.sst_celsius}°C</b></span>
            <span>{t.condVisibility}: <b className="text-slate-200">{data.weather_forecast.visibility_km} km</b></span>
          </div>
        </div>

        {/* 3. IS IT SAFE TO GO? */}
        <div className={`p-5 rounded-3xl border shadow-xl space-y-3 relative overflow-hidden transition-all ${
          isSafe
            ? "bg-emerald-950/30 border-emerald-500/50"
            : isCaution
            ? "bg-amber-950/30 border-amber-500/50"
            : "bg-rose-950/30 border-rose-500/50"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold font-mono tracking-wider flex items-center gap-1.5 uppercase ${
              isSafe ? "text-emerald-400" : isCaution ? "text-amber-400" : "text-rose-400"
            }`}>
              {isSafe ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {t.safetyCardTitle}
            </span>

            {/* Audio Speech Button */}
            <button
              onClick={handleSpeakAdvisory}
              className={`p-1.5 rounded-xl border flex items-center gap-1 text-[10px] font-mono transition-all cursor-pointer ${
                isSpeaking
                  ? "bg-cyan-500 text-slate-950 border-cyan-400 animate-pulse font-bold"
                  : "bg-ocean-900 text-cyan-300 border-slate-800 hover:bg-cyan-950"
              }`}
              title="Listen to Voice Advisory"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? t.muteVoice : t.listenVoice}</span>
            </button>
          </div>

          <div>
            <h3 className={`text-base sm:text-lg font-extrabold flex items-center gap-2 ${
              isSafe ? "text-emerald-300" : isCaution ? "text-amber-300" : "text-rose-300"
            }`}>
              {data.why_explanation?.headline || (isSafe ? "🟢 SAFE TO VENTURE" : isCaution ? "🟡 PROCEED WITH CAUTION" : "🔴 DO NOT VENTURE")}
            </h3>
            <p className="text-xs text-slate-300 mt-1 line-clamp-3 font-sans">
              {data.why_explanation?.summary_prose || (isSafe
                ? "Favorable sea state and wind conditions. Clear sailing."
                : isCaution
                ? "Moderate waves or shifting winds. Maintain safety gear and radio contact."
                : "Hazardous sea state or severe weather warning. Avoid going offshore.")}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">{t.safetyScoreLabel}</span>
            <span className={`font-bold ${isSafe ? "text-emerald-400" : isCaution ? "text-amber-400" : "text-rose-400"}`}>
              {data.decision.safety_risk_score.toFixed(0)} / 100
            </span>
          </div>
        </div>

        {/* 4. WHERE SHOULD I GO FOR BEST FISHING? */}
        <div className="p-5 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden group hover:border-cyan-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-400 font-mono tracking-wider flex items-center gap-1.5 uppercase">
              <Fish className="w-4 h-4 text-cyan-400" />
              {t.pfzCardTitle}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px] font-mono font-bold">
              {targetPfz?.suitability_score.toFixed(0)}% {t.pfzPotentialLabel}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors truncate">
              {targetPfz?.name || "Offshore Shelf Front"}
            </h3>
            <p className="text-xs text-teal-300 mt-0.5 flex items-center gap-2 font-mono">
              <span>{targetPfz?.distance_km.toFixed(1)} km</span>
              <span>&bull;</span>
              <span>{t.pfzHeading} {targetPfz?.bearing_deg.toFixed(0)}°</span>
            </p>
          </div>

          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">{t.pfzTargetFish}</span>
            <span className="text-cyan-300 font-bold truncate max-w-[130px]">
              {targetPfz?.target_species[0]?.split("(")[0] || "Indian Mackerel"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Copilot Action Panel */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-ocean-950 via-ocean-900 to-ocean-950 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.copilotRecBadge}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            {t.copilotRecHeading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans">
            {t.copilotRecText}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={onSwitchToMap}
            className="flex-1 md:flex-none px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{t.btnViewRouteMap}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAiAssistant}
            className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-ocean-900 hover:bg-cyan-950 border border-slate-750 text-cyan-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{t.btnAskAiAssistant}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
