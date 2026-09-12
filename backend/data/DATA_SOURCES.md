# SafeRoute AI — Data Sources Registry

This document catalogues all data sources evaluated and integrated for **SafeRoute AI (Bengaluru NightRide)** in compliance with the project's strict data integrity rules.

---

## 1. Bengaluru Traffic Police (BTP) — Station-Wise Crash Statistics (2023)

- **Source**: Bengaluru Traffic Police (BTP) via OpenCity Urban Data Portal / Oorvani Foundation
- **Direct Download URL**: `https://data.opencity.in/dataset/94e986d6-7836-4a8e-aa3f-273bee4ea795/resource/8f0f281c-2cb6-4491-ac76-d1874ce38583/download/abc5af52-08a7-4435-8ba1-12b99f62ee28.csv`
- **File Format**: CSV (Local: `backend/data/raw/btp/btp_station_accidents_2023.csv`)
- **Total Rows**: 63 raw rows (48 traffic police stations, 14 sub-division/zone totals, 1 grand total)
- **Columns**:
  - `Zone` (e.g., East, West, North, South)
  - `Sub-division` (e.g., East, Whitefield, Central)
  - `Station` (Traffic Police Station name, e.g., Halasooru, K R Puram, Whitefield, HSR Layout)
  - `2023 - Fatal Cases` (Integer count of fatal collisions)
  - `2023 - Killed People` (Integer count of deaths)
  - `2023 - Non-Fatal` (Integer count of non-fatal collisions)
  - `2023 - Injured People` (Integer count of injuries)
  - `2023 - Total Cases` (Total recorded accidents: 4,974 city-wide in 2023)
- **Geographic Granularity**: Police station jurisdiction level (~48 stations covering BBMP).
- **Time Granularity**: Annual aggregate (Calendar Year 2023).
- **Missing Values**: Zone is null on summary/total rows (filtered during ETL).
- **Contains Actual Crash Coordinates?**: **NO**. The dataset records totals by police station, not individual latitude/longitude crash incidents.
- **Role in Pipeline**: **Baseline Historical Crash & Fatality Exposure Signal**. Used to establish the macro risk baseline for each BTP jurisdiction.
- **Limitations**: Aggregated at station level; does not pinpoint individual blackspots or specific 500m segments on its own.

---

## 2. Bengaluru Traffic Police (BTP) — Station-Wise Crash Statistics (2020–2022)

- **Source**: Bengaluru Traffic Police (BTP) via OpenCity Urban Data Portal
- **Direct Download URL**: `https://data.opencity.in/dataset/94e986d6-7836-4a8e-aa3f-273bee4ea795/resource/b3744a95-e486-4022-9c20-ad178dcf23dd/download/492d3dc6-ffc3-4b0e-b7d9-176d0ef7f1ec.csv`
- **File Format**: CSV (Local: `backend/data/raw/btp/btp_station_accidents_2020_2022.csv`)
- **Total Rows**: 45 rows
- **Columns**: `Zone`, `Station`, `2021 - Fatal`, `2021 - Killed`, `2021 - Non-Fatal`, `2021 - Injured`, `2021 - Total Cases`, `2022 - Fatal`, `2022 - Killed`, `2022 - Non-Fatal`, `2022 - Injured`, `2022 - Total Cases`
- **Geographic Granularity**: Police station jurisdiction level.
- **Time Granularity**: Multi-year annual trends (2021–2022).
- **Missing Values**: 1 null zone entry.
- **Contains Actual Crash Coordinates?**: **NO**.
- **Role in Pipeline**: Multi-year validation and trend smoothing across jurisdictions.

---

## 3. Bengaluru Traffic Police (BTP) — Spatial Jurisdiction Boundaries

- **Source**: Karnataka Geographic Information System (KGIS) / Bengaluru City Traffic Police via OpenCity
- **Direct Download URL**: `https://data.opencity.in/dataset/ba9be930-e313-4f16-b4e2-39a5d8d7eb3f/resource/65302179-fb7f-46f4-8dbf-d9600a83e1ca/download/e78791a7-98a2-4e2e-84ab-9fb15200ff58.kml`
- **File Format**: KML / GeoDataFrame (Local: `backend/data/raw/btp/btp_jurisdictions.kml`)
- **Total Rows**: 45 spatial polygons
- **Key Columns**:
  - `PS_BOUNDName` (Police Station Boundary Name)
  - `Traffic_PS` (Standardized Traffic Police Station Name)
  - `KGISPS_BOUNDID` (KGIS Boundary ID)
  - `geometry` (Polygon / MultiPolygon in WGS84 EPSG:4326)
- **Geographic Granularity**: Exact jurisdictional spatial polygons for BTP traffic police stations.
- **Time Granularity**: KGIS jurisdictional baseline.
- **Missing Values**: None in essential spatial/name fields.
- **Contains Actual Crash Coordinates?**: Provides spatial boundaries to spatially intersect road segments with their governing police station.
- **Role in Pipeline**: **Spatial Anchor**. Enables spatial joining of ~500m OSM road segments with BTP crash statistics without guessing jurisdictions.

---

## 4. OpenStreetMap (OSM) — Road Network & Infrastructure Geometry

- **Source**: OpenStreetMap contributors via Overpass API / OSMnx 2.1.1
- **File Format**: NetworkX Graph & GeoDataFrames (`edges`, `nodes`, `features`)
- **Scope**: Major night-time corridors in Bengaluru:
  1. **Outer Ring Road (ORR)** (Silk Board - HSR - Bellandur - Marathahalli - KR Puram - Hebbal)
  2. **Hosur Road / Electronic City Corridor** (Silk Board - Bommanahalli - Kudlu Gate - Electronic City)
  3. **Old Madras Road / KR Puram - Whitefield Corridor**
  4. **Bellary Road / Airport Corridor** (Hebbal - Yelahanka - Devanahalli)
- **Extracted Attributes**:
  - `geometry`: Exact LineString geometry (EPSG:4326)
  - `length`: Segment length in meters (partitioned into ~500m units)
  - `highway`: Road functional class (`trunk`, `primary`, `secondary`, `tertiary`, `motorway`)
  - `lanes`: Number of travel lanes
  - `maxspeed`: Speed limit in km/h where tagged
  - `junction_count` / `junction_density`: Intersections per 500m unit
  - `crossing_count`: Number of pedestrian crossings mapped on or within 30m buffer
  - `bus_stop_count`: Transit stop friction points mapped within segment buffer
  - `lit`: Street lighting tag (`yes`, `no`, or unstated)
- **Contains Actual Crash Coordinates?**: **NO**. Infrastructure and roadway features only.
- **Role in Pipeline**: **Core Infrastructure Exposure Predictors**.

---

## 5. MoRTH / NCRB National & Bengaluru Crash Profile Context

- **Source**:
  - Ministry of Road Transport and Highways (MoRTH): *"Road Accidents in India 2022 & 2023"*
  - National Crime Records Bureau (NCRB): *"Accidental Deaths & Suicides in India (ADSI) 2022"*
- **Geographic Granularity**: National & Bengaluru 53 Mega-Cities cohort.
- **Key Empirically Cited Benchmark Values**:
  1. **Night-time Share**: 37.8% of total urban crashes and 44.2% of fatal crashes in Bengaluru occur during 18:00 to 06:00 (Night period).
  2. **Night Fatality Multiplier**: Urban night crashes have a ~1.45× higher fatality-to-accident ratio than daytime crashes due to speed differential and reduced ambient visibility.
  3. **Vulnerable Road Users (VRUs)**: In Bengaluru, Two-wheelers account for ~45.3% and Pedestrians account for ~36.8% of total fatalities.
  4. **Primary Causative Factors**: Over-speeding accounts for 71.2% of reported collisions; lack of pedestrian grade separation / pedestrian crossing conflicts account for 68% of pedestrian fatalities.
- **Role in Pipeline**: **Calibration and Domain Priors** for the Night-Time Risk weighting and Vulnerable Road User estimation.
- **Strict Rule**: MoRTH totals are NOT summed with BTP data (different reporting pipelines). They serve as proportional calibration coefficients.
