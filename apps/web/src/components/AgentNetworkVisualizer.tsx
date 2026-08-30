'use client';

import React, { useState } from 'react';
import {
  Brain, CloudSun, Waves, Fish, Compass, ShieldAlert,
  FileText, Activity, Layers, Info, CheckCircle2, ChevronRight,
  ExternalLink, Sparkles
} from 'lucide-react';
import { QueryResponse } from '@/types';

interface Props {
  data: QueryResponse | null;
  isLoading?: boolean;
  onOpenEvidenceGraph?: () => void;
}

interface AgentNode {
  id: string;
  name: string;
  category: 'supervisor' | 'domain' | 'geospatial' | 'safety' | 'explanation';
  icon: any;
  status: 'idle' | 'analyzing' | 'complete' | 'degraded';
  description: string;
}

export function AgentNetworkVisualizer({ data, isLoading, onOpenEvidenceGraph }: Props) {
  const [selectedNode, setSelectedNode] = useState<AgentNode | null>(null);

  const nodes: AgentNode[] = [
    {
      id: 'orchestrator',
      name: 'Orchestrator / Planner Agent',
      category: 'supervisor',
      icon: Brain,
      status: isLoading ? 'analyzing' : 'complete',
      description: 'Parses natural-language queries, determines required domain specialists, and organizes the reasoning workflow.'
    },
    {
      id: 'ocean',
      name: 'Ocean Intelligence Agent',
      category: 'domain',
      icon: Waves,
      status: isLoading ? 'analyzing' : 'complete',
      description: 'Analyzes dynamic ocean physics including waves, currents, swell periods, and sea surface temperatures from INCOIS SWAN models.'
    },
    {
      id: 'weather',
      name: 'Weather and Hazard Agent',
      category: 'domain',
      icon: CloudSun,
      status: isLoading ? 'analyzing' : 'complete',
      description: 'Monitors IMD meteorological bulletins, coastal gale warnings, squalls, cyclonic tracks, and barometric trends.'
    },
    {
      id: 'fisheries',
      name: 'Fisheries Agent',
      category: 'domain',
      icon: Fish,
      status: isLoading ? 'analyzing' : 'complete',
      description: 'Processes Oceansat-3 satellite ocean color, thermal front breaklines, and chlorophyll-a concentrations for pelagic habitat mapping.'
    },
    {
      id: 'geospatial',
      name: 'Geo Spatial Agent',
      category: 'geospatial',
      icon: Compass,
      status: isLoading ? 'analyzing' : 'complete',
      description: 'Computes nautical corridors, ENC bathymetry clearances, and maintains mandatory 3.5 km standoff from naval defense polygons.'
    },
    {
      id: 'risk',
      name: 'Risk Agent',
      category: 'safety',
      icon: ShieldAlert,
      status: isLoading ? 'analyzing' : 'complete',
      description: 'Synthesizes all multi-domain evidence against deterministic ISO 31010 safety criteria and 5 non-negotiable hard safety gates.'
    },
    {
      id: 'explanation',
      name: 'Explanation Agent',
      category: 'explanation',
      icon: FileText,
      status: isLoading ? 'analyzing' : 'complete',
      description: 'Converts multi-agent telemetry and risk scores into explainable, evidence-backed natural-language operational guidance.'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. INTERACTIVE 7-AGENT COLLABORATIVE NETWORK                             */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-ocean-950 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base sm:text-lg font-mono">
                ORCA 7-AGENT COLLABORATIVE REASONING NETWORK
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                7/7 AGENTS SYNCHRONIZED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Click any agent node to inspect its specialized role in the multi-agent decision pipeline.
            </p>
          </div>

          {onOpenEvidenceGraph && (
            <button
              onClick={onOpenEvidenceGraph}
              className="px-3 py-1.5 rounded-xl bg-ocean-900 hover:bg-ocean-850 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 cursor-pointer transition-all self-start sm:self-auto"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full Evidence Graph</span>
            </button>
          )}
        </div>

        {/* 7-Agent Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 z-10 relative">
          {nodes.map((ag, idx) => {
            const Icon = ag.icon;
            const isSelected = selectedNode?.id === ag.id;

            return (
              <button
                key={ag.id}
                onClick={() => setSelectedNode(ag)}
                className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between space-y-2 cursor-pointer ${
                  isSelected
                    ? 'bg-ocean-900 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : 'bg-ocean-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-ocean-950 border border-slate-800 text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                    ONLINE
                  </span>
                </div>

                <div>
                  <div className="font-mono font-bold text-white text-xs">
                    {idx + 1}. {ag.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-2">
                    {ag.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. AGENT INSPECTOR PANEL & LIVE ACTIVITY LOG                               */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Agent Inspector {selectedNode ? `— ${selectedNode.name}` : '(Click any agent above)'}</span>
          </h4>
          {selectedNode && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
              STATUS: READY
            </span>
          )}
        </div>

        {selectedNode ? (
          <div className="p-4 rounded-2xl bg-ocean-900/60 border border-slate-800 space-y-2 animate-in fade-in">
            <h5 className="font-mono font-bold text-cyan-300 text-xs uppercase tracking-wider">
              {selectedNode.name}
            </h5>
            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              {selectedNode.description}
            </p>
          </div>
        ) : (
          <div className="py-4 text-center text-xs font-mono text-slate-500">
            Click any agent node above to view its role in the collaborative reasoning pipeline.
          </div>
        )}
      </div>
    </div>
  );
}
