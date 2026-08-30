'use client';

import React, { useState } from 'react';
import { Wind, Waves, Thermometer, Eye, Activity, ShieldAlert, Compass } from 'lucide-react';

interface MetricDimension {
  key: string;
  label: string;
  value: number; // 0 to 100
  displayValue: string;
  status: 'optimal' | 'moderate' | 'elevated' | 'severe';
  unit: string;
}

interface Props {
  locationName: string;
  waveHeightM: number;
  windKmh: number;
  sstC: number;
  currentKnots: number;
  visibilityKm: number;
  pressureHpa: number;
  riskScore: number;
}

export function MarineRadarSpiderChart({
  locationName,
  waveHeightM = 0.8,
  windKmh = 14,
  sstC = 27.6,
  currentKnots = 0.8,
  visibilityKm = 10,
  pressureHpa = 1013,
  riskScore = 22
}: Props) {
  const [hoveredDimension, setHoveredDimension] = useState<MetricDimension | null>(null);

  // Normalize metrics into 0-100 scale for spider polygon
  const dimensions: MetricDimension[] = [
    {
      key: 'wave',
      label: 'Wave Height',
      value: Math.min(100, Math.round((waveHeightM / 3.0) * 100)),
      displayValue: `${waveHeightM.toFixed(1)} m`,
      status: waveHeightM > 2.0 ? 'elevated' : waveHeightM > 1.2 ? 'moderate' : 'optimal',
      unit: 'm'
    },
    {
      key: 'wind',
      label: 'Wind Speed',
      value: Math.min(100, Math.round((windKmh / 50.0) * 100)),
      displayValue: `${Math.round(windKmh)} km/h`,
      status: windKmh > 35 ? 'elevated' : windKmh > 20 ? 'moderate' : 'optimal',
      unit: 'km/h'
    },
    {
      key: 'sst',
      label: 'Sea Temp (SST)',
      value: Math.min(100, Math.round(((sstC - 20) / 15) * 100)),
      displayValue: `${sstC.toFixed(1)} °C`,
      status: 'optimal',
      unit: '°C'
    },
    {
      key: 'current',
      label: 'Tidal Current',
      value: Math.min(100, Math.round((currentKnots / 3.0) * 100)),
      displayValue: `${currentKnots.toFixed(1)} kn`,
      status: currentKnots > 2.0 ? 'elevated' : 'optimal',
      unit: 'kn'
    },
    {
      key: 'visibility',
      label: 'Visibility',
      value: Math.min(100, Math.round((visibilityKm / 12.0) * 100)),
      displayValue: `${visibilityKm.toFixed(1)} km`,
      status: visibilityKm < 4 ? 'elevated' : 'optimal',
      unit: 'km'
    },
    {
      key: 'risk',
      label: 'Regional Risk',
      value: Math.min(100, Math.round(riskScore)),
      displayValue: `${Math.round(riskScore)} / 100`,
      status: riskScore > 50 ? 'elevated' : riskScore > 30 ? 'moderate' : 'optimal',
      unit: 'score'
    }
  ];

  // SVG spider polygon coordinates calculation
  const size = 300;
  const center = size / 2;
  const radius = 105;
  const total = dimensions.length;

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Generate polygon points
  const points = dimensions
    .map((dim, i) => {
      const coord = getCoordinates(i, Math.max(0.15, dim.value / 100));
      return `${coord.x},${coord.y}`;
    })
    .join(' ');

  return (
    <div className="p-6 rounded-3xl bg-ocean-950 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Metocean Spider Radar &bull; {locationName}</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-sans">
            Hover over vertices to inspect real-time physics telemetry
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
          6-AXIS RADAR
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Spider Chart (7 Cols) */}
        <div className="md:col-span-7 flex justify-center relative">
          <svg width={size} height={size} className="overflow-visible">
            {/* Background concentric polygons */}
            {[0.25, 0.5, 0.75, 1.0].map((level, lIdx) => {
              const bgPoints = Array.from({ length: total })
                .map((_, i) => {
                  const c = getCoordinates(i, level);
                  return `${c.x},${c.y}`;
                })
                .join(' ');

              return (
                <polygon
                  key={lIdx}
                  points={bgPoints}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray={lIdx < 3 ? '2 2' : 'none'}
                />
              );
            })}

            {/* Radial axis lines */}
            {dimensions.map((_, i) => {
              const edge = getCoordinates(i, 1.0);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={edge.x}
                  y2={edge.y}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
              );
            })}

            {/* Data Polygon */}
            <polygon
              points={points}
              fill="rgba(6, 182, 212, 0.25)"
              stroke="#06b6d4"
              strokeWidth="2.5"
              className="transition-all duration-300"
            />

            {/* Vertices Points with Hover */}
            {dimensions.map((dim, i) => {
              const coord = getCoordinates(i, Math.max(0.15, dim.value / 100));
              const labelCoord = getCoordinates(i, 1.22);
              const isHovered = hoveredDimension?.key === dim.key;

              return (
                <g key={dim.key} onMouseEnter={() => setHoveredDimension(dim)} onMouseLeave={() => setHoveredDimension(null)}>
                  {/* Outer circle vertex */}
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={isHovered ? 6 : 4}
                    fill={isHovered ? '#22d3ee' : '#0891b2'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all"
                  />

                  {/* Label on chart edge */}
                  <text
                    x={labelCoord.x}
                    y={labelCoord.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-[9px] font-mono cursor-pointer transition-colors ${
                      isHovered ? 'fill-cyan-300 font-bold' : 'fill-slate-400'
                    }`}
                  >
                    {dim.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dynamic Metric Details on Right (5 Cols) */}
        <div className="md:col-span-5 space-y-2 text-xs font-sans">
          {hoveredDimension ? (
            <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-700/60 space-y-1.5 animate-in fade-in">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                Selected Dimension
              </span>
              <div className="text-base font-bold text-white font-mono">
                {hoveredDimension.label}: {hoveredDimension.displayValue}
              </div>
              <p className="text-slate-300 text-[11px]">
                Status is rated <b>{hoveredDimension.status.toUpperCase()}</b> relative to coastal safety thresholds.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-ocean-900/50 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Radar Telemetry Overview
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Hover over any radar vertex to inspect wave energy, atmospheric pressure, and regional safety gates for <b>{locationName}</b>.
              </p>
            </div>
          )}

          {/* Quick List of Dimensions */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono">
            {dimensions.map((dim) => (
              <div
                key={dim.key}
                onMouseEnter={() => setHoveredDimension(dim)}
                onMouseLeave={() => setHoveredDimension(null)}
                className="p-2 rounded-xl bg-ocean-900/60 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-800 transition-all flex justify-between items-center cursor-pointer"
              >
                <span className="text-slate-400 truncate">{dim.label}</span>
                <span className="font-bold text-cyan-300 shrink-0">{dim.displayValue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
