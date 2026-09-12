# RoadSafe AI: Predictive Road Safety Intelligence Platform
**IBM Bob National Hackathon 2026 • Team 042**  
**Problem Statement:** PS-3 — RoadSafe India (Transport)

---

## 🚀 Project Overview
RoadSafe AI transforms reactive road accident mapping into a **predictive and prescriptive intelligence platform**. By analyzing historical crash data (MoRTH, NCRB) and road network parameters, the system answers:
1. **Where** accidents are most likely to occur (Spatial Corridor Risk Map).
2. **Why** accidents occur (Explainable Causal AI: overspeeding, geometry, illumination).
3. **Who/What** is vulnerable (Vulnerability profiles: Two-wheelers, pedestrians).
4. **When** risk is highest (Temporal danger windows & night peaks).
5. **What** intervention to implement first (Ranked safety actions with cost & timeframe).
6. **Whether** interventions will reduce accidents (Modeled lives saved, accident % reduction, ROI).

---

## 📁 Repository Structure
```text
team_042/
├── backend/                  # FastAPI REST Service & SQLite Database
│   ├── main.py               # Application entry point with CORS enabled
│   ├── config.py             # App & CORS configuration (supports Vite 5173)
│   ├── database.py           # SQLAlchemy database connection
│   ├── models.py             # Accident & Risk database models
│   ├── schemas.py            # Pydantic request/response schemas
│   └── routers/
│       └── accidents.py      # CRUD and filtering endpoints
│
├── frontend/                 # Interactive React + Vite Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Vision Zero header & status
│   │   │   ├── CityStats.jsx         # City-wide KPI cards
│   │   │   ├── RiskMap.jsx           # Leaflet interactive map with custom pulse pins
│   │   │   ├── SpotListSidebar.jsx   # Search & severity filtering
│   │   │   └── SpotInspector.jsx     # PS3 Actionable Intelligence Panel
│   │   ├── services/
│   │   │   ├── api.js                # Contract-first API service (USE_MOCK switch)
│   │   │   └── mockData.js           # Curated Bengaluru corridors intelligence
│   │   ├── App.jsx                   # Master dashboard container
│   │   └── index.css                 # Command-center dark aesthetic
│   └── package.json
│
├── data/
│   ├── bangalore_blackspots.json     # Curated Bengaluru accident blackspots dataset
│   └── seed_data.py                  # Script to seed backend SQLite database
│
└── README.md
```

---

## 🛠️ Quick Start Guide

### 1. Frontend Development (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

> **Note for Frontend:** By default, `frontend/src/services/api.js` has `USE_MOCK = true` so the UI runs with rich Bengaluru intelligence data without waiting for the backend. Once backend is running, toggle `USE_MOCK = false`.

---

### 2. Backend Development (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn backend.main.py:app --reload --port 8000
```
API Documentation will be available at: **`http://localhost:8000/docs`**

---

### 3. Seed Database with Bengaluru Data
```bash
python data/seed_data.py
```
This populates the SQLite database (`road_safety.db`) with 10 high-risk Bengaluru corridors.

---

## 🤝 Team Collaboration Workflow
- **Frontend Lead**: Work exclusively in `frontend/`. Keep `USE_MOCK = true` during development.
- **Backend / ML Leads**: Work in `backend/` and `data/`. Train ML models and expose risk prediction endpoints.
- **Integration**: When backend is ready, switch `USE_MOCK = false` in `frontend/src/services/api.js`.
