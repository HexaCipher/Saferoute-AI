import { BANGALORE_CORRIDORS, CITY_OVERVIEW_METRICS, CORRIDOR_POLYLINES } from './mockData';

// Seamless toggle: set to false when backend FastAPI is active on localhost:8000
const USE_MOCK = true;
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
      const response = await fetch(`${API_BASE_URL}/segments`);
      if (!response.ok) throw new Error('Failed to fetch from backend');
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn('Backend unavailable, using high-fidelity local dataset:', err);
      return BANGALORE_CORRIDORS;
    }
  },

  async getCityMetrics() {
    return CITY_OVERVIEW_METRICS;
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
    
    // Sum of impact
    const totalReduction = chosen.reduce((acc, curr) => acc + curr.reduction_num, 0);
    // Diminishing returns formula so it doesn't exceed 85%
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
