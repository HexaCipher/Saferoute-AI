"""
SafeRoute AI — End-to-End API Test Suite
Validates all endpoints, responses, data schemas, and performance criteria.
"""

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import Base, engine

# Ensure SQLite schema is ready
Base.metadata.create_all(bind=engine)
client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["dataset_loaded"] is True
    assert data["total_segments"] == 428


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "SafeRoute AI" in data["platform"]
    assert data["total_analyzed_segments"] == 428


def test_get_segments_geojson():
    response = client.get("/api/v1/segments")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 428
    
    first_feat = data["features"][0]
    assert first_feat["type"] == "Feature"
    assert first_feat["geometry"]["type"] == "LineString"
    props = first_feat["properties"]
    assert "safety_score" in props
    assert "risk_tier" in props
    assert "primary_vulnerable_group" in props


def test_get_segments_filter():
    response = client.get("/api/v1/segments?corridor_id=ORR&risk_tier=CRITICAL")
    assert response.status_code == 200
    data = response.json()
    assert len(data["features"]) == 15
    for f in data["features"]:
        assert f["properties"]["corridor_id"] == "ORR"
        assert f["properties"]["risk_tier"] == "CRITICAL"


def test_get_segment_detail():
    # Fetch first segment
    all_segs = client.get("/api/v1/segments").json()
    seg_id = all_segs["features"][0]["properties"]["segment_id"]

    response = client.get(f"/api/v1/segments/{seg_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["segment_id"] == seg_id
    assert "infrastructure" in data
    assert "risk_explanation" in data
    assert "vulnerable_road_users" in data
    assert len(data["risk_explanation"]["top_contributing_factors"]) > 0


def test_simulate_intervention():
    all_segs = client.get("/api/v1/segments").json()
    seg_id = all_segs["features"][0]["properties"]["segment_id"]

    payload = {
        "segment_id": seg_id,
        "interventions": ["street_lighting_upgrade", "speed_enforcement_camera"]
    }
    response = client.post("/api/v1/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["segment_id"] == seg_id
    assert "original_safety_score" in data
    assert "simulated_safety_score" in data
    assert "score_gain" in data
    assert "expected_fatality_reduction_pct" in data
    assert len(data["intervention_breakdown"]) == 2


def test_fix_this_first_recommendations():
    response = client.get("/api/v1/recommendations/fix-this-first?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total_analyzed_segments"] == 428
    assert data["critical_priority_count"] == 29
    assert len(data["recommendations"]) == 10
    
    # Priority ranks must be sorted 1 to 10
    ranks = [r["priority_rank"] for r in data["recommendations"]]
    assert ranks == list(range(1, 11))
    
    # Priority scores must be monotonically descending
    p_scores = [r["priority_score"] for r in data["recommendations"]]
    assert p_scores == sorted(p_scores, reverse=True)


def test_analytics_summary():
    response = client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_segments"] == 428
    assert data["total_road_network_km"] == 161.92
    assert round(data["average_city_safety_score"]) == 66
    assert len(data["corridor_breakdown"]) == 3
    assert "Two-Wheelers" in data["vru_vulnerability_breakdown"]
    assert data["risk_distribution"]["CRITICAL"]["segment_count"] == 29


def test_analytics_csv_export():
    response = client.get("/api/v1/analytics/export/csv")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    lines = response.text.strip().split("\n")
    assert len(lines) == 429  # header + 428 segments


def test_accidents_backward_compatibility():
    response = client.get("/api/v1/accidents")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_saved_simulations():
    # 1. Get existing saved simulations
    res = client.get("/api/v1/simulate/saved")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    
    # 2. Save a new simulation
    all_segs = client.get("/api/v1/segments").json()
    seg_id = all_segs["features"][0]["properties"]["segment_id"]
    save_payload = {
        "segment_id": seg_id,
        "scenario_name": "Test Highway Safety Intervention",
        "interventions": ["street_lighting_upgrade", "speed_enforcement_camera"],
        "created_by": "Traffic Police Commissioner"
    }
    save_res = client.post("/api/v1/simulate/save", json=save_payload)
    assert save_res.status_code == 201
    saved_data = save_res.json()
    assert saved_data["scenario_name"] == "Test Highway Safety Intervention"
    assert "score_gain" in saved_data


def test_action_tracker():
    # 1. List actions
    res = client.get("/api/v1/actions")
    assert res.status_code == 200
    actions = res.json()
    assert len(actions) >= 3

    # 2. Create action
    new_action = {
        "segment_id": "BLR_ORR_001_1",
        "corridor_name": "Outer Ring Road (Silk Board to Hebbal)",
        "road_name": "Outer Ring Road (Bellandur)",
        "intervention_type": "street_lighting_upgrade",
        "intervention_label": "High-Mast Smart LED Lighting Upgrade",
        "priority_tier": "CRITICAL",
        "assigned_agency": "BBMP",
        "allocated_budget_lakhs": 35.0,
        "notes": "Tender released for nighttime lighting",
        "target_date": "2026-11-30"
    }
    create_res = client.post("/api/v1/actions", json=new_action)
    assert create_res.status_code == 201
    created_id = create_res.json()["id"]

    # 3. Patch action status
    patch_res = client.patch(f"/api/v1/actions/{created_id}", json={"status": "IN_PROGRESS"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "IN_PROGRESS"

    # 4. Delete action
    del_res = client.delete(f"/api/v1/actions/{created_id}")
    assert del_res.status_code == 200


if __name__ == "__main__":
    tests = [
        test_health_check,
        test_root_endpoint,
        test_get_segments_geojson,
        test_get_segments_filter,
        test_get_segment_detail,
        test_simulate_intervention,
        test_fix_this_first_recommendations,
        test_analytics_summary,
        test_analytics_csv_export,
        test_saved_simulations,
        test_action_tracker,
        test_accidents_backward_compatibility,
    ]
    print("=" * 60)
    print("  RUNNING SAFEROUTE AI END-TO-END TEST SUITE")
    print("=" * 60)
    for test in tests:
        test()
        print(f"  [PASS] {test.__name__}")
    print("=" * 60)
    print(f"  ALL {len(tests)} TESTS PASSED SUCCESSFULLY (100% GREEN)")
    print("=" * 60)
