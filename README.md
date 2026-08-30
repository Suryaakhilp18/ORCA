# ORCA — Marine EcOsystem Reasoning with Collaborative Agents

[![SIH 2026](https://img.shields.io/badge/SIH-2026-blue.svg)](https://sih.gov.in)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26176-orange.svg)](https://sih.gov.in)
[![Organization](https://img.shields.io/badge/ISRO-Space%20Technology%20Theme-purple.svg)](https://isro.gov.in)

> **"Ask the ocean. Get a decision."**  
> An evidence-backed marine decision-support system that autonomously correlates Indian oceanographic, satellite, meteorological, fisheries, and geospatial data into verifiable, explainable operational guidance.

---

## 🌟 Core Architecture & Engineering Highlights

1. **Strict AI vs. Deterministic Software Separation**:
   - **Deterministic Systems**: Hard safety gates, independent Safety Risk (`0–100`) vs Fishing Potential (`0–100`) scoring, Haversine geodesic calculations, ray-casting polygon containment, and naval defense geofence collision bypass with tactical standoff.
   - **AI Layer**: Natural-language intent extraction, conversational memory, what-if tradeoffs, grounded "Why ORCA Says This" rationale, and multilingual presentation (English, Telugu, Hindi).
   - **Zero Hallucination Guarantee**: The LLM *never* creates numbers, coordinates, or safety thresholds.

2. **Decoupled Safety vs Opportunity**:
   - Safety Risk (`0–100`) and Fishing Potential (`0–100`) are evaluated as completely independent dimensions.
   - **Rule of Precedence**: High fishing potential can **never** compensate for an active official warning or safety prohibition.

3. **Tactical Geospatial Cartography & Avoidance**:
   - Automatic detection of route intersection with military defense zones (e.g. `ENC-R04 Eastern Naval Command Exercise Area`).
   - Real-time computation of safe bypass waypoint routes with a 3.5 km standoff buffer.
   - Interactive toggle comparing Direct Course (conflicting) vs Safe Tactical Route.

4. **Verifiable Evidence Graph & Provenance**:
   - Every recommendation links directly to primary sources: **INCOIS** (PFZ & Ocean State Forecast), **IMD** (Coastal Bulletins & Hazard Alerts), **MOSDAC / ISRO** (Satellite SST & Chlorophyll), and **PostGIS**.
   - Clear labeling of `DEMO MODE` and `LIVE SENSORS`.

5. **Temporal What-If & Deep Research Modes**:
   - **What-If Comparison**: Side-by-side morning vs evening conditions showing delta risk and sea agitation.
   - **Research Mode**: 30-day multi-satellite anomalies, environmental lag analysis, and scientific literature citations.

---

## 🚀 Quick Start (Single Command)

### PowerShell
```powershell
.\run_orca.ps1
```

This automatically launches:
- **Operations Web Console**: `http://localhost:3000`
- **FastAPI Intelligence Engine**: `http://localhost:8000` (Interactive Swagger Docs at `http://localhost:8000/docs`)

---

## 🧪 Automated Test Suite

Run all automated unit, geospatial, safety regression, and integration tests:
```powershell
$env:PYTHONPATH = ".\backend"
.\venv\Scripts\python.exe -m pytest backend/tests -v
```

All 11 tests validate:
- Geodesic distance (Haversine) & forward azimuth bearing accuracy.
- Ray-casting polygon containment and line-segment intersection.
- Tactical safe route waypoint bypass around naval geofences.
- Deterministic risk scoring and candidate ranking.
- **Safety Regression Invariant**: Official warnings *always* override high fishing scores to produce `DO NOT VENTURE`.
- Multilingual numeric and coordinate invariance.
- Full Visakhapatnam end-to-end query execution.
