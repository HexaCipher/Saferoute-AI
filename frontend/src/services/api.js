import { BANGALORE_HOTSPOTS, CITY_METRICS } from './mockData';

// Toggle to false when backend team runs FastAPI at localhost:8000
const USE_MOCK = true;
const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiService = {
  async getHotspots(filterSeverity = 'ALL') {
    if (USE_MOCK) {
      if (!filterSeverity || filterSeverity === 'ALL') {
        return BANGALORE_HOTSPOTS;
      }
      return BANGALORE_HOTSPOTS.filter(
        (spot) => spot.risk_level.toUpperCase() === filterSeverity.toUpperCase()
      );
    }

    try {
      const url = filterSeverity && filterSeverity !== 'ALL'
        ? `${API_BASE_URL}/accidents/?severity=${encodeURIComponent(filterSeverity)}`
        : `${API_BASE_URL}/accidents/`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('API network response was not ok');
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn('Backend API connection failed, seamlessly falling back to curated intelligence dataset:', err);
      return BANGALORE_HOTSPOTS;
    }
  },

  async getCityMetrics() {
    return CITY_METRICS;
  },

  async getHotspotById(id) {
    return BANGALORE_HOTSPOTS.find((spot) => spot.id === id) || BANGALORE_HOTSPOTS[0];
  }
};
