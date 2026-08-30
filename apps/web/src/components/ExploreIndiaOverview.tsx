"use client";

import React, { useState, useEffect } from "react";
import {
  Compass, Globe, MapPin, Anchor, Waves, ShieldCheck, ChevronRight, Sparkles
} from "lucide-react";
import { CoastalLocation } from "@/types";
import { fetchLocations } from "@/lib/apiClient";

interface Props {
  onSelectLocation: (loc: CoastalLocation) => void;
  selectedLocation?: CoastalLocation | null;
}

export function ExploreIndiaOverview({ onSelectLocation, selectedLocation }: Props) {
  const [locations, setLocations] = useState<CoastalLocation[]>([]);
  const [activeRegion, setActiveRegion] = useState<string>("All");
  const [activeState, setActiveState] = useState<string>("All");

  useEffect(() => {
    fetchLocations().then((data) => {
      setLocations(data);
    });
  }, []);

  const regions = [
    { id: "All", label: "All Regions" },
    { id: "West Coast", label: "West Coast (Arabian Sea)" },
    { id: "East Coast", label: "East Coast (Bay of Bengal)" },
    { id: "Islands & UTs", label: "Islands & Union Territories" }
  ];

  const states = Array.from(new Set(locations.map((l) => l.state)));

  const filteredLocations = locations.filter((loc) => {
    if (activeRegion !== "All" && loc.region !== activeRegion) return false;
    if (activeState !== "All" && loc.state !== activeState) return false;
    return true;
  });

  return (
    <div className="rounded-3xl bg-ocean-950 border border-slate-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Overview Header & National Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs font-mono">
            <Globe className="w-3.5 h-3.5" />
            <span>INDIAN EXCLUSIVE ECONOMIC ZONE (EEZ)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            India Marine Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Select any coastal state or port to focus geospatial reasoning, ocean state forecasts, and PFZ advisories.
          </p>
        </div>

        {/* Compact National Coastline Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-ocean-900 border border-slate-800/80 text-center">
            <div className="text-base sm:text-lg font-extrabold text-cyan-400 font-mono">7,516 km</div>
            <div className="text-[10px] text-slate-400 font-medium">Coastline Length</div>
          </div>
          <div className="p-3 rounded-2xl bg-ocean-900 border border-slate-800/80 text-center">
            <div className="text-base sm:text-lg font-extrabold text-teal-300 font-mono">9 States</div>
            <div className="text-[10px] text-slate-400 font-medium">Maritime States</div>
          </div>
          <div className="p-3 rounded-2xl bg-ocean-900 border border-slate-800/80 text-center">
            <div className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono">2 UTs</div>
            <div className="text-[10px] text-slate-400 font-medium">Coastal UTs</div>
          </div>
          <div className="p-3 rounded-2xl bg-ocean-900 border border-slate-800/80 text-center">
            <div className="text-base sm:text-lg font-extrabold text-purple-400 font-mono">2 Archipelagos</div>
            <div className="text-[10px] text-slate-400 font-medium">Lakshadweep & A&N</div>
          </div>
        </div>
      </div>

      {/* Region & State Filters */}
      <div className="space-y-3">
        {/* Region Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {regions.map((reg) => (
            <button
              key={reg.id}
              onClick={() => {
                setActiveRegion(reg.id);
                setActiveState("All");
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeRegion === reg.id
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "bg-ocean-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coastal Location Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredLocations.map((loc) => {
          const isSelected = selectedLocation?.id === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => onSelectLocation(loc)}
              className={`p-3.5 rounded-2xl border text-left transition-all group flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/10"
                  : "bg-ocean-900/80 border-slate-800 hover:border-slate-700 hover:bg-ocean-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl border ${
                    isSelected ? "bg-cyan-500 text-slate-950 border-cyan-400" : "bg-ocean-950 border-slate-800 text-slate-400 group-hover:text-cyan-400"
                  }`}>
                    {loc.category === "Port" ? <Anchor className="w-3.5 h-3.5" /> : <Waves className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className={`text-xs font-extrabold ${isSelected ? "text-cyan-300" : "text-slate-100 group-hover:text-cyan-200"}`}>
                      {loc.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      {loc.state} &bull; {loc.district}
                    </div>
                  </div>
                </div>
                {loc.is_demo_scenario && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300">
                    DEMO
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                <span>{loc.category}</span>
                <span className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                  Focus Zone <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
