import { BANGALORE_CORRIDORS, CITY_OVERVIEW_METRICS, CORRIDOR_POLYLINES } from './mockData';

// Live toggle: set to false when backend FastAPI is active on localhost:8000
const USE_MOCK = false;
const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiService = {
  async getCorridors(filterSeverity = 'ALL') {
    if (USE_MOCK) {
      if (!filterSeverity || filterSeverity === 'ALL') {
        return BANGALORE_CORRIDORS;
      }
      return BANGALORE_CORRIDORS.filter(
        (spot) => spot.risk_tier.toUpperCase() === filterSeverity.toUpperCase()
      );
    }

    try {
      // 1. Fetch live backend segments & priority recommendations in parallel
      const [segmentsRes, fixRes] = await Promise.all([
        fetch(`${API_BASE_URL}/segments`),
        fetch(`${API_BASE_URL}/recommendations/fix-this-first?limit=25`)
      ]);

      if (!segmentsRes.ok && !fixRes.ok) {
        throw new Error('Backend endpoints unavailable');
      }

      const fixData = fixRes.ok ? await fixRes.json() : null;

      // Map backend recommendations & segments to enrich BANGALORE_CORRIDORS with live ML scores
      const enrichedCorridors = BANGALORE_CORRIDORS.map(corridor => {
        let matchedRec = null;
        if (fixData && fixData.recommendations) {
          matchedRec = fixData.recommendations.find(r => 
            r.road_name?.toLowerCase().includes(corridor.name.toLowerCase()) ||
            corridor.name.toLowerCase().includes(r.road_name?.toLowerCase()) ||
            r.corridor_id === (corridor.highway.includes('ORR') ? 'ORR' : corridor.highway.includes('HOSUR') ? 'HOSUR' : 'OMR_WHITEFIELD')
          );
        }

        // Live backend ML risk calculation if matched
        if (matchedRec) {
          const liveRiskScore = Math.round(100 - matchedRec.current_safety_score);
          return {
            ...corridor,
            backend_segment_id: matchedRec.segment_id,
            risk_score: liveRiskScore || corridor.risk_score,
            risk_tier: matchedRec.current_risk_tier === 'CRITICAL' ? 'Critical' : matchedRec.current_risk_tier === 'HIGH' ? 'High' : corridor.risk_tier,
            status_tag: `${matchedRec.current_risk_tier} RISK`,
            backend_justification: matchedRec.justification,
            backend_intervention_label: matchedRec.recommended_intervention_label
          };
        }
        return corridor;
      });

      if (!filterSeverity || filterSeverity === 'ALL') {
        return enrichedCorridors;
      }
      return enrichedCorridors.filter(
        (spot) => spot.risk_tier.toUpperCase() === filterSeverity.toUpperCase()
      );
    } catch (err) {
      console.warn('Backend live fetch failed, using calibrated fallback data:', err);
      return filterSeverity === 'ALL' 
        ? BANGALORE_CORRIDORS 
        : BANGALORE_CORRIDORS.filter(s => s.risk_tier.toUpperCase() === filterSeverity.toUpperCase());
    }
  },

  async getCityMetrics() {
    if (USE_MOCK) return CITY_OVERVIEW_METRICS;

    try {
      const response = await fetch(`${API_BASE_URL}/analytics/summary`);
      if (!response.ok) throw new Error('Analytics summary unavailable');
      const data = await response.json();

      return {
        ...CITY_OVERVIEW_METRICS,
        total_analyzed_segments: data.total_segments || 428,
        total_road_network_km: data.total_road_network_km || 161.92,
        critical_zones_count: data.risk_distribution?.CRITICAL?.segment_count || 29,
        high_risk_count: data.risk_distribution?.HIGH?.segment_count || 125,
        medium_risk_count: data.risk_distribution?.MEDIUM?.segment_count || 134,
        average_safety_score: data.average_city_safety_score || 66.2,
        motorcyclist_fatalities_pct: Math.round(data.vru_vulnerability_breakdown?.["Two-Wheelers"] || 59),
        modeled_lives_saveable: Math.round((data.projected_impact?.estimated_casualty_reduction_if_critical_fixed_pct || 26.5) * 2.2)
      };
    } catch (err) {
      console.warn('Backend live analytics unavailable, using local metrics:', err);
      return CITY_OVERVIEW_METRICS;
    }
  },

  async getCorridorById(id) {
    return BANGALORE_CORRIDORS.find((c) => c.id === id) || BANGALORE_CORRIDORS[0];
  },

  async getCorridorPolylines() {
    return CORRIDOR_POLYLINES;
  },

  // Interactive What-If Simulation calculations
  simulateInterventions(corridor, selectedInterventionIds) {
    if (!corridor || !corridor.interventions) return null;

    const chosen = corridor.interventions.filter((i) => selectedInterventionIds.includes(i.id));
    const totalReduction = chosen.reduce((acc, curr) => acc + curr.reduction_num, 0);
    const cappedReduction = Math.min(Math.round(totalReduction * 0.85), 82);
    const totalLivesSaved = chosen.reduce((acc, curr) => acc + curr.lives_num, 0);
    const totalCostLakhs = chosen.reduce((acc, curr) => acc + curr.cost_num, 0);
    const newRiskScore = Math.max(Math.round(corridor.risk_score * (1 - cappedReduction / 100)), 18);
    const newExpectedCrashes = Math.max(Math.round(corridor.stats_2023.crashes * (1 - cappedReduction / 100)), 12);

    return {
      original_risk_score: corridor.risk_score,
      simulated_risk_score: newRiskScore,
      score_reduction_points: corridor.risk_score - newRiskScore,
      accident_reduction_pct: cappedReduction,
      total_lives_saved_yearly: totalLivesSaved,
      total_cost_lakhs: totalCostLakhs,
      simulated_expected_crashes: newExpectedCrashes,
      economic_benefit_cr: +(totalLivesSaved * 1.45 + (corridor.stats_2023.crashes - newExpectedCrashes) * 0.12).toFixed(2),
      active_interventions_count: chosen.length
    };
  }
};
