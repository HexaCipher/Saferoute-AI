# Product Requirements Document (PRD)
## RoadSafe AI — Predictive Road Safety Intelligence Platform
**Version:** 1.0 | **Date:** September 2026 | **Team:** 042 | **Hackathon:** IBM Bob National 2026

---

## 1. App Overview

RoadSafe AI is a **predictive road safety command center** built for Bengaluru. It transforms raw accident data from MoRTH (Ministry of Road Transport & Highways) and BTP (Bengaluru Traffic Police) into actionable intelligence — mapping exactly where, why, when, and who is at risk on the city's deadliest corridors.

Unlike static crash-pin maps, RoadSafe AI provides:
- **Risk Scores (0–100)** per 500m road segment
- **Explainable AI** that breaks down WHY a segment is dangerous
- **What-If Simulator** that lets planners test interventions before spending ₹1
- **"Fix This First"** ranked prioritization for city authorities

**One-line pitch:** *"From crash data to saved lives — an AI command center that tells city planners exactly which road to fix first, why, and what will happen if they do."*

---

## 2. Target Users

### Primary Users
| User | Role | What They Need |
|------|------|---------------|
| **City Traffic Commissioner (BTP)** | Decision-maker | Top 10 most dangerous corridors, ranked by urgency |
| **Urban Planner (BBMP/DULT)** | Infrastructure designer | Which intervention yields maximum lives saved per ₹ spent |
| **Road Safety Officer (MoRTH)** | Policy enforcer | District-level risk dashboards, compliance tracking |

### Secondary Users
| User | Role | What They Need |
|------|------|---------------|
| **Hackathon Judges / IBM Evaluators** | Evaluators | Clean demo, clear data story, working simulator |
| **Data Journalists / RTI Researchers** | Transparency | Exportable corridor risk reports |
| **Citizen Advocacy Groups** | Public safety | Visual evidence for road safety campaigns |

---

## 3. Problem Statement

### The Reality
- **1,013 accidents** across 10 major Bengaluru corridors in 2023 alone
- **165 fatalities** — predominantly two-wheeler riders (52–64%) and pedestrians (22–54%)
- **₹84.5 Crore** estimated economic loss from preventable road deaths
- Most accidents cluster at **10 known blackspots** but no data system connects cause → intervention → outcome

### The Gap
Current approach is **reactive**: accidents happen → FIR filed → data sits in spreadsheets → politicians announce random flyovers. There is **no system** that:
1. Scores road segments by future risk probability
2. Explains the root cause of danger (speed? lighting? junctions?)
3. Simulates intervention impact before money is spent
4. Prioritizes which segment to fix first based on lives-saved-per-rupee

### Our Solution
RoadSafe AI fills this gap with a **predictive + prescriptive** intelligence loop:
```
Raw Data → Risk Scoring → Causal Explanation → What-If Simulation → Prioritized Action Plan
```

---

## 4. Core Features

### F1: Interactive Risk Heatmap (Bengaluru Command Map)
- Full-screen Leaflet/Mapbox map of Bengaluru
- 10 blackspot markers color-coded by risk tier:
  - 🔴 **CRITICAL** (Score 0–39): `#EF4444`
  - 🟠 **HIGH** (Score 40–59): `#F97316`
  - 🟡 **MEDIUM** (Score 60–74): `#FBBF24`
  - 🟢 **LOW** (Score 75–100): `#10B981`
- Click any marker → opens Segment Intelligence Drawer
- Pulsing animation on critical markers
- Dark satellite/terrain basemap for command-center aesthetic

### F2: City-Wide KPI Summary Strip
- 4 headline metric cards at the top:
  - Total Accidents (2023)
  - Total Fatalities
  - Critical Zones Count
  - Potential Lives Saveable (AI-modeled)
- Live-feeling counters with micro-animations

### F3: Corridor Browser Sidebar
- Searchable, filterable list of all 10 blackspots
- Filter by: Risk Level (Critical/High/Medium), Corridor Type
- Each card shows: Name, Risk Score badge, Accident Count, Primary Cause
- Click → selects on map + opens inspector panel

### F4: Segment Intelligence Panel (SpotInspector)
- Deep-dive drawer for selected blackspot:
  - **Risk Score** with circular gauge visualization
  - **Cause Breakdown** — horizontal bar chart showing contributing factors %
  - **Vulnerable Groups** — donut/pie chart (Two-Wheelers, Pedestrians, etc.)
  - **Peak Risk Hours** — timeline visualization
  - **Future Prediction** — quarterly trend, predicted accidents, severity forecast
  - **Ranked Interventions** — card list with cost, lives saved, timeframe

### F5: What-If Safety Simulator
- Select a segment → choose interventions (checkboxes):
  - Street Lighting Upgrade
  - Speed Enforcement Camera
  - Pedestrian Crossing Refuge
  - Speed Calming Measures
  - Junction Redesign
- Click "Simulate" → animated score transition showing:
  - Original Score → Simulated Score
  - Risk Tier change (e.g., CRITICAL → MEDIUM)
  - Expected fatality reduction %
  - Per-intervention score gain breakdown

### F6: "Fix This First" Prioritization View
- Executive summary table/cards ranking segments by urgency
- Shows: Rank, Segment Name, Current Score, Recommended Intervention, Expected Gain
- Sortable by: Risk Score, Fatality Count, Cost-Effectiveness

---

## 5. User Stories

### US-01: Traffic Commissioner Views City Risk Overview
> **As a** Traffic Commissioner,  
> **I want to** see all high-risk corridors on a map with color-coded severity,  
> **So that** I can quickly identify which areas need immediate attention.

**Acceptance Criteria:**
- Map loads within 2 seconds with all 10 blackspots
- Color coding matches risk tier specification
- Hovering shows tooltip with segment name + risk score

### US-02: Urban Planner Investigates a Blackspot
> **As an** Urban Planner,  
> **I want to** click a blackspot and see exactly why it's dangerous,  
> **So that** I can design the right intervention instead of guessing.

**Acceptance Criteria:**
- Inspector panel opens with full cause breakdown
- Contributing factors shown as percentage bars
- Vulnerable groups displayed with share percentages

### US-03: Planner Simulates an Intervention
> **As a** Planner,  
> **I want to** select safety interventions and see the predicted impact,  
> **So that** I can justify budget allocation with data.

**Acceptance Criteria:**
- User can select 1–5 interventions via checkboxes
- Simulated score updates within 1 second
- Shows score delta, tier change, and fatality reduction %

### US-04: Commissioner Asks "What Should We Fix First?"
> **As a** Commissioner,  
> **I want to** see a ranked list of most urgent segments with recommended actions,  
> **So that** I can allocate resources to save the most lives per rupee.

**Acceptance Criteria:**
- Top 10 ranked list loads with justification text
- Each entry shows recommended intervention + expected safety gain
- List is sortable by different priority criteria

### US-05: User Searches for a Specific Corridor
> **As a** user,  
> **I want to** search for a corridor by name (e.g., "Silk Board"),  
> **So that** I can quickly find and analyze a specific location.

**Acceptance Criteria:**
- Search filters in real-time as user types
- Matching results highlight in the sidebar list
- Clicking a result selects it on the map

---

## 6. MVP Scope (Hackathon v1.0)

### ✅ In Scope (Must Ship)
| Feature | Priority |
|---------|----------|
| Interactive Bengaluru risk map with 10 blackspots | P0 |
| City-wide KPI summary cards | P0 |
| Corridor browser sidebar with search/filter | P0 |
| Segment intelligence panel with cause + vulnerability breakdown | P0 |
| What-If simulator with intervention selection | P0 |
| "Fix This First" prioritization view | P0 |
| Dark command-center theme | P0 |
| Mock data mode (works without backend) | P0 |
| Responsive layout (desktop-first, tablet-acceptable) | P1 |

### ❌ Out of Scope (v2.0+)
| Feature | Reason |
|---------|--------|
| User authentication / login | Not needed for hackathon demo |
| Multi-city support | Bengaluru-only for v1 |
| Real-time live data feeds | Static dataset is sufficient |
| Mobile native app | Web-only for hackathon |
| Export to PDF/Excel | Nice-to-have, not MVP |
| Admin panel / CMS | Not needed |
| Notification / alerting system | Post-hackathon |
| Historical trend comparison (year-over-year) | Data limitation |

---

## 7. Success Metrics

### Demo Day Metrics
| Metric | Target |
|--------|--------|
| Page Load Time (First Meaningful Paint) | < 2 seconds |
| Map Interaction Responsiveness | < 200ms per click |
| Simulator Response Time | < 1 second |
| All 10 Blackspots Visible on Map | 100% |
| Zero Console Errors During Demo | 0 errors |
| Judge Engagement ("Wow factor") | Positive reaction to map + simulator |

### Product Impact Metrics (Theoretical)
| Metric | Benchmark |
|--------|-----------|
| Potential Lives Saved (Modeled) | 68 per year |
| Economic Loss Prevented | ₹84.5 Crore |
| Critical Segments Identified | 5 of 10 |
| Vision Zero 2030 Progress | -50% fatality target tracking |

---

## 8. Features to AVOID in v1

| Anti-Feature | Why Avoid |
|--------------|-----------|
| **Chatbot / AI Assistant** | Looks gimmicky in a data product; judges want clean analytics, not chat |
| **Purple/Neon AI aesthetic** | Screams "AI-generated"; we need Palantir-grade seriousness |
| **Placeholder images / Lorem ipsum** | Real data only; our 10 blackspots are curated with real Bengaluru corridors |
| **Complex auth flows** | Zero login friction for demo |
| **Over-animated transitions** | Subtle micro-animations only; no bouncing cards or spinning loaders |
| **Generic chart library demo** | Every chart must serve a specific analytical purpose |
| **Feature bloat** | Better to have 5 polished features than 15 half-baked ones |
| **Mobile-first design** | Desktop command center is the primary viewport for judges |

---

## 9. Demo Script (3-Minute Walk-Through)

1. **Open** → Dashboard loads with Bengaluru map, 10 pulsing blackspots, KPI strip
2. **Observe** → "Bengaluru had 1,013 accidents in 2023. 165 people died. Here's where."
3. **Click** Silk Board Junction (highest risk) → Inspector opens with full intelligence
4. **Explain** → "Risk Score 94/100. Primary cause: lane weaving & pedestrian conflict."
5. **Simulate** → Select "Pedestrian Skywalk" + "Speed Camera" → Score jumps 38 → 67
6. **Show** → "Fix This First" panel → "Here's the ranked priority list for the Commissioner."
7. **Close** → "This isn't a map. It's a decision engine that saves lives."
