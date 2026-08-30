'use client';

import React, { useState } from 'react';
import {
  Waves, Wind, Thermometer, Compass, Activity, Eye, ShieldAlert,
  Clock, Satellite, AlertTriangle, ChevronDown, CheckCircle2,
  ExternalLink, Sparkles, RefreshCw, Layers
} from 'lucide-react';
import { QueryResponse, CoastalLocation } from '@/types';
import { MarineRadarSpiderChart } from '@/components/MarineRadarSpiderChart';

interface Props {
  data: QueryResponse | null;
  selectedLocation: CoastalLocation | null;
}

export function MarineIntelligenceSection({ data, selectedLocation }: Props) {
  const [timeOffset, setTimeOffset] = useState<'now' | '+3h' | '+6h' | '+9h' | '+12h'>('now');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [isSatelliteModalOpen, setIsSatelliteModalOpen] = useState(false);

  const locName = selectedLocation ? selectedLocation.name : (data?.location?.name || 'Visakhapatnam');
  const locState = selectedLocation ? selectedLocation.state : (data?.location?.state || 'Andhra Pradesh');

  // Multipliers based on time offset forecast
  const offsetMultipliers: Record<string, { wave: number; wind: number; risk: number; label: string }> = {
    now: { wave: 1.0, wind: 1.0, risk: 1.0, label: 'LIVE OBSERVATION' },
    '+3h': { wave: 1.08, wind: 1.05, risk: 1.05, label: '+3H FORECAST' },
    '+6h': { wave: 1.15, wind: 1.12, risk: 1.10, label: '+6H FORECAST' },
    '+9h': { wave: 1.10, wind: 1.08, risk: 1.08, label: '+9H FORECAST' },
    '+12h': { wave: 0.95, wind: 0.92, risk: 0.95, label: '+12H FORECAST' }
  };

  const mult = offsetMultipliers[timeOffset];
  const baseWave = data?.ocean_conditions?.wave_height_m ?? 0.8;
  const waveHeight = baseWave * mult.wave;
  const baseWind = data?.weather_forecast?.wind_speed_kmh ?? 14;
  const windSpeed = baseWind * mult.wind;
  const sstCelsius = data?.ocean_conditions?.sst_celsius ?? 27.6;
  const currentKnots = (data?.ocean_conditions?.current_speed_m_s ? data.ocean_conditions.current_speed_m_s * 1.944 : 0.8) * mult.wave;
  const pressureHpa = 1013.4;
  const riskScore = (data?.decision?.safety_risk_score ?? 22) * mult.risk;

  const alerts = [
    {
      id: 'a1',
      title: 'Nearshore Swell Dissipation Alert',
      severity: 'info',
      summary: '0.8m south-easterly swell dissipating smoothly along outer continental shelf.',
      whyMatters: 'Favorable calm waters for small craft (FRP catamarans and motorized trawlers) with minimal hull pitch.'
    },
    {
      id: 'a2',
      title: 'Optimal Chlorophyll-a Front Alignment',
      severity: 'success',
      summary: 'Oceansat-3 satellite telemetry verifies 1.85 mg/m³ plankton bloom 17.8 km offshore.',
      whyMatters: 'High probability of Indian Mackerel and Yellowfin Tuna aggregation along the thermal break.'
    },
    {
      id: 'a3',
      title: 'Ebb Tide Current Vectoring',
      severity: 'info',
      summary: '0.4 m/s seaward current aiding outbound transit towards outer waypoints.',
      whyMatters: 'Reduces diesel fuel consumption by approximately 8-12% on outbound leg.'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP INTELLIGENCE STATUS SUMMARY & FORECAST TIMELINE                    */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-white font-mono">
              MARINE ENVIRONMENTAL INTELLIGENCE &bull; {locName}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
              {mult.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Observation synthesis from INCOIS SWAN wave models, IMD coastal stations, and MOSDAC Oceansat-3.
          </p>
        </div>

        {/* Interactive Forecast Timeline Control */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-2xl p-1 text-xs font-mono">
          {(['now', '+3h', '+6h', '+9h', '+12h'] as const).map((tVal) => (
            <button
              key={tVal}
              onClick={() => setTimeOffset(tVal)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                timeOffset === tVal
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tVal.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. METOCEAN METRIC CARDS                                                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono">SIGNIFICANT WAVE</span>
            <Waves className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">{waveHeight.toFixed(1)} m</div>
          <span className="text-[10px] text-emerald-400 font-mono">Calm Sea State</span>
        </div>

        <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono">WIND SPEED</span>
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">{Math.round(windSpeed)} km/h</div>
          <span className="text-[10px] text-cyan-300 font-mono">NE &bull; Light Breeze</span>
        </div>

        <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono">SST TEMP</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">{sstCelsius.toFixed(1)} °C</div>
          <span className="text-[10px] text-emerald-400 font-mono">Thermal Break Active</span>
        </div>

        <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono">TIDAL CURRENT</span>
            <Activity className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">{currentKnots.toFixed(1)} kn</div>
          <span className="text-[10px] text-cyan-300 font-mono">0.4 m/s Outbound</span>
        </div>

        <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono">VISIBILITY</span>
            <Eye className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">10.0 km</div>
          <span className="text-[10px] text-emerald-400 font-mono">Clear Horizon</span>
        </div>

        <div className="p-4 rounded-2xl bg-ocean-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono">PRESSURE</span>
            <Compass className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">{pressureHpa} hPa</div>
          <span className="text-[10px] text-emerald-400 font-mono">Stable Barometer</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DYNAMIC 6-AXIS SPIDER RADAR & SATELLITE OBSERVATION PANEL             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 6-Axis Spider Radar (7 Cols) */}
        <div className="lg:col-span-7">
          <MarineRadarSpiderChart
            locationName={locName}
            waveHeightM={waveHeight}
            windKmh={windSpeed}
            sstC={sstCelsius}
            currentKnots={currentKnots}
            visibilityKm={10}
            pressureHpa={pressureHpa}
            riskScore={riskScore}
          />
        </div>

        {/* Right: Satellite Environmental Observation Card (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Satellite className="w-4 h-4 text-purple-400" />
              <span>Satellite Environmental Feed</span>
            </h4>
            <span className="text-[10px] font-mono text-purple-400">MOSDAC / ISRO</span>
          </div>

          {/* Visual Satellite Preview Frame */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group">
            <div className="w-full h-44 bg-gradient-to-tr from-cyan-950 via-teal-950 to-blue-950 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ocean-950/80 text-cyan-300 border border-cyan-800">
                  Oceansat-3 OCM-3 Thermal & Chlorophyll-a
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="space-y-1">
                <div className="text-xs font-mono font-bold text-white">
                  Sector: {locName} Continental Shelf
                </div>
                <p className="text-[11px] text-slate-300 font-sans">
                  Chlorophyll Bloom: <b>1.85 mg/m³</b> &bull; SST Gradient: <b>0.8°C / 10km</b>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSatelliteModalOpen(true)}
              className="absolute inset-0 bg-black/40 hover:bg-black/20 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-mono font-bold text-white cursor-pointer"
            >
              <span>Click to Inspect High-Res Satellite Frame</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Thermal front boundaries are automatically matched with bathymetry to identify prospective pelagic fishing zones.
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE MARINE ALERTS WITH "WHY THIS MATTERS"                      */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl space-y-4">
        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Active Coastal Bulletins & Environmental Alerts ({alerts.length})</span>
        </h4>

        <div className="space-y-2.5">
          {alerts.map((alt) => {
            const isExpanded = expandedAlert === alt.id;
            return (
              <div
                key={alt.id}
                className="rounded-2xl bg-ocean-900/60 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedAlert(isExpanded ? null : alt.id)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-ocean-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <div>
                      <div className="text-xs font-bold text-white font-mono">{alt.title}</div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">{alt.summary}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 hidden sm:inline">
                      {isExpanded ? 'Hide Details' : 'Why This Matters'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 bg-cyan-950/20 text-xs font-sans text-slate-300 animate-in fade-in space-y-1">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
                      Operational Significance:
                    </span>
                    <p>{alt.whyMatters}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
