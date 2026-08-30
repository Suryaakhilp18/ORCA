"use client";

import React, { useState } from "react";
import { Search, Sparkles, Send, Anchor, Compass, AlertCircle } from "lucide-react";

interface Props {
  onSearch: (query: string) => void;
  isLoading: boolean;
  language: string;
}

const SAMPLE_PROMPTS = [
  {
    label: "Visakhapatnam (Default)",
    query: "I'm fishing near Visakhapatnam tomorrow morning. Is it safe, and where should I go?"
  },
  {
    label: "Chennai Tuna Front",
    query: "Find nearest Potential Fishing Zone off Chennai with favorable SST and chlorophyll."
  },
  {
    label: "Kochi Evening Safety",
    query: "Is it safe to venture off Kochi tomorrow evening given wave and swell conditions?"
  },
  {
    label: "Official Warning Scenario",
    query: "Check active IMD cyclone warning and hazard status near Paradip coast."
  }
];

export function QueryConsole({ onSearch, isLoading, language }: Props) {
  const [queryInput, setQueryInput] = useState(
    "I'm fishing near Visakhapatnam tomorrow morning. Is it safe, and where should I go?"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim() && !isLoading) {
      onSearch(queryInput.trim());
    }
  };

  return (
    <div className="bg-ocean-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl shadow-black/40 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Ask ORCA in natural language (e.g. 'Is it safe to fish off Visakhapatnam tomorrow morning?')..."
            className="w-full bg-ocean-950/90 border border-slate-700/80 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all font-sans"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !queryInput.trim()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Execute</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Suggested Query Chips */}
      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
        <span className="text-slate-400 flex items-center gap-1 font-medium text-[11px]">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Quick Missions:
        </span>
        {SAMPLE_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQueryInput(p.query);
              onSearch(p.query);
            }}
            className="px-2.5 py-1 rounded-lg bg-ocean-950/80 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all font-mono text-[11px]"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
