# SafeRoute AI — Segment Feature Data Dictionary

This document defines the segment-level data schema for **SafeRoute AI (Bengaluru NightRide)**. Each record represents a discrete ~500-metre roadway segment.

---

## 1. Identifiers & Spatial Geometry

| Field | Type | Description | Source |
| :--- | :--- | :--- | :--- |
| `segment_id` | `String` | Unique persistent identifier (e.g., `BLR_ORR_014`). | Derived (Pipeline) |
| `corridor_name` | `String` | Strategic corridor name (e.g., `Outer Ring Road`, `Hosur Road`). | OSM Corridor Filter |
| `geometry` | `LineString` | WGS84 coordinates `[[lon, lat], ...]` tracing the center-line. | OpenStreetMap (OSM) |
| `start_lat`, `start_lon` | `Float` | Latitude/Longitude of segment origin. | OSM Edge Geometry |
| `end_lat`, `end_lon` | `Float` | Latitude/Longitude of segment terminus. | OSM Edge Geometry |
| `segment_length_m` | `Float` | Actual segment length in metres (~450m – 550m). | Projected Haversine / Shapely |

---

## 2. Roadway & Infrastructure Attributes (OSM)

| Field | Type | Description | Source |
| :--- | :--- | :--- | :--- |
| `road_type` | `String` | OSM functional hierarchy (`trunk`, `primary`, `secondary`, `tertiary`). | OSM `highway` tag |
| `lanes` | `Integer` | Number of travel lanes (both directions combined). Imputed by road class mode if unmapped. | OSM `lanes` tag |
| `speed_limit_kph` | `Integer` | Operating speed limit (km/h). Defaults to Bengaluru Traffic Police corridor rules (50 or 60 km/h). | OSM `maxspeed` / BTP notification |
| `junction_count` | `Integer` | Number of intersecting street nodes along the segment. | OSM Network Topology |
| `junction_density_per_km` | `Float` | Conflict point density ($junction\_count \times 1000 / length\_m$). | Derived |
| `crossing_count` | `Integer` | Count of zebra / signalized pedestrian crossings within 30m. | OSM `highway=crossing` |
| `bus_stop_count` | `Integer` | Count of BMTC transit stops / bus bays along the segment. | OSM `highway=bus_stop` |
| `street_lighting` | `Integer` | Binary flag (1 = street lights present, 0 = unlit/dark spot). | OSM `lit=yes` |

---

## 3. Police Jurisdiction & Historical Macro Signal (BTP)

| Field | Type | Description | Source |
| :--- | :--- | :--- | :--- |
| `btp_station` | `String` | Name of governing BTP Traffic Police Station. | Spatial Intersection (KGIS KML) |
| `btp_zone` | `String` | Police operational zone (`East`, `West`, `North`, `South`). | BTP 2023 Records |
| `station_total_crashes_2023` | `Integer` | Total annual crashes recorded in this jurisdiction. | BTP 2023 Records |
| `station_fatal_crashes_2023` | `Integer` | Fatal crash count recorded in this jurisdiction. | BTP 2023 Records |
| `station_deaths_2023` | `Integer` | Total fatalities recorded in this jurisdiction. | BTP 2023 Records |
| `station_injuries_2023` | `Integer` | Total injuries recorded in this jurisdiction. | BTP 2023 Records |
| `station_fatality_ratio` | `Float` | Fatal crash share ($\text{fatal\_crashes} / \text{total\_crashes}$). | Derived |

---

## 4. Night-Time & Vulnerable User Calibration (MoRTH / NCRB)

| Field | Type | Description | Source |
| :--- | :--- | :--- | :--- |
| `night_risk_multiplier` | `Float` | Empirically grounded night severity factor (1.45× on high-speed unlit corridors, 1.15× on lit CBD streets). | MoRTH 2022/2023 Calibration |
| `two_wheeler_vulnerability` | `String` | Qualitative vulnerability index for two-wheelers (`CRITICAL`, `HIGH`, `MODERATE`). | Model Estimate (Speed + Junctions) |
| `pedestrian_vulnerability` | `String` | Qualitative risk index for pedestrians (`CRITICAL`, `HIGH`, `MODERATE`). | Model Estimate (Bus Stops vs Crossings) |
| `primary_vulnerable_group` | `String` | Most endangered road user cohort on this segment. | Model Decision Engine |

---

## 5. Predictive Model Outputs & Decision Support

| Field | Type | Description | Source |
| :--- | :--- | :--- | :--- |
| `predicted_risk_score` | `Float` | Normalized segment crash risk index ($0.0 \le \text{risk} \le 1.0$). | ML Model (Gradient Boosting / Hybrid) |
| `safety_score` | `Float` | Inverted user-facing metric ($100 \times [1 - \text{risk}]$) on a 0–100 scale. | Derived from `predicted_risk_score` |
| `risk_tier` | `String` | Categorical risk band (`CRITICAL`: 0–39, `HIGH`: 40–59, `MEDIUM`: 60–74, `LOW`: 75–100). | Threshold Mapping |
| `confidence_level` | `String` | Data reliability rating (`HIGH`, `MEDIUM`, `LOW`) based on exact spatial join and OSM attribute completeness. | Methodological Rule |
| `top_risk_factors` | `List[Dict]` | Feature contributions explaining *why* the segment is risky. | Tree Feature Importance / SHAP |
| `recommended_fix` | `Dict` | Top prioritized engineering intervention and expected safety gain. | Intervention Engine |
