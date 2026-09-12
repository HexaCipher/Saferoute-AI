# SafeRoute AI — Frontend/Backend API Contract

**Base URL (Local Development)**: `http://localhost:8000`  
**Interactive Swagger UI**: `http://localhost:8000/docs`  
**ReDoc**: `http://localhost:8000/redoc`  
**CORS Allowed Origins**: `http://localhost:3000`, `http://localhost:5173`, `http://localhost:8000` (React, Vite, Next.js)

---

## 1. Health Check

### `GET /health`
Verifies backend server health and dataset readiness.

**Response (`200 OK`)**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "dataset_loaded": true,
  "total_segments": 184
}
```

---

## 2. Road Segments Map Layer (GeoJSON)

### `GET /api/v1/segments`
Returns all ~500m road segments as a standard GeoJSON `FeatureCollection`. Directly consumable by **Mapbox GL JS**, **Leaflet**, **Deck.gl**, or **Google Maps Data Layer**.

**Query Parameters (Optional)**:
- `corridor_id` (string, optional): Filter by corridor (e.g., `ORR`, `HOSUR`, `OMR_WHITEFIELD`).
- `risk_tier` (string, optional): Filter by tier (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- `min_safety_score` (float, optional): e.g., `0`
- `max_safety_score` (float, optional): e.g., `50`

**Response (`200 OK`)**:
```json
{
  "type": "FeatureCollection",
  "metadata": {
    "total_features": 184,
    "corridors": ["ORR", "HOSUR", "OMR_WHITEFIELD"],
    "score_scale": "0 to 100 (0 = Extreme Danger, 100 = Optimal Safety)"
  },
  "features": [
    {
      "type": "Feature",
      "id": "BLR_ORR_014",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [77.683412, 12.927901],
          [77.687245, 12.925832]
        ]
      },
      "properties": {
        "segment_id": "BLR_ORR_014",
        "corridor_id": "ORR",
        "corridor_name": "Outer Ring Road (Silk Board to Hebbal)",
        "road_name": "Outer Ring Road (Bellandur to Ecospace)",
        "road_type": "trunk",
        "segment_length_m": 492.5,
        "safety_score": 38.4,
        "risk_tier": "CRITICAL",
        "risk_score": 0.616,
        "night_risk_multiplier": 1.45,
        "primary_vulnerable_group": "Two-Wheelers",
        "btp_station": "H.S.R.Layout Traffic PS",
        "street_lighting": "unverified",
        "crossing_count": 0,
        "bus_stop_count": 2,
        "junction_count": 3
      }
    }
  ]
}
```

> **Color Coding Guide for Frontend Map**:
> - `CRITICAL` (Score 0–39): **Red** (`#EF4444`)
> - `HIGH` (Score 40–59): **Orange** (`#F97316`)
> - `MEDIUM` (Score 60–74): **Amber/Yellow** (`#FBBF24`)
> - `LOW` (Score 75–100): **Emerald Green** (`#10B981`)

---

## 3. Segment Details & Risk Explanation

### `GET /api/v1/segments/{segment_id}`
Returns complete infrastructure details, risk breakdown, and vulnerable road users for a selected segment (used in the side-drawer / modal when a user clicks a segment on the map).

**Path Parameters**:
- `segment_id` (string, required): e.g., `BLR_ORR_014`

**Response (`200 OK`)**:
```json
{
  "segment_id": "BLR_ORR_014",
  "corridor_id": "ORR",
  "corridor_name": "Outer Ring Road (Silk Board to Hebbal)",
  "road_name": "Outer Ring Road (Bellandur to Ecospace)",
  "geometry": {
    "type": "LineString",
    "coordinates": [[77.683412, 12.927901], [77.687245, 12.925832]]
  },
  "metrics": {
    "safety_score": 38.4,
    "risk_score": 0.616,
    "risk_tier": "CRITICAL",
    "confidence_level": "HIGH",
    "segment_length_m": 492.5
  },
  "infrastructure": {
    "road_type": "trunk",
    "lanes": 6,
    "lane_count_available": true,
    "speed_limit_kph": 60,
    "speed_limit_available": true,
    "street_lighting": "unverified",
    "street_lighting_verified": false,
    "junction_count": 3,
    "junction_density_per_km": 6.09,
    "crossing_count": 0,
    "bus_stop_count": 2
  },
  "btp_jurisdiction": {
    "station_name": "H.S.R.Layout Traffic PS",
    "overlap_ratio": 1.0,
    "historical_signals": {
      "total_crashes_2023": 295,
      "fatal_crashes_2023": 48,
      "fatalities_2023": 51,
      "injuries_2023": 268,
      "total_crashes_2022": 281
    }
  },
  "risk_explanation": {
    "summary": "High-speed trunk roadway with zero pedestrian crossings, active transit friction (2 bus stops), and unverified night street lighting.",
    "top_contributing_factors": [
      {
        "factor": "high_speed_limit",
        "label": "High Corridor Operating Speed (60 km/h)",
        "direction": "increases_risk",
        "relative_contribution_pct": 32.5
      },
      {
        "factor": "zero_crossings_with_transit",
        "label": "Transit Stops Without Safe Pedestrian Crossings",
        "direction": "increases_risk",
        "relative_contribution_pct": 28.1
      },
      {
        "factor": "junction_density",
        "label": "Weaving Conflict Points (6.1 junctions/km)",
        "direction": "increases_risk",
        "relative_contribution_pct": 22.4
      },
      {
        "factor": "unverified_lighting",
        "label": "Unverified Night Street Lighting",
        "direction": "increases_risk",
        "relative_contribution_pct": 17.0
      }
    ]
  },
  "vulnerable_road_users": {
    "primary_vulnerable_group": "Two-Wheelers",
    "two_wheeler_risk": "HIGH",
    "pedestrian_risk": "CRITICAL",
    "justification": "MoRTH benchmark: High speed differentials on multi-lane arterials create severe rear-end and weaving crash risks for two-wheelers, while commuters crossing between bus bays face extreme pedestrian vulnerability."
  }
}
```

**Error Response (`404 Not Found`)**:
```json
{
  "detail": "Segment with ID 'BLR_ORR_999' not found"
}
```

---

## 4. What-If Safety Simulator

### `POST /api/v1/simulate`
Simulates the impact of planned road safety interventions on a segment. Modifies model feature states and returns the recalculated Safety Score, score delta, and expected safety benefit.

**Supported Intervention Keys**:
- `street_lighting_upgrade`: Upgrades lighting from unverified/no to verified LED illumination.
- `speed_enforcement_camera`: Reduces operating speed differential and high-speed violations.
- `pedestrian_crossing_refuge`: Adds safe, high-visibility zebra/refuge crossing.
- `speed_calming_measures`: Installs rumble strips / speed breakers near conflict nodes.
- `junction_redesign`: Geometric channelization reducing conflict points.

**Request Body**:
```json
{
  "segment_id": "BLR_ORR_014",
  "interventions": [
    "street_lighting_upgrade",
    "speed_enforcement_camera",
    "pedestrian_crossing_refuge"
  ]
}
```

**Response (`200 OK`)**:
```json
{
  "segment_id": "BLR_ORR_014",
  "original_safety_score": 38.4,
  "simulated_safety_score": 67.2,
  "score_gain": 28.8,
  "original_risk_tier": "CRITICAL",
  "simulated_risk_tier": "MEDIUM",
  "expected_fatality_reduction_pct": 36.4,
  "simulated_features": {
    "street_lighting": "yes",
    "speed_limit_kph": 50,
    "crossing_count": 1
  },
  "intervention_breakdown": [
    {
      "intervention": "street_lighting_upgrade",
      "label": "High-Mast Smart LED Lighting",
      "isolated_score_gain": 12.1
    },
    {
      "intervention": "speed_enforcement_camera",
      "label": "Automated Speed Violation Radar",
      "isolated_score_gain": 9.5
    },
    {
      "intervention": "pedestrian_crossing_refuge",
      "label": "Grade-Separated / High-Vis Crossing",
      "isolated_score_gain": 7.2
    }
  ]
}
```

---

## 5. "Fix This First" Prioritization

### `GET /api/v1/recommendations/fix-this-first`
Returns an executive prioritized ranking for city planners and traffic police authorities. Identifies which road segments should be fixed first, why, and which single intervention yields the highest safety return.

**Query Parameters (Optional)**:
- `corridor_id` (string, optional): Filter to a specific corridor (e.g., `ORR`).
- `limit` (integer, optional, default: 10): Number of top priorities to return.

**Response (`200 OK`)**:
```json
{
  "total_analyzed_segments": 184,
  "critical_priority_count": 22,
  "recommendations": [
    {
      "priority_rank": 1,
      "segment_id": "BLR_ORR_014",
      "corridor_name": "Outer Ring Road (Silk Board to Hebbal)",
      "road_name": "Outer Ring Road (Bellandur to Ecospace)",
      "current_safety_score": 38.4,
      "current_risk_tier": "CRITICAL",
      "primary_vulnerable_group": "Two-Wheelers",
      "recommended_intervention": "street_lighting_upgrade",
      "recommended_intervention_label": "Install High-Mast LED Lighting & Speed Enforcement",
      "expected_safety_gain": 21.6,
      "simulated_safety_score": 60.0,
      "justification": "This segment has high traffic density with 2 transit stops and dark spot risks. Upgrading illumination and adding pedestrian refuges addresses the primary cause of night fatalities."
    }
  ]
}
```

---

## 6. City Analytics & Data Export

### `GET /api/v1/analytics/summary`
Returns city-level macro safety intelligence and aggregate KPIs across all monitored corridors. Perfect for top-level dashboard stat cards, pie/donut charts, and executive reporting.

**Response (`200 OK`)**:
```json
{
  "total_corridors_analyzed": 3,
  "total_road_network_km": 161.92,
  "total_segments": 428,
  "average_city_safety_score": 66.3,
  "risk_distribution": {
    "CRITICAL": {
      "segment_count": 27,
      "percentage": 6.3,
      "total_km": 3.02
    },
    "HIGH": {
      "segment_count": 136,
      "percentage": 31.8,
      "total_km": 52.1
    },
    "MEDIUM": {
      "segment_count": 134,
      "percentage": 31.3,
      "total_km": 52.14
    },
    "LOW": {
      "segment_count": 131,
      "percentage": 30.6,
      "total_km": 54.66
    }
  },
  "corridor_breakdown": [
    {
      "corridor_id": "ORR",
      "corridor_name": "Outer Ring Road (Silk Board to Hebbal)",
      "segment_count": 190,
      "length_km": 69.35,
      "average_safety_score": 66.0,
      "critical_segments": 17,
      "high_segments": 53
    },
    {
      "corridor_id": "OMR_WHITEFIELD",
      "corridor_name": "Old Madras Road / Whitefield Corridor",
      "segment_count": 164,
      "length_km": 63.37,
      "average_safety_score": 66.6,
      "critical_segments": 10,
      "high_segments": 53
    },
    {
      "corridor_id": "HOSUR",
      "corridor_name": "Hosur Road / Electronic City (NH 44)",
      "segment_count": 74,
      "length_km": 29.2,
      "average_safety_score": 66.6,
      "critical_segments": 0,
      "high_segments": 30
    }
  ],
  "vru_vulnerability_breakdown": {
    "Two-Wheelers": 90.0,
    "Two-Wheelers & Pedestrians": 8.2,
    "Pedestrians": 1.9
  },
  "infrastructure_highlights": {
    "verified_street_lighting_pct": 0.0,
    "unverified_or_unlit_km": 161.92,
    "total_crossings_cataloged": 742,
    "total_bus_stops_cataloged": 35,
    "avg_junction_density_per_km": 6.94
  },
  "projected_impact": {
    "critical_segments_count": 27,
    "critical_segments_km": 3.02,
    "estimated_casualty_reduction_if_critical_fixed_pct": 26.5,
    "top_recommended_intervention": "street_lighting_upgrade",
    "key_takeaway": "Addressing 27 critical segments (3.02 km out of 161.92 km network) with targeted lighting upgrades and speed enforcement delivers a projected 26.5% reduction in night-time severe crashes."
  }
}
```

---

### `GET /api/v1/analytics/export/csv`
Exports the entire road safety dataset or filtered subset as a clean, standardized CSV file with `Content-Disposition: attachment`.

**Query Parameters (Optional)**:
- `corridor_id` (string, optional): Filter by corridor (`ORR`, `HOSUR`, `OMR_WHITEFIELD`).
- `risk_tier` (string, optional): Filter by risk tier (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).

**Response (`200 OK`)**:
- Headers:
  - `Content-Type`: `text/csv; charset=utf-8`
  - `Content-Disposition`: `attachment; filename="saferoute_ai_bengaluru_safety_report.csv"`
- Output columns:
  `segment_id, corridor_id, corridor_name, road_name, road_type, segment_length_m, safety_score, risk_tier, risk_score, night_risk_multiplier, primary_vulnerable_group, btp_station, street_lighting, lanes, speed_limit_kph, crossing_count, bus_stop_count, junction_count, confidence_level`

---

## 7. Saved Simulations (Scenario Planner)

### `POST /api/v1/simulate/save`
Saves an evaluated What-If simulation into the persistent municipal database with a descriptive scenario name.

**Request Body**:
```json
{
  "segment_id": "BLR_ORR_006_2",
  "scenario_name": "BBMP FY26 Bellandur Night Safety Overhaul",
  "interventions": [
    "street_lighting_upgrade",
    "speed_enforcement_camera",
    "pedestrian_crossing_refuge"
  ],
  "created_by": "BBMP Traffic Engineering Cell"
}
```

**Response (`201 Created`)**:
```json
{
  "id": 1,
  "segment_id": "BLR_ORR_006_2",
  "scenario_name": "BBMP FY26 Bellandur Night Safety Overhaul",
  "original_safety_score": 29.1,
  "simulated_safety_score": 44.5,
  "score_gain": 15.4,
  "original_risk_tier": "CRITICAL",
  "simulated_risk_tier": "HIGH",
  "expected_fatality_reduction_pct": 20.8,
  "applied_interventions": [
    "street_lighting_upgrade",
    "speed_enforcement_camera",
    "pedestrian_crossing_refuge"
  ],
  "created_by": "BBMP Traffic Engineering Cell",
  "created_at": "2026-09-12T14:00:00Z"
}
```

### `GET /api/v1/simulate/saved`
Retrieves all persisted simulation scenarios for review and comparison.

**Response (`200 OK`)**: List of `SavedSimulationResponse` objects.

---

## 8. Municipal Action Tracker (Project Management)

### `GET /api/v1/actions`
Retrieves all tracked road safety projects across Bengaluru corridors.

**Query Parameters (Optional)**:
- `status` (string, optional): Filter by `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`.
- `agency` (string, optional): Filter by `BBMP`, `BTP`, `NHAI`, `DULT`.

**Response (`200 OK`)**:
```json
[
  {
    "id": 1,
    "segment_id": "BLR_ORR_006_2",
    "corridor_name": "Outer Ring Road (Silk Board to Hebbal)",
    "road_name": "Outer Ring Road (Bellandur Ecospace)",
    "intervention_type": "street_lighting_upgrade",
    "intervention_label": "High-Mast Smart LED Lighting Upgrade",
    "status": "IN_PROGRESS",
    "priority_tier": "CRITICAL",
    "assigned_agency": "BBMP",
    "allocated_budget_lakhs": 45.0,
    "notes": "Smart LED installation tender awarded; poles delivery scheduled for next week.",
    "target_date": "2026-10-30",
    "created_at": "2026-09-12T13:30:00Z",
    "updated_at": "2026-09-12T13:30:00Z"
  }
]
```

### `POST /api/v1/actions`
Creates a new tracked engineering or enforcement project.

**Request Body**:
```json
{
  "segment_id": "BLR_ORR_014_1",
  "corridor_name": "Outer Ring Road (Silk Board to Hebbal)",
  "road_name": "Outer Ring Road (Kadubeesanahalli)",
  "intervention_type": "speed_enforcement_camera",
  "intervention_label": "Automated Speed Violation Radar (ANPR)",
  "priority_tier": "CRITICAL",
  "assigned_agency": "BTP",
  "allocated_budget_lakhs": 12.0,
  "notes": "BTP approved speed radar placement to curb nighttime overspeeding.",
  "target_date": "2026-10-15"
}
```

### `PATCH /api/v1/actions/{action_id}`
Updates the status, budget, or notes of an existing project.

**Request Body**:
```json
{
  "status": "COMPLETED",
  "allocated_budget_lakhs": 42.5,
  "notes": "Installation verified by BTP field inspection."
}
```

### `DELETE /api/v1/actions/{action_id}`
Deletes an action item. Returns `{"message": "Action item {id} deleted successfully"}`.
