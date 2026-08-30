"""
End-to-End Pipeline & Multilingual Invariance Tests
SIH 2026 / ISRO Problem Statement SIH26176
"""

import pytest
from orca_engine.models.schemas import QueryRequest, DecisionVerdict
from orca_engine.agents.planner import OrcaPlanner


def test_visakhapatnam_morning_e2e_execution():
    req = QueryRequest(
        query="I'm fishing near Visakhapatnam tomorrow morning. Is it safe, and where should I go?",
        language="en"
    )
    resp = OrcaPlanner.execute_query_pipeline(req)

    assert resp.location.name == "Visakhapatnam"
    assert resp.mission.time_window == "morning"
    assert resp.decision.decision_class in [DecisionVerdict.GO, DecisionVerdict.CAUTION]
    assert resp.selected_pfz is not None
    assert len(resp.candidates) >= 3
    assert len(resp.agent_trace) >= 6
    assert len(resp.evidence_graph.nodes) >= 4
    assert resp.route.route_status is not None


def test_multilingual_numerical_invariance():
    """
    CRITICAL SIH REQUIREMENT:
    English, Telugu, and Hindi queries for the same conditions must produce
    IDENTICAL numerical scores, coordinates, and decision verdicts.
    """
    en_req = QueryRequest(query="Visakhapatnam tomorrow morning", language="en")
    te_req = QueryRequest(query="రేపు ఉదయం విశాఖపట్నం దగ్గర చేపల వేటకు వెళ్లడం సురక్షితమేనా?", language="te")
    hi_req = QueryRequest(query="क्या कल सुबह विशाखापत्तनम में मछली पकड़ना सुरक्षित है?", language="hi")

    en_res = OrcaPlanner.execute_query_pipeline(en_req)
    te_res = OrcaPlanner.execute_query_pipeline(te_req)
    hi_res = OrcaPlanner.execute_query_pipeline(hi_req)

    # Invariance assertions
    assert en_res.decision.decision_class == te_res.decision.decision_class == hi_res.decision.decision_class
    assert en_res.decision.safety_risk_score == te_res.decision.safety_risk_score == hi_res.decision.safety_risk_score
    assert en_res.decision.fishing_suitability_score == te_res.decision.fishing_suitability_score == hi_res.decision.fishing_suitability_score
    assert en_res.selected_pfz.distance_km == te_res.selected_pfz.distance_km == hi_res.selected_pfz.distance_km


def test_sse_streaming_events():
    import asyncio
    async def _run():
        req = QueryRequest(query="Visakhapatnam tomorrow morning", language="en")
        events = []
        async for item in OrcaPlanner.execute_query_stream(req):
            events.append(item)
        return events

    events = asyncio.run(_run())
    assert len(events) >= 10
    assert any("ORCA_PLANNER" in e for e in events)
    assert any("RISK_ENGINE" in e for e in events)
    assert any("complete" in e for e in events)
