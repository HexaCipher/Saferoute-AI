# 🛣️ SafeRoute AI — Bengaluru NightRide

<div align="center">

**Predictive Road Safety Intelligence Platform**

*IBM Bob National Hackathon 2026 • Team 042*

**Problem Statement:** PS-3 — RoadSafe India (Transport)

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-GradientBoosting-F7931E?logo=scikitlearn&logoColor=white)
![REST API](https://img.shields.io/badge/API-REST%20%2B%20GeoJSON-orange)

</div>

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [The Problem We Solve](#-the-problem-we-solve)
3. [Key Features](#-key-features)
4. [How It Works — The Intelligence Pipeline](#-how-it-works--the-intelligence-pipeline)
5. [System Architecture](#-system-architecture)
6. [Tech Stack](#️-tech-stack)
7. [Repository Structure](#-repository-structure)
8. [Data Sources & Integrity Rules](#-data-sources--integrity-rules)
9. [ML Model & Risk Methodology](#-ml-model--risk-methodology)
10. [API Reference](#-api-reference)
11. [Getting Started](#-getting-started)
12. [Environment Variables](#-environment-variables)
13. [Running Tests](#-running-tests)
14. [Team Workflow & Git Strategy](#-team-workflow--git-strategy)
15. [Roadmap](#-roadmap)
16. [Known Limitations](#-known-limitations)
17. [Contributing](#-contributing)
18. [License](#-license)
19. [Acknowledgments](#-acknowledgments)

---

## 🌆 Overview

**SafeRoute AI — Bengaluru NightRide** transforms reactive road accident mapping into a **predictive and prescriptive intelligence platform**. Instead of merely mapping where crashes *already happened*, the system analyzes the Bengaluru road network at ~500 m segment granularity, fuses official Bengaluru Traffic Police (BTP) crash statistics with OpenStreetMap infrastructure data, and trains an explainable ML model to compute a **Safety Score (0–100)** for every segment — then tells city authorities exactly **what to fix first, what it will cost, and how many lives it will save**.

> **Coverage:** 428 analyzed road segments · ~162 km of network across 3 priority corridors · 48 BTP traffic police jurisdictions · 4,974 recorded city crashes (2023)

---

## 🎯 The Problem We Solve

India recorded over **1.68 lakh road fatalities** in 2022 — Bengaluru alone saw **915 deaths and 4,974 crashes** in 2023, with **43% of night-time deaths occurring between 6 PM and 2 AM**. Authorities today work reactively: they respond to crashes that have already happened.

SafeRoute AI answers six operational questions for traffic police and municipal planners:

| # | Question | SafeRoute AI Capability |
|---|----------|------------------------|
| 1 | **WHERE** will accidents occur? | Spatial Corridor Risk Map with 428 scored segments |
| 2 | **WHY** do accidents occur there? | Explainable Causal AI: junction density, speed, lighting, transit friction |
| 3 | **WHO** is most vulnerable? | VRU profiles: Two-Wheelers (45.3% of BLR deaths) & Pedestrians (36.8%) |
| 4 | **WHEN** is risk highest? | Night-time danger windows & calibrated night-risk multipliers |
| 5 | **WHAT** should be fixed first? | Ranked "Fix This First" actions with cost & expected gain |
| 6 | **WILL** interventions work? | What-If simulator: modeled fatality reduction & score deltas |

---

## ✨ Key Features

- 🗺️ **Satellite Risk Map** — Interactive Leaflet map (Esri World Imagery) with risk-tiered corridors, layer controls, and click-to-inspect
- 🧠 **Explainable Risk Model** — Gradient Boosting Regressor with 5-fold cross-validation; every score decomposes into weighted contributing factors
- 🔍 **Segment Inspector** — Full infrastructure breakdown, BTP jurisdiction history, causal factor attribution, and vulnerability profile per segment
- 🎛️ **What-If Intervention Simulator** — Mutates real feature states (lighting, speed, crossings, junction density) and re-runs the trained model — no hardcoded reduction numbers
- 📊 **City Analytics Dashboard** — Risk-tier distribution, corridor breakdowns, VRU shares, infrastructure highlights, CSV export
- 🏗️ **Municipal Action Tracker** — Turns "Fix This First" recommendations into tracked, funded projects (BBMP / BTP / NHAI / DULT) with status workflow and budgets in lakhs
- ⌨️ **⌘K Command Palette** — Fast corridor/segment search with keyboard navigation
- 📱 **Fully Responsive** — Mobile slide-over drawer, view switcher, collapsible panels, adaptive breakpoints

## ⚙️ How It Works — The Intelligence Pipeline

SafeRoute AI follows an end-to-end, 10-step data-to-decision pipeline:

```
 ┌─────────────────────────── DATA INGESTION ───────────────────────────┐
 │  BTP station crash stats (2020–2023)   BTP jurisdiction KML (KGIS)   │
 │  OSM road network GraphML (3 corridors) OSM infrastructure features  │
 └──────────────────────────────────┬───────────────────────────────────┘
                                    ▼
 ┌───────────────────── build_segment_dataset.py ──────────────────────┐
 │  Step 1–4: Extract OSM roads → partition into ~500m segments →      │
 │  extract junctions/crossings/bus stops/lighting → spatial join      │
 │  with BTP polygons (crash signals attached per jurisdiction)        │
 └──────────────────────────────────┬───────────────────────────────────┘
                                    ▼
 ┌───────────────────────── risk_engine.py ────────────────────────────┐
 │  Step 5: Hybrid risk target = BTP macro signal × OSM micro signal   │
 │          × night multiplier (1.45× unlit / 1.15× lit)               │
 │  Step 6: Gradient Boosting Regressor → Safety Score 0–100           │
 │  Step 7: Explainability — factor attribution per segment            │
 └──────────────────────────────────┬───────────────────────────────────┘
                                    ▼
 ┌───────────────────────── Decision Layer ────────────────────────────┐
 │  Step 8:  vru_engine.py       → WHO is vulnerable (2W vs pedestrian)│
 │  Step 9:  simulator_engine.py → WILL an intervention work?          │
 │  Step 10: prioritizer.py      → WHAT to fix first (priority rank)   │
 └──────────────────────────────────┬───────────────────────────────────┘
                                    ▼
 ┌──────────────────────── FastAPI REST API ───────────────────────────┐
 │  GeoJSON map layer · segment detail · simulate · recommendations    │
 │  analytics/summary · CSV export · action tracker CRUD (SQLite)      │
 └──────────────────────────────────┬───────────────────────────────────┘
                                    ▼
 ┌──────────────────── React Command-Center Dashboard ─────────────────┐
 │  Satellite map · corridor list · inspector · KPIs · simulator modal │
 └─────────────────────────────────────────────────────────────────────┘
```

**Safety Score interpretation:** `0 = Extreme Hazard` → `100 = Optimal Safety`, banded into tiers:

| Tier | Safety Score | Meaning |
|------|--------------|---------|
| 🔴 CRITICAL | < 40 | Immediate engineering intervention required |
| 🟠 HIGH | 40 – 59 | Priority corrective measures |
| 🟡 MEDIUM | 60 – 74 | Monitor & schedule improvements |
| 🟢 LOW | ≥ 75 | Meets baseline safety standards |

---

## 🏗️ System Architecture

```
┌─────────────────────────┐   HTTP / JSON + GeoJSON    ┌──────────────────────────────┐
│      Frontend (5173)    │ ─────────────────────────▶ │       Backend (8000)         │
│  React 19 + Vite 8      │                            │  FastAPI (uvicorn)           │
│  ┌───────────────────┐  │  GET /segments (GeoJSON)   │  ┌────────────────────────┐  │
│  │ SatelliteRiskMap  │  │ ◀───────────────────────── │  │  Risk Engine (sklearn) │  │
│  │ CorridorList      │  │  POST /simulate            │  │  Simulator Engine      │  │
│  │ InspectorDrawer   │  │  GET /analytics/summary    │  │  Prioritizer / VRU     │  │
│  │ KpiMetricsRow     │  │  GET /recommendations/...  │  └───────────┬────────────┘  │
│  │ SimulatorModal    │  │  CRUD /actions             │              ▼               │
│  └───────────────────┘  │                            │  bengaluru_500m_segments     │
│  services/api.js        │                            │  .parquet + risk_model.joblib│
└─────────────────────────┘                            │  SQLite (road_safety.db)     │
        Esri satellite tiles                           └──────────────────────────────┘
        (Leaflet / CDN)                                    Raw data: BTP CSVs, KML,
                                                           OSM GraphML, POIs
```

- **Stateless REST API** — segment intelligence is served from an in-memory GeoDataFrame (vectorized batch inference < 200 ms)
- **Relational persistence** — SQLite stores BTP station records, saved simulations, and the municipal action tracker
- **Artifact caching** — the trained model is persisted to `risk_model.joblib` and re-used across restarts (auto-retrains if missing)

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite 8 | SPA dashboard, HMR dev server |
| | Leaflet 1.9 + Esri World Imagery | Interactive satellite risk map |
| | lucide-react | Icon system |
| | oxlint | Linting |
| **Backend** | FastAPI 0.104 + Uvicorn | Async REST API with auto Swagger docs |
| | Pydantic v2 + pydantic-settings | Schema validation & config |
| | SQLAlchemy 2 + SQLite | Relational persistence |
| **ML / Data** | pandas, NumPy, GeoPandas, Shapely, pyproj | Segment processing, spatial joins (EPSG:4326 ↔ EPSG:32643) |
| | scikit-learn (GradientBoostingRegressor), joblib | Risk model training, persistence, 5-fold CV |
| | OSMnx | OSM road network extraction |
| **Data** | BTP OpenCity CSVs, KGIS KML, OSM GraphML | Official crash statistics & road network |

## 📂 Repository Structure

```text
team_042/
├── README.md                          ← You are here
│
├── backend/                           # FastAPI REST service & ML core
│   ├── main.py                        # App entry point, CORS, router mounting, lifespan
│   ├── config.py                      # Settings (DB URL, CORS, API prefix)
│   ├── database.py                    # SQLAlchemy engine / SessionLocal / get_db
│   ├── models.py                      # BTPStation, RoadSegment, SavedSimulation, ActionTracker
│   ├── schemas.py                     # Pydantic request/response schemas (GeoJSON-ready)
│   ├── requirements.txt               # Python dependencies
│   ├── API_CONTRACT.md                # Frontend/backend contract documentation
│   ├── routers/
│   │   ├── segments.py                # GeoJSON map layer + segment detail
│   │   ├── simulator.py               # What-If simulation + save/list scenarios
│   │   ├── recommendations.py         # "Fix This First" prioritization
│   │   ├── actions.py                 # Municipal action tracker CRUD
│   │   ├── analytics.py               # City KPIs + CSV export
│   │   └── accidents.py               # Legacy accident CRUD (compatibility)
│   ├── services/
│   │   ├── risk_engine.py             # Hybrid risk target + GB Regressor + explainability
│   │   ├── simulator_engine.py        # Intervention feature mutation + Nilsson scaling
│   │   ├── prioritizer.py             # Vectorized "Fix This First" ranking
│   │   └── vru_engine.py              # Vulnerable road user profiling
│   ├── scripts/
│   │   ├── build_segment_dataset.py   # ETL: OSM → 500m segments → BTP spatial join
│   │   └── seed_database.py           # Populates SQLite (stations, segments, actions)
│   ├── tests/
│   │   └── test_api_suite.py          # End-to-end API test suite (FastAPI TestClient)
│   └── data/
│       ├── DATA_SOURCES.md            # Full source registry with download URLs
│       ├── data_dictionary.md         # Column-level schema documentation
│       ├── raw/
│       │   ├── btp/                   # BTP crash CSVs (2020–2023) + jurisdiction KML
│       │   └── osm/                   # Corridor GraphML graphs + POIs
│       └── processed/
│           ├── bengaluru_500m_segments.parquet / .geojson
│           ├── risk_model.joblib      # Trained Gradient Boosting model
│           └── dataset_metadata.json
│
├── frontend/                          # React + Vite command-center dashboard
│   ├── src/
│   │   ├── App.jsx                    # Layout orchestration, state, global shortcuts
│   │   ├── components/
│   │   │   ├── SatelliteRiskMap.jsx   # Leaflet satellite map (live 428-segment GeoJSON)
│   │   │   ├── CorridorList.jsx       # Corridor/segment list panel (search + tier filters)
│   │   │   ├── InspectorDrawer.jsx    # Segment intelligence panel (live detail API)
│   │   │   ├── KpiMetricsRow.jsx      # City-wide KPI strip (analytics summary)
│   │   │   ├── SimulatorModal.jsx     # What-If simulator (live POST /simulate + save)
│   │   │   ├── SearchModal.jsx        # ⌘K command palette (real segment search)
│   │   │   └── SidebarNav / TopHeader / FooterBar
│   │   └── services/
│   │       └── api.js                 # Pure live API service layer (no mock data)
│   ├── public/favicon.svg
│   ├── docs/                          # PRD, TRD, UI/UX brief, API contract, pitch deck
│   └── package.json
│
└── road_safety.db                     ← SQLite database (seeded)
```

---

## 🗃️ Data Sources & Integrity Rules

All data sources are catalogued with direct download URLs in **[`backend/data/DATA_SOURCES.md`](backend/data/DATA_SOURCES.md)**.

| # | Source | Granularity | Role |
|---|--------|-------------|------|
| 1 | **BTP Station Crash Statistics 2023** (OpenCity) | 48 traffic police stations | Macro risk baseline (total/fatal/injury cases) |
| 2 | **BTP Station Crash Statistics 2020–2022** (OpenCity) | Station-level, multi-year | Trend validation & smoothing |
| 3 | **BTP Jurisdiction Boundaries** (KGIS KML) | 45 spatial polygons | Spatial join: segment ↔ governing station |
| 4 | **OpenStreetMap road networks** (OSMnx GraphML) | ORR, Hosur Rd, OMR/Whitefield | Segment geometry + infrastructure features |
| 5 | **OSM POIs** | City-wide GeoJSON | Crossings, bus stops, junctions |

**🔒 Data Integrity Rules (strictly enforced):**
- ❌ **No fabricated crash data** and no invented lane/speed values — missing attributes remain `null`
- 🏷️ Street lighting is classified as `yes`, `no`, or `unverified` — never guessed
- 📍 BTP crash numbers are labeled as **station-level historical signals**, not point coordinates (BTP data contains no individual crash lat/lon)
- ✅ Every segment carries a **confidence level** (HIGH / MEDIUM / LOW) based on BTP polygon overlap ratio and feature availability

## 🧠 ML Model & Risk Methodology

### Hybrid Risk Target (Step 5)
```
risk_target = macro_signal × micro_signal × night_multiplier

macro_signal  = 0.5·norm(station_total_crashes_2023) + 0.5·norm(station_fatality_ratio)
micro_signal  = 0.30·junction_density + 0.30·speed_exposure
              + 0.25·transit_crossing_conflict + 0.15·lane_exposure
night_multiplier = 1.45 (unverified/unlit)  |  1.15 (verified lit)   ← MoRTH calibration
```

### Model (Steps 6–7)
- **Algorithm:** `GradientBoostingRegressor` (150 estimators, depth 4, lr 0.08, seed 42)
- **Validation:** 5-fold K-Fold cross-validation (R² reported per fold in model metadata)
- **Features (12):** lanes, speed limit, junction density, crossings, bus stops, verified lighting, station totals/fatals/fatality-ratio, plus engineered interactions — `night_speed_index`, `crossing_deficit`, `junction_transit_conflict`
- **Output:** `safety_score = 100 × (1 − predicted_risk)`, clipped to [0, 100]
- **Persistence:** trained artifact cached in `risk_model.joblib` with CV metrics + feature importances
- **Explainability:** per-segment factor attribution (direction + relative contribution %) derived from feature values × model importances

### What-If Simulation (Step 9)
Interventions **mutate actual feature states** (e.g., lighting → `yes`, speed cap ×0.85, crossings +2, junction density ×0.60) and re-run the trained model — yielding cumulative and per-intervention isolated score gains. Casualty reduction is estimated via **Nilsson's power-rule scaling**, not hardcoded percentages.

### Supported Interventions
`street_lighting_upgrade` · `speed_enforcement_camera` · `pedestrian_crossing_refuge` · `speed_calming_measures` · `junction_redesign`

---

## 🌐 API Reference

**Base URL:** `http://localhost:8000` · **Interactive docs:** [`/docs`](http://localhost:8000/docs) (Swagger) & `/redoc`
Full request/response examples: [`backend/API_CONTRACT.md`](backend/API_CONTRACT.md)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health + dataset readiness |
| `GET` | `/api/v1/segments` | All segments as **GeoJSON FeatureCollection** (filters: `corridor_id`, `risk_tier`, `min/max_safety_score`) |
| `GET` | `/api/v1/segments/{segment_id}` | Full detail: metrics, infrastructure, BTP history, risk explanation, VRU profile |
| `POST` | `/api/v1/simulate` | What-If intervention simulation (score gain + isolated breakdown) |
| `POST` | `/api/v1/simulate/save` | Persist a named simulation scenario |
| `GET` | `/api/v1/simulate/saved` | List saved simulation scenarios |
| `GET` | `/api/v1/recommendations/fix-this-first` | Ranked priority interventions (filters: `corridor_id`, `limit`) |
| `GET` | `/api/v1/analytics/summary` | City KPIs, risk distribution, corridor & VRU breakdowns |
| `GET` | `/api/v1/analytics/export/csv` | Downloadable CSV report (filters: `corridor_id`, `risk_tier`) |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/v1/actions` | Municipal action tracker CRUD (status, agency, budget) |
| `GET` / `POST` / `PUT` / `DELETE` | `/api/v1/accidents` | Legacy accident records CRUD (compatibility) |

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |

### 1️⃣ Backend — FastAPI + ML Engine

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies (includes ML/geo stack: pandas, geopandas, scikit-learn, osmnx…)
pip install -r requirements.txt

# (Optional, if no processed artifacts exist) Build the segment dataset:
#   python scripts/build_segment_dataset.py

# Seed the SQLite database with 48 BTP stations + 428 scored segments + sample actions:
python scripts/seed_database.py

# Start the API server
uvicorn backend.main:app --reload --port 8000
```

✅ Verify: open **http://localhost:8000/docs** (Swagger UI) and **http://localhost:8000/health**.

### 2️⃣ Frontend — React Dashboard

```bash
cd frontend
npm install

# Configure backend API URL (defaults to http://localhost:8000/api/v1)
cp .env.example .env

# Run local development server
npm run dev
```

✅ Verify: open **http://localhost:5173** (or the port reported by Vite) — the dashboard renders live telemetry, ML safety scores, and crash histories directly from the FastAPI backend. If the backend is unreachable, the dashboard displays an explicit offline state with quick recovery instructions; it never substitutes fake or mock data.

### 3️⃣ Quick Sanity Check

```bash
# Health
curl http://localhost:8000/health

# Fetch segments (should return 428 features)
curl "http://localhost:8000/api/v1/segments" | jq ".metadata"

# Simulate an intervention on a critical segment
curl -X POST http://localhost:8000/api/v1/simulate \
  -H "Content-Type: application/json" \
  -d '{"segment_id": "BLR_ORR_014", "interventions": ["street_lighting_upgrade"]}'
```

---

## 🔧 Environment Variables

**Backend** — create `backend/.env` (all optional; sensible defaults are built in):

```env
DATABASE_URL=sqlite:///./road_safety.db
DEBUG=false
CORS_ORIGINS=["http://localhost:5173", "http://localhost:5174"]
SECRET_KEY=change-me-in-production
```

**Frontend** — create `frontend/.env` (see `frontend/.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 🧪 Running Tests

```bash
# Backend API test suite (validates all endpoints, schemas, data integrity, performance)
cd backend
python -m pytest tests/test_api_suite.py -v
```

The suite asserts dataset readiness (428 segments), GeoJSON structure, corridor/tier filtering,
segment detail payloads, simulation correctness, and action-tracker CRUD.

```bash
# Frontend lint + production build check
cd frontend
npm run lint
npm run build
```

## 🤝 Team Workflow & Git Strategy

| Role | Owns | Workspace |
|------|------|-----------|
| **Frontend Lead** | Dashboard, map, UX | `frontend/` |
| **Backend Lead** | FastAPI services, DB, routers | `backend/` (routers, models, schemas) |
| **ML Lead** | Risk model, simulator, prioritizer | `backend/services/`, `backend/scripts/` |

- **Branches:** `frontend` (dashboard), `feature/backend` (API/ML), merged into the working line via PR
- **Contract-first development:** any API change is documented in `backend/API_CONTRACT.md` **before** implementation
- **Commit convention:** Conventional Commits — `feat(scope): …`, `fix: …`, `style: …`, `chore: …`

---

## 🗺️ Roadmap

- [x] 500 m segment ETL pipeline with BTP spatial join
- [x] Explainable risk model with 5-fold CV + artifact caching
- [x] GeoJSON map layer, segment inspector, explainability panel
- [x] What-If simulator with isolated intervention breakdown
- [x] "Fix This First" prioritization engine
- [x] Municipal action tracker with persistence
- [x] Responsive command-center UI + ⌘K search palette
- [x] Render all 428 live segments on the satellite map (pure live API, no mock data)
- [x] Route the frontend simulator through the live `POST /simulate` endpoint
- [ ] Temporal crash data integration for time-of-day risk curves
- [ ] PostgreSQL + PostGIS upgrade for multi-city scale
- [ ] Auth (JWT) for planner/police roles on the action tracker
- [ ] Historical crash-coordinate ingestion for point-level validation

---

## ⚠️ Known Limitations

1. **Station-level, not point-level crash data** — BTP publishes aggregate counts per police station; the model uses these as jurisdiction-level signals, so within-station risk differences come from infrastructure features only.
2. **Three corridors in MVP** — ORR, Hosur Road, and OMR/Whitefield; expanding city-wide requires additional OSM graph extraction runs.
3. **SQLite for persistence** — fine for hackathon scale; switch `DATABASE_URL` to PostgreSQL for concurrent production writes.
4. **Simulation fatality estimates** are modeled via Nilsson's power rule from score deltas — directional and grounded, but not a substitute for before/after empirical studies.
5. **Lighting ground truth** — `unverified` lighting (the majority) is treated conservatively with the 1.45× night multiplier.
6. **Legacy compatibility surface** — the `/api/v1/accidents` CRUD and the `Accident` model predate the segment pipeline; they remain functional for backward compatibility but are not used by the dashboard.

---

## 🤲 Contributing

1. Create a branch from the relevant working line (`frontend` or `feature/backend`)
2. Follow Conventional Commits and keep changes scoped to your role's workspace
3. Update `backend/API_CONTRACT.md` for any API change
4. Run the checks before opening a PR:
   - Backend: `python -m pytest tests/test_api_suite.py -v`
   - Frontend: `npm run lint && npm run build`
5. Open a PR describing the change, screenshots for UI work, and test evidence

---

## 📄 License

This project was developed for the **IBM Bob National Hackathon 2026** (Team 042). License terms TBD — © 2026 Team 042. All rights reserved until a license is selected.

---

## 🙏 Acknowledgments

- **Bengaluru Traffic Police (BTP)** & the **OpenCity Urban Data Portal / Oorvani Foundation** — station-wise crash statistics
- **KGIS / Karnataka Spatial Data Infrastructure** — police jurisdiction boundaries
- **OpenStreetMap contributors** & **OSMnx** — road network and infrastructure data
- **MoRTH & NCRB** — national road-safety benchmarks used for night-risk and VRU calibration
- **Esri** — World Imagery satellite tiles
- **IBM Bob National Hackathon 2026 organizers** — for Problem Statement PS-3

---

<div align="center">

**Built with 🧠, 🗺️ and ☕ by Team 042 — Bengaluru NightRide**

*Predict. Explain. Prioritize. Save lives.*

</div>





