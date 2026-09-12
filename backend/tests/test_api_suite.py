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
    assert len(data["features"]) == 17
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
    assert data["critical_priority_count"] == 27
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
    assert data["average_city_safety_score"] == 66.3
    assert len(data["corridor_breakdown"]) == 3
    assert "Two-Wheelers" in data["vru_vulnerability_breakdown"]
    assert data["risk_distribution"]["CRITICAL"]["segment_count"] == 27


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
