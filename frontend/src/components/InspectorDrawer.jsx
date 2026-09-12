import React, { useState } from 'react';
import { 
  Bookmark, 
  Info, 
  ArrowUpRight, 
  Clock, 
  TrendingUp, 
  Bike, 
  Footprints, 
  Car, 
  Bus,
  ArrowRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { apiService } from '../services/api';

export default function InspectorDrawer({ corridor, onOpenSimulator }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookmarked, setBookmarked] = useState(false);
  const [activeInterventionIds, setActiveInterventionIds] = useState(['INT-01', 'INT-02']);

  if (!corridor) return null;

  const isCritical = corridor.risk_tier === 'Critical';
  const isHigh = corridor.risk_tier === 'High';

  let badgeColor = '#EF4444';
  if (isHigh) badgeColor = '#F97316';
  if (corridor.risk_tier === 'Medium') badgeColor = '#FBBF24';

  // Semi-circular gauge calculations (circumference for semi-circle)
  const radius = 68;
  const circumference = Math.PI * radius; // ~213.6
  const strokeDashoffset = circumference - (circumference * corridor.risk_score) / 100;

  // Real-time What-If calculations for the Interventions tab
  const simulationResult = apiService.simulateInterventions(corridor, activeInterventionIds);

  const toggleIntervention = (id) => {
    setActiveInterventionIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="inspector-drawer-panel">
      {/* 1. Top Hero Image Banner */}
      <div className="inspector-hero-banner">
        <img 
          src={corridor.banner_image || corridor.image} 
          alt={corridor.name} 
          className="hero-banner-bg"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=1200&q=85';
          }}
        />
        <div className="hero-banner-gradient"></div>

        {/* Hero Overlay Details */}
        <div className="hero-overlay-content">
          <div className="hero-text-block">
            <h2 className="hero-corridor-title">{corridor.name}</h2>
            <div className="hero-corridor-subtitle">{corridor.location}</div>
          </div>

          <div className="hero-actions-right">
            <span className="hero-critical-badge" style={{ backgroundColor: badgeColor }}>
              {corridor.status_tag}
            </span>
            <button 
              className={`hero-bookmark-btn ${bookmarked ? 'active' : ''}`}
              onClick={() => setBookmarked(!bookmarked)}
              title="Bookmark corridor for audit"
            >
              <Bookmark size={15} fill={bookmarked ? '#2563EB' : 'none'} color={bookmarked ? '#2563EB' : '#475569'} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Secondary Tab Navigation Bar */}
      <div className="inspector-nav-tabs">
        <button 
          className={`inspector-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`inspector-tab-btn ${activeTab === 'risk_factors' ? 'active' : ''}`}
          onClick={() => setActiveTab('risk_factors')}
        >
          Risk Factors
        </button>
        <button 
          className={`inspector-tab-btn ${activeTab === 'interventions' ? 'active' : ''}`}
          onClick={() => setActiveTab('interventions')}
        >
          Interventions
        </button>
        <button 
          className={`inspector-tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          Trends
        </button>
        <button 
          className={`inspector-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Gallery
        </button>
      </div>

      {/* 3. Tab Body Container */}
      <div className="inspector-tab-body">
        {activeTab === 'overview' && (
          <div className="overview-tab-flow">
            {/* ROW 1: Road Safety Score Gauge + 2023 Statistics */}
            <div className="gauge-stats-row">
              {/* Left: Road Safety Score */}
              <div className="score-gauge-card">
                <div className="card-section-label">
                  <span>Road Safety Score</span>
                  <Info size={13} className="info-hint-icon" title="Calculated from crash frequency, speed, and geometric conflict points" />
                </div>

                <div className="semi-gauge-visual-wrap">
                  <svg className="semi-gauge-svg" viewBox="0 0 160 95">
                    {/* Background Track Arc */}
                    <path
                      d="M 12 85 A 68 68 0 0 1 148 85"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="11"
                      strokeLinecap="round"
                    />
                    {/* Active Gradient Filled Arc */}
                    <path
                      d="M 12 85 A 68 68 0 0 1 148 85"
                      fill="none"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="11"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                    />
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F97316" />
                        <stop offset="100%" stopColor="#EF4444" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Big Center Score Number */}
                  <div className="gauge-center-text">
                    <span className="gauge-score-val">{corridor.risk_score}</span>
                    <span className="gauge-scale-max">/ 100</span>
                  </div>
                </div>

                <div className="gauge-subtext">
                  {corridor.percentile_rank}
                </div>
              </div>

              {/* Right: 2023 Statistics */}
              <div className="year-stats-card">
                <div className="card-section-label">2023 Statistics</div>
                <div className="stats-triad-grid">
                  <div className="triad-col">
                    <div className="triad-val">{corridor.stats_2023.crashes}</div>
                    <div className="triad-lbl">Crashes</div>
                    <div className="triad-delta text-red">
                      <ArrowUpRight size={12} />
                      <span>{corridor.stats_2023.crashes_yoy.split(' ')[0]}</span>
                    </div>
                    <div className="triad-period">vs. 2022</div>
                  </div>

                  <div className="triad-col">
                    <div className="triad-val text-red">{corridor.stats_2023.deaths}</div>
                    <div className="triad-lbl">Deaths</div>
                    <div className="triad-delta text-red">
                      <ArrowUpRight size={12} />
                      <span>{corridor.stats_2023.deaths_yoy.split(' ')[0]}</span>
                    </div>
                    <div className="triad-period">vs. 2022</div>
                  </div>

                  <div className="triad-col">
                    <div className="triad-val text-orange">{corridor.stats_2023.injuries}</div>
                    <div className="triad-lbl">Injuries</div>
                    <div className="triad-delta text-red">
                      <ArrowUpRight size={12} />
                      <span>{corridor.stats_2023.injuries_yoy.split(' ')[0]}</span>
                    </div>
                    <div className="triad-period">vs. 2022</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: Why it happens + Who is vulnerable? */}
            <div className="causes-vulnerability-row">
              {/* Left: Why it happens */}
              <div className="diagnostic-card">
                <div className="card-section-label">
                  Why it happens <span className="sub-label">(Key Contributing Factors)</span>
                </div>
                <div className="factors-progress-list">
                  {corridor.why_it_happens.map((item, idx) => (
                    <div key={idx} className="factor-bar-row">
                      <div className="factor-bar-labels">
                        <span className="factor-name">{item.factor}</span>
                        <span className="factor-pct">{item.percentage}%</span>
                      </div>
                      <div className="factor-track">
                        <div 
                          className="factor-fill" 
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: item.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Who is vulnerable? */}
              <div className="diagnostic-card">
                <div className="card-section-label">Who is vulnerable?</div>
                <div className="vulnerability-list">
                  {corridor.vulnerable_groups.map((group, idx) => {
                    let IconComponent = Bike;
                    if (group.icon === 'pedestrian') IconComponent = Footprints;
                    if (group.icon === 'car') IconComponent = Car;
                    if (group.icon === 'bus') IconComponent = Bus;

                    return (
                      <div key={idx} className="vulnerable-item-row">
                        <div className="vuln-left">
                          <IconComponent size={15} style={{ color: group.color }} />
                          <span className="vuln-name">{group.group}</span>
                        </div>
                        <span className="vuln-percentage" style={{ color: group.color }}>
                          {group.percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ROW 3: When risk is highest + AI Prediction */}
            <div className="temporal-prediction-row">
              {/* Left: When risk is highest */}
              <div className="diagnostic-card">
                <div className="card-section-label">When risk is highest</div>
                <div className="peak-hours-callout">
                  <Clock size={16} className="text-amber" />
                  <span className="peak-hours-time">{corridor.peak_risk.time_range}</span>
                </div>
                <p className="peak-hours-desc">{corridor.peak_risk.description}</p>

                {/* Hourly Bar Histogram */}
                <div className="hourly-histogram-wrap">
                  <div className="histogram-bars-row">
                    {corridor.peak_risk.hourly_bars.map((bar, idx) => (
                      <div key={idx} className="hist-bar-col">
                        <div 
                          className="hist-bar-fill" 
                          style={{ 
                            height: `${bar.value}%`,
                            backgroundColor: bar.value > 80 ? '#F59E0B' : '#CBD5E1'
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>
                  <div className="histogram-labels-row">
                    <span>6PM</span>
                    <span>9PM</span>
                    <span>12AM</span>
                    <span>3AM</span>
                    <span>6AM</span>
                  </div>
                </div>
              </div>

              {/* Right: AI Prediction (Next 12 Months) */}
              <div className="diagnostic-card">
                <div className="card-section-label">AI Prediction <span className="sub-label">(Next 12 Months)</span></div>
                <div className="ai-prediction-badges">
                  <div className="prediction-risk-tag text-red">
                    <TrendingUp size={14} />
                    <span>{corridor.ai_prediction.risk_level}</span>
                  </div>
                  <div className="confidence-pill">{corridor.ai_prediction.confidence}</div>
                </div>

                <div className="prediction-callout-text">
                  <strong>{corridor.ai_prediction.expected_crashes}</strong> {corridor.ai_prediction.context}
                </div>

                {/* Smooth Rising Curve SVG */}
                <div className="prediction-sparkline-wrap">
                  <svg className="sparkline-svg" viewBox="0 0 160 55" preserveAspectRatio="none">
                    <path
                      d="M 10 45 Q 40 40, 70 32 T 130 18 T 155 8"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 45 Q 40 40, 70 32 T 130 18 T 155 8 L 155 55 L 10 55 Z"
                      fill="rgba(239, 68, 68, 0.08)"
                    />
                    <circle cx="155" cy="8" r="3" fill="#EF4444" />
                  </svg>
                  <div className="sparkline-months-row">
                    <span>Jan</span>
                    <span>Mar</span>
                    <span>May</span>
                    <span>Jul</span>
                    <span>Sep</span>
                    <span>Nov</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 4: Recommended Interventions */}
            <div className="recommended-interventions-section">
              <div className="interventions-header-row">
                <h4 className="interventions-title">
                  Recommended Interventions <span className="sub-label">(Ranked by Expected Impact)</span>
                </h4>
                <button 
                  className="view-all-link-btn"
                  onClick={() => setActiveTab('interventions')}
                >
                  View all →
                </button>
              </div>

              {/* Table Column Labels */}
              <div className="interventions-table-header">
                <div className="col-intervention">Intervention</div>
                <div className="col-cost">Cost</div>
                <div className="col-reduction">Est. Accident Reduction</div>
                <div className="col-lives">Lives Saved / Year</div>
              </div>

              {/* Interventions List */}
              <div className="interventions-cards-stack">
                {corridor.interventions.map((item) => (
                  <div key={item.id} className="intervention-table-row">
                    {/* Rank Badge + Title & Subtitle */}
                    <div className="col-intervention intervention-main-info">
                      <div className="rank-square-badge">{item.rank}</div>
                      <div className="intervention-text-col">
                        <div className="item-title-row">
                          <span className="intervention-item-title">{item.title}</span>
                          <span className={`category-pill ${item.category === 'Enforcement' ? 'cat-orange' : 'cat-blue'}`}>
                            {item.category}
                          </span>
                        </div>
                        <div className="intervention-item-sub">{item.subtitle}</div>
                      </div>
                    </div>

                    {/* Cost */}
                    <div className="col-cost cost-val-text">{item.cost}</div>

                    {/* Accident Reduction */}
                    <div className="col-reduction reduction-val-text">{item.reduction}</div>

                    {/* Lives Saved */}
                    <div className="col-lives lives-val-text">{item.lives_saved}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Risk Factors Deep-Dive */}
        {activeTab === 'risk_factors' && (
          <div className="risk-factors-tab-flow">
            <h4 className="deep-tab-title">Causal Risk Diagnostics & Environmental Telemetry</h4>
            <p className="deep-tab-sub">Telemetry from Bengaluru Traffic Police (BTP) surveillance cameras and field geometric surveys.</p>
            
            <div className="factors-matrix-grid">
              <div className="matrix-card">
                <div className="matrix-card-title">Lighting & Illumination</div>
                <div className="matrix-card-val text-red">14.2 Lux <span className="val-unit">(Target: &gt;30 Lux)</span></div>
                <p className="matrix-desc">Low visibility at night between flyover pillars creates severe blind zones for merging two-wheelers.</p>
              </div>

              <div className="matrix-card">
                <div className="matrix-card-title">Sight Distance Conflict</div>
                <div className="matrix-card-val text-red">42m Stopping Sight <span className="val-unit">(Deficit: 38m)</span></div>
                <p className="matrix-desc">Sharp curvature on approach reduces braking reaction time for high-velocity vehicles.</p>
              </div>

              <div className="matrix-card">
                <div className="matrix-card-title">Speed Variance (ΔV)</div>
                <div className="matrix-card-val text-orange">48 km/h <span className="val-unit">(High Variance)</span></div>
                <p className="matrix-desc">Fast-moving airport cabs (80 km/h) converging with slow-moving commercial autos (32 km/h).</p>
              </div>

              <div className="matrix-card">
                <div className="matrix-card-title">Pedestrian Cross-Traffic</div>
                <div className="matrix-card-val text-red">1,420 crossings / hr <span className="val-unit">(At Grade)</span></div>
                <p className="matrix-desc">Heavy tech-park pedestrian flow jaywalking across 6-lane carriageway due to missing skywalk.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Interactive What-If Safety Simulator */}
        {activeTab === 'interventions' && (
          <div className="interventions-tab-flow">
            <div className="simulator-inline-header">
              <div>
                <h4 className="deep-tab-title">Interactive What-If Safety Simulator</h4>
                <p className="deep-tab-sub">Select proposed safety countermeasures to project risk score reductions and lives saved.</p>
              </div>
              <button 
                className="launch-full-sim-btn"
                onClick={onOpenSimulator}
              >
                <Sliders size={14} />
                <span>Full City Sandbox</span>
              </button>
            </div>

            {/* Live Projected Impact Bar */}
            {simulationResult && (
              <div className="simulation-live-metrics-bar">
                <div className="sim-stat-col">
                  <div className="sim-lbl">Current Risk</div>
                  <div className="sim-val text-red">{simulationResult.original_risk_score} / 100</div>
                </div>
                <div className="sim-arrow">→</div>
                <div className="sim-stat-col">
                  <div className="sim-lbl">Simulated Risk</div>
                  <div className="sim-val text-green">{simulationResult.simulated_risk_score} / 100</div>
                </div>
                <div className="sim-stat-col">
                  <div className="sim-lbl">Accident Reduction</div>
                  <div className="sim-val text-green">-{simulationResult.accident_reduction_pct}%</div>
                </div>
                <div className="sim-stat-col">
                  <div className="sim-lbl">Lives Saved / Yr</div>
                  <div className="sim-val text-green">+{simulationResult.total_lives_saved_yearly} Lives</div>
                </div>
                <div className="sim-stat-col">
                  <div className="sim-lbl">Total Budget</div>
                  <div className="sim-val">₹{simulationResult.total_cost_lakhs} Lakhs</div>
                </div>
              </div>
            )}

            {/* Checklist of Interventions */}
            <div className="interactive-countermeasures-list">
              {corridor.interventions.map((item) => {
                const isChecked = activeInterventionIds.includes(item.id);
                return (
                  <div 
                    key={item.id} 
                    className={`countermeasure-item ${isChecked ? 'active-countermeasure' : ''}`}
                    onClick={() => toggleIntervention(item.id)}
                  >
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      onChange={() => {}} // Handled by div onClick
                      className="countermeasure-check"
                    />
                    <div className="countermeasure-content">
                      <div className="countermeasure-title-row">
                        <span className="countermeasure-title">{item.title}</span>
                        <span className="countermeasure-badge">{item.category}</span>
                      </div>
                      <div className="countermeasure-sub">{item.subtitle} • Implementation: {item.timeframe}</div>
                    </div>
                    <div className="countermeasure-impact-stats">
                      <div className="impact-cost">{item.cost}</div>
                      <div className="impact-reduction text-green">{item.reduction} crashes</div>
                      <div className="impact-lives text-green">{item.lives_saved} lives/yr</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Historical Trends */}
        {activeTab === 'trends' && (
          <div className="trends-tab-flow">
            <h4 className="deep-tab-title">Corridor Casualty Trends (2019 – 2024)</h4>
            <p className="deep-tab-sub">Historical longitudinal crash records mapped across seasonal rainfall and transit phases.</p>
            <div className="trend-historical-card">
              <div className="trend-year-stat">
                <span className="stat-yr">2023:</span> 142 crashes (23 fatal, 118 serious injuries)
              </div>
              <div className="trend-year-stat">
                <span className="stat-yr">2022:</span> 112 crashes (19 fatal, 93 serious injuries)
              </div>
              <div className="trend-year-stat">
                <span className="stat-yr">2021:</span> 98 crashes (15 fatal, 81 serious injuries)
              </div>
              <div className="trend-year-stat">
                <span className="stat-yr">2020:</span> 74 crashes (Lockdown impacted periods)
              </div>
              <div className="trend-year-stat">
                <span className="stat-yr">2019:</span> 126 crashes (Pre-metro construction baseline)
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Site Gallery */}
        {activeTab === 'gallery' && (
          <div className="gallery-tab-flow">
            <h4 className="deep-tab-title">Corridor Photographic Documentation</h4>
            <div className="gallery-grid">
              <img src={corridor.banner_image} alt="Night drone" className="gallery-photo" />
              <img src={corridor.image} alt="Junction day" className="gallery-photo" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
