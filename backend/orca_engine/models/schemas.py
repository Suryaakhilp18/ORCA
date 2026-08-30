"""
ORCA Domain Schemas & Contracts
SIH 2026 / ISRO Problem Statement SIH26176
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DecisionVerdict(str, Enum):
    FAVORABLE = "FAVORABLE"
    GO = "GO"
    CAUTION = "CAUTION"
    UNSAFE = "UNSAFE"
    DO_NOT_VENTURE = "DO_NOT_VENTURE"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
    UNKNOWN = "UNKNOWN"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    EXTREME = "EXTREME"


class SuitabilityLevel(str, Enum):
    HIGH = "HIGH"
    MODERATE = "MODERATE"
    LOW = "LOW"


class HardGateStatus(str, Enum):
    PASSED = "PASSED"
    OFFICIAL_PROHIBITION = "OFFICIAL_PROHIBITION"
    HAZARD_BLOCKED = "HAZARD_BLOCKED"
    DATA_UNAVAILABLE = "DATA_UNAVAILABLE"


class EvidenceQuality(str, Enum):
    HIGH = "HIGH"
    MODERATE = "MODERATE"
    LOW = "LOW"
    INSUFFICIENT = "INSUFFICIENT"


class AgentLifecycleStatus(str, Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    FAILED = "FAILED"


class GeoJSONGeometry(BaseModel):
    type: str = Field(default="Point", description="GeoJSON type: Point, LineString, Polygon")
    coordinates: Any = Field(description="Coordinates according to GeoJSON specification [lon, lat]")


class Coordinates(BaseModel):
    lat: float
    lon: float


class LocationContext(BaseModel):
    name: str
    state: str
    latitude: float
    longitude: float
    harbour_name: str
    shelf_azimuth_deg: float
    is_supported_coastal_zone: bool = True


class DataSource(BaseModel):
    authority: str
    product_name: str
    dataset_version: str
    retrieval_timestamp: str
    valid_from: str
    valid_to: str
    quality_status: str = "VALIDATED"
    is_simulation: bool = True


class PFZCandidate(BaseModel):
    id: str
    name: str
    bearing_deg: float
    distance_km: float
    depth_m: float
    sst_celsius: float
    chlorophyll_mg_m3: float
    suitability_score: float
    suitability_level: SuitabilityLevel
    target_species: List[str]
    geometry: GeoJSONGeometry
    source: DataSource


class OceanConditions(BaseModel):
    sst_celsius: float
    chlorophyll_mg_m3: float
    wave_height_m: float
    wave_period_s: float
    swell_height_m: float
    current_speed_m_s: float
    current_direction_deg: float
    tide_status: str
    sea_state_code: str
    source: DataSource


class WeatherForecast(BaseModel):
    wind_speed_kmh: float
    wind_gust_kmh: float
    wind_direction: str
    precipitation_prob_pct: int
    lightning_risk: str
    visibility_km: float
    cyclone_alert_level: str
    is_official_warning_active: bool
    official_bulletin: Optional[str] = None
    source: DataSource


class HazardAlert(BaseModel):
    id: str
    hazard_type: str
    severity: str
    message: str
    affected_zone_name: str
    geometry: GeoJSONGeometry
    authority: str
    source: DataSource


class RestrictedZone(BaseModel):
    id: str
    name: str
    zone_type: str
    authority: str
    geometry: GeoJSONGeometry
    description: str
    effective_dates: str


class RouteCandidate(BaseModel):
    route_status: str
    direct_distance_km: float
    safe_distance_km: float
    direct_geometry: GeoJSONGeometry
    safe_geometry: GeoJSONGeometry
    waypoints: List[Coordinates]
    conflicts_detected: List[str]
    conflict_resolution_applied: bool
    standoff_buffer_km: float = 3.5


class CoreDecision(BaseModel):
    decision_class: DecisionVerdict
    safety_risk_score: float
    risk_level: RiskLevel
    fishing_suitability_score: float
    fishing_level: SuitabilityLevel
    hard_safety_gate: HardGateStatus
    evidence_quality: EvidenceQuality
    selected_pfz_id: Optional[str]
    rule_version: str = "risk-2026-08-v1"
    gate_reason: Optional[str] = None


class WhyFactor(BaseModel):
    category: str
    status: str
    detail: str
    source_authority: str
    raw_value: str
    threshold: Optional[str] = None


class WhyExplanation(BaseModel):
    headline: str
    summary_prose: str
    positive_factors: List[WhyFactor]
    risk_factors: List[WhyFactor]
    scientific_evidence_notes: List[str]
    language: str = "en"


class EvidenceNode(BaseModel):
    id: str
    label: str
    category: str
    value: str
    source: str
    timestamp: str
    quality: str


class EvidenceEdge(BaseModel):
    source_id: str
    target_id: str
    relationship: str


class EvidenceGraphData(BaseModel):
    nodes: List[EvidenceNode]
    edges: List[EvidenceEdge]


class AgentTraceEvent(BaseModel):
    node: str
    status: AgentLifecycleStatus
    progress_message: str
    timestamp: str
    duration_ms: Optional[float] = None
    evidence_collected: Optional[Dict[str, Any]] = None


class MissionContext(BaseModel):
    activity: str
    time_window: str
    target_radius_km: float


class QueryRequest(BaseModel):
    query: str
    language: str = "en"
    demo_mode: bool = True
    session_id: Optional[str] = None


class QueryResponse(BaseModel):
    query_id: str
    session_id: str
    language: str
    location: LocationContext
    mission: MissionContext
    decision: CoreDecision
    selected_pfz: Optional[PFZCandidate]
    candidates: List[PFZCandidate]
    ocean_conditions: OceanConditions
    weather_forecast: WeatherForecast
    hazards: List[HazardAlert]
    restricted_zones: List[RestrictedZone]
    route: RouteCandidate
    why_explanation: WhyExplanation
    evidence_graph: EvidenceGraphData
    agent_trace: List[AgentTraceEvent]
    created_at: str


class WhatIfRequest(BaseModel):
    session_id: str
    target_pfz_id: Optional[str] = None
    target_time_window: str = "evening"
    wind_delta_factor: float = 1.0
    wave_delta_factor: float = 1.0


class WhatIfResponse(BaseModel):
    session_id: str
    time_window_evaluated: str
    baseline_decision: CoreDecision
    simulated_decision: CoreDecision
    delta_risk_score: float
    delta_fishing_score: float
    ocean_delta: Dict[str, Any]
    weather_delta: Dict[str, Any]
    tradeoff_summary: str
    language: str = "en"


class ResearchAnomalyPoint(BaseModel):
    date: str
    sst_anomaly_celsius: float
    chlorophyll_mg_m3: float
    cpue_trend_index: float
    upwelling_index: float


class ResearchLiteratureCitation(BaseModel):
    title: str
    authors: str
    journal: str
    year: int
    doi: str
    relevance_summary: str


class ResearchQueryRequest(BaseModel):
    location: str
    topic: str
    lookback_days: int = 30


class ResearchQueryResponse(BaseModel):
    location: str
    topic: str
    anomaly_trend: List[ResearchAnomalyPoint]
    upwelling_status: str
    trophic_cascade_notes: str
    literature_citations: List[ResearchLiteratureCitation]
    governing_dataset: str


class AiChatRequest(BaseModel):
    message: str
    location_name: Optional[str] = "Visakhapatnam"
    language: Optional[str] = "en"
    session_id: Optional[str] = None


class AiChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str]
    source_authorities: List[str]
    confidence_score: float
    language: str


class AiFuelOptimizationRequest(BaseModel):
    location_name: str = "Visakhapatnam"
    vessel_type: str = "Motorized Craft (9-12m)"
    engine_hp: int = 40
    target_pfz_id: Optional[str] = None


class AiFuelOptimizationResponse(BaseModel):
    location: str
    vessel_type: str
    pfz_name: str
    one_way_distance_km: float
    round_trip_distance_km: float
    traditional_search_liters: float
    orca_optimized_liters: float
    diesel_saved_liters: float
    cost_saved_inr: float
    co2_reduced_kg: float
    optimal_departure_time: str
    optimal_return_time: str
    tidal_boost_summary: str

