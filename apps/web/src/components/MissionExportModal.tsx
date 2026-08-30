"use client";

import React from "react";
import { X, Download, FileJson, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { QueryResponse } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  queryData?: QueryResponse | null;
}

export function MissionExportModal({ isOpen, onClose, queryData }: Props) {
  if (!isOpen || !queryData) return null;

  const handleDownloadGeoJSON = () => {
    const geojson = {
      type: "FeatureCollection",
      properties: {
        query_id: queryData.query_id,
        session_id: queryData.session_id,
        location: queryData.location.name,
        decision: queryData.decision.decision_class,
        timestamp: new Date().toISOString()
      },
      features: [
        {
          type: "Feature",
          properties: { name: "Recommended Safe Route", status: queryData.route.route_status, distance_km: queryData.route.safe_distance_km },
          geometry: queryData.route.safe_geometry
        },
        {
          type: "Feature",
          properties: { name: "Direct Course Line", distance_km: queryData.route.direct_distance_km },
          geometry: queryData.route.direct_geometry
        }
      ]
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orca-mission-${queryData.query_id}.geojson`;
    a.click();
  };

  const handleDownloadCSV = () => {
    const rows = [
      ["Metric", "Value", "Source Authority"],
      ["Location", queryData.location.name, "Port Authority"],
      ["Verdict", queryData.decision.decision_class, "ORCA Risk Engine (risk-2026-08-v1)"],
      ["Safety Risk Score", `${queryData.decision.safety_risk_score}/100`, "Governed Metocean Formula"],
      ["Fishing Potential", `${queryData.decision.fishing_suitability_score}/100`, "INCOIS / ISRO PFZ"],
      ["Wave Height", `${queryData.ocean_conditions.wave_height_m} m`, "INCOIS Ocean State Forecast"],
      ["Wind Speed", `${queryData.weather_forecast.wind_speed_kmh} km/h`, "IMD Marine Weather"],
      ["SST", `${queryData.ocean_conditions.sst_celsius} °C`, "MOSDAC INSAT-3D TIR"],
      ["Chlorophyll", `${queryData.ocean_conditions.chlorophyll_mg_m3} mg/m3`, "Oceansat-3 OCM"],
      ["Safe Route Distance", `${queryData.route.safe_distance_km} km`, "PostGIS Tactical Avoidance"]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement("a");
    a.href = encodedUri;
    a.download = `orca-telemetry-${queryData.query_id}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-ocean-950 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Export Mission Telemetry
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Mission #{queryData.query_id}
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

        <div className="space-y-3 my-5">
          <button
            onClick={handleDownloadGeoJSON}
            className="w-full p-4 rounded-xl bg-ocean-900 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-200 group-hover:text-cyan-300">
                  GeoJSON Feature Collection
                </div>
                <div className="text-[11px] text-slate-400">
                  Ready for QGIS, ArcGIS, Mapbox, or Leaflet
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
          </button>

          <button
            onClick={handleDownloadCSV}
            className="w-full p-4 rounded-xl bg-ocean-900 border border-slate-800 hover:border-teal-500/50 flex items-center justify-between text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-950 border border-teal-800 text-teal-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-200 group-hover:text-teal-300">
                  CSV Telemetry Log
                </div>
                <div className="text-[11px] text-slate-400">
                  Full metocean, PFZ, and decision metrics
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
          </button>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-ocean-900 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
