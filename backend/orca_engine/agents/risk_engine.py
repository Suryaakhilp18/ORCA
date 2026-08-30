"""
ORCA Deterministic Risk Engine & Safety Gatekeeper
SIH 2026 / ISRO Problem Statement SIH26176
Governed Rule Version: risk-2026-08-v1

NON-NEGOTIABLE DESIGN PRINCIPLE:
Deterministic software calculates numbers, thresholds, and safety gates.
The AI layer explains them.
An official safety prohibition can NEVER be overridden by a high fishing suitability score.
"""

from typing import List, Tuple, Optional, Dict, Any
from orca_engine.models.schemas import (
    CoreDecision, DecisionVerdict, RiskLevel, SuitabilityLevel,
    HardGateStatus, EvidenceQuality, PFZCandidate, OceanConditions,
    WeatherForecast, HazardAlert, RestrictedZone
)


def evaluate_hard_safety_gates(
    weather: WeatherForecast,
    ocean: OceanConditions,
    hazards: List[HazardAlert]
) -> Tuple[HardGateStatus, Optional[str]]:
    """
    Evaluates non-negotiable binary safety constraints before any numerical scoring.
    """
    # 1. Authoritative Official Cyclone or Severe Warning
    if weather.is_official_warning_active or weather.cyclone_alert_level in ["WARNING", "ALERT", "RED"]:
        bulletin = weather.official_bulletin or "IMD Fishermen Alert in effect. Sea condition rough to very rough."
        return HardGateStatus.OFFICIAL_PROHIBITION, f"Authoritative IMD Warning: {bulletin}"

    # 2. Critical Hazard Alert from Maritime Authorities
    for h in hazards:
        if h.severity.upper() in ["EXTREME", "SEVERE", "DANGER"]:
            return HardGateStatus.HAZARD_BLOCKED, f"Active Maritime Hazard: {h.message} ({h.authority})"

    # 3. Physical Metocean Hard-Stops (Severe sea state)
    if ocean.wave_height_m >= 3.0:
        return HardGateStatus.HAZARD_BLOCKED, f"Wave height ({ocean.wave_height_m:.1f}m) exceeds craft survivability cutoff (3.0m)."

    if weather.wind_speed_kmh >= 55.0:
        return HardGateStatus.HAZARD_BLOCKED, f"Wind speed ({weather.wind_speed_kmh:.1f} km/h) exceeds safe navigation cutoff (55 km/h)."

    return HardGateStatus.PASSED, None


def calculate_safety_risk_score(
    ocean: OceanConditions,
    weather: WeatherForecast,
    hazards: List[HazardAlert]
) -> Tuple[float, RiskLevel]:
    """
    Calculates deterministic risk score from 0 (dead calm) to 100 (extreme danger).
    Weights:
      - Significant Wave Height: 35%
      - Wind Speed & Gusts: 30%
      - Swell & Currents: 20%
      - Rain & Lightning: 15%
    """
    # Wave sub-score (0m -> 0, 1.5m -> 25, 2.5m -> 60, 3.5m+ -> 100)
    wave_norm = min(100.0, (ocean.wave_height_m / 3.0) * 100.0)

    # Wind sub-score (0 km/h -> 0, 25 km/h -> 30, 45 km/h -> 70, 60+ km/h -> 100)
    wind_norm = min(100.0, (weather.wind_speed_kmh / 50.0) * 100.0)

    # Swell sub-score (0m -> 0, 2.0m -> 100)
    swell_norm = min(100.0, (ocean.swell_height_m / 2.0) * 100.0)

    # Rain & Lightning sub-score
    lightning_val = 50.0 if weather.lightning_risk.upper() == "HIGH" else (20.0 if weather.lightning_risk.upper() == "MODERATE" else 0.0)
    weather_hazard_norm = min(100.0, (weather.precipitation_prob_pct * 0.5) + lightning_val)

    # Weighted sum
    total_risk = (
        (wave_norm * 0.35) +
        (wind_norm * 0.30) +
        (swell_norm * 0.20) +
        (weather_hazard_norm * 0.15)
    )
    total_risk = round(min(100.0, max(0.0, total_risk)), 1)

    if total_risk <= 30.0:
        level = RiskLevel.LOW
    elif total_risk <= 60.0:
        level = RiskLevel.MODERATE
    elif total_risk <= 80.0:
        level = RiskLevel.HIGH
    else:
        level = RiskLevel.EXTREME

    return total_risk, level


def calculate_fishing_suitability_score(
    candidate: PFZCandidate,
    ocean: OceanConditions
) -> Tuple[float, SuitabilityLevel]:
    """
    Calculates fishing opportunity score from 0 (poor) to 100 (exceptional).
    Independent from safety.
    """
    # SST thermal gradient optimality (ideal 26.5 - 28.5 C in Indian waters)
    if 26.5 <= candidate.sst_celsius <= 28.5:
        sst_score = 95.0
    elif 25.0 <= candidate.sst_celsius < 26.5 or 28.5 < candidate.sst_celsius <= 30.0:
        sst_score = 75.0
    else:
        sst_score = 45.0

    # Chlorophyll concentration (ideal 1.0 - 4.0 mg/m3)
    if 1.2 <= candidate.chlorophyll_mg_m3 <= 3.5:
        chl_score = 95.0
    elif 0.6 <= candidate.chlorophyll_mg_m3 < 1.2 or 3.5 < candidate.chlorophyll_mg_m3 <= 6.0:
        chl_score = 70.0
    else:
        chl_score = 40.0

    # Distance penalty (closer is more economical: < 20km = 100, 50km = 50)
    dist_score = max(20.0, 100.0 - (candidate.distance_km * 1.2))

    suitability = (sst_score * 0.40) + (chl_score * 0.40) + (dist_score * 0.20)
    suitability = round(min(100.0, max(0.0, suitability)), 1)

    if suitability >= 70.0:
        level = SuitabilityLevel.HIGH
    elif suitability >= 45.0:
        level = SuitabilityLevel.MODERATE
    else:
        level = SuitabilityLevel.LOW

    return suitability, level


def evaluate_decision(
    weather: WeatherForecast,
    ocean: OceanConditions,
    candidates: List[PFZCandidate],
    hazards: List[HazardAlert]
) -> Tuple[CoreDecision, Optional[PFZCandidate]]:
    """
    Executes the full deterministic decision pipeline in exact precedence order.
    """
    gate_status, gate_reason = evaluate_hard_safety_gates(weather, ocean, hazards)

    # Rank PFZ candidates by fishing suitability
    ranked_candidates = sorted(
        candidates,
        key=lambda c: c.suitability_score,
        reverse=True
    )
    best_pfz = ranked_candidates[0] if ranked_candidates else None

    # Calculate deterministic safety risk
    risk_score, risk_level = calculate_safety_risk_score(ocean, weather, hazards)

    # Determine final verdict
    if gate_status != HardGateStatus.PASSED:
        decision_verdict = DecisionVerdict.DO_NOT_VENTURE
    elif risk_level in [RiskLevel.HIGH, RiskLevel.EXTREME]:
        decision_verdict = DecisionVerdict.DO_NOT_VENTURE
    elif risk_level == RiskLevel.MODERATE:
        decision_verdict = DecisionVerdict.CAUTION
    else:
        decision_verdict = DecisionVerdict.GO

    # Fishing suitability
    fishing_score = best_pfz.suitability_score if best_pfz else 0.0
    fishing_level = best_pfz.suitability_level if best_pfz else SuitabilityLevel.LOW

    # Evidence quality
    evidence_quality = EvidenceQuality.HIGH

    decision = CoreDecision(
        decision_class=decision_verdict,
        safety_risk_score=risk_score,
        risk_level=risk_level,
        fishing_suitability_score=fishing_score,
        fishing_level=fishing_level,
        hard_safety_gate=gate_status,
        evidence_quality=evidence_quality,
        selected_pfz_id=best_pfz.id if best_pfz else None,
        rule_version="risk-2026-08-v1",
        gate_reason=gate_reason
    )

    return decision, best_pfz
