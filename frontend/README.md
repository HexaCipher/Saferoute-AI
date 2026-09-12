# 🛣️ SafeRoute AI — Frontend Dashboard

React 19 + Vite 8 command center application for **SafeRoute AI (Bengaluru NightRide)**.

## 🚀 Live Data Architecture

The frontend is connected directly to the FastAPI backend with **zero mock fallback data**:
- **All 428 road segments** are loaded live via `GET /api/v1/segments` as a GeoJSON FeatureCollection.
- **City overview KPIs** are aggregated directly from `GET /api/v1/analytics/summary`.
- **Road segment telemetry** (crash counts, BTP station jurisdiction, SHAP feature importance, and VRU counts) is fetched on-demand via `GET /api/v1/segments/{segment_id}`.
- **Intervention What-If Simulations** run live on `POST /api/v1/simulate`, recalculating safety scores and injury reductions via the server-side ML model.
- If the backend is unreachable, the application displays an explicit connection error state rather than falling back to fake statistics.

## 🛠️ Setup & Development

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Lint & Build
```bash
# Oxlint static analysis (zero warnings, zero errors)
npm run lint

# Production bundle build
npm run build
```

## 🗺️ Key Features
- **Satellite & Vector Map**: Real Leaflet LineStrings for all 428 segments color-coded by ML risk tier (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- **Real Feature Layer Filters**: Toggles for Dark Spots (unlit segments), High-Conflict Junctions, Pedestrian Crossings, and Night Risk Multipliers.
- **Segment Inspector**: Detailed view showing BTP historical statistics, speed limits, crossing density, and ML factor importance.
- **What-If Simulation**: Test the safety impact of smart street lighting, speed enforcement cameras, pedestrian refuges, traffic calming, and junction redesigns.
- **Quick Search (⌘K / Ctrl+K)**: Instant keyboard palette searching across all 428 segments, road names, and BTP police stations.
