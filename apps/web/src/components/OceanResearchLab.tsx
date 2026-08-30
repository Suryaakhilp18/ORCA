"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, TrendingUp, Sparkles, Database, ExternalLink, Activity, RefreshCw } from "lucide-react";
import { ResearchQueryResponse } from "@/types";
import { executeResearchQuery } from "@/lib/apiClient";

interface Props {
  location: string;
}

export function OceanResearchLab({ location }: Props) {
  const [data, setData] = useState<ResearchQueryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [topic, setTopic] = useState<string>("Multi-Satellite Frontal Productivity & Upwelling Dynamics");

  useEffect(() => {
    loadResearch();
  }, [location, topic]);

  const loadResearch = async () => {
    setLoading(true);
    try {
      const res = await executeResearchQuery(location, topic);
      setData(res);
    } catch (e) {
      console.error("Failed to load research data", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Research Header */}
      <div className="bg-ocean-900/90 border border-purple-800/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-700/50 text-purple-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300">
                  {location} Coastal Observatory
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Archive: MOSDAC Oceansat-3 & INSAT-3D
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                Deep Ocean Ecosystem & Remote Sensing Lab
              </h2>
            </div>
          </div>

          <button
            onClick={loadResearch}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 text-xs font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Trends</span>
          </button>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Anomaly Trend Series */}
          <div className="lg:col-span-2 bg-ocean-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 font-mono">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                30-Day Multi-Satellite Anomaly & CPUE Trend Matrix
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                {data.upwelling_status}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2">Date (2026)</th>
                    <th className="pb-2">SST Anomaly</th>
                    <th className="pb-2">Chl-a (mg/m³)</th>
                    <th className="pb-2">Upwelling Index</th>
                    <th className="pb-2">Pelagic CPUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {data.anomaly_trend.map((pt, idx) => (
                    <tr key={idx} className="hover:bg-ocean-950/40">
                      <td className="py-2.5 font-bold text-slate-200">{pt.date}</td>
                      <td className={`py-2.5 ${pt.sst_anomaly_celsius < 0 ? "text-cyan-400 font-bold" : "text-amber-400"}`}>
                        {pt.sst_anomaly_celsius > 0 ? `+${pt.sst_anomaly_celsius}°C` : `${pt.sst_anomaly_celsius}°C`}
                      </td>
                      <td className="py-2.5 text-emerald-400 font-bold">{pt.chlorophyll_mg_m3.toFixed(2)}</td>
                      <td className="py-2.5">{pt.upwelling_index.toFixed(0)}</td>
                      <td className="py-2.5 text-teal-300">{pt.cpue_trend_index.toFixed(0)} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-ocean-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-cyan-300 mr-1">Trophic Cascade Insight:</span>
              {data.trophic_cascade_notes}
            </div>
          </div>

          {/* Peer-Reviewed Literature Citations */}
          <div className="bg-ocean-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Scientific Evidence Base
            </h4>

            <div className="space-y-3">
              {data.literature_citations.map((cite, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-ocean-950 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="font-bold text-slate-100 leading-snug">{cite.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {cite.authors} ({cite.year}) — <span className="italic">{cite.journal}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                    {cite.relevance_summary}
                  </p>
                  <div className="text-[10px] text-cyan-400 font-mono pt-1">
                    DOI: {cite.doi}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
