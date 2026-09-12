import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sliders, 
  Sparkles,
  RotateCcw,
  Check,
  Save,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';
import { apiService } from '../services/api';

const AVAILABLE_INTERVENTIONS = [
  {
    key: 'street_lighting_upgrade',
    label: 'High-Mast Smart LED Lighting Upgrade',
    category: 'Lighting & Visibility',
    description: 'Upgrades unlit dark spots to IRC:SP:72 standards, mitigating night-time pedestrian & two-wheeler hazards.'
  },
  {
    key: 'speed_enforcement_camera',
    label: 'Automated Speed Violation Radar',
    category: 'Enforcement',
    description: 'Enforces posted speed limit compliance upstream of high-speed conflict zones.'
  },
  {
    key: 'pedestrian_crossing_refuge',
    label: 'Zebra Crossing with Median Refuge Island',
    category: 'Pedestrian Infrastructure',
    description: 'Grade-level mid-block protected crossing for vulnerable pedestrians near transit stops.'
  },
  {
    key: 'speed_calming_measures',
    label: 'Rumble Strips & Speed Tables',
    category: 'Traffic Calming',
    description: 'Physical geometric speed calming upstream of conflict points.'
  },
  {
    key: 'junction_redesign',
    label: 'Intersection Channelization & Geometric Redesign',
    category: 'Geometric Engineering',
    description: 'Realigns entry/exit lanes to reduce turning friction and side-swipe collisions.'
  }
];

export default function SimulatorModal({ 
  isOpen, 
  onClose, 
  segments = [], 
  initialSegmentId 
}) {
  const [selectedSegmentId, setSelectedSegmentId] = useState('');
  const [checkedInterventions, setCheckedInterventions] = useState(['street_lighting_upgrade', 'speed_enforcement_camera']);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simError, setSimError] = useState(null);
  
  // Scenario saving states
  const [scenarioName, setScenarioName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [activeTab, setActiveTab] = useState('simulate'); // 'simulate' | 'saved'

  const activeSegmentId = selectedSegmentId || initialSegmentId || segments[0]?.properties?.segment_id || '';

  // Execute simulation via live backend POST /api/v1/simulate
  useEffect(() => {
    if (!isOpen || !activeSegmentId) return;

    let isMounted = true;
    async function executeSimulation() {
      try {
        setIsSimulating(true);
        setSimError(null);
        const res = await apiService.simulateInterventions(activeSegmentId, checkedInterventions);
        if (isMounted) {
          setSimulationResult(res);
        }
      } catch (err) {
        if (isMounted) {
          setSimError(err.message || 'Simulation failed');
        }
      } finally {
        if (isMounted) {
          setIsSimulating(false);
        }
      }
    }

    executeSimulation();
    return () => {
      isMounted = false;
    };
  }, [isOpen, activeSegmentId, checkedInterventions]);

  // Fetch saved scenarios
  useEffect(() => {
    if (!isOpen || activeTab !== 'saved') return;

    let isMounted = true;
    async function fetchSavedScenarios() {
      try {
        const data = await apiService.getSavedSimulations();
        if (isMounted) {
          setSavedScenarios(data || []);
        }
      } catch (err) {
        console.error('Failed to load saved scenarios:', err);
      }
    }

    fetchSavedScenarios();
    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleModalClose = () => {
    setSelectedSegmentId('');
    onClose();
  };

  const toggleIntervention = (key) => {
    setCheckedInterventions(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    setCheckedInterventions(AVAILABLE_INTERVENTIONS.map(i => i.key));
  };

  const handleReset = () => {
    setCheckedInterventions([]);
  };

  const handleSaveScenario = async () => {
    if (!scenarioName.trim() || !simulationResult) return;
    try {
      setIsSaving(true);
      await apiService.saveSimulation({
        segment_id: activeSegmentId,
        scenario_name: scenarioName.trim(),
        interventions: checkedInterventions,
        created_by: 'SafeRoute Urban Engineering'
      });
      setSaveSuccess(true);
      setScenarioName('');
      setTimeout(() => setSaveSuccess(false), 3000);
      const data = await apiService.getSavedSimulations();
      setSavedScenarios(data || []);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop-blur" onClick={handleModalClose}>
      <div className="simulator-modal-window" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-bar">
          <div className="modal-title-wrap">
            <div className="sim-icon-circle">
              <Sliders size={18} className="text-blue" />
            </div>
            <div>
              <h3 className="modal-title">What-If Intervention Simulator</h3>
              <p className="modal-sub">
                ML feature mutation via XGBoost RiskEngine — test engineering ROI before deployment
              </p>
            </div>
          </div>
          <div className="modal-header-actions">
            <div className="sim-tab-toggle">
              <button 
                className={`sim-tab-btn ${activeTab === 'simulate' ? 'active' : ''}`}
                onClick={() => setActiveTab('simulate')}
              >
                Simulator
              </button>
              <button 
                className={`sim-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                onClick={() => setActiveTab('saved')}
              >
                Saved Scenarios
              </button>
            </div>
            <button className="modal-close-icon-btn" onClick={handleModalClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {activeTab === 'simulate' ? (
          <div className="simulator-modal-body">
            {/* Target Segment Picker Row */}
            <div className="sim-corridor-select-row">
              <label className="sim-label">Target Road Segment:</label>
              <select 
                value={activeSegmentId} 
                onChange={e => setSelectedSegmentId(e.target.value)}
                className="sim-dropdown"
              >
                {segments.map(feat => {
                  const p = feat.properties || {};
                  return (
                    <option key={p.segment_id} value={p.segment_id}>
                      {p.segment_id} — {p.road_name} ({p.corridor_id}) • Safety: {Math.round(p.safety_score || 0)}/100 [{p.risk_tier}]
                    </option>
                  );
                })}
              </select>

              <div className="sim-actions-quick">
                <button className="sim-action-text-btn" onClick={handleSelectAll}>
                  Select All
                </button>
                <button className="sim-action-text-btn" onClick={handleReset}>
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Simulated Impact Scoreboard */}
            {simError ? (
              <div className="sim-error-banner">
                <AlertTriangle size={16} className="text-red" />
                <span>Simulation failed: {simError}</span>
              </div>
            ) : simulationResult ? (
              <div className="sim-scoreboard-grid">
                {/* Score Transition */}
                <div className="scoreboard-card score-transition-card">
                  <div className="sb-label">Safety Score Delta</div>
                  <div className="score-duo-row">
                    <div className="score-item">
                      <span className="lbl">Original</span>
                      <span className="val text-muted">{simulationResult.original_safety_score?.toFixed(1)}</span>
                      <span className="unit">/ 100</span>
                    </div>

                    <div className="score-arrow-huge">
                      <ArrowRight size={22} />
                    </div>

                    <div className="score-item">
                      <span className="lbl">Simulated</span>
                      <span className="val text-green">{simulationResult.simulated_safety_score?.toFixed(1)}</span>
                      <span className="unit">/ 100</span>
                    </div>
                  </div>

                  <div className="score-delta-summary text-green">
                    +{simulationResult.score_gain?.toFixed(1)} Safety Gain ({simulationResult.original_risk_tier} → {simulationResult.simulated_risk_tier})
                  </div>
                </div>

                {/* Expected Fatality Reduction */}
                <div className="scoreboard-card">
                  <div className="sb-icon-row">
                    <TrendingDown size={16} className="text-green" />
                    <span className="sb-label">Severe Crash Reduction</span>
                  </div>
                  <div className="sb-huge-val text-green">
                    -{simulationResult.expected_fatality_reduction_pct?.toFixed(1)}%
                  </div>
                  <div className="sb-subtext">Projected reduction in night-time severe casualties</div>
                </div>

                {/* Applied Count */}
                <div className="scoreboard-card">
                  <div className="sb-icon-row">
                    <ShieldCheck size={16} className="text-blue" />
                    <span className="sb-label">Active Interventions</span>
                  </div>
                  <div className="sb-huge-val text-blue">
                    {simulationResult.applied_interventions?.length || 0} / 5
                  </div>
                  <div className="sb-subtext">Simulated empirical features mutated</div>
                </div>
              </div>
            ) : null}

            {/* Interventions Selection Checklist */}
            <div className="sim-interventions-section">
              <div className="sim-interventions-title">
                <span>Select Interventions to Test ({checkedInterventions.length} active)</span>
                {isSimulating && <span className="sim-calculating-hint">Calculating ML features...</span>}
              </div>

              <div className="sim-checkbox-list">
                {AVAILABLE_INTERVENTIONS.map((item) => {
                  const isChecked = checkedInterventions.includes(item.key);
                  const breakdownItem = simulationResult?.intervention_breakdown?.find(b => b.intervention === item.key);

                  return (
                    <label 
                      key={item.key} 
                      className={`sim-check-card ${isChecked ? 'active' : ''}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => toggleIntervention(item.key)}
                        className="sim-checkbox-input"
                      />
                      <div className="sim-card-body">
                        <div className="sim-card-header">
                          <span className="sim-card-title">{item.label}</span>
                          <span className="sim-cat-tag">{item.category}</span>
                        </div>
                        <p className="sim-card-sub">{item.description}</p>
                      </div>

                      {breakdownItem && isChecked && (
                        <div className="sim-card-impact text-green">
                          +{breakdownItem.isolated_score_gain?.toFixed(1)} pts
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Save Municipal Scenario Form */}
            <div className="sim-save-scenario-row">
              <div className="save-input-wrap">
                <input 
                  type="text" 
                  placeholder="Scenario title (e.g. Q3 Smart Lighting & Radar Upgrades)..." 
                  value={scenarioName}
                  onChange={e => setScenarioName(e.target.value)}
                  className="scenario-name-input"
                />
                <button 
                  className="save-scenario-btn"
                  onClick={handleSaveScenario}
                  disabled={!scenarioName.trim() || isSaving}
                >
                  <Save size={14} />
                  <span>{isSaving ? 'Saving...' : 'Save Scenario'}</span>
                </button>
              </div>
              {saveSuccess && (
                <div className="save-success-msg">
                  <Check size={14} />
                  <span>Scenario persisted to municipal database!</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SAVED SCENARIOS VIEW */
          <div className="simulator-modal-body saved-scenarios-body">
            <div className="saved-scenarios-header">
              <FolderOpen size={16} className="text-muted" />
              <span>Municipal Saved Scenarios ({savedScenarios.length})</span>
            </div>

            {savedScenarios.length === 0 ? (
              <div className="saved-empty-state">
                <p>No saved scenarios found in the municipal database. Run a simulation and save it above.</p>
              </div>
            ) : (
              <div className="saved-scenarios-list">
                {savedScenarios.map(s => (
                  <div key={s.id} className="saved-scenario-card">
                    <div className="saved-card-top">
                      <span className="saved-title">{s.scenario_name}</span>
                      <span className="saved-segment">{s.segment_id}</span>
                    </div>
                    <div className="saved-meta-row">
                      <span className="saved-delta text-green">
                        Safety: {s.original_safety_score?.toFixed(1)} → {s.simulated_safety_score?.toFixed(1)} (+{s.score_gain?.toFixed(1)})
                      </span>
                      <span className="saved-tier">
                        {s.original_risk_tier} → {s.simulated_risk_tier}
                      </span>
                      <span className="saved-date">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    <div className="saved-interventions-tags">
                      {(s.applied_interventions || []).map(it => (
                        <span key={it} className="tag-pill">{it.replace(/_/g, ' ')}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="modal-footer-bar">
          <div className="footer-note">
            <Sparkles size={13} className="text-amber" />
            <span>SafeRoute AI transparently recomputes features via RiskEngine rather than using static constants.</span>
          </div>
          <button className="primary-modal-cta" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
