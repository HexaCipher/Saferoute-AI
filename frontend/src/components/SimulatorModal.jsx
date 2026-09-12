import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  CheckCircle, 
  Sparkles, 
  TrendingDown, 
  DollarSign, 
  Heart,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { apiService } from '../services/api';

export default function SimulatorModal({ 
  isOpen, 
  onClose, 
  corridors, 
  initialCorridor 
}) {
  const [selectedCorridorId, setSelectedCorridorId] = useState(initialCorridor?.id || corridors[0]?.id);
  const [checkedInterventions, setCheckedInterventions] = useState(['INT-01', 'INT-02']);

  if (!isOpen) return null;

  const currentCorridor = corridors.find(c => c.id === selectedCorridorId) || corridors[0];
  const sim = apiService.simulateInterventions(currentCorridor, checkedInterventions);

  const toggleCheck = (id) => {
    setCheckedInterventions(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!currentCorridor?.interventions) return;
    setCheckedInterventions(currentCorridor.interventions.map(i => i.id));
  };

  const handleReset = () => {
    setCheckedInterventions([]);
  };

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="simulator-modal-window" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-bar">
          <div className="modal-title-wrap">
            <div className="sim-icon-circle">
              <Sliders size={18} className="text-blue" />
            </div>
            <div>
              <h3 className="modal-title">What-If Intervention Simulator</h3>
              <p className="modal-sub">Model safety impact, lives saved, and budget ROI before breaking ground</p>
            </div>
          </div>
          <button className="modal-close-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="simulator-modal-body">
          {/* Corridor Picker Row */}
          <div className="sim-corridor-select-row">
            <label className="sim-label">Target Corridor:</label>
            <select 
              value={selectedCorridorId} 
              onChange={e => {
                setSelectedCorridorId(e.target.value);
                // Reset defaults for that corridor
                const nextCorridor = corridors.find(c => c.id === e.target.value);
                if (nextCorridor?.interventions) {
                  setCheckedInterventions([nextCorridor.interventions[0]?.id]);
                }
              }}
              className="sim-dropdown"
            >
              {corridors.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.corridor_name}) — Risk: {c.risk_score}/100
                </option>
              ))}
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

          {/* Real-time Simulated Impact Scoreboard */}
          {sim && (
            <div className="sim-scoreboard-grid">
              <div className="scoreboard-card score-comparison">
                <div className="score-duo-row">
                  <div className="score-item before">
                    <span className="lbl">Baseline Risk</span>
                    <span className="val text-red">{sim.original_risk_score}</span>
                    <span className="unit">/ 100</span>
                  </div>
                  <div className="score-arrow-huge">→</div>
                  <div className="score-item after">
                    <span className="lbl">Modeled Risk</span>
                    <span className="val text-green">{sim.simulated_risk_score}</span>
                    <span className="unit">/ 100</span>
                  </div>
                </div>
                <div className="score-delta-summary text-green">
                  ↓ {sim.score_reduction_points} points risk drop ({sim.accident_reduction_pct}% safer)
                </div>
              </div>

              <div className="scoreboard-card">
                <div className="sb-icon-row">
                  <Heart size={16} className="text-red" />
                  <span className="sb-label">Lives Saved / Year</span>
                </div>
                <div className="sb-huge-val text-green">+{sim.total_lives_saved_yearly}</div>
                <div className="sb-subtext">Estimated based on MoRTH fatality reduction factors</div>
              </div>

              <div className="scoreboard-card">
                <div className="sb-icon-row">
                  <DollarSign size={16} className="text-amber" />
                  <span className="sb-label">Estimated Capex</span>
                </div>
                <div className="sb-huge-val">₹{sim.total_cost_lakhs} <span className="val-unit">Lakhs</span></div>
                <div className="sb-subtext">Est. economic benefit: ₹{sim.economic_benefit_cr} Cr</div>
              </div>
            </div>
          )}

          {/* Interventions Checklist */}
          <div className="sim-interventions-section">
            <h4 className="sim-interventions-title">
              Available Countermeasures for {currentCorridor.name}
            </h4>
            <div className="sim-checkbox-list">
              {currentCorridor.interventions.map((item) => {
                const isChecked = checkedInterventions.includes(item.id);
                return (
                  <div 
                    key={item.id} 
                    className={`sim-check-card ${isChecked ? 'active' : ''}`}
                    onClick={() => toggleCheck(item.id)}
                  >
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      onChange={() => {}} 
                      className="sim-checkbox-input"
                    />
                    <div className="sim-card-body">
                      <div className="sim-card-header">
                        <span className="sim-card-title">{item.title}</span>
                        <span className="sim-cat-tag">{item.category}</span>
                      </div>
                      <div className="sim-card-sub">{item.subtitle} • Ready in: {item.timeframe}</div>
                    </div>
                    <div className="sim-card-impact">
                      <div className="sim-impact-cost">{item.cost}</div>
                      <div className="sim-impact-reduction text-green">{item.reduction} crashes</div>
                      <div className="sim-impact-lives text-green">{item.lives_saved} lives</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer-bar">
          <div className="footer-note">
            <ShieldCheck size={14} className="text-green" />
            <span>Simulations are backed by empirical BTP crash records & Bayesian impact models.</span>
          </div>
          <button className="primary-modal-cta" onClick={onClose}>
            Apply to Active Plan
          </button>
        </div>
      </div>
    </div>
  );
}
