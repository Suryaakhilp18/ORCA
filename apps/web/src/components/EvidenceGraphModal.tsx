"use client";

import React, { useState } from "react";
import { X, Network, Database, Shield, Radio, CheckCircle2, ArrowRight } from "lucide-react";
import { EvidenceGraphData, EvidenceNode } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  graphData?: EvidenceGraphData;
}

export function EvidenceGraphModal({ isOpen, onClose, graphData }: Props) {
  const [selectedNode, setSelectedNode] = useState<EvidenceNode | null>(null);

  if (!isOpen || !graphData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-ocean-950 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Verifiable Marine Evidence Graph
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Click any evidence node to inspect primary sensor lineage & timestamps
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 overflow-y-auto">
          {/* Nodes Explorer Column */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Evidence Graph Nodes ({graphData.nodes.length})
            </h4>

            <div className="space-y-2.5">
              {graphData.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isDecision = node.category === "DECISION";

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/10"
                        : isDecision
                        ? "border-emerald-500/50 bg-emerald-950/20"
                        : "border-slate-800 bg-ocean-900/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        {node.label}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ocean-950 border border-slate-700 text-cyan-300">
                        {node.category}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-300 mt-1.5 line-clamp-1">
                      {node.value}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2 pt-1.5 border-t border-slate-800">
                      <span>Source: {node.source}</span>
                      <span>{node.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Inspector Column */}
          <div className="bg-ocean-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 font-mono uppercase">
                  <Database className="w-4 h-4" />
                  Node Provenance
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-mono">Label</div>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedNode.label}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-mono">Category</div>
                  <div className="text-xs font-bold text-cyan-300 mt-0.5 font-mono">{selectedNode.category}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-mono">Telemetry Observation</div>
                  <div className="text-xs font-mono bg-ocean-950 p-2.5 rounded-lg border border-slate-800 text-slate-200 mt-1">
                    {selectedNode.value}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-mono">Governing Authority</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">{selectedNode.source}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-mono">Timestamp & QC</div>
                  <div className="text-xs font-mono text-slate-300 mt-0.5">
                    {selectedNode.timestamp} (Status: {selectedNode.quality})
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs font-mono">
                <Network className="w-8 h-8 text-slate-600 mb-2" />
                Select any evidence node to view raw sensor payloads and authority metadata.
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
              Validated against SIH26176 Evidence Graph standard
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-ocean-900 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white"
          >
            Close Graph View
          </button>
        </div>
      </div>
    </div>
  );
}
