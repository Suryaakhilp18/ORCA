"use client";

import React, { useState } from "react";
import { X, Terminal, Shield, Code, Cpu, Clock, CheckCircle2, Copy } from "lucide-react";
import { QueryResponse } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  queryData?: QueryResponse | null;
}

export function AdvancedTraceModal({ isOpen, onClose, queryData }: Props) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"trace" | "json">("trace");

  if (!isOpen || !queryData) return null;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(queryData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-ocean-950 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                ADVANCED ORCA SYSTEM TRACE
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                SIH26176 / ISRO Multi-Agent Lineage & Rule Governance &bull; Mission #{queryData.query_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-ocean-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between my-4 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("trace")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === "trace"
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-ocean-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              Agent Execution & State
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === "json"
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-ocean-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              Raw Telemetry JSON
            </button>
          </div>

          {activeTab === "json" && (
            <button
              onClick={handleCopyJSON}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-ocean-900 border border-slate-700 text-xs font-mono text-cyan-300 hover:text-white transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied!" : "Copy Payload"}</span>
            </button>
          )}
        </div>

        {/* Trace Content */}
        {activeTab === "trace" ? (
          <div className="space-y-4 text-xs font-mono">
            {/* Meta Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-ocean-900/60 border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">RULESET VERSION</span>
                <span className="text-cyan-300 font-bold">{queryData.decision.rule_version || "risk-2026-08-v1"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PIPELINE STATUS</span>
                <span className="text-emerald-400 font-bold">EXECUTION SUCCESS</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">GEOFENCE COLLISION</span>
                <span className="text-amber-400 font-bold">
                  {queryData.route.conflict_resolution_applied ? "DETECTED & BYPASSED" : "NONE"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">HARD SAFETY GATE</span>
                <span className="text-emerald-400 font-bold">{queryData.decision.hard_safety_gate}</span>
              </div>
            </div>

            {/* Evidence Nodes Count */}
            <div className="p-4 rounded-2xl bg-ocean-900/40 border border-slate-800 space-y-2">
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Evidence Lineage Nodes ({queryData.evidence_graph.nodes.length} Nodes &bull; {queryData.evidence_graph.edges.length} Edges)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                {queryData.evidence_graph.nodes.slice(0, 6).map((node, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-ocean-950 border border-slate-800">
                    <span className="text-cyan-400 block font-bold truncate">{node.label}</span>
                    <span className="text-slate-400 text-[10px]">{node.source}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <pre className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-[400px]">
            {JSON.stringify(queryData, null, 2)}
          </pre>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-ocean-900 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
}
