# Technical Requirements Document (TRD)
## RoadSafe AI — Predictive Road Safety Intelligence Platform
**Version:** 1.0 | **Date:** September 2026 | **Team:** 042

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│   React 19 + Vite 8 SPA                                        │
│   ┌──────────┬──────────┬──────────┬──────────┬──────────┐     │
│   │  Navbar  │ CityStats│ RiskMap  │ Sidebar  │ Inspector│     │
│   │          │  (KPIs)  │ (Leaflet)│ (Search) │ (Detail) │     │
│   └──────────┴──────────┴──────────┴──────────┴──────────┘     │
│                          ↕                                      │
│            apiService (USE_MOCK toggle)                         │
│              ↙              ↘                                   │
│     mockData.js        fetch() → Backend                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                            │
│                                                                 │
│   /health                    → Health check                     │
│   /api/v1/segments           → GeoJSON road segments            │
│   /api/v1/segments/{id}      → Segment detail + risk explain    │
│   /api/v1/simulate           → What-If intervention simulator   │
│   /api/v1/recommendations    → Fix-This-First prioritization    │
│                                                                 │
│   SQLAlchemy + SQLite (dev) / PostgreSQL (prod)                 │
│   ML Model: GBClassifier + Bayesian Optimization (R²: 0.86)    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Stack

### Core Framework
| Technology | Version | Reason |
|-----------|---------|--------|
| **React** | 19.2.8 | Latest stable, hooks-first architecture, team familiarity |
| **Vite** | 8.3.0 | Sub-second HMR, zero-config, 10x faster than CRA |
| **Vanilla CSS** | — | Full control over dark theme, no utility class bloat, custom design system |

### Key Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| **Leaflet** | 1.9.4 | Interactive map rendering, GeoJSON layers, custom markers |
| **Lucide React** | 1.45.0 | Clean, consistent icon system (AlertTriangle, Shield, Activity, etc.) |

### Libraries to ADD (Recommended)
| Library | Purpose | Install Command |
|---------|---------|----------------|
| **deck.gl** | 3D hexagonal heatmap overlay on map (wow factor) | `npm i @deck.gl/react @deck.gl/layers` |
| **recharts** | Clean bar/pie/gauge charts for inspector panel | `npm i recharts` |
| **framer-motion** | Smooth panel transitions + score counter animations | `npm i framer-motion` |
| **react-map-gl** | Mapbox GL JS wrapper (if upgrading from Leaflet) | `npm i react-map-gl mapbox-gl` |

### Frontend Architecture Pattern
```
frontend/src/
├── components/              # UI components (one per file)
│   ├── Navbar.jsx           # Top navigation + branding
│   ├── CityStats.jsx        # KPI summary cards
│   ├── RiskMap.jsx          # Leaflet/Mapbox map container
│   ├── SpotListSidebar.jsx  # Searchable corridor list
│   ├── SpotInspector.jsx    # Segment deep-dive panel
│   ├── Simulator.jsx        # [NEW] What-If intervention UI
│   ├── FixThisFirst.jsx     # [NEW] Prioritization table
│   ├── RiskGauge.jsx        # [NEW] Circular score gauge
│   ├── CauseBreakdown.jsx   # [NEW] Horizontal bar chart
│   └── VulnerableGroups.jsx # [NEW] Donut chart component
├── services/
│   ├── api.js               # API service with USE_MOCK toggle
│   └── mockData.js          # Curated Bengaluru corridor data
├── hooks/                   # [NEW] Custom React hooks
│   ├── useHotspots.js       # Data fetching + caching
│   └── useSimulator.js      # Simulation state management
├── utils/                   # [NEW] Helpers
│   ├── riskColors.js        # Risk tier → color mapping
│   └── formatters.js        # Number/currency formatting
├── App.jsx                  # Master layout container
├── App.css                  # Component-scoped styles
├── index.css                # Global design system (dark theme)
└── main.jsx                 # React DOM entry point
```

---

## 3. Backend Stack (Teammate's Domain)

| Technology | Purpose |
|-----------|---------|
| **FastAPI** (Python) | High-performance async REST API |
| **SQLAlchemy** | ORM for database models |
| **SQLite** (dev) | Zero-config local database |
| **Pydantic** | Request/response schema validation |
| **Uvicorn** | ASGI server with hot-reload |
| **scikit-learn** | Gradient Boosting Classifier for risk scoring |
| **CORS** | Configured for `localhost:5173` (Vite) |

> **Frontend team does NOT touch backend.** We use `USE_MOCK = true` and build against `mockData.js` which mirrors the API contract exactly.

---

## 4. Database Schema (Reference Only — Backend Owns This)

### Core Tables
```sql
-- Road Segments (GeoJSON source)
segments (
  segment_id    TEXT PRIMARY KEY,     -- "BLR_ORR_014"
  corridor_id   TEXT NOT NULL,        -- "ORR"
  corridor_name TEXT,
  road_name     TEXT,
  road_type     TEXT,                 -- "trunk", "primary", "secondary"
  geometry      JSON,                 -- GeoJSON LineString
  safety_score  REAL,                 -- 0-100
  risk_tier     TEXT,                 -- "CRITICAL", "HIGH", "MEDIUM", "LOW"
  risk_score    REAL,                 -- 0-1 probability
  night_risk_multiplier REAL,
  primary_vulnerable_group TEXT,
  btp_station   TEXT,
  street_lighting TEXT,
  crossing_count INTEGER,
  bus_stop_count INTEGER,
  junction_count INTEGER
)

-- Blackspot Intelligence (Detailed)
blackspots (
  id            TEXT PRIMARY KEY,     -- "BLR-001"
  name          TEXT,
  location      TEXT,
  corridor_type TEXT,
  latitude      REAL,
  longitude     REAL,
  risk_score    INTEGER,              -- 0-100
  risk_level    TEXT,                 -- "Critical", "High"
  accident_count_2023 INTEGER,
  fatalities_2023 INTEGER,
  injuries_2023 INTEGER,
  primary_cause TEXT,
  causes_breakdown JSON,
  vulnerable_groups JSON,
  peak_risk_hours TEXT,
  future_prediction JSON,
  interventions JSON
)
```

---

## 5. API Integration Strategy

### Contract-First Development
The frontend team builds against a **frozen API contract** ([API_CONTRACT.md](./API_CONTRACT.md)). This allows parallel development.

### Mock Toggle Pattern
```javascript
// frontend/src/services/api.js
const USE_MOCK = true; // Toggle to false when backend is ready

export const apiService = {
  getHotspots: () => USE_MOCK 
    ? Promise.resolve(BANGALORE_HOTSPOTS)   // From mockData.js
    : fetch(`${BASE_URL}/api/v1/segments`).then(r => r.json()),
  
  getSegmentDetail: (id) => USE_MOCK
    ? Promise.resolve(BANGALORE_HOTSPOTS.find(h => h.id === id))
    : fetch(`${BASE_URL}/api/v1/segments/${id}`).then(r => r.json()),
  
  simulate: (segmentId, interventions) => USE_MOCK
    ? simulateMock(segmentId, interventions)  // Local calculation
    : fetch(`${BASE_URL}/api/v1/simulate`, { method: 'POST', body: JSON.stringify({ segment_id: segmentId, interventions }) }).then(r => r.json()),
  
  getFixThisFirst: (limit = 10) => USE_MOCK
    ? Promise.resolve(generateFixThisFirstMock())
    : fetch(`${BASE_URL}/api/v1/recommendations/fix-this-first?limit=${limit}`).then(r => r.json()),
};
```

### API Endpoints Summary
| Method | Endpoint | Frontend Component | Mock Source |
|--------|----------|-------------------|-------------|
| `GET` | `/health` | Status badge in Navbar | Hardcoded |
| `GET` | `/api/v1/segments` | RiskMap + SpotListSidebar | `BANGALORE_HOTSPOTS` |
| `GET` | `/api/v1/segments/{id}` | SpotInspector | Array find by ID |
| `POST` | `/api/v1/simulate` | Simulator | Local score calc |
| `GET` | `/api/v1/recommendations/fix-this-first` | FixThisFirst | Sorted by risk_score |

---

## 6. Authentication

### v1.0 (Hackathon): NONE
- No login, no auth, no sessions
- Public dashboard — any browser can access
- Reason: Eliminates friction for demo, judges don't want to create accounts

### v2.0 (Future): Role-Based Access
- JWT tokens via FastAPI OAuth2
- Roles: `admin`, `planner`, `viewer`
- Protected endpoints for simulation history and report export

---

## 7. Deployment Plan

### Hackathon Demo (v1.0)
| Component | Where | How |
|-----------|-------|-----|
| **Frontend** | `localhost:5173` | `npm run dev` (Vite) |
| **Backend** | `localhost:8000` | `uvicorn main:app --reload` |
| **Database** | Local SQLite | Auto-created on first run |
| **Demo Mode** | `USE_MOCK = true` | Frontend runs standalone |

### Production (v2.0 — if we win)
| Component | Platform | Reason |
|-----------|----------|--------|
| Frontend | Vercel / Netlify | Free tier, CDN, auto-deploy from GitHub |
| Backend | Railway / Render | Free tier, supports Python/FastAPI |
| Database | Supabase PostgreSQL | Free tier, managed, real-time capable |
| Map Tiles | Mapbox / OpenStreetMap | Free tier for low traffic |

---

## 8. Security Requirements

### v1.0 Hackathon Security
| Requirement | Implementation |
|-------------|---------------|
| No hardcoded secrets | No API keys in committed code |
| CORS properly configured | Only allow localhost origins |
| Input sanitization | Pydantic validates all request bodies |
| No SQL injection surface | SQLAlchemy ORM, parameterized queries |
| No XSS vectors | React auto-escapes JSX output |

### v2.0 Security (Future)
- HTTPS everywhere (Vercel/Railway default)
- Rate limiting on simulation endpoint
- CSP headers
- Environment variables for all secrets

---

## 9. Technical Decisions & Rationale

| Decision | Choice | Why | Alternative Rejected |
|----------|--------|-----|---------------------|
| **SPA vs SSR** | SPA (Vite + React) | Dashboard is a single-page app, no SEO needed | Next.js SSR — overkill for internal tool |
| **Map Library** | Leaflet (starting) | Already installed, free, no API key needed | Mapbox GL — needs API key, heavier |
| **CSS Approach** | Vanilla CSS | Full control over dark theme, no learning curve | Tailwind — inconsistent with command-center aesthetic |
| **State Management** | React useState/useEffect | Only 10 blackspots, simple state | Redux — way overkill for this data size |
| **Chart Library** | Recharts (recommended) | React-native, composable, good dark theme support | Chart.js — not React-first |
| **Mock Data Strategy** | In-app JS module | Zero latency, works offline, mirrors API contract | MSW — overhead for 5-hour hackathon |
| **Component Structure** | Flat directory | Simple, fast to navigate | Atomic Design — over-engineering for 10 components |
| **TypeScript vs JS** | JavaScript | Faster to write, no compile step, team velocity | TypeScript — adds overhead in hackathon context |

---

## 10. Performance Requirements

| Metric | Target | How We Achieve It |
|--------|--------|-------------------|
| First Contentful Paint | < 1.5s | Vite code splitting, no heavy imports |
| Map Load (10 markers) | < 1s | GeoJSON is < 21KB, lazy tile loading |
| Inspector Panel Open | < 200ms | Data already in memory (mock mode) |
| Simulator Calculation | < 500ms | Simple score arithmetic in mock mode |
| Bundle Size | < 500KB gzipped | No unnecessary dependencies |
| Lighthouse Performance | > 90 | Vanilla CSS, minimal JS, optimized assets |

---

## 11. Browser Support

| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | 120+ | Primary (demo browser) |
| Firefox | 115+ | Secondary |
| Safari | 17+ | Best effort |
| Edge | 120+ | Best effort |
| Mobile Chrome | 120+ | Responsive layout works |

---

## 12. Development Environment Setup

```bash
# 1. Clone and switch to frontend branch
git clone https://github.com/HexaCipher/team_042.git
cd team_042
git checkout frontend

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Start development server
npm run dev
# → Opens at http://localhost:5173

# 4. (Optional) Install recommended additional packages
npm i recharts framer-motion

# 5. (Optional) Start backend (teammate's responsibility)
cd ../backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
