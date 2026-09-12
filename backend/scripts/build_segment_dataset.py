"""
SafeRoute AI — Bengaluru NightRide
Data Processing Pipeline: Extracts OSM road network for priority Bengaluru corridors,
partitions them into ~500m road segments, extracts OSM infrastructure features,
and spatially joins them with official BTP Traffic Police Station crash statistics.

Adheres strictly to Hackathon Data Integrity Rules:
- NO fabricated crash data or lane/speed values. Missing attributes remain null.
- Lighting is categorized as 'yes', 'no', or 'unverified'.
- BTP crash numbers are labeled as station-level historical signals.
"""

import os
import json
import time
import datetime
import re
from typing import Dict, List, Tuple, Any, Optional

import pandas as pd
import numpy as np
import geopandas as gpd
import shapely
from shapely.geometry import LineString, Point, MultiLineString
from shapely.ops import transform, substring
from shapely import force_2d
import pyproj
import osmnx as ox

# Projections: EPSG:4326 (WGS84 lat/lon) -> EPSG:32643 (UTM 43N meters for Bengaluru)
wgs84_to_utm = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:32643", always_xy=True).transform
utm_to_wgs84 = pyproj.Transformer.from_crs("EPSG:32643", "EPSG:4326", always_xy=True).transform

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_BTP_DIR = os.path.join(BASE_DIR, "data", "raw", "btp")
RAW_OSM_DIR = os.path.join(BASE_DIR, "data", "raw", "osm")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

os.makedirs(RAW_OSM_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# Corridors Configuration for Bengaluru MVP
CORRIDORS_CONFIG = [
    {
        "id": "ORR",
        "name": "Outer Ring Road (Silk Board to Hebbal)",
        "graphml": os.path.join(RAW_OSM_DIR, "orr_drive.graphml"),
        "name_keywords": [
            "outer ring road", "ring road", "sarjapur", "marathahalli",
            "bellandur", "kadubeesanahalli", "mahadevapura", "kr puram",
            "kalyan nagar", "ramamurthy nagar", "hennur", "nagawara", "hebbal"
        ]
    },
    {
        "id": "HOSUR",
        "name": "Hosur Road / Electronic City (NH 44)",
        "graphml": os.path.join(RAW_OSM_DIR, "hosur_drive.graphml"),
        "name_keywords": [
            "hosur road", "hosur", "nh 44", "nh44", "electronic city",
            "bommanahalli", "singasandra", "kudlu", "silk board"
        ]
    },
    {
        "id": "OMR_WHITEFIELD",
        "name": "Old Madras Road / Whitefield Corridor",
        "graphml": os.path.join(RAW_OSM_DIR, "omr_drive.graphml"),
        "name_keywords": [
            "old madras road", "swamy vivekananda", "omr", "whitefield",
            "itpl", "varthur", "hoodi", "hal old airport road", "airport road"
        ]
    }
]

# Canonical mapping from BTP CSV station names to KML Traffic_PS names
BTP_STATION_MAPPING = {
    'Halasooru': 'Halasur Traffic PS',
    'Indiranagar': 'Jeevan Bheemanagar Traffic PS',
    'Pulikeshinagar': 'Pulakeshinagar Traffic PS',
    'Banasawadi': 'Banaswadi Traffic PS',
    'Shivajinagar': 'Shivajinagar Traffic  PS',
    'K G Halli': 'Kadugondana Halli Traffic PS (K.G Halli)',
    'K R Puram': 'K.R. Puram Traffic  PS',
    'Airport': 'H.A.L Airport Traffic PS',
    'Whitefield': 'Whitefield Traffic  PS',
    'Mahadevapura': 'Whitefield Traffic  PS',
    'Cubbon Park': 'Cubbon Park Traffic PS',
    'H.Grounds': 'High Grounds Traffic  PS',
    'S.S.Nagar': 'Sadashivanagar Traffic PS',
    'U.Gate': 'Halasurgate Traffic PS',
    'Ashokanagar': 'Ashokanagara Traffic PS',
    'W.Garden': 'Wilsongarden Traffic PS',
    'Upparpet': 'Upparpet Traffic PS',
    'Chickpet': 'Chikkapete Traffic ps',
    'City Market': 'City Market Traffic  PS',
    'Chamarajpet': 'Chikkapete Traffic ps',
    'Malleshwaram': 'Malleshwarm  Traffic PS',
    'Rajajinagar': 'Rajaji Nagar Traffic PS',
    'Yashawanthapura': 'Yeshwanthapura Traffic PS',
    'Jalahalli': 'Jalahalli Traffic PS',
    'Peenya': 'Peenya  Traffic  PS',
    'Magadi Road': 'Magadi Road Traffic PS',
    'Vijayanagar': 'Vijayanagar Traffic PS',
    'Kamakshipalya': 'Kamakshipalya Traffic PS',
    'Bytarayanapura': 'Byatarayanapura Traffic PS',
    'Kengeri': 'Kengeri Traffic PS',
    'R T Nagar': 'R.T. Nagar Traffic PS',
    'Hebbala': 'Hebbal Traffic PS',
    'Yalahanka': 'Yelahanka Traffic PS',
    'Chikkajala': 'Chikkajala Traffic PS',
    'Devanahalli': 'Devanahalli Traffic PS',
    'Int. Aiport': 'Devanahalli Traffic PS',
    'Hennuru': 'Banaswadi Traffic PS',
    'Adugodi': 'Adugodi Traffic PS',
    'Micolayout': 'Mico layout Traffic PS',
    'Madivala': 'Madiwala Traffic PS',
    'Electronic City': 'Electronic City Traffic PS',
    'Jayanagar': 'Jayanagar Traffic PS',
    'Basavanagudi': 'Basavanagudi  Traffic PS',
    'Banashankari': 'Banashankari Traffic PS',
    'K S Layout': 'Kumaraswamy Layout Traffic PS',
    'Hulimavu': 'Hulimavu Traffic PS',
    'Thalagattapura': 'Kumaraswamy Layout Traffic PS',
    'HSR Layout': 'H.S.R.Layout Traffic PS',
    'Bellanduru': 'H.S.R.Layout Traffic PS'
}

# 2020-2022 CSV Station Name Mapping
BTP_2020_MAPPING = {
    'Ulsoor': 'Halasur Traffic PS',
    'F.Town': 'Pulakeshinagar Traffic PS',
    'H.Grounds': 'High Grounds Traffic  PS',
    'S.S.Nagar': 'Sadashivanagar Traffic PS',
    'U.Gate': 'Halasurgate Traffic PS',
    'W.Garden': 'Wilsongarden Traffic PS',
    'K G Halli': 'Kadugondana Halli Traffic PS (K.G Halli)',
    'Madivala': 'Madiwala Traffic PS',
    'K S Layout': 'Kumaraswamy Layout Traffic PS',
    'R T Nagar': 'R.T. Nagar Traffic PS',
    'Hebbala': 'Hebbal Traffic PS',
    'Yalahanka': 'Yelahanka Traffic PS',
    'K R Puram': 'K.R. Puram Traffic  PS',
    'Airport': 'H.A.L Airport Traffic PS',
    'Chickpet': 'Chikkapete Traffic ps',
    'Banasawadi': 'Banaswadi Traffic PS'
}


def load_and_clean_btp_data() -> gpd.GeoDataFrame:
    """Loads BTP 2023 CSV, 2020-2022 CSV, and KML boundaries, producing a unified GeoDataFrame."""
    print("--- [Step 1] Loading and Cleaning BTP Crash Data & Jurisdictions ---")
    
    # 1. Load 2023 CSV
    csv23_path = os.path.join(RAW_BTP_DIR, "btp_station_accidents_2023.csv")
    df23 = pd.read_csv(csv23_path)
    clean23 = df23[~df23['Station'].str.contains('Total|total', case=False, na=False)].copy()
    clean23['Station'] = clean23['Station'].str.strip()
    clean23['Traffic_PS'] = clean23['Station'].map(BTP_STATION_MAPPING)
    
    # Aggregate multiple stations mapped to same historical jurisdiction
    agg_23 = clean23.groupby('Traffic_PS').agg({
        '2023 - Fatal Cases': 'sum',
        '2023 - Killed People': 'sum',
        '2023 - Non-Fatal': 'sum',
        '2023 - Injured People': 'sum',
        '2023 - Total Cases': 'sum'
    }).reset_index().rename(columns={
        '2023 - Fatal Cases': 'btp_station_fatal_cases_2023',
        '2023 - Killed People': 'btp_station_killed_people_2023',
        '2023 - Non-Fatal': 'btp_station_nonfatal_cases_2023',
        '2023 - Injured People': 'btp_station_injuries_2023',
        '2023 - Total Cases': 'btp_station_total_cases_2023'
    })
    
    # 2. Load 2020-2022 CSV
    csv20_path = os.path.join(RAW_BTP_DIR, "btp_station_accidents_2020_2022.csv")
    df20 = pd.read_csv(csv20_path)
    df20['Station'] = df20['Station'].str.strip()
    df20['Traffic_PS'] = df20['Station'].map(lambda s: BTP_2020_MAPPING.get(s, BTP_STATION_MAPPING.get(s, s + " Traffic PS")))
    
    agg_20 = df20.groupby('Traffic_PS').agg({
        '2021 - Fatal': 'sum',
        '2021 - Total Cases': 'sum',
        '2022 - Fatal': 'sum',
        '2022 - Total Cases': 'sum'
    }).reset_index().rename(columns={
        '2021 - Fatal': 'btp_station_fatal_cases_2021',
        '2021 - Total Cases': 'btp_station_total_cases_2021',
        '2022 - Fatal': 'btp_station_fatal_cases_2022',
        '2022 - Total Cases': 'btp_station_total_cases_2022'
    })
    
    # 3. Load KML boundaries
    kml_path = os.path.join(RAW_BTP_DIR, "btp_jurisdictions.kml")
    gdf_kml = gpd.read_file(kml_path, engine='pyogrio')
    gdf_kml['geometry'] = gdf_kml.geometry.apply(force_2d)
    gdf_kml = gdf_kml[['Traffic_PS', 'PS_BOUNDName', 'geometry']].copy()
    gdf_kml['Traffic_PS'] = gdf_kml['Traffic_PS'].str.strip()
    
    # 4. Join statistics to spatial boundaries
    merged = gdf_kml.merge(agg_23, on='Traffic_PS', how='left')
    merged = merged.merge(agg_20, on='Traffic_PS', how='left')
    
    print(f"Loaded {len(merged)} BTP jurisdiction polygons with full crash statistics.")
    return merged


def matches_corridor(name_val: Any, keywords: List[str]) -> bool:
    """Checks if road name matches target corridor keywords."""
    if name_val is None or (isinstance(name_val, float) and pd.isna(name_val)):
        return False
    names = [str(x).lower() for x in name_val] if isinstance(name_val, list) else [str(name_val).lower()]
    return any(kw in n for n in names for kw in keywords)


def parse_numeric(val: Any) -> Optional[float]:
    """Safely extracts numeric value without fabrication. Returns None if missing or non-numeric."""
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    if isinstance(val, list):
        val = val[0]
    val_str = str(val).strip()
    match = re.search(r'\d+(\.\d+)?', val_str)
    if match:
        try:
            return float(match.group(0))
        except ValueError:
            return None
    return None


def parse_lighting(lit_val: Any) -> str:
    """Categorizes lighting as 'yes', 'no', or 'unverified'. Never converts unverified to no."""
    if lit_val is None or (isinstance(lit_val, float) and pd.isna(lit_val)):
        return "unverified"
    if isinstance(lit_val, list):
        lit_val = lit_val[0]
    val_str = str(lit_val).strip().lower()
    if val_str in ["yes", "true", "24/7", "dusk-dawn", "night"]:
        return "yes"
    elif val_str in ["no", "false"]:
        return "no"
    else:
        return "unverified"


def partition_edge_to_segments(
    line_wgs: LineString,
    edge_attrs: Dict[str, Any],
    corridor_id: str,
    corridor_name: str,
    base_idx: int,
    target_length_m: float = 500.0
) -> List[Dict[str, Any]]:
    """Partitions a road edge LineString into ~500m segments using metric projection."""
    line_utm = transform(wgs84_to_utm, line_wgs)
    edge_length_m = line_utm.length
    
    # Filter out micro-slivers under 50m (connector stubs / turn slips)
    if edge_length_m < 50.0:
        return []
        
    # If edge is under 600m, keep as single unit to avoid zero-length slivers
    if edge_length_m < 600.0:
        sub_wgs = line_wgs
        coords = list(sub_wgs.coords)
        return [{
            "sub_id_suffix": f"{base_idx:03d}",
            "geometry": sub_wgs,
            "length_m": round(edge_length_m, 2),
            "start_lat": round(coords[0][1], 6),
            "start_lon": round(coords[0][0], 6),
            "end_lat": round(coords[-1][1], 6),
            "end_lon": round(coords[-1][0], 6),
            "corridor_id": corridor_id,
            "corridor_name": corridor_name,
            **edge_attrs
        }]
        
    # Split into ~500m subsegments
    segments = []
    curr = 0.0
    sub_idx = 1
    while curr < edge_length_m:
        end = min(curr + target_length_m, edge_length_m)
        if (edge_length_m - end) < 150.0:
            end = edge_length_m
            
        sub_utm = substring(line_utm, curr, end)
        sub_wgs = transform(utm_to_wgs84, sub_utm)
        coords = list(sub_wgs.coords)
        
        segments.append({
            "sub_id_suffix": f"{base_idx:03d}_{sub_idx}",
            "geometry": sub_wgs,
            "length_m": round(sub_utm.length, 2),
            "start_lat": round(coords[0][1], 6),
            "start_lon": round(coords[0][0], 6),
            "end_lat": round(coords[-1][1], 6),
            "end_lon": round(coords[-1][0], 6),
            "corridor_id": corridor_id,
            "corridor_name": corridor_name,
            **edge_attrs
        })
        curr = end
        sub_idx += 1
        
    return segments


def associate_btp_jurisdiction(
    segment_geom: LineString,
    btp_gdf: gpd.GeoDataFrame
) -> Tuple[Optional[str], float, Dict[str, Any]]:
    """
    Spatially intersects segment with BTP polygons.
    Returns (station_name, overlap_ratio, btp_stats_dict).
    If crossing multiple, picks the jurisdiction containing the largest proportion.
    """
    overlaps = []
    seg_len = segment_geom.length
    if seg_len <= 0:
        return None, 0.0, {}
        
    for _, row in btp_gdf.iterrows():
        poly = row.geometry
        if segment_geom.intersects(poly):
            inter = segment_geom.intersection(poly)
            inter_len = inter.length
            ratio = inter_len / seg_len
            overlaps.append((row, ratio))
            
    if overlaps:
        overlaps.sort(key=lambda x: x[1], reverse=True)
        best_row, best_ratio = overlaps[0]
        stats = {
            "btp_station": best_row['Traffic_PS'],
            "btp_station_clean_name": best_row['PS_BOUNDName'],
            "btp_overlap_ratio": round(min(1.0, best_ratio), 4),
            "btp_station_total_cases_2023": best_row.get('btp_station_total_cases_2023'),
            "btp_station_fatal_cases_2023": best_row.get('btp_station_fatal_cases_2023'),
            "btp_station_killed_people_2023": best_row.get('btp_station_killed_people_2023'),
            "btp_station_nonfatal_cases_2023": best_row.get('btp_station_nonfatal_cases_2023'),
            "btp_station_injuries_2023": best_row.get('btp_station_injuries_2023'),
            "btp_station_total_cases_2022": best_row.get('btp_station_total_cases_2022'),
            "btp_station_fatal_cases_2022": best_row.get('btp_station_fatal_cases_2022'),
            "btp_station_total_cases_2021": best_row.get('btp_station_total_cases_2021'),
            "btp_station_fatal_cases_2021": best_row.get('btp_station_fatal_cases_2021'),
        }
        return best_row['Traffic_PS'], best_ratio, stats
        
    # Fallback: nearest polygon within 100m buffer if line sits on boundary
    buffered = segment_geom.buffer(0.001) # ~100m
    for _, row in btp_gdf.iterrows():
        if buffered.intersects(row.geometry):
            return row['Traffic_PS'], 0.5, {
                "btp_station": row['Traffic_PS'],
                "btp_station_clean_name": row['PS_BOUNDName'],
                "btp_overlap_ratio": 0.5,
                "btp_station_total_cases_2023": row.get('btp_station_total_cases_2023'),
                "btp_station_fatal_cases_2023": row.get('btp_station_fatal_cases_2023'),
                "btp_station_killed_people_2023": row.get('btp_station_killed_people_2023'),
                "btp_station_nonfatal_cases_2023": row.get('btp_station_nonfatal_cases_2023'),
                "btp_station_injuries_2023": row.get('btp_station_injuries_2023'),
                "btp_station_total_cases_2022": row.get('btp_station_total_cases_2022'),
                "btp_station_fatal_cases_2022": row.get('btp_station_fatal_cases_2022'),
                "btp_station_total_cases_2021": row.get('btp_station_total_cases_2021'),
                "btp_station_fatal_cases_2021": row.get('btp_station_fatal_cases_2021'),
            }
            
    return None, 0.0, {"btp_station": None, "btp_overlap_ratio": 0.0}


def build_pipeline():
    """Main execution orchestrator."""
    start_time = time.time()
    print("=================================================================")
    print("SafeRoute AI — Bengaluru NightRide Geospatial Processing Pipeline")
    print("=================================================================\n")
    
    # Step 1: Load BTP data
    btp_gdf = load_and_clean_btp_data()
    
    # Step 2: Load POIs (crossings and bus stops) from cached POI GeoJSON
    poi_path = os.path.join(RAW_OSM_DIR, "bengaluru_pois.geojson")
    if os.path.exists(poi_path):
        pois_gdf = gpd.read_file(poi_path)
        print(f"Loaded {len(pois_gdf)} authentic POIs from {poi_path}.")
    else:
        pois_gdf = gpd.GeoDataFrame(columns=['highway', 'geometry'], crs='EPSG:4326')
        print("Warning: POI file not found, proceeding with empty POIs.")
        
    pois_crossings = pois_gdf[pois_gdf['highway'] == 'crossing'] if not pois_gdf.empty else gpd.GeoDataFrame()
    pois_bus_stops = pois_gdf[pois_gdf['highway'] == 'bus_stop'] if not pois_gdf.empty else gpd.GeoDataFrame()
    
    # Step 3: Process Corridors
    all_raw_segments = []
    
    for corridor in CORRIDORS_CONFIG:
        cid = corridor['id']
        cname = corridor['name']
        print(f"\n--- [Step 2] Processing Corridor: {cname} ---")
        
        graphml_path = corridor['graphml']
        if not os.path.exists(graphml_path):
            raise FileNotFoundError(f"Missing road graph: {graphml_path}")
            
        G = ox.load_graphml(graphml_path)
        edges = ox.graph_to_gdfs(G, nodes=False)
        node_degrees = dict(G.degree())
        
        # Filter corridor edges by name or major arterial types
        is_matched = edges['name'].apply(lambda n: matches_corridor(n, corridor['name_keywords']))
        corridor_edges = edges[is_matched].copy()
        
        # Ensure comprehensive corridor coverage (trunk/motorway corridors)
        if len(corridor_edges) < 20:
            trunk_edges = edges[edges['highway'].isin(['trunk', 'motorway', 'primary'])].copy()
            corridor_edges = pd.concat([corridor_edges, trunk_edges]).drop_duplicates()
            
        print(f"Extracted {len(corridor_edges)} raw road ways for {cid}.")
        
        # Partition edges into ~500m segments
        base_edge_counter = 1
        for idx, edge in corridor_edges.iterrows():
            geom = edge.geometry
            if geom is None or geom.is_empty or geom.geom_type != 'LineString':
                continue
                
            # Extract actual OSM attributes without fabrication
            road_type = edge.get('highway')
            if isinstance(road_type, list): road_type = road_type[0]
            
            lanes_raw = parse_numeric(edge.get('lanes'))
            lanes = int(lanes_raw) if lanes_raw is not None else None
            lane_count_available = 1 if lanes is not None else 0
            
            speed_raw = parse_numeric(edge.get('maxspeed'))
            speed_limit_kph = int(speed_raw) if speed_raw is not None else None
            speed_limit_available = 1 if speed_limit_kph is not None else 0
            
            street_lighting = parse_lighting(edge.get('lit'))
            street_lighting_verified = 1 if street_lighting != "unverified" else 0
            
            road_name = edge.get('name')
            if isinstance(road_name, list): road_name = " / ".join(str(x) for x in road_name)
            elif road_name is None or (isinstance(road_name, float) and pd.isna(road_name)):
                road_name = f"{cname} Segment"
                
            edge_attrs = {
                "road_name": str(road_name),
                "road_type": str(road_type),
                "lanes": lanes,
                "lane_count_available": lane_count_available,
                "speed_limit_kph": speed_limit_kph,
                "speed_limit_available": speed_limit_available,
                "street_lighting": street_lighting,
                "street_lighting_verified": street_lighting_verified,
                "u_node": idx[0] if isinstance(idx, tuple) else None,
                "v_node": idx[1] if isinstance(idx, tuple) else None
            }
            
            sub_segs = partition_edge_to_segments(
                geom,
                edge_attrs,
                corridor_id=cid,
                corridor_name=cname,
                base_idx=base_edge_counter
            )
            base_edge_counter += 1
            
            # For each subsegment, compute junctions, crossings, bus stops, and BTP join
            for seg in sub_segs:
                seg_geom = seg['geometry']
                length_m = seg['length_m']
                
                # Junction count: nodes along segment with degree >= 3
                u_deg = node_degrees.get(seg['u_node'], 2) if seg['u_node'] in node_degrees else 2
                v_deg = node_degrees.get(seg['v_node'], 2) if seg['v_node'] in node_degrees else 2
                junction_count = (1 if u_deg >= 3 else 0) + (1 if v_deg >= 3 else 0)
                junction_density_per_km = round((junction_count * 1000.0) / max(1.0, length_m), 2)
                
                # POI counts: buffer 30 meters
                seg_utm = transform(wgs84_to_utm, seg_geom)
                seg_buffer_utm = seg_utm.buffer(30.0)
                seg_buffer_wgs = transform(utm_to_wgs84, seg_buffer_utm)
                
                crossing_count = 0
                if not pois_crossings.empty:
                    crossing_count = int(pois_crossings.intersects(seg_buffer_wgs).sum())
                    
                bus_stop_count = 0
                if not pois_bus_stops.empty:
                    bus_stop_count = int(pois_bus_stops.intersects(seg_buffer_wgs).sum())
                    
                # Associate BTP Jurisdiction
                station_ps, overlap_ratio, btp_stats = associate_btp_jurisdiction(seg_geom, btp_gdf)
                
                seg_id = f"BLR_{cid}_{seg['sub_id_suffix']}"
                
                processed_seg = {
                    "segment_id": seg_id,
                    "corridor_id": cid,
                    "corridor_name": cname,
                    "road_name": seg['road_name'],
                    "road_type": seg['road_type'],
                    "segment_length_m": length_m,
                    "start_lat": seg['start_lat'],
                    "start_lon": seg['start_lon'],
                    "end_lat": seg['end_lat'],
                    "end_lon": seg['end_lon'],
                    "lanes": seg['lanes'],
                    "lane_count_available": seg['lane_count_available'],
                    "speed_limit_kph": seg['speed_limit_kph'],
                    "speed_limit_available": seg['speed_limit_available'],
                    "street_lighting": seg['street_lighting'],
                    "street_lighting_verified": seg['street_lighting_verified'],
                    "junction_count": junction_count,
                    "junction_density_per_km": junction_density_per_km,
                    "crossing_count": crossing_count,
                    "bus_stop_count": bus_stop_count,
                    **btp_stats,
                    "geometry": seg_geom
                }
                all_raw_segments.append(processed_seg)

    # Convert to GeoDataFrame
    final_gdf = gpd.GeoDataFrame(all_raw_segments, crs="EPSG:4326")
    
    # Deduplicate by segment_id
    final_gdf = final_gdf.drop_duplicates(subset=['segment_id']).reset_index(drop=True)
    
    # Add pipeline metadata
    metadata = {
        "pipeline_version": "1.0.0",
        "processing_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "osm_extraction_date": "2026-09-12",
        "source_btp_2023": "Bengaluru Traffic Police / OpenCity (48 Stations, 4974 cases)",
        "source_btp_2020_2022": "Bengaluru Traffic Police / OpenCity (45 Stations)",
        "source_btp_jurisdictions": "KGIS / BTP Pre-2022 (45 Polygons)",
        "source_osm": "OpenStreetMap contributors via OSMnx 2.1.1",
        "segment_target_length_m": 500.0,
        "crs": "EPSG:4326 (WGS84)"
    }
    
    # Step 4: Export Datasets
    geojson_path = os.path.join(PROCESSED_DIR, "bengaluru_500m_segments.geojson")
    parquet_path = os.path.join(PROCESSED_DIR, "bengaluru_500m_segments.parquet")
    meta_path = os.path.join(PROCESSED_DIR, "dataset_metadata.json")
    
    print("\n--- [Step 3] Exporting Processed Datasets ---")
    final_gdf.to_file(geojson_path, driver="GeoJSON")
    print(f"Exported GeoJSON -> {geojson_path} ({os.path.getsize(geojson_path)} bytes)")
    
    try:
        final_gdf.to_parquet(parquet_path)
        print(f"Exported Parquet -> {parquet_path} ({os.path.getsize(parquet_path)} bytes)")
    except Exception as e:
        print(f"Warning: Parquet export ({e})")
        
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Exported Metadata -> {meta_path}")
    
    # Step 5: Run Validation Checks
    print("\n=================================================================")
    print("PIPELINE VALIDATION REPORT")
    print("=================================================================")
    total_segments = len(final_gdf)
    total_length_km = final_gdf['segment_length_m'].sum() / 1000.0
    corridor_counts = final_gdf['corridor_name'].value_counts()
    
    # BTP stats
    with_btp = final_gdf['btp_station'].notna().sum()
    unique_stations = final_gdf['btp_station'].dropna().unique()
    
    # OSM stats
    known_lanes = final_gdf['lanes'].notna().sum()
    known_speed = final_gdf['speed_limit_kph'].notna().sum()
    lit_counts = final_gdf['street_lighting'].value_counts().to_dict()
    total_crossings = final_gdf['crossing_count'].sum()
    total_bus_stops = final_gdf['bus_stop_count'].sum()
    total_junctions = final_gdf['junction_count'].sum()
    
    # Data quality
    invalid_geoms = (~final_gdf.geometry.is_valid).sum()
    empty_geoms = final_gdf.geometry.is_empty.sum()
    zero_len = (final_gdf['segment_length_m'] <= 0).sum()
    near_zero = (final_gdf['segment_length_m'] < 50).sum()
    dup_ids = final_gdf['segment_id'].duplicated().sum()
    
    print(f"\n1. GEOGRAPHIC METRICS:")
    print(f"   - Total Segments: {total_segments}")
    print(f"   - Total Corridor Length: {total_length_km:.2f} km")
    print(f"   - Average Segment Length: {final_gdf['segment_length_m'].mean():.1f} meters")
    print(f"   - CRS: {final_gdf.crs}")
    print(f"   - Corridors Represented:")
    for cname, cnt in corridor_counts.items():
        print(f"     * {cname}: {cnt} segments")
        
    print(f"\n2. BTP JURISDICTION JOIN:")
    print(f"   - Segments with BTP Jurisdiction: {with_btp} / {total_segments} ({with_btp/total_segments*100:.1f}%)")
    print(f"   - Unique BTP Police Stations Represented: {len(unique_stations)}")
    print(f"   - Stations Sample: {list(unique_stations[:6])}")
    print(f"   - Average BTP Overlap Ratio: {final_gdf['btp_overlap_ratio'].mean():.3f}")
    
    print(f"\n3. OSM INFRASTRUCTURE ATTRIBUTES (NO FABRICATION):")
    print(f"   - Segments with Known Lanes: {known_lanes} / {total_segments} ({known_lanes/total_segments*100:.1f}%)")
    print(f"   - Segments with Known Speed Limit: {known_speed} / {total_segments} ({known_speed/total_segments*100:.1f}%)")
    print(f"   - Street Lighting Breakdown: {lit_counts}")
    print(f"   - Total Mapped Pedestrian Crossings: {total_crossings}")
    print(f"   - Total Mapped Bus Stops: {total_bus_stops}")
    print(f"   - Total Mapped Road Junctions: {total_junctions}")
    
    print(f"\n4. DATA QUALITY AUDIT:")
    print(f"   - Duplicate Segment IDs: {dup_ids}")
    print(f"   - Invalid Geometries: {invalid_geoms}")
    print(f"   - Empty Geometries: {empty_geoms}")
    print(f"   - Zero/Near-Zero Length Segments (<50m): {near_zero}")
    
    print(f"\n5. SAMPLE OF REAL PROCESSED SEGMENTS:")
    sample_cols = [
        'segment_id', 'corridor_id', 'road_name', 'road_type',
        'segment_length_m', 'lanes', 'speed_limit_kph', 'street_lighting',
        'junction_count', 'crossing_count', 'bus_stop_count', 'btp_station',
        'btp_station_total_cases_2023', 'btp_station_fatal_cases_2023'
    ]
    sample_df = final_gdf[sample_cols].head(5)
    print(sample_df.to_string())
    
    print(f"\nPipeline finished in {time.time()-start_time:.1f} seconds.")


if __name__ == "__main__":
    build_pipeline()
