import React from 'react';
import { 
  ShieldAlert, 
  HelpCircle, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  DollarSign, 
  Calendar 
} from 'lucide-react';

export default function SpotInspector({ spot, onClose }) {
  if (!spot) {
    return (
      <div className="inspector-card empty-state">
        <div className="empty-icon">
          <ShieldAlert size={48} />
        </div>
        <h3>Select a Road Segment</h3>
        <p>Click on any marker on the Bengaluru map or choose from the corridor list to view explainable risk causes, predictions, and ranked safety interventions.</p>
      </div>
    );
  }

  const isCritical = spot.risk_level === 'Critical';
  const scoreColor = isCritical ? '#ef4444' : '#f97316';

  // Calculate total modeled lives saved across top 3 interventions
  const totalLivesSaved = spot.interventions.reduce((sum, item) => sum + item.estimated_lives_saved_yearly, 0);
  const maxReductionPct = Math.max(...spot.interventions.map(i => i.accident_reduction_pct));

  return (
    <div className="inspector-card active-inspector">
      {/* 1. Header with Name & 0-100 Risk Score */}
      <div className="inspector-header">
        <div className="header-left">
          <span className={`tag-pill ${isCritical ? 'pill-critical' : 'pill-high'}`}>
            {spot.risk_level.toUpperCase()} HAZARD
          </span>
          <h2 className="corridor-title">{spot.name}</h2>
          <div className="corridor-sub">{spot.location} • <span className="text-secondary">{spot.corridor_type}</span></div>
        </div>

        <div className="risk-score-badge" style={{ borderColor: scoreColor }}>
          <div className="risk-num" style={{ color: scoreColor }}>{spot.risk_score}</div>
          <div className="risk-scale">/ 100 RISK</div>
        </div>
      </div>

      {/* Corridor Baseline Stats */}
      <div className="corridor-metrics-row">
        <div className="metric-box">
          <span className="metric-val">{spot.accident_count_2023}</span>
          <span className="metric-lbl">2023 Crashes</span>
        </div>
        <div className="metric-box">
          <span className="metric-val text-red">{spot.fatalities_2023}</span>
          <span className="metric-lbl">Deaths</span>
        </div>
        <div className="metric-box">
          <span className="metric-val text-orange">{spot.injuries_2023}</span>
          <span className="metric-lbl">Injuries</span>
        </div>
      </div>

      <div className="inspector-scroll-content">
        {/* 2. Cause Analysis: Explain Why Risk is High (Explainable AI) */}
        <div className="section-block">
          <div className="section-title-wrap">
            <HelpCircle size={18} className="sec-icon text-orange" />
            <h4 className="section-title">Why Accidents Occur Here (Causal Analysis)</h4>
          </div>
          <div className="primary-cause-callout">
            <strong>Primary Factor:</strong> {spot.primary_cause}
          </div>

          <div className="factors-breakdown">
            {spot.causes_breakdown.map((cause, idx) => (
              <div key={idx} className="factor-item">
                <div className="factor-header">
                  <span className="factor-name">{cause.factor}</span>
                  <span className="factor-pct">{cause.percentage}%</span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${cause.percentage}%`,
                      backgroundColor: idx === 0 ? '#ef4444' : idx === 1 ? '#f97316' : '#eab308' 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Who & When: Vulnerability Profile + Peak Temporal Risk */}
        <div className="grid-two-col">
          {/* Who is Vulnerable */}
          <div className="section-block compact">
            <div className="section-title-wrap">
              <Users size={16} className="sec-icon text-blue" />
              <h4 className="section-title">Who is Vulnerable</h4>
            </div>
            <div className="vuln-list">
              {spot.vulnerable_groups.map((v, idx) => (
                <div key={idx} className="vuln-pill">
                  <span className="vuln-group">{v.group}</span>
                  <span className="vuln-share">{v.share}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* When is Risk Highest */}
          <div className="section-block compact">
            <div className="section-title-wrap">
              <Clock size={16} className="sec-icon text-yellow" />
              <h4 className="section-title">When Risk is Highest</h4>
            </div>
            <div className="time-badge">
              <span className="time-highlight">{spot.peak_risk_hours}</span>
              <span className="time-desc">Night & peak shift convergence</span>
            </div>
          </div>
        </div>

        {/* 4. Prediction: Future Forecast */}
        <div className="section-block highlight-block">
          <div className="section-title-wrap">
            <TrendingUp size={18} className="sec-icon text-purple" />
            <h4 className="section-title">AI Predictive Forecast (Next Quarter)</h4>
          </div>
          <div className="forecast-grid">
            <div className="forecast-metric">
              <span className="fc-label">Projected Trend</span>
              <span className="fc-value text-red">{spot.future_prediction.quarterly_trend}</span>
            </div>
            <div className="forecast-metric">
              <span className="fc-label">Est. Collisions (Untreated)</span>
              <span className="fc-value">{spot.future_prediction.predicted_accidents_next_q}</span>
            </div>
          </div>
          <div className="forecast-note">
            ⚠️ <strong>Model Note:</strong> {spot.future_prediction.severity_forecast}
          </div>
        </div>

        {/* 5 & 6. Ranked Interventions & Modeled Impact */}
        <div className="section-block">
          <div className="section-title-wrap between">
            <div className="flex-inline">
              <Sparkles size={18} className="sec-icon text-green" />
              <h4 className="section-title">Ranked Interventions (Prescriptive Plan)</h4>
            </div>
            <span className="badge-pill green-pill">≥ 3 Ranked Actions</span>
          </div>

          {/* Summary ROI Strip */}
          <div className="impact-summary-banner">
            <div className="banner-item">
              <span className="banner-label">Max Crash Reduction</span>
              <span className="banner-val text-green">-{maxReductionPct}%</span>
            </div>
            <div className="banner-sep"></div>
            <div className="banner-item">
              <span className="banner-label">Lives Saved (Annual)</span>
              <span className="banner-val text-green">+{totalLivesSaved} lives</span>
            </div>
            <div className="banner-sep"></div>
            <div className="banner-item">
              <span className="banner-label">Benefit-Cost Ratio</span>
              <span className="banner-val text-blue">9.2x</span>
            </div>
          </div>

          {/* List of 3 Interventions */}
          <div className="interventions-list">
            {spot.interventions.map((item) => (
              <div key={item.rank} className="intervention-card">
                <div className="card-top">
                  <div className="rank-circle">#{item.rank}</div>
                  <div className="card-header-info">
                    <div className="inter-cat-tag">{item.category}</div>
                    <div className="inter-title">{item.title}</div>
                  </div>
                </div>

                <div className="card-impact-metrics">
                  <div className="metric-chip green-chip">
                    <CheckCircle2 size={13} />
                    <span>-{item.accident_reduction_pct}% Accidents</span>
                  </div>
                  <div className="metric-chip blue-chip">
                    <Users size={13} />
                    <span>+{item.estimated_lives_saved_yearly} Lives Saved</span>
                  </div>
                  <div className="metric-chip gray-chip">
                    <DollarSign size={13} />
                    <span>₹{item.cost_inr_lakhs} Lakhs</span>
                  </div>
                  <div className="metric-chip gray-chip">
                    <Calendar size={13} />
                    <span>{item.timeframe}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
