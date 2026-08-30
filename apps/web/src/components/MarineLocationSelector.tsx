'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, ChevronDown, Check, Compass, Globe } from 'lucide-react';
import { CoastalLocation } from '@/types';

interface Props {
  selectedLocation: CoastalLocation | null;
  onSelectLocation: (loc: CoastalLocation) => void;
  allLocations: CoastalLocation[];
}

export function MarineLocationSelector({
  selectedLocation,
  onSelectLocation,
  allLocations
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const locName = selectedLocation?.name || 'Visakhapatnam';
  const locState = selectedLocation?.state || 'Andhra Pradesh';
  const locLat = selectedLocation ? selectedLocation.latitude : 17.6868;
  const locLon = selectedLocation ? selectedLocation.longitude : 83.2185;

  const filteredLocations = allLocations.filter((loc) => {
    const q = search.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      loc.region.toLowerCase().includes(q)
    );
  });

  const eastCoast = filteredLocations.filter((l) => l.region === 'East Coast');
  const westCoast = filteredLocations.filter((l) => l.region === 'West Coast');
  const islands = filteredLocations.filter((l) => l.region === 'Islands & UTs');

  const handleSelect = (loc: CoastalLocation) => {
    onSelectLocation(loc);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 rounded-2xl px-4 py-2.5 text-left transition-all cursor-pointer shadow-inner group"
      >
        <div className="w-8 h-8 rounded-xl bg-cyan-950/90 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4" />
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Current Operating Sector
          </span>
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>{locName}</span>
            <span className="text-slate-400 font-normal">({locState})</span>
          </span>
        </div>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-800 ml-1">
          <span className="text-xs text-cyan-400 hidden sm:inline font-mono">
            {locLat.toFixed(3)}°N, {locLon.toFixed(3)}°E
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-cyan-400' : 'group-hover:text-white'
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-ocean-950/98 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-2xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coastal ports, districts, states..."
              className="w-full bg-slate-900 border border-slate-750 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:border-cyan-400 font-sans shadow-inner"
              autoFocus
            />
          </div>

          {/* Quick Selection List grouped by Coastline */}
          <div className="max-h-72 overflow-y-auto space-y-3 pr-1 text-sm">
            {/* East Coast Group */}
            {eastCoast.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider px-2 block">
                  East Coast ({eastCoast.length})
                </span>
                <div className="space-y-0.5">
                  {eastCoast.map((loc) => {
                    const isSelected = selectedLocation?.id === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelect(loc)}
                        className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs sm:text-sm transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold'
                            : 'text-slate-200 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate">{loc.name}</span>
                          <span className="text-xs text-slate-400">({loc.state})</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* West Coast Group */}
            {westCoast.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider px-2 block">
                  West Coast ({westCoast.length})
                </span>
                <div className="space-y-0.5">
                  {westCoast.map((loc) => {
                    const isSelected = selectedLocation?.id === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelect(loc)}
                        className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs sm:text-sm transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-950/80 border border-teal-500/50 text-teal-300 font-bold'
                            : 'text-slate-200 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate">{loc.name}</span>
                          <span className="text-xs text-slate-400">({loc.state})</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Islands & UTs */}
            {islands.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider px-2 block">
                  Islands & UTs ({islands.length})
                </span>
                <div className="space-y-0.5">
                  {islands.map((loc) => {
                    const isSelected = selectedLocation?.id === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelect(loc)}
                        className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs sm:text-sm transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-950/80 border border-purple-500/50 text-purple-300 font-bold'
                            : 'text-slate-200 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate">{loc.name}</span>
                          <span className="text-xs text-slate-400">({loc.state})</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredLocations.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                No coastal ports found matching "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
