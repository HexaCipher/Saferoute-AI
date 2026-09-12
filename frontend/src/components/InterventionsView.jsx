import React, { useState, useEffect, useCallback } from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Sliders, 
  Trash2, 
  RefreshCw, 
  DollarSign, 
  Calendar, 
  ExternalLink 
} from 'lucide-react';
import { apiService } from '../services/api';

export default function InterventionsView({
  onOpenSimulator,
  onSelectSegment,
  onNavigateToOverview
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [actions, setActions] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);
  const [selectedCorridor, setSelectedCorridor] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('priorities'); // 'priorities' | 'tracker'

  // New Action Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionForm, setActionForm] = useState({
    segment_id: '',
    corridor_name: 'Outer Ring Road (Silk Board to Hebbal)',
    road_name: '',
    intervention_type: 'street_lighting_upgrade',
    intervention_label: 'High-Mast Smart LED Lighting Upgrade',
    priority_tier: 'CRITICAL',
    assigned_agency: 'BBMP',
    allocated_budget_lakhs: 25.0,
    notes: '',
    target_date: '2026-11-30'
  });

  // Fetch 'Fix This First' Recommendations
  const loadRecommendations = useCallback(async () => {
    try {
      setLoadingRecs(true);
      const res = await apiService.getRecommendations(selectedCorridor, 25);
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  }, [selectedCorridor]);

  // Fetch Municipal Action Tracker items
  const loadActions = useCallback(async () => {
    try {
      setLoadingActions(true);
      const res = await apiService.getActions(statusFilter, selectedCorridor);
      setActions(res || []);
    } catch (err) {
      console.error('Failed to load action items:', err);
    } finally {
      setLoadingActions(false);
    }
  }, [statusFilter, selectedCorridor]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadRecommendations();
    });
    return () => { active = false; };
  }, [loadRecommendations]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadActions();
    });
    return () => { active = false; };
  }, [loadActions]);

  // Handle Quick Add from Recommendation to Action Tracker
  const handleAddFromRecommendation = async (rec) => {
    try {
      const newAction = {
        segment_id: rec.segment_id,
        corridor_name: rec.corridor_name || 'Outer Ring Road',
        road_name: rec.road_name || 'Arterial Road',
        intervention_type: rec.recommended_intervention,
        intervention_label: rec.recommended_intervention_label || 'High-Impact Safety Upgrade',
        priority_tier: rec.current_risk_tier || 'CRITICAL',
        assigned_agency: rec.recommended_intervention?.includes('speed') ? 'BTP' : 'BBMP',
        allocated_budget_lakhs: 25.0,
        notes: `Auto-generated from SafeRoute AI Decision Support. Justification: ${rec.justification?.slice(0, 120)}...`,
        target_date: '2026-12-15'
      };

      await apiService.createAction(newAction);
      await loadActions();
      setActiveTab('tracker');
    } catch (err) {
      console.error('Failed to create action from recommendation:', err);
      alert('Could not add action: ' + err.message);
    }
  };

  // Update Status of Action Item
  const handleUpdateStatus = async (actionId, newStatus) => {
    try {
      await apiService.updateAction(actionId, { status: newStatus });
      setActions(prev => prev.map(a => a.id === actionId ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error('Failed to update action status:', err);
    }
  };

  // Delete Action Item
  const handleDeleteAction = async (actionId) => {
    if (!confirm(`Delete action item #${actionId}?`)) return;
    try {
      await apiService.deleteAction(actionId);
      setActions(prev => prev.filter(a => a.id !== actionId));
    } catch (err) {
      console.error('Failed to delete action item:', err);
    }
  };

  // Submit New Action from Modal Form
  const handleCreateActionSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAction(true);
      await apiService.createAction(actionForm);
      setCreateModalOpen(false);
      await loadActions();
      setActiveTab('tracker');
      // Reset form
      setActionForm({
        segment_id: '',
        corridor_name: 'Outer Ring Road (Silk Board to Hebbal)',
        road_name: '',
        intervention_type: 'street_lighting_upgrade',
        intervention_label: 'High-Mast Smart LED Lighting Upgrade',
        priority_tier: 'CRITICAL',
        assigned_agency: 'BBMP',
        allocated_budget_lakhs: 25.0,
        notes: '',
        target_date: '2026-11-30'
      });
    } catch (err) {
      console.error('Failed to create action:', err);
      alert('Error creating action: ' + err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="interventions-view-container">
      {/* Header Banner */}
      <div className="view-header-bar">
        <div>
          <div className="view-tag">
            <GitFork size={13} className="text-blue" />
            <span>Decision Support & Action Tracker</span>
          </div>
          <h2 className="view-title">Targeted Interventions & Municipal Operations</h2>
          <p className="view-subtitle">
            AI-driven prioritization ("Fix This First") integrated directly with the BBMP / BTP Municipal Action Tracker
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="interventions-tab-nav">
          <button 
            className={`tab-btn ${activeTab === 'priorities' ? 'active' : ''}`}
            onClick={() => setActiveTab('priorities')}
          >
            <span>Fix This First (AI Ranked)</span>
            <span className="tab-count">{recommendations.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            <span>Municipal Action Tracker</span>
            <span className="tab-count">{actions.length}</span>
          </button>
        </div>
      </div>

      {/* Corridor Filter Strip */}
      <div className="interventions-filter-bar">
        <div className="filter-group">
          <span className="filter-label">Corridor:</span>
          <button 
            className={`filter-chip ${selectedCorridor === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCorridor('ALL')}
          >
            All Corridors
          </button>
          <button 
            className={`filter-chip ${selectedCorridor === 'ORR' ? 'active' : ''}`}
            onClick={() => setSelectedCorridor('ORR')}
          >
            Outer Ring Road
          </button>
          <button 
            className={`filter-chip ${selectedCorridor === 'OMR_WHITEFIELD' ? 'active' : ''}`}
            onClick={() => setSelectedCorridor('OMR_WHITEFIELD')}
          >
            Old Madras / Whitefield
          </button>
          <button 
            className={`filter-chip ${selectedCorridor === 'HOSUR' ? 'active' : ''}`}
            onClick={() => setSelectedCorridor('HOSUR')}
          >
            Hosur Road
          </button>
        </div>

        {activeTab === 'tracker' && (
          <div className="tracker-right-controls">
            <div className="filter-group">
              <span className="filter-label">Status:</span>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-dropdown"
              >
                <option value="ALL">All Statuses</option>
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <button 
              className="add-action-btn"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus size={15} />
              <span>New Action Item</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: "Fix This First" AI Recommendations */}
      {activeTab === 'priorities' && (
        <div className="priorities-table-wrapper">
          {loadingRecs ? (
            <div className="table-loading-box">
              <RefreshCw size={24} className="spin text-blue" />
              <span>Evaluating highest-ROI safety interventions...</span>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="empty-state-box">
              <AlertTriangle size={32} className="text-muted" />
              <p>No priority recommendations found for this filter.</p>
            </div>
          ) : (
            <table className="custom-data-table priority-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Segment / Location</th>
                  <th>Current Score</th>
                  <th>Primary VRU</th>
                  <th>Recommended Single Intervention</th>
                  <th>Expected Score Gain</th>
                  <th>Justification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((rec) => (
                  <tr key={rec.segment_id} className="table-data-row priority-row">
                    <td>
                      <span className={`rank-badge ${rec.priority_rank <= 3 ? 'top-rank' : ''}`}>
                        #{rec.priority_rank}
                      </span>
                    </td>
                    <td>
                      <div className="road-cell">
                        <span className="segment-code">{rec.segment_id}</span>
                        <span className="road-title">{rec.road_name}</span>
                        <span className="corridor-sub">{rec.corridor_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="score-cell">
                        <span className="score-number text-red">{rec.current_safety_score?.toFixed(1)}</span>
                        <span className="score-total">/100</span>
                      </div>
                      <span className="tier-pill critical mini">{rec.current_risk_tier}</span>
                    </td>
                    <td>
                      <span className="vru-cell-text">{rec.primary_vulnerable_group}</span>
                    </td>
                    <td>
                      <div className="rec-intervention-box">
                        <span className="rec-title">{rec.recommended_intervention_label}</span>
                        <span className="rec-key">{rec.recommended_intervention}</span>
                      </div>
                    </td>
                    <td>
                      <div className="gain-cell">
                        <span className="gain-num text-emerald">+{rec.expected_safety_gain?.toFixed(1)}</span>
                        <span className="sim-target">Sim: {rec.simulated_safety_score?.toFixed(1)}</span>
                      </div>
                    </td>
                    <td>
                      <p className="rec-justification">{rec.justification}</p>
                    </td>
                    <td>
                      <div className="action-buttons-stack">
                        <button 
                          className="action-pill-btn track"
                          onClick={() => handleAddFromRecommendation(rec)}
                          title="Add to Municipal Action Tracker"
                        >
                          <Plus size={12} />
                          <span>Track</span>
                        </button>
                        <button 
                          className="action-pill-btn simulate"
                          onClick={() => {
                            if (onSelectSegment) onSelectSegment(rec.segment_id);
                            if (onOpenSimulator) onOpenSimulator();
                          }}
                          title="Run What-If ML Simulation"
                        >
                          <Sliders size={12} />
                          <span>Simulate</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 2: Municipal Action Tracker */}
      {activeTab === 'tracker' && (
        <div className="actions-tracker-wrapper">
          {loadingActions ? (
            <div className="table-loading-box">
              <RefreshCw size={24} className="spin text-blue" />
              <span>Loading Municipal Action Tracker...</span>
            </div>
          ) : actions.length === 0 ? (
            <div className="empty-state-box">
              <CheckCircle2 size={36} className="text-muted" />
              <h4>No Municipal Projects Logged</h4>
              <p>Promote recommendations from the "Fix This First" tab or create a new project above.</p>
              <button 
                className="add-action-btn"
                onClick={() => setCreateModalOpen(true)}
                style={{ marginTop: '12px' }}
              >
                <Plus size={15} />
                <span>Create First Project</span>
              </button>
            </div>
          ) : (
            <div className="actions-card-grid">
              {actions.map((act) => (
                <div key={act.id} className="action-project-card">
                  <div className="action-card-top">
                    <div className="agency-and-id">
                      <span className={`agency-badge ${act.assigned_agency?.toLowerCase()}`}>
                        {act.assigned_agency || 'BBMP'}
                      </span>
                      <span className="action-id-tag">ACT-{act.id}</span>
                      <span className="segment-code mini">{act.segment_id}</span>
                    </div>

                    <div className="status-selector-wrap">
                      <select 
                        value={act.status}
                        onChange={(e) => handleUpdateStatus(act.id, e.target.value)}
                        className={`status-select-pill ${act.status?.toLowerCase()}`}
                      >
                        <option value="PLANNED">PLANNED</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </div>
                  </div>

                  <h4 className="action-intervention-title">{act.intervention_label}</h4>
                  <div className="action-location-info">
                    <span className="action-road-name">{act.road_name}</span>
                    <span className="action-corridor-sub">{act.corridor_name}</span>
                  </div>

                  {act.notes && (
                    <p className="action-notes-box">{act.notes}</p>
                  )}

                  <div className="action-card-meta-row">
                    <div className="meta-item">
                      <DollarSign size={13} className="text-muted" />
                      <span>₹{act.allocated_budget_lakhs?.toFixed(1)} Lakhs</span>
                    </div>
                    {act.target_date && (
                      <div className="meta-item">
                        <Calendar size={13} className="text-muted" />
                        <span>Target: {act.target_date}</span>
                      </div>
                    )}
                  </div>

                  <div className="action-card-footer">
                    <button 
                      className="card-footer-btn delete"
                      onClick={() => handleDeleteAction(act.id)}
                      title="Delete action item"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>

                    <button 
                      className="card-footer-btn view"
                      onClick={() => {
                        if (act.segment_id && onSelectSegment) onSelectSegment(act.segment_id);
                        if (onNavigateToOverview) onNavigateToOverview('ALL', act.segment_id);
                      }}
                    >
                      <span>View Map</span>
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create New Action Item */}
      {createModalOpen && (
        <div className="modal-backdrop-overlay" onClick={() => setCreateModalOpen(false)}>
          <div className="action-create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">New Municipal Safety Project</h3>
              <button className="close-btn" onClick={() => setCreateModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleCreateActionSubmit} className="modal-form-body">
              <div className="form-group">
                <label>Segment ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. BLR_ORR_006_2" 
                  value={actionForm.segment_id} 
                  onChange={(e) => setActionForm({ ...actionForm, segment_id: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Corridor</label>
                  <select 
                    value={actionForm.corridor_name}
                    onChange={(e) => setActionForm({ ...actionForm, corridor_name: e.target.value })}
                  >
                    <option value="Outer Ring Road (Silk Board to Hebbal)">Outer Ring Road (Silk Board to Hebbal)</option>
                    <option value="Old Madras Road / Whitefield Corridor">Old Madras Road / Whitefield Corridor</option>
                    <option value="Hosur Road / Electronic City (NH 44)">Hosur Road / Electronic City (NH 44)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Road / Stretch Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bellandur to Ecospace" 
                    value={actionForm.road_name} 
                    onChange={(e) => setActionForm({ ...actionForm, road_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Intervention Type</label>
                  <select 
                    value={actionForm.intervention_type}
                    onChange={(e) => {
                      const val = e.target.value;
                      let lbl = 'High-Mast Smart LED Lighting Upgrade';
                      if (val === 'speed_enforcement_camera') lbl = 'Automated Speed Radar (ANPR)';
                      if (val === 'pedestrian_crossing_refuge') lbl = 'High-Visibility Pedestrian Crossing & Refuge';
                      if (val === 'junction_redesign') lbl = 'Intersection Channelization & Geometric Redesign';
                      if (val === 'speed_calming_measures') lbl = 'Rumble Strips & Speed Calming Nodes';
                      setActionForm({ 
                        ...actionForm, 
                        intervention_type: val,
                        intervention_label: lbl
                      });
                    }}
                  >
                    <option value="street_lighting_upgrade">Smart LED Lighting Upgrade</option>
                    <option value="speed_enforcement_camera">Speed Enforcement Radar</option>
                    <option value="pedestrian_crossing_refuge">Pedestrian Crossing & Refuge</option>
                    <option value="junction_redesign">Junction Geometric Redesign</option>
                    <option value="speed_calming_measures">Speed Calming / Rumble Strips</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Assigned Agency</label>
                  <select 
                    value={actionForm.assigned_agency}
                    onChange={(e) => setActionForm({ ...actionForm, assigned_agency: e.target.value })}
                  >
                    <option value="BBMP">BBMP (Bruhat Bengaluru Mahanagara Palike)</option>
                    <option value="BTP">BTP (Bengaluru Traffic Police)</option>
                    <option value="NHAI">NHAI (National Highways Authority)</option>
                    <option value="DULT">DULT (Directorate of Urban Land Transport)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Allocated Budget (₹ Lakhs)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={actionForm.allocated_budget_lakhs} 
                    onChange={(e) => setActionForm({ ...actionForm, allocated_budget_lakhs: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label>Target Completion Date</label>
                  <input 
                    type="date" 
                    value={actionForm.target_date} 
                    onChange={(e) => setActionForm({ ...actionForm, target_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Operational Notes / Scope</label>
                <textarea 
                  rows="3"
                  placeholder="Scope of civil or enforcement work, tender details, contractor notes..."
                  value={actionForm.notes}
                  onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submittingAction}>
                  {submittingAction ? 'Creating...' : 'Log Municipal Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
