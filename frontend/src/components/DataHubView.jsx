import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  CheckCircle2, 
  ExternalLink, 
  Play, 
  Copy, 
  Check, 
  RefreshCw, 
  Layers, 
  Activity, 
  Server
} from 'lucide-react';
import { apiService } from '../services/api';

export default function DataHubView({ backendHealth }) {
  const [activeTab, setActiveTab] = useState('endpoints'); // 'endpoints' | 'saved_sims' | 'architecture'
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);

  // Endpoint Tester State
  const [selectedEndpoint, setSelectedEndpoint] = useState('/health');
  const [testingResponse, setTestingResponse] = useState(null);
  const [testingLoading, setTestingLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const ROOT_URL = 'http://localhost:8000';

  const endpointsList = [
    { label: 'Health Check', path: '/health', method: 'GET', description: 'Checks server and dataset readiness' },
    { label: 'City Analytics Summary', path: '/api/v1/analytics/summary', method: 'GET', description: 'Macro KPIs, corridor distribution, VRU breakdown' },
    { label: 'Fix This First Recommendations', path: '/api/v1/recommendations/fix-this-first?limit=3', method: 'GET', description: 'Top hazardous segments ranked by ROI' },
    { label: 'Municipal Action Tracker', path: '/api/v1/actions', method: 'GET', description: 'All tracked civil engineering and enforcement projects' },
    { label: 'Saved Simulations', path: '/api/v1/simulate/saved', method: 'GET', description: 'Saved What-If scenarios from municipal database' },
    { label: 'Road Segments GeoJSON', path: '/api/v1/segments?corridor_id=ORR&limit=3', method: 'GET', description: 'GeoJSON FeatureCollection layer' },
    { label: 'Historical Accidents', path: '/api/v1/accidents?limit=5', method: 'GET', description: 'BTP historical crash registry' }
  ];

  const loadSavedScenarios = useCallback(async () => {
    try {
      setLoadingScenarios(true);
      const data = await apiService.getSavedSimulations();
      setSavedScenarios(data || []);
    } catch (err) {
      console.error('Failed to load saved scenarios:', err);
    } finally {
      setLoadingScenarios(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoadingScenarios(true);
        const data = await apiService.getSavedSimulations();
        if (isMounted) setSavedScenarios(data || []);
      } catch (err) {
        if (isMounted) console.error('Failed to load saved scenarios:', err);
      } finally {
        if (isMounted) setLoadingScenarios(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Execute Endpoint Test
  const handleExecuteTest = useCallback(async (endpointPath) => {
    const path = endpointPath || selectedEndpoint;
    setTestingLoading(true);
    setTestingResponse(null);
    const startTime = performance.now();

    try {
      const url = `${ROOT_URL}${path}`;
      const res = await fetch(url);
      const duration = Math.round(performance.now() - startTime);

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await res.json();
        setTestingResponse({
          status: res.status,
          statusText: res.statusText,
          duration,
          data: json
        });
      } else {
        const text = await res.text();
        setTestingResponse({
          status: res.status,
          statusText: res.statusText,
          duration,
          data: text
        });
      }
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      setTestingResponse({
        status: 0,
        statusText: 'Network Error',
        duration,
        error: err.message
      });
    } finally {
      setTestingLoading(false);
    }
  }, [selectedEndpoint]);

  // Run initial test for health check
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) handleExecuteTest('/health');
    });
    return () => { active = false; };
  }, [handleExecuteTest]);

  const handleCopyJson = () => {
    if (!testingResponse) return;
    navigator.clipboard.writeText(JSON.stringify(testingResponse.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="datahub-view-container">
      {/* Header Banner */}
      <div className="view-header-bar">
        <div>
          <div className="view-tag">
            <Database size={13} className="text-blue" />
            <span>Developer & Municipal Data Hub</span>
          </div>
          <h2 className="view-title">FastAPI Backend Pipeline & Telemetry Explorer</h2>
          <p className="view-subtitle">
            Direct API observability, interactive endpoint testing, OpenAPI schema inspection, and saved scenario logs
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="interventions-tab-nav">
          <button 
            className={`tab-btn ${activeTab === 'endpoints' ? 'active' : ''}`}
            onClick={() => setActiveTab('endpoints')}
          >
            <span>Interactive API Tester</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'saved_sims' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('saved_sims');
              loadSavedScenarios();
            }}
          >
            <span>Saved Scenarios</span>
            <span className="tab-count">{savedScenarios.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            <span>Pipeline Architecture</span>
          </button>
        </div>
      </div>

      {/* Backend Health Status Bar */}
      <div className="datahub-status-strip">
        <div className="status-metric-item">
          <Server size={16} className="text-blue" />
          <span className="label">Backend Host:</span>
          <span className="val code">http://localhost:8000</span>
        </div>

        <div className="status-metric-item">
          <CheckCircle2 size={16} className="text-emerald" />
          <span className="label">FastAPI Status:</span>
          <span className="val text-emerald font-bold">
            {backendHealth?.isHealthy ? 'Healthy (v1.0.0)' : 'Online'}
          </span>
        </div>

        <div className="status-metric-item">
          <Layers size={16} className="text-amber" />
          <span className="label">Parquet Segments:</span>
          <span className="val">{backendHealth?.totalSegments || 428} segments</span>
        </div>

        <div className="status-docs-links">
          <a 
            href="http://localhost:8000/docs" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="docs-chip-link"
          >
            <span>Swagger UI</span>
            <ExternalLink size={12} />
          </a>
          <a 
            href="http://localhost:8000/redoc" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="docs-chip-link"
          >
            <span>ReDoc API</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Tab 1: Interactive Endpoint Tester */}
      {activeTab === 'endpoints' && (
        <div className="endpoint-tester-layout">
          {/* Left: Endpoint Selector List */}
          <div className="endpoint-selector-col">
            <h4 className="col-title">FastAPI Endpoints</h4>
            <div className="endpoint-items-list">
              {endpointsList.map((ep) => {
                const isSelected = selectedEndpoint === ep.path;
                return (
                  <button
                    key={ep.path}
                    className={`endpoint-item-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedEndpoint(ep.path);
                      handleExecuteTest(ep.path);
                    }}
                  >
                    <div className="ep-top-line">
                      <span className="method-tag get">{ep.method}</span>
                      <span className="ep-label">{ep.label}</span>
                    </div>
                    <span className="ep-path-code">{ep.path}</span>
                    <p className="ep-desc">{ep.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Live Execution & JSON Response Viewer */}
          <div className="endpoint-response-col">
            <div className="response-header-bar">
              <div className="request-bar">
                <span className="method-pill get">GET</span>
                <span className="request-url">{ROOT_URL}{selectedEndpoint}</span>
              </div>

              <div className="request-actions">
                <button 
                  className="exec-btn" 
                  onClick={() => handleExecuteTest()}
                  disabled={testingLoading}
                >
                  {testingLoading ? (
                    <RefreshCw size={13} className="spin" />
                  ) : (
                    <Play size={13} />
                  )}
                  <span>Execute</span>
                </button>

                {testingResponse?.data && (
                  <button className="copy-btn" onClick={handleCopyJson}>
                    {copied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Response Meta Strip */}
            {testingResponse && (
              <div className="response-meta-strip">
                <div className="meta-pill">
                  <span className="meta-label">Status:</span>
                  <span className={`meta-val ${testingResponse.status === 200 ? 'text-emerald' : 'text-red'}`}>
                    {testingResponse.status} {testingResponse.statusText}
                  </span>
                </div>
                <div className="meta-pill">
                  <span className="meta-label">Time:</span>
                  <span className="meta-val">{testingResponse.duration} ms</span>
                </div>
                <div className="meta-pill">
                  <span className="meta-label">Format:</span>
                  <span className="meta-val">application/json</span>
                </div>
              </div>
            )}

            {/* JSON Output Viewer */}
            <div className="json-viewer-container">
              {testingLoading ? (
                <div className="json-loading-state">
                  <RefreshCw size={24} className="spin text-blue" />
                  <span>Fetching live response from FastAPI...</span>
                </div>
              ) : testingResponse?.error ? (
                <div className="json-error-state">
                  <span className="error-title">Request Failed</span>
                  <code>{testingResponse.error}</code>
                </div>
              ) : testingResponse?.data ? (
                <pre className="json-code-block">
                  {JSON.stringify(testingResponse.data, null, 2)}
                </pre>
              ) : (
                <div className="json-placeholder-state">
                  Select an endpoint on the left and click "Execute"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Saved Scenarios Explorer */}
      {activeTab === 'saved_sims' && (
        <div className="saved-scenarios-wrapper">
          <div className="scenarios-toolbar">
            <h3 className="section-title">Persisted Municipal What-If Scenarios</h3>
            <button className="refresh-scenarios-btn" onClick={loadSavedScenarios}>
              <RefreshCw size={13} className={loadingScenarios ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {loadingScenarios ? (
            <div className="table-loading-box">
              <RefreshCw size={24} className="spin text-blue" />
              <span>Loading saved simulations from SQLite...</span>
            </div>
          ) : savedScenarios.length === 0 ? (
            <div className="empty-state-box">
              <Activity size={32} className="text-muted" />
              <h4>No Saved Scenarios Found</h4>
              <p>Open the What-If Safety Simulator (AI tab) and click "Save Scenario" to persist evaluated models.</p>
            </div>
          ) : (
            <div className="saved-scenarios-grid">
              {savedScenarios.map((sc) => (
                <div key={sc.id} className="scenario-item-card">
                  <div className="sc-header">
                    <span className="sc-id">SCN-{sc.id}</span>
                    <span className="sc-date">{new Date(sc.created_at).toLocaleDateString()}</span>
                  </div>

                  <h4 className="sc-title">{sc.scenario_name}</h4>
                  <div className="sc-segment-tag">Segment: {sc.segment_id}</div>

                  <div className="sc-score-comparison">
                    <div className="sc-score-col">
                      <span className="sc-slabel">Original</span>
                      <span className="sc-sval">{sc.original_safety_score?.toFixed(1)}</span>
                      <span className="sc-tier critical">{sc.original_risk_tier}</span>
                    </div>

                    <div className="sc-delta-badge">
                      <span>+{sc.score_gain?.toFixed(1)}</span>
                    </div>

                    <div className="sc-score-col">
                      <span className="sc-slabel">Simulated</span>
                      <span className="sc-sval text-emerald">{sc.simulated_safety_score?.toFixed(1)}</span>
                      <span className="sc-tier high">{sc.simulated_risk_tier}</span>
                    </div>
                  </div>

                  <div className="sc-interventions-list">
                    <span className="int-label">Applied Interventions:</span>
                    <div className="int-tags">
                      {sc.applied_interventions?.map((it) => (
                        <span key={it} className="int-tag-pill">{it.replace(/_/g, ' ')}</span>
                      ))}
                    </div>
                  </div>

                  <div className="sc-footer">
                    <span className="sc-author">By: {sc.created_by || 'Civil Engineer'}</span>
                    <span className="sc-reduction text-emerald">
                      -{sc.expected_fatality_reduction_pct?.toFixed(1)}% Fatalities
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: System Pipeline Architecture */}
      {activeTab === 'architecture' && (
        <div className="architecture-view-wrapper">
          <div className="arch-card">
            <h3 className="arch-title">SafeRoute AI End-to-End System Architecture</h3>
            <p className="arch-subtitle">
              Fully decoupled, production-grade integration between the FastAPI Python backend and React / Vite frontend
            </p>

            <div className="pipeline-flow-diagram">
              <div className="pipe-box data-source">
                <span className="pipe-step">Layer 1: Empirical Datasets</span>
                <h4>Data Ingestion</h4>
                <ul>
                  <li>OpenStreetMap Road Geometries</li>
                  <li>BTP Crash Records (2022–2023)</li>
                  <li>MoRTH Night Risk Benchmarks</li>
                  <li>Parquet Vector Database</li>
                </ul>
              </div>

              <div className="pipe-arrow">➔</div>

              <div className="pipe-box ml-engine">
                <span className="pipe-step">Layer 2: AI & ML Scoring</span>
                <h4>Calibrated Risk Engine</h4>
                <ul>
                  <li>XGBoost Safety Classifier v1.2</li>
                  <li>Night Multiplier Evaluation</li>
                  <li>Feature Sensitivity Analysis</li>
                  <li>What-If Feature Mutator</li>
                </ul>
              </div>

              <div className="pipe-arrow">➔</div>

              <div className="pipe-box backend-api">
                <span className="pipe-step">Layer 3: REST Microservices</span>
                <h4>FastAPI High-Speed API</h4>
                <ul>
                  <li>GeoJSON Layer Delivery</li>
                  <li>"Fix This First" Ranking</li>
                  <li>Municipal Action Tracker (SQLite)</li>
                  <li>Dynamic CSV Streaming</li>
                </ul>
              </div>

              <div className="pipe-arrow">➔</div>

              <div className="pipe-box frontend-app">
                <span className="pipe-step">Layer 4: Command Center</span>
                <h4>React Dashboard</h4>
                <ul>
                  <li>Realistic Leaflet Satellite Map</li>
                  <li>Real-Time Telemetry Inspector</li>
                  <li>Interactive What-If Simulator</li>
                  <li>Executive Vision Zero Reports</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
