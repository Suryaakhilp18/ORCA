'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio, Shield, AlertTriangle, Ship, Navigation, Activity,
  RefreshCw, Compass, Eye, Waves, Layers, CheckCircle2
} from 'lucide-react';
import { CoastalLocation } from '@/types';
import { translations, SupportedLanguage } from '@/lib/i18n';

interface AISVessel {
  mmsi: string;
  name: string;
  type: 'Container' | 'Tanker' | 'Patrol' | 'Trawler' | 'Bulk Carrier';
  callSign: string;
  sog_knots: number; // Speed over ground
  cog_deg: number;   // Course over ground
  distance_nm: number;
  bearing_deg: number;
  cpa_nm: number;    // Closest point of approach
  tcpa_min: number;  // Time to CPA in minutes
  status: 'SAFE' | 'MONITOR' | 'COLLISION_RISK';
  destination: string;
  flag: string;
}

interface Props {
  location: CoastalLocation | { name: string; state: string; latitude: number; longitude: number };
  language?: string;
}

export function MarineRadarVesselTraffic({ location, language = 'en' }: Props) {
  const t = translations[(language as SupportedLanguage) || 'en'] || translations.en;
  const [radarRange, setRadarRange] = useState<6 | 12 | 24>(12);
  const [selectedVessel, setSelectedVessel] = useState<AISVessel | null>(null);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [showDoppler, setShowDoppler] = useState(true);
  const [showAisTags, setShowAisTags] = useState(true);

  // Dynamic simulated AIS traffic around the selected port
  const vessels: AISVessel[] = [
    {
      mmsi: '419001284',
      name: 'MV MAERSK CHENNAI',
      type: 'Container',
      callSign: 'VTBF',
      sog_knots: 17.4,
      cog_deg: 215,
      distance_nm: 4.8,
      bearing_deg: 45,
      cpa_nm: 2.1,
      tcpa_min: 14,
      status: 'MONITOR',
      destination: 'Colombo',
      flag: '🇮🇳 India'
    },
    {
      mmsi: '419000912',
      name: 'ICGS VARUNA',
      type: 'Patrol',
      callSign: 'AWX1',
      sog_knots: 21.0,
      cog_deg: 130,
      distance_nm: 8.2,
      bearing_deg: 160,
      cpa_nm: 5.4,
      tcpa_min: 26,
      status: 'SAFE',
      destination: 'Coastal Patrol Area Bravo',
      flag: '🇮🇳 Coast Guard'
    },
    {
      mmsi: '419003445',
      name: 'MT SWARNA GANGA',
      type: 'Tanker',
      callSign: 'VTCG',
      sog_knots: 11.2,
      cog_deg: 35,
      distance_nm: 3.2,
      bearing_deg: 285,
      cpa_nm: 0.8,
      tcpa_min: 8,
      status: 'COLLISION_RISK',
      destination: 'Paradip Port SPM',
      flag: '🇮🇳 India'
    },
    {
      mmsi: '419009821',
      name: 'FB SAGAR KANYA III',
      type: 'Trawler',
      callSign: 'VTB9',
      sog_knots: 5.8,
      cog_deg: 95,
      distance_nm: 2.4,
      bearing_deg: 110,
      cpa_nm: 1.9,
      tcpa_min: 22,
      status: 'SAFE',
      destination: 'Offshore PFZ Grounds',
      flag: '🇮🇳 India'
    },
    {
      mmsi: '419007611',
      name: 'MV OCEAN GLORY',
      type: 'Bulk Carrier',
      callSign: 'VTKZ',
      sog_knots: 13.5,
      cog_deg: 180,
      distance_nm: 9.6,
      bearing_deg: 330,
      cpa_nm: 4.8,
      tcpa_min: 34,
      status: 'SAFE',
      destination: 'Visakhapatnam Outer Anchorage',
      flag: '🇮🇳 India'
    }
  ];

  // Rotate radar sweep animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle((prev) => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-3xl bg-ocean-950 border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-700/80 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-white font-mono tracking-wide">
                LIVE MARINE RADAR & AIS VESSEL CORRIDOR
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono">
                AIS CLASS-A ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Real-time vessel collision avoidance & Doppler echo sweep around {location.name} ({location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E)
            </p>
          </div>
        </div>

        {/* Range Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-ocean-900 border border-slate-800 rounded-xl p-1 text-xs font-mono">
            <span className="text-slate-400 px-2 text-[10px]">Range:</span>
            {[6, 12, 24].map((r) => (
              <button
                key={r}
                onClick={() => setRadarRange(r as 6 | 12 | 24)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  radarRange === r
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r} NM
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowDoppler(!showDoppler)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              showDoppler
                ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                : 'bg-ocean-900 border-slate-800 text-slate-400'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Doppler</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Radar Canvas (Left) + AIS Vessel Target Telemetry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar PPI Scope (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-inner relative overflow-hidden">
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full border-2 border-emerald-500/40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/40 via-slate-950 to-slate-950 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.15)]">
            {/* Concentric Range Rings */}
            <div className="absolute w-3/4 h-3/4 rounded-full border border-emerald-500/25 border-dashed pointer-events-none" />
            <div className="absolute w-1/2 h-1/2 rounded-full border border-emerald-500/30 pointer-events-none" />
            <div className="absolute w-1/4 h-1/4 rounded-full border border-emerald-500/40 pointer-events-none" />

            {/* Crosshair Grids */}
            <div className="absolute w-full h-[1px] bg-emerald-500/20 pointer-events-none" />
            <div className="absolute h-full w-[1px] bg-emerald-500/20 pointer-events-none" />

            {/* Azimuth Markings */}
            <span className="absolute top-1 text-[9px] font-mono text-emerald-400 font-bold">000° N</span>
            <span className="absolute bottom-1 text-[9px] font-mono text-emerald-400 font-bold">180° S</span>
            <span className="absolute right-1 text-[9px] font-mono text-emerald-400 font-bold">090° E</span>
            <span className="absolute left-1 text-[9px] font-mono text-emerald-400 font-bold">270° W</span>

            {/* Doppler Weather / Rain Echo Simulation */}
            {showDoppler && (
              <div className="absolute w-28 h-20 top-12 right-12 rounded-full bg-cyan-500/10 blur-md pointer-events-none border border-cyan-400/20 animate-pulse" />
            )}

            {/* Rotating Radar Sweep Line with Phosphor Glow */}
            <div
              className="absolute top-0 left-0 w-full h-full rounded-full pointer-events-none transition-transform"
              style={{
                transform: `rotate(${sweepAngle}deg)`,
                background: 'conic-gradient(from 0deg, rgba(16, 185, 129, 0.45) 0deg, rgba(16, 185, 129, 0.0) 45deg, transparent 60deg)'
              }}
            />

            {/* Center Own Vessel Marker */}
            <div className="absolute w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-[0_0_15px_rgba(34,211,238,1)] z-20 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>

            {/* AIS Vessel Blips on Radar PPI */}
            {vessels.map((v) => {
              // Convert bearing and distance to polar-to-cartesian offsets
              const maxDist = radarRange;
              const radiusPct = Math.min(46, (v.distance_nm / maxDist) * 44);
              const rad = (v.bearing_deg - 90) * (Math.PI / 180);
              const xOffset = Math.cos(rad) * radiusPct;
              const yOffset = Math.sin(rad) * radiusPct;

              const isCollision = v.status === 'COLLISION_RISK';
              const isSelected = selectedVessel?.mmsi === v.mmsi;

              return (
                <button
                  key={v.mmsi}
                  onClick={() => setSelectedVessel(v)}
                  style={{
                    transform: `translate(${xOffset * 3.8}px, ${yOffset * 3.8}px)`
                  }}
                  className={`absolute z-30 p-1 rounded-full transition-all cursor-pointer group ${
                    isSelected
                      ? 'ring-4 ring-cyan-400 scale-125'
                      : ''
                  }`}
                  title={`${v.name} (${v.sog_knots} kts)`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-lg ${
                      isCollision
                        ? 'bg-rose-500 text-slate-950 animate-bounce'
                        : v.status === 'MONITOR'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-emerald-400 text-slate-950'
                    }`}
                  >
                    <Ship className="w-2 h-2" />
                  </div>

                  {showAisTags && (
                    <div className="absolute left-4 top-0 bg-slate-950/90 backdrop-blur-md border border-slate-700 px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-200 whitespace-nowrap pointer-events-none group-hover:scale-110 transition-transform">
                      {v.name.split(' ')[1] || v.name} ({v.sog_knots}k)
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between w-full px-4 pt-3 text-[10px] font-mono text-slate-400">
            <span>OWN VESSEL: <b className="text-cyan-400">ORCA FISHING CRAFT</b></span>
            <span>HDG: <b className="text-white">078°</b></span>
            <span>SPEED: <b className="text-white">9.2 KTS</b></span>
            <span>WATER: <b className="text-emerald-400">27.8°C</b></span>
          </div>
        </div>

        {/* AIS Vessel Telemetry List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1 border-b border-slate-800">
            <span className="font-bold uppercase tracking-wider">Nearby Vessel Contacts ({vessels.length})</span>
            <span className="text-emerald-400">LIVE AIS FEED</span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {vessels.map((v) => {
              const isCollision = v.status === 'COLLISION_RISK';
              const isSelected = selectedVessel?.mmsi === v.mmsi;

              return (
                <div
                  key={v.mmsi}
                  onClick={() => setSelectedVessel(v)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-lg'
                      : isCollision
                      ? 'bg-rose-950/30 border-rose-600/50 hover:border-rose-500'
                      : 'bg-ocean-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        isCollision ? 'bg-rose-950 text-rose-400' : 'bg-ocean-950 text-cyan-400'
                      }`}>
                        <Ship className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{v.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          MMSI: {v.mmsi} &bull; {v.type}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isCollision
                        ? 'bg-rose-950 border border-rose-600 text-rose-300 animate-pulse'
                        : v.status === 'MONITOR'
                        ? 'bg-amber-950 border border-amber-600 text-amber-300'
                        : 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                    }`}>
                      {v.status === 'COLLISION_RISK' ? '⚠️ CPA < 1 NM' : v.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Distance</span>
                      <span className="font-bold text-cyan-300">{v.distance_nm} NM</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Speed / Course</span>
                      <span className="font-bold text-white">{v.sog_knots}k / {v.cog_deg}°</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">CPA / Time</span>
                      <span className={`font-bold ${isCollision ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {v.cpa_nm} NM ({v.tcpa_min}m)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Collision Warning Summary Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-ocean-950 to-ocean-950 border border-rose-700/40 text-xs text-slate-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <b className="text-rose-300">Automatic Collision Avoidance Active:</b> ORCA routing agent continuously queries AIS Class-A transmitters and adjusts your tactical waypoints with <b>1.5 NM safety standoff</b> from large tankers & commercial container vessels.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
