export type DecisionVerdict = "FAVORABLE" | "GO" | "CAUTION" | "UNSAFE" | "DO_NOT_VENTURE" | "INSUFFICIENT_DATA" | "UNKNOWN";
export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "EXTREME";
export type SuitabilityLevel = "HIGH" | "MODERATE" | "LOW";
export type HardGateStatus = "PASSED" | "OFFICIAL_PROHIBITION" | "HAZARD_BLOCKED" | "DATA_UNAVAILABLE";
export type EvidenceQuality = "HIGH" | "MODERATE" | "LOW" | "INSUFFICIENT";
export type AgentLifecycleStatus = "QUEUED" | "RUNNING" | "SUCCESS" | "WARNING" | "FAILED";

export interface CoastalLocation {
  id: string;
  name: string;
  state: string;
  region: "West Coast" | "East Coast" | "Islands & UTs";
  district: string;
  category: "Port" | "Coastal City" | "Fishing Harbour" | "Coastal District";
  latitude: number;
  longitude: number;
  is_demo_scenario?: boolean;
  live_data_available?: boolean;
}

export interface GeoJSONGeometry {
  type: string;
  coordinates: any;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface LocationContext {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  harbour_name: string;
  shelf_azimuth_deg: number;
  is_supported_coastal_zone: boolean;
}

export interface DataSource {
  authority: string;
  product_name: string;
  dataset_version: string;
  retrieval_timestamp: string;
  valid_from: string;
  valid_to: string;
  quality_status: string;
  is_simulation: boolean;
}

export interface PFZCandidate {
  id: string;
  name: string;
  bearing_deg: number;
  distance_km: number;
  depth_m: number;
  sst_celsius: number;
  chlorophyll_mg_m3: number;
  suitability_score: number;
  suitability_level: SuitabilityLevel;
  target_species: string[];
  geometry: GeoJSONGeometry;
  source: DataSource;
}

export interface OceanConditions {
  sst_celsius: number;
  chlorophyll_mg_m3: number;
  wave_height_m: number;
  wave_period_s: number;
  swell_height_m: number;
  current_speed_m_s: number;
  current_direction_deg: number;
  tide_status: string;
  sea_state_code: string;
  source: DataSource;
}

export interface WeatherForecast {
  wind_speed_kmh: number;
  wind_gust_kmh: number;
  wind_direction: string;
  precipitation_prob_pct: number;
  lightning_risk: string;
  visibility_km: number;
  cyclone_alert_level: string;
  is_official_warning_active: boolean;
  official_bulletin?: string | null;
  source: DataSource;
}

export interface HazardAlert {
  id: string;
  hazard_type: string;
  severity: string;
  message: string;
  affected_zone_name: string;
  geometry: GeoJSONGeometry;
  authority: string;
  source: DataSource;
}

export interface RestrictedZone {
  id: string;
  name: string;
  zone_type: string;
  authority: string;
  geometry: GeoJSONGeometry;
  description: string;
  effective_dates: string;
}

export interface RouteCandidate {
  route_status: string;
  direct_distance_km: number;
  safe_distance_km: number;
  direct_geometry: GeoJSONGeometry;
  safe_geometry: GeoJSONGeometry;
  waypoints: Coordinates[];
  conflicts_detected: string[];
  conflict_resolution_applied: boolean;
  standoff_buffer_km: number;
}

export interface CoreDecision {
  decision_class: DecisionVerdict;
  safety_risk_score: number;
  risk_level: RiskLevel;
  fishing_suitability_score: number;
  fishing_level: SuitabilityLevel;
  hard_safety_gate: HardGateStatus;
  evidence_quality: EvidenceQuality;
  selected_pfz_id?: string | null;
  rule_version: string;
  gate_reason?: string | null;
}

export interface WhyFactor {
  category: string;
  status: string;
  detail: string;
  source_authority: string;
  raw_value: string;
  threshold?: string | null;
}

export interface WhyExplanation {
  headline: string;
  summary_prose: string;
  positive_factors: WhyFactor[];
  risk_factors: WhyFactor[];
  scientific_evidence_notes: string[];
  language: string;
}

export interface EvidenceNode {
  id: string;
  label: string;
  category: string;
  value: string;
  source: string;
  timestamp: string;
  quality: string;
}

export interface EvidenceEdge {
  source_id: string;
  target_id: string;
  relationship: string;
}

export interface EvidenceGraphData {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

export interface AgentTraceEvent {
  node: string;
  status: AgentLifecycleStatus;
  progress_message: string;
  timestamp: string;
  duration_ms?: number;
  evidence_collected?: Record<string, any>;
}

export interface MissionContext {
  activity: string;
  time_window: string;
  target_radius_km: number;
}

export interface QueryResponse {
  query_id: string;
  session_id: string;
  language: string;
  location: LocationContext;
  mission: MissionContext;
  decision: CoreDecision;
  selected_pfz?: PFZCandidate | null;
  candidates: PFZCandidate[];
  ocean_conditions: OceanConditions;
  weather_forecast: WeatherForecast;
  hazards: HazardAlert[];
  restricted_zones: RestrictedZone[];
  route: RouteCandidate;
  why_explanation: WhyExplanation;
  evidence_graph: EvidenceGraphData;
  agent_trace: AgentTraceEvent[];
  created_at: string;
}

export interface WhatIfResponse {
  session_id: string;
  time_window_evaluated: string;
  baseline_decision: CoreDecision;
  simulated_decision: CoreDecision;
  delta_risk_score: number;
  delta_fishing_score: number;
  ocean_delta: Record<string, any>;
  weather_delta: Record<string, any>;
  tradeoff_summary: string;
  language: string;
}

export interface ResearchAnomalyPoint {
  date: string;
  sst_anomaly_celsius: number;
  chlorophyll_mg_m3: number;
  cpue_trend_index: number;
  upwelling_index: number;
}

export interface ResearchLiteratureCitation {
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  relevance_summary: string;
}

export interface ResearchQueryResponse {
  location: string;
  topic: string;
  anomaly_trend: ResearchAnomalyPoint[];
  upwelling_status: string;
  trophic_cascade_notes: string;
  literature_citations: ResearchLiteratureCitation[];
  governing_dataset: string;
}

export interface AiChatResponse {
  reply: string;
  suggested_actions: string[];
  source_authorities: string[];
  confidence_score: number;
  language: string;
}

export interface AiFuelOptimizationResponse {
  location: string;
  vessel_type: string;
  pfz_name: string;
  one_way_distance_km: number;
  round_trip_distance_km: number;
  traditional_search_liters: number;
  orca_optimized_liters: number;
  diesel_saved_liters: number;
  cost_saved_inr: number;
  co2_reduced_kg: number;
  optimal_departure_time: string;
  optimal_return_time: string;
  tidal_boost_summary: string;
}

