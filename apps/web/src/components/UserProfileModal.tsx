'use client';

import React, { useState } from 'react';
import {
  X, User, Shield, Radio, Settings, Bell, Server, CheckCircle2,
  Anchor, Compass, Sliders, Globe2, Lock
} from 'lucide-react';
import { CoastalLocation } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: CoastalLocation | null;
  onSelectLocation: (loc: CoastalLocation) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  selectedLocation,
  onSelectLocation,
  language,
  onLanguageChange
}: Props) {
  const [activeTab, setActiveTab] = useState<'profile' | 'vessel' | 'telemetry' | 'system'>('profile');
  const [vesselType, setVesselType] = useState('Motorized Trawler');
  const [engineHp, setEngineHp] = useState('40');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'nautical'>('nautical');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-ocean-950 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">User Profile & Vessel Configuration</h3>
              <p className="text-xs text-slate-400 font-mono">ORCA Autonomous Marine Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-ocean-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-1 text-xs font-mono">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'profile' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('vessel')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'vessel' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vessel Specs
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'telemetry' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Data Telemetry
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'system' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Preferences
          </button>
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 rounded-2xl bg-ocean-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Captain / Master:</span>
                <span className="font-bold text-white">Capt. S. Murugan</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Home Port:</span>
                <span className="font-bold text-cyan-300">{selectedLocation?.name || 'Visakhapatnam'} ({selectedLocation?.state || 'AP'})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">AIS Registration:</span>
                <span className="font-bold text-emerald-400 font-mono">IND-AP-4190082</span>
              </div>
            </div>
          </div>
        )}

        {/* VESSEL SPECS */}
        {activeTab === 'vessel' && (
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono">Vessel Category:</label>
              <select
                value={vesselType}
                onChange={(e) => setVesselType(e.target.value)}
                className="w-full bg-ocean-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              >
                <option value="Motorized Trawler">Motorized Trawler (Fiberglass, 28–32 ft)</option>
                <option value="Mechanized Vessel">Mechanized Trawler (Steel hull, 45–60 ft)</option>
                <option value="Traditional Craft">Traditional FRP Catamaran</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono">Outboard / Inboard Engine (HP):</label>
              <input
                type="number"
                value={engineHp}
                onChange={(e) => setEngineHp(e.target.value)}
                className="w-full bg-ocean-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none font-mono"
              />
            </div>
          </div>
        )}

        {/* TELEMETRY */}
        {activeTab === 'telemetry' && (
          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-ocean-900 border border-slate-800 flex justify-between items-center">
              <span>INCOIS OSF SWAN Wave Model</span>
              <span className="text-emerald-400 font-bold">🟢 140ms (Online)</span>
            </div>
            <div className="p-3 rounded-xl bg-ocean-900 border border-slate-800 flex justify-between items-center">
              <span>IMD Cyclone Warning Gateway</span>
              <span className="text-emerald-400 font-bold">🟢 95ms (Online)</span>
            </div>
            <div className="p-3 rounded-xl bg-ocean-900 border border-slate-800 flex justify-between items-center">
              <span>MOSDAC Oceansat-3 Thermal Fronts</span>
              <span className="text-emerald-400 font-bold">🟢 160ms (Online)</span>
            </div>
            <div className="p-3 rounded-xl bg-ocean-900 border border-slate-800 flex justify-between items-center">
              <span>PostGIS Defense Geofence</span>
              <span className="text-emerald-400 font-bold">🟢 45ms (Online)</span>
            </div>
          </div>
        )}

        {/* PREFERENCES */}
        {activeTab === 'system' && (
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono">Measurement Units:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUnitSystem('nautical')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    unitSystem === 'nautical'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-ocean-900 border-slate-800 text-slate-300'
                  }`}
                >
                  Nautical (Knots, NM, Deg)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitSystem('metric')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    unitSystem === 'metric'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-ocean-900 border-slate-800 text-slate-300'
                  }`}
                >
                  Metric (km/h, km, m)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer transition-all"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
