"use client";

import React, { useState } from "react";
import { X, Sparkles, Sliders, ArrowRight, Waves, Wind, Activity, Fish, RefreshCw } from "lucide-react";
import { WhatIfResponse, QueryResponse } from "@/types";
import { executeWhatIf } from "@/lib/apiClient";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  queryData?: QueryResponse | null;
}

export function WhatIfSimulator({ isOpen, onClose, queryData }: Props) {
  const [timeWindow, setTimeWindow] = useState<string>("evening");
  const [windFactor, setWindFactor] = useState<number>(1.2);
  const [waveFactor, setWaveFactor] = useState<number>(1.3);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WhatIfResponse | null>(null);

  if (!isOpen || !queryData) return null;

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await executeWhatIf(queryData.session_id, timeWindow, windFactor, waveFactor);
      setResult(res);
    } catch (e) {
      console.error("What-If simulation error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-ocean-950 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950 border border-amber-700 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Temporal What-If Metocean Simulator
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Simulate alternate time windows & wave/wind perturbations for {queryData.location.name}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-ocean-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5 p-4 rounded-xl bg-ocean-900/60 border border-slate-800">
          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1.5">Target Time Window</label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              className="w-full bg-ocean-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none"
            >
              <option value="afternoon">Tomorrow Afternoon</option>
              <option value="evening">Tomorrow Evening</option>
              <option value="night">Night Departure</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1.5">
              Wind Multiplier: {windFactor.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.1"
              value={windFactor}
              onChange={(e) => setWindFactor(parseFloat(e.target.value))}
              className="w-full accent-teal-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1.5">
              Wave Multiplier: {waveFactor.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.1"
              value={waveFactor}
              onChange={(e) => setWaveFactor(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
              Run Metocean Perturbation
            </button>
          </div>
        </div>

        {/* Results Comparison */}
        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Baseline Morning Card */}
              <div className="p-4 rounded-xl bg-ocean-900 border border-slate-800 text-xs">
                <div className="font-mono text-slate-400 uppercase text-[10px]">Baseline (Morning)</div>
                <div className="text-base font-extrabold text-emerald-400 mt-1">
                  {result.baseline_decision.decision_class}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 font-mono">
                  <div>Safety Risk: {result.baseline_decision.safety_risk_score.toFixed(0)}/100</div>
                  <div>Fishing: {result.baseline_decision.fishing_suitability_score.toFixed(0)}/100</div>
                </div>
              </div>

              {/* Simulated Evening Card */}
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs">
                <div className="font-mono text-amber-400 uppercase text-[10px]">
                  Simulated ({result.time_window_evaluated})
                </div>
                <div className="text-base font-extrabold text-amber-300 mt-1">
                  {result.simulated_decision.decision_class}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-amber-800/40 font-mono">
                  <div>
                    Safety Risk: {result.simulated_decision.safety_risk_score.toFixed(0)}/100
                    <span className="text-rose-400 ml-1 font-bold">
                      (+{result.delta_risk_score.toFixed(0)})
                    </span>
                  </div>
                  <div>Fishing: {result.simulated_decision.fishing_suitability_score.toFixed(0)}/100</div>
                </div>
              </div>
            </div>

            {/* Tradeoff Summary */}
            <div className="p-4 rounded-xl bg-ocean-900/90 border border-slate-800 text-xs">
              <div className="font-bold text-slate-200 font-mono">Metocean Differential Summary</div>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                {result.tradeoff_summary}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-ocean-900 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
}
