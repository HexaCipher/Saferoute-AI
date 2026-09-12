/**
 * SafeRoute AI — Pure Live API Service Layer
 * Directly interfaces with the FastAPI backend (http://localhost:8000/api/v1).
 * NO mock data or silent fallbacks. All errors are propagated to components for proper UX states.
 */

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) {
      return `${window.location.origin}/api/v1`;
    }
  }
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getBaseUrl();
const ROOT_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

/**
 * Standard fetch helper with centralized error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) {
          errorDetail = typeof errorJson.detail === 'string' 
            ? errorJson.detail 
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        // use status text if body isn't JSON
      }
      throw new Error(errorDetail);
    }
    return await res.json();
  } catch (err) {
    console.error(`[SafeRoute API Error] ${options.method || 'GET'} ${url}:`, err);
    throw err;
  }
}

export const apiService = {
  /**
   * Health check for connection status badge
   * @returns {Promise<{ status: string, version: string, dataset_loaded: boolean, total_segments: number }>}
   */
  async checkHealth() {
    return apiFetch(`${ROOT_URL}/health`);
  },

  /**
   * Fetch all 428 road segments as GeoJSON FeatureCollection
   * @param {Object} filters
   * @param {string} [filters.corridor_id] - e.g. "ORR", "OMR_WHITEFIELD", "HOSUR"
   * @param {string} [filters.risk_tier] - "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
   * @param {number} [filters.min_safety_score]
   * @param {number} [filters.max_safety_score]
   * @returns {Promise<{ type: "FeatureCollection", metadata: Object, features: Array }>}
   */
  async getSegments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.corridor_id && filters.corridor_id !== 'ALL') {
      params.append('corridor_id', filters.corridor_id);
    }
    if (filters.risk_tier && filters.risk_tier !== 'ALL') {
      params.append('risk_tier', filters.risk_tier.toUpperCase());
    }
    if (filters.min_safety_score !== undefined && filters.min_safety_score !== null) {
      params.append('min_safety_score', filters.min_safety_score);
    }
    if (filters.max_safety_score !== undefined && filters.max_safety_score !== null) {
      params.append('max_safety_score', filters.max_safety_score);
    }

    const qs = params.toString();
    return apiFetch(`/segments${qs ? `?${qs}` : ''}`);
  },

  /**
   * Fetch full segment telemetry detail
   * @param {string} segmentId - e.g. "BLR_ORR_001_1"
   * @returns {Promise<Object>} Segment detail with metrics, infrastructure, btp, risk explanation
   */
  async getSegmentDetail(segmentId) {
    if (!segmentId) throw new Error('segmentId is required');
    return apiFetch(`/segments/${encodeURIComponent(segmentId)}`);
  },

  /**
   * Fetch macro city safety analytics, corridor breakdown, VRU metrics
   * @returns {Promise<Object>} Summary metrics
   */
  async getAnalyticsSummary() {
    return apiFetch('/analytics/summary');
  },

  /**
   * Fetch priority hazardous segments
   * @param {string} [corridorId]
   * @param {number} [limit=25]
   * @returns {Promise<Object>} Recommendations list
   */
  async getRecommendations(corridorId = null, limit = 25) {
    const params = new URLSearchParams();
    if (corridorId && corridorId !== 'ALL') {
      params.append('corridor_id', corridorId);
    }
    if (limit) {
      params.append('limit', limit);
    }
    const qs = params.toString();
    return apiFetch(`/recommendations/fix-this-first${qs ? `?${qs}` : ''}`);
  },

  /**
   * Run What-If intervention simulation via backend ML model
   * @param {string} segmentId
   * @param {string[]} interventions - e.g. ['street_lighting_upgrade', 'speed_enforcement_camera']
   * @returns {Promise<Object>} Simulation result with score gain and isolated breakdown
   */
  async simulateInterventions(segmentId, interventions = []) {
    if (!segmentId) throw new Error('segmentId is required for simulation');
    return apiFetch('/simulate', {
      method: 'POST',
      body: JSON.stringify({
        segment_id: segmentId,
        interventions
      })
    });
  },

  /**
   * Persist a What-If scenario into municipal database
   * @param {Object} data
   * @param {string} data.segment_id
   * @param {string} data.scenario_name
   * @param {string[]} data.interventions
   * @param {string} [data.created_by]
   */
  async saveSimulation(data) {
    return apiFetch('/simulate/save', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Retrieve all saved scenarios from municipal database
   */
  async getSavedSimulations() {
    return apiFetch('/simulate/saved');
  },

  /**
   * Retrieve municipal action items
   * @param {string} [status] - "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD"
   * @param {string} [corridorId]
   */
  async getActions(status = null, corridorId = null) {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (corridorId && corridorId !== 'ALL') params.append('corridor_id', corridorId);
    const qs = params.toString();
    return apiFetch(`/actions${qs ? `?${qs}` : ''}`);
  },

  /**
   * Create municipal action item
   */
  async createAction(data) {
    return apiFetch('/actions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Update municipal action item
   */
  async updateAction(actionId, data) {
    return apiFetch(`/actions/${actionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  /**
   * Delete municipal action item
   */
  async deleteAction(actionId) {
    return apiFetch(`/actions/${actionId}`, {
      method: 'DELETE'
    });
  }
};
