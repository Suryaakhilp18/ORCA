"""
Safety Invariant & Gatekeeper Tests
SIH 2026 / ISRO Problem Statement SIH26176
Validates that official safety warnings and severe metocean thresholds strictly override opportunity scores.
"""

import pytest
from orca_engine.models.schemas import (
    WeatherForecast, OceanConditions, HazardAlert, PFZCandidate,
    Coordinates, GeoJSONGeometry, DataSource, HardGateStatus,
    DecisionVerdict, RiskLevel, SuitabilityLevel
)
from orca_engine.agents.risk_engine import (
    evaluate_hard_safety_gates, calculate_safety_risk_score,
    calculate_fishing_suitability_score, evaluate_decision
)


@pytest.fixture
def calm_weather():
    return WeatherForecast(
        wind_speed_kmh=12.0,
        wind_gust_kmh=15.0,
        wind_direction="NE",
        precipitation_prob_pct=5,
        lightning_risk="LOW",
        visibility_km=15.0,
        cyclone_alert_level="NONE",
        is_official_warning_active=False,
        source=DataSource(
            authority="IMD",
            product_name="Coastal Bulletin",
            dataset_version="v1",
            retrieval_timestamp="2026-08-29T00:00:00Z",
            valid_from="2026-08-29T00:00:00Z",
            valid_to="2026-08-30T00:00:00Z"
        )
    )


@pytest.fixture
def calm_ocean():
    return OceanConditions(
        sst_celsius=27.4,
        chlorophyll_mg_m3=2.1,
        wave_height_m=0.8,
        wave_period_s=7.5,
        swell_height_m=0.5,
        current_speed_m_s=0.4,
        current_direction_deg=110.0,
        tide_status="FLOOD",
        sea_state_code="CALM",
        source=DataSource(
            authority="INCOIS",
            product_name="OSF",
            dataset_version="v1",
            retrieval_timestamp="2026-08-29T00:00:00Z",
            valid_from="2026-08-29T00:00:00Z",
            valid_to="2026-08-30T00:00:00Z"
        )
    )


@pytest.fixture
def ideal_pfz():
    return PFZCandidate(
        id="PFZ-TEST-01",
        name="Prime Tuna Front",
        bearing_deg=90.0,
        distance_km=12.0,
        depth_m=50.0,
        sst_celsius=27.5,
        chlorophyll_mg_m3=2.2,
        suitability_score=95.0,
        suitability_level=SuitabilityLevel.HIGH,
        target_species=["Yellowfin Tuna"],
        geometry=GeoJSONGeometry(type="Polygon", coordinates=[[[83.0, 17.0], [83.1, 17.0], [83.1, 17.1], [83.0, 17.1], [83.0, 17.0]]]),
        source=DataSource(
            authority="INCOIS",
            product_name="PFZ",
            dataset_version="v1",
            retrieval_timestamp="2026-08-29T00:00:00Z",
            valid_from="2026-08-29T00:00:00Z",
            valid_to="2026-08-30T00:00:00Z"
        )
    )


def test_calm_conditions_produce_go_verdict(calm_weather, calm_ocean, ideal_pfz):
    gate, reason = evaluate_hard_safety_gates(calm_weather, calm_ocean, [])
    assert gate == HardGateStatus.PASSED
    assert reason is None

    dec, best = evaluate_decision(calm_weather, calm_ocean, [ideal_pfz], [])
    assert dec.decision_class == DecisionVerdict.GO
    assert dec.risk_level == RiskLevel.LOW
    assert dec.safety_risk_score < 25.0
    assert dec.fishing_suitability_score > 80.0


def test_safety_regression_official_warning_strictly_overrides_high_fishing(calm_ocean, ideal_pfz):
    """
    CRITICAL SIH INVARIANT:
    Even if fishing potential is 100/100, an active IMD official warning MUST produce DO_NOT_VENTURE.
    """
    warning_weather = WeatherForecast(
        wind_speed_kmh=15.0,
        wind_gust_kmh=20.0,
        wind_direction="E",
        precipitation_prob_pct=10,
        lightning_risk="LOW",
        visibility_km=10.0,
        cyclone_alert_level="WARNING",
        is_official_warning_active=True,
        official_bulletin="Depression over Bay of Bengal. Fishermen advised not to venture into sea.",
        source=DataSource(
            authority="IMD",
            product_name="Fishermen Warning",
            dataset_version="v1",
            retrieval_timestamp="2026-08-29T00:00:00Z",
            valid_from="2026-08-29T00:00:00Z",
            valid_to="2026-08-30T00:00:00Z"
        )
    )

    gate, reason = evaluate_hard_safety_gates(warning_weather, calm_ocean, [])
    assert gate == HardGateStatus.OFFICIAL_PROHIBITION
    assert "IMD Warning" in reason

    dec, best = evaluate_decision(warning_weather, calm_ocean, [ideal_pfz], [])
    assert dec.decision_class == DecisionVerdict.DO_NOT_VENTURE
    assert dec.hard_safety_gate == HardGateStatus.OFFICIAL_PROHIBITION


def test_wave_height_cutoff_triggers_hard_gate(calm_weather, calm_ocean, ideal_pfz):
    """Wave height >= 3.0m triggers physical survivability gate."""
    rough_ocean = calm_ocean.model_copy(update={"wave_height_m": 3.4})
    gate, reason = evaluate_hard_safety_gates(calm_weather, rough_ocean, [])
    assert gate == HardGateStatus.HAZARD_BLOCKED
    assert "survivability cutoff" in reason

    dec, _ = evaluate_decision(calm_weather, rough_ocean, [ideal_pfz], [])
    assert dec.decision_class == DecisionVerdict.DO_NOT_VENTURE
