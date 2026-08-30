"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  CircleMarker,
  useMap
} from "react-leaflet";
import L from "leaflet";
import { QueryResponse, PFZCandidate, CoastalLocation } from "@/types";
import {
  Layers,
  Shield,
  Fish,
  Navigation,
  AlertTriangle,
  Compass,
  Globe,
  Anchor,
  Search,
  Check,
  ChevronDown,
  Info,
  MapPin,
  ExternalLink
} from "lucide-react";

// Fix standard Leaflet default marker icons for Next.js bundler
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Icons for Port, Harbour, and Active Station
const PortIcon = L.divIcon({
  html: `<div style="background-color: #0284c7; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 8px #0284c7;"></div>`,
  className: "custom-port-marker",
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const ActiveOriginIcon = L.divIcon({
  html: `<div style="background-color: #00f0ff; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 14px #00f0ff; animation: pulse 2s infinite;"></div>`,
  className: "custom-origin-marker",
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

interface Props {
  data: QueryResponse;
  selectedCandidate?: PFZCandidate;
  onSelectCandidate: (candidate: PFZCandidate) => void;
  locations?: CoastalLocation[];
  onSelectLocation?: (location: CoastalLocation) => void;
}

export function OceanTacticalMap({
  data,
  selectedCandidate,
  onSelectCandidate,
  locations = [],
  onSelectLocation
}: Props) {
  const [isClient, setIsClient] = useState(false);
  // Layer visibility state
  const [showCoastline, setShowCoastline] = useState(true);
  const [showLocations, setShowLocations] = useState(true);
  const [showPFZ, setShowPFZ] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showRestricted, setShowRestricted] = useState(true);
  const [showSafeRoute, setShowSafeRoute] = useState(true);
  const [showDirectRoute, setShowDirectRoute] = useState(true);
  
  // Basemap & Viewport state
  const [basemap, setBasemap] = useState<"dark" | "voyager" | "satellite" | "light">("dark");
  const [mapZoom, setMapZoom] = useState(6);
  const [mapCenter, setMapCenter] = useState<[number, number]>([16.5, 80.0]); // Default India EEZ View
  const [selectedLocationPopup, setSelectedLocationPopup] = useState<CoastalLocation | null>(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  const cartoKey = process.env.NEXT_PUBLIC_CARTO_KEY;
  const origin: [number, number] = [data.location.latitude, data.location.longitude];

  // Tactical safe route coordinates [[lat, lon], ...]
  const safeRouteCoords = data.route?.safe_geometry?.coordinates?.map(
    (pt: [number, number]) => [pt[1], pt[0]] as [number, number]
  ) || [];

  // Direct route coordinates
  const directRouteCoords = data.route?.direct_geometry?.coordinates?.map(
    (pt: [number, number]) => [pt[1], pt[0]] as [number, number]
  ) || [];

  // Recenter when data location updates
  useEffect(() => {
    if (data?.location) {
      setMapCenter([data.location.latitude, data.location.longitude]);
      setMapZoom(8);
    }
  }, [data?.location?.name]);

  // Filter locations for search bar
  const filteredLocations = searchQuery.trim() === ""
    ? locations.slice(0, 8)
    : locations.filter((loc) =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.district.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelectLocation = (loc: CoastalLocation) => {
    setMapCenter([loc.latitude, loc.longitude]);
    setMapZoom(9);
    setSelectedLocationPopup(loc);
    setIsSearchOpen(false);
    setSearchQuery("");
    if (onSelectLocation) {
      onSelectLocation(loc);
    }
  };

  const getTileLayer = () => {
    if (basemap === "satellite") {
      return (
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> &bull; Maxar, Earthstar Geographics'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={18}
        />
      );
    } else if (basemap === "voyager") {
      // CARTO Voyager with authenticated key
      const url = cartoKey
        ? `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${cartoKey}`
        : `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png`;
      return (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'
          url={url}
          maxZoom={19}
        />
      );
    } else if (basemap === "light") {
      // CARTO Positron with authenticated key
      const url = cartoKey
        ? `https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=${cartoKey}`
        : `https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png`;
      return (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'
          url={url}
          maxZoom={19}
        />
      );
    } else {
      // Dark Matter Ocean with authenticated key (Default)
      const url = cartoKey
        ? `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${cartoKey}`
        : `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png`;
      return (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'
          url={url}
          maxZoom={19}
        />
      );
    }
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[600px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-ocean-950 group">
      {/* Top Floating Map Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Search / Port Finder Bar */}
        <div className="relative pointer-events-auto" ref={searchRef}>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ocean-950/95 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-xs font-mono shadow-xl transition-all"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Jump to Port:</span>
            <span className="text-cyan-300 font-bold">{data.location.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isSearchOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 max-h-64 overflow-y-auto bg-ocean-950/98 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1 z-50">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type port name..."
                className="w-full bg-ocean-900 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-sans mb-1"
                autoFocus
              />
              {filteredLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => {
                    handleSelectLocation(loc);
                    setIsSearchOpen(false);
                  }}
                  className="w-full p-2 rounded-xl hover:bg-cyan-950/80 border border-transparent hover:border-cyan-800/60 flex items-center justify-between text-left transition-all text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{loc.name}</span>
                    <span className="text-[10px] text-slate-400">{loc.state} &bull; {loc.category}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Region Selectors */}
        <div className="bg-ocean-950/95 backdrop-blur-md border border-slate-800 rounded-2xl p-1 shadow-xl flex items-center gap-1 text-[11px] font-mono pointer-events-auto">
          <button
            onClick={() => {
              setMapCenter([16.0, 80.5]);
              setMapZoom(5);
            }}
            className="px-2 py-1 rounded-xl bg-ocean-900 hover:bg-cyan-950 text-slate-300 transition-colors"
          >
            All India
          </button>
          <button
            onClick={() => {
              setMapCenter([16.5, 72.5]);
              setMapZoom(6);
            }}
            className="px-2 py-1 rounded-xl bg-ocean-900 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 text-[10px] transition-colors"
            title="West Coast (Arabian Sea)"
          >
            West Coast
          </button>
          <button
            onClick={() => {
              setMapCenter([15.5, 83.5]);
              setMapZoom(6);
            }}
            className="px-2 py-1 rounded-xl bg-ocean-900 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 text-[10px] transition-colors"
            title="East Coast (Bay of Bengal)"
          >
            East Coast
          </button>
          <button
            onClick={() => {
              setMapCenter([11.5, 92.5]);
              setMapZoom(7);
            }}
            className="px-2 py-1 rounded-xl bg-ocean-900 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 text-[10px] transition-colors"
            title="Andaman & Nicobar Islands"
          >
            Islands
          </button>
        </div>
      </div>

      {/* Layer Visibility & Basemap Switcher Floating Drawer */}
      <div className="absolute top-16 right-3 z-[1000] flex flex-col gap-2 items-end">
        <button
          onClick={() => setIsLayersOpen(!isLayersOpen)}
          className="bg-ocean-950/95 backdrop-blur-md border border-slate-800 rounded-2xl px-3 py-1.5 text-xs text-slate-200 shadow-xl flex items-center gap-2 hover:border-cyan-700 transition-colors font-mono"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Map Layers</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isLayersOpen ? "rotate-180" : ""}`} />
        </button>

        {isLayersOpen && (
          <div className="bg-ocean-950/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 text-[11px] font-mono text-slate-300 shadow-2xl w-60 space-y-2.5">
            {/* Basemap Selection */}
            <div className="space-y-1.5 border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CARTO Basemap
              </span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button
                  onClick={() => setBasemap("dark")}
                  className={`px-2 py-1 rounded-lg border ${
                    basemap === "dark"
                      ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                      : "bg-ocean-900 text-slate-400 border-slate-800"
                  }`}
                >
                  Dark Matter
                </button>
                <button
                  onClick={() => setBasemap("voyager")}
                  className={`px-2 py-1 rounded-lg border ${
                    basemap === "voyager"
                      ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                      : "bg-ocean-900 text-slate-400 border-slate-800"
                  }`}
                >
                  Voyager
                </button>
                <button
                  onClick={() => setBasemap("satellite")}
                  className={`px-2 py-1 rounded-lg border ${
                    basemap === "satellite"
                      ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                      : "bg-ocean-900 text-slate-400 border-slate-800"
                  }`}
                >
                  Satellite (ESRI)
                </button>
                <button
                  onClick={() => setBasemap("light")}
                  className={`px-2 py-1 rounded-lg border ${
                    basemap === "light"
                      ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                      : "bg-ocean-900 text-slate-400 border-slate-800"
                  }`}
                >
                  Positron (Light)
                </button>
              </div>
            </div>

            {/* Layer Checkboxes */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Operational Layers
              </span>
              <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showLocations}
                  onChange={(e) => setShowLocations(e.target.checked)}
                  className="accent-cyan-500 rounded"
                />
                <span className="text-cyan-300">Coastal Locations & Ports</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showPFZ}
                  onChange={(e) => setShowPFZ(e.target.checked)}
                  className="accent-emerald-500 rounded"
                />
                <span className="text-emerald-400">Potential Fishing Zones (PFZ)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showRestricted}
                  onChange={(e) => setShowRestricted(e.target.checked)}
                  className="accent-rose-500 rounded"
                />
                <span className="text-rose-400">Naval & Restricted Zones</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showHazards}
                  onChange={(e) => setShowHazards(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span className="text-amber-400">Offshore Hazard Areas</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showSafeRoute}
                  onChange={(e) => setShowSafeRoute(e.target.checked)}
                  className="accent-cyan-400 rounded"
                />
                <span className="text-cyan-400">Tactical Safe Route</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showDirectRoute}
                  onChange={(e) => setShowDirectRoute(e.target.checked)}
                  className="accent-slate-400 rounded"
                />
                <span className="text-slate-400">Direct Course Line</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Leaflet Map Canvas */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full"
        zoomControl={false}
      >
        {getTileLayer()}
        <MapRecenter center={mapCenter} zoom={mapZoom} />

        {/* Pan-India Coastal Location Markers */}
        {showLocations &&
          locations.map((loc) => {
            const isActive = loc.name.toLowerCase() === data?.location?.name?.toLowerCase();
            return (
              <Marker
                key={loc.id}
                position={[loc.latitude, loc.longitude]}
                icon={isActive ? ActiveOriginIcon : PortIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedLocationPopup(loc);
                  }
                }}
              >
                <Popup>
                  <div className="text-xs p-1 space-y-1 min-w-[190px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="font-bold text-cyan-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {loc.name}
                      </span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-ocean-900 text-slate-300 font-mono">
                        {loc.category}
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px]">{loc.state} &bull; {loc.region}</div>
                    <div className="text-slate-400 text-[10px] font-mono">
                      Coords: {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E
                    </div>
                    <div className="pt-1.5 flex gap-1">
                      <button
                        onClick={() => handleSelectLocation(loc)}
                        className="w-full py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[10px] text-center transition-colors"
                      >
                        Analyze Conditions
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Departure Origin Marker */}
        <Marker position={origin} icon={ActiveOriginIcon}>
          <Popup>
            <div className="text-xs p-1">
              <div className="font-bold text-cyan-400">{data.location.name} Harbour</div>
              <div className="text-slate-300 text-[11px]">Active Mission Origin</div>
              <div className="text-slate-400 text-[10px] font-mono mt-1">
                Lat: {origin[0].toFixed(4)}°N, Lon: {origin[1].toFixed(4)}°E
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Restricted Military/Naval Geofence Polygons */}
        {showRestricted &&
          data.restricted_zones.map((zone) => {
            const polyCoords = zone.geometry.coordinates[0].map(
              (pt: [number, number]) => [pt[1], pt[0]] as [number, number]
            );
            return (
              <Polygon
                key={zone.id}
                positions={polyCoords}
                pathOptions={{
                  color: "#ef4444",
                  fillColor: "#ef4444",
                  fillOpacity: 0.25,
                  weight: 2,
                  dashArray: "4, 6"
                }}
              >
                <Popup>
                  <div className="text-xs p-1 space-y-1">
                    <div className="font-bold text-rose-400 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      {zone.name}
                    </div>
                    <div className="text-[11px] text-slate-300">{zone.description}</div>
                    <div className="text-[10px] text-amber-400 font-mono">
                      Authority: {zone.authority}
                    </div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

        {/* Offshore Hazard Circles */}
        {showHazards &&
          data.hazards.map((haz) => {
            const [hLon, hLat] = haz.geometry.coordinates;
            return (
              <CircleMarker
                key={haz.id}
                center={[hLat, hLon]}
                radius={12}
                pathOptions={{
                  color: "#f59e0b",
                  fillColor: "#f59e0b",
                  fillOpacity: 0.25,
                  weight: 1.5
                }}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <div className="font-bold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {haz.affected_zone_name || haz.hazard_type}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{haz.message}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      Severity: {haz.severity} &bull; Authority: {haz.authority}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* Potential Fishing Zone (PFZ) Advisories */}
        {showPFZ &&
          data.candidates.map((cand) => {
            const isTarget = selectedCandidate?.id === cand.id;
            
            let lat = 0;
            let lon = 0;
            let polyPositions: [number, number][] = [];

            if (cand.geometry && cand.geometry.coordinates) {
              if (cand.geometry.type === "Polygon" && Array.isArray(cand.geometry.coordinates[0])) {
                polyPositions = cand.geometry.coordinates[0].map(
                  (pt: [number, number]) => [pt[1], pt[0]] as [number, number]
                );
                if (polyPositions.length > 0) {
                  lat = polyPositions[0][0];
                  lon = polyPositions[0][1];
                }
              } else if (typeof cand.geometry.coordinates[0] === "number") {
                lon = cand.geometry.coordinates[0];
                lat = cand.geometry.coordinates[1];
              } else if (Array.isArray(cand.geometry.coordinates[0]) && typeof cand.geometry.coordinates[0][0] === "number") {
                lon = cand.geometry.coordinates[0][0];
                lat = cand.geometry.coordinates[0][1];
              }
            }

            if (!lat || !lon || isNaN(lat) || isNaN(lon)) return null;

            return (
              <React.Fragment key={cand.id}>
                {polyPositions.length > 0 && (
                  <Polygon
                    positions={polyPositions}
                    pathOptions={{
                      color: isTarget ? "#00f0ff" : "#10b981",
                      fillColor: isTarget ? "#00f0ff" : "#10b981",
                      fillOpacity: isTarget ? 0.3 : 0.15,
                      weight: isTarget ? 2 : 1
                    }}
                  />
                )}
                <CircleMarker
                  center={[lat, lon]}
                  radius={isTarget ? 12 : 8}
                  pathOptions={{
                    color: isTarget ? "#00f0ff" : "#10b981",
                    fillColor: isTarget ? "#00f0ff" : "#10b981",
                    fillOpacity: isTarget ? 0.9 : 0.6,
                    weight: isTarget ? 3 : 1.5
                  }}
                  eventHandlers={{
                    click: () => onSelectCandidate(cand)
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1 space-y-1 min-w-[180px]">
                      <div className="font-bold text-cyan-400 flex items-center gap-1">
                        <Fish className="w-3.5 h-3.5" />
                        {cand.name}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Fishing Potential: <span className="font-bold text-emerald-400">{cand.suitability_score.toFixed(0)}/100</span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-mono">
                        Distance: {cand.distance_km.toFixed(1)} km &bull; Bearing: {cand.bearing_deg.toFixed(0)}°
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        SST: {cand.sst_celsius}°C &bull; Chl-a: {cand.chlorophyll_mg_m3} mg/m³
                      </div>
                      <div className="text-[10px] text-teal-300 font-mono pt-0.5">
                        Target Species: {cand.target_species.slice(0, 1).join(", ")}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}

        {/* Direct Course Line (Conflicting) */}
        {showDirectRoute && directRouteCoords.length > 1 && (
          <Polyline
            positions={directRouteCoords}
            pathOptions={{
              color: "#94a3b8",
              weight: 2,
              dashArray: "6, 6",
              opacity: 0.7
            }}
          />
        )}

        {/* Recommended Safe Route (Bypass Waypoints with 3.5 km Standoff) */}
        {showSafeRoute && safeRouteCoords.length > 1 && (
          <Polyline
            positions={safeRouteCoords}
            pathOptions={{
              color: "#00f0ff",
              weight: 3.5,
              opacity: 0.95
            }}
          />
        )}
      </MapContainer>

      {/* Bottom Route Status & Information Banner */}
      <div className="p-3 bg-ocean-950/95 border-t border-slate-800 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-300">
            {data.route.conflict_resolution_applied ? (
              <>
                <span className="text-amber-400 font-bold mr-1">RESTRICTED ZONE DETOUR:</span>
                Direct course intersects naval perimeter. Safe bypass planned ({data.route.safe_distance_km.toFixed(1)} km).
              </>
            ) : (
              <>
                <span className="text-emerald-400 font-bold mr-1">CLEAR PASSAGE:</span>
                Direct trajectory to advisory zone ({data.route.safe_distance_km.toFixed(1)} km).
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <div>
            Target: <span className="text-cyan-300 font-bold">{selectedCandidate?.name || "PFZ-1"}</span>
          </div>
          <div className="hidden sm:block text-slate-600">&bull;</div>
          <div className="text-[10px] text-slate-400">
            CARTO Basemaps &copy; OpenStreetMap &copy; CARTO
          </div>
        </div>
      </div>
    </div>
  );
}

