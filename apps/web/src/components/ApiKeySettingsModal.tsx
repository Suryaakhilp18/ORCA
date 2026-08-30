"use client";

import React from "react";
import { X, ShieldCheck, Database, Radio, Sparkles, CheckCircle2, Server, Lock } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeySettingsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-ocean-950 border border-slate-800 rounded-3xl shadow-2xl p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Data Telemetry & Security Gateway
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                ORCA Multi-Agent Operational Feeds
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-ocean-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Isolation Notice */}
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 my-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              Secure Server-Side Credential Isolation
            </span>
            <span className="text-[10px] font-mono bg-emerald-950 px-2 py-0.5 rounded text-emerald-400 border border-emerald-700 font-bold">
              PROTECTED
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            All API keys and provider tokens (CARTO, LLM, NASA, Copernicus) are strictly managed via backend environment variables (<code className="text-cyan-300 font-mono">.env</code>) and are never exposed to browser clients.
          </p>
        </div>

        {/* Primary Data Source Feeds Status */}
        <div className="space-y-2.5 mb-4 text-xs font-mono">
          <div className="text-slate-400 text-[11px] uppercase tracking-wider font-bold">
            Live Feed Telemetry & Latency
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-ocean-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">INCOIS OSF / PFZ</span>
                <span className="text-[10px] text-slate-400">Oceansat-3 / MODIS</span>
              </div>
              <span className="text-emerald-400 text-[10px] font-bold">🟢 140ms</span>
            </div>

            <div className="p-3 rounded-xl bg-ocean-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">IMD Warnings</span>
                <span className="text-[10px] text-slate-400">Cyclone / Squall Alert</span>
              </div>
              <span className="text-emerald-400 text-[10px] font-bold">🟢 95ms</span>
            </div>

            <div className="p-3 rounded-xl bg-ocean-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Open-Meteo Marine</span>
                <span className="text-[10px] text-slate-400">Wave & Swell Physics</span>
              </div>
              <span className="text-emerald-400 text-[10px] font-bold">🟢 180ms</span>
            </div>

            <div className="p-3 rounded-xl bg-ocean-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">PostGIS Geofence</span>
                <span className="text-[10px] text-slate-400">ENC Defense Zones</span>
              </div>
              <span className="text-emerald-400 text-[10px] font-bold">🟢 45ms</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-ocean-900 hover:bg-ocean-800 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white cursor-pointer"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
}
