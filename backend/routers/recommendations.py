"""
SafeRoute AI — Recommendations Router
Endpoint for 'Fix This First' decision support.
"""

from fastapi import APIRouter, Query
from typing import Optional
from backend.services.prioritizer import prioritizer
from backend.schemas import RecommendationsResponse

router = APIRouter()


@router.get("/fix-this-first", response_model=RecommendationsResponse)
def get_fix_this_first(
    corridor_id: Optional[str] = Query(None, description="Filter to a specific corridor (e.g., 'ORR', 'HOSUR')"),
    limit: int = Query(15, ge=1, le=50, description="Max number of priority recommendations to return")
):
    """
    Returns prioritized road segments for city authorities, highlighting the single
    highest-impact intervention and expected safety score gain.
    """
    return prioritizer.get_fix_this_first_recommendations(
        corridor_id=corridor_id,
        limit=limit
    )
