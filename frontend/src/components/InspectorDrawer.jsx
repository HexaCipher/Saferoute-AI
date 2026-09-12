import React, { useState, useEffect } from 'react';
import { 
  Info, 
  Bike,
  Sliders, 
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  LightbulbOff,
  Sparkles,
  RotateCcw,
  Building2,
  Bookmark
} from 'lucide-react';
import { apiService } from '../services/api';

export default function InspectorDrawer({ selectedSegmentId, onOpenSimulator }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookmarked, setBookmarked] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch live segment detail on segmentId change
  useEffect(() => {
    if (!selectedSegmentId) {
      return;
    }

    let isMounted = true;
    async function loadSegment() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getSegmentDetail(selectedSegmentId);
        if (isMounted) {
          setDetail(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load segment telemetry');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSegment();

    return () => {
      isMounted = false;
    };
  }, [selectedSegmentId]);

  if (!selectedSegmentId) {
    return (
      <div className="inspector-drawer-panel empty-selection-panel">
        <div className="empty-selection-card">
          <ShieldAlert size={36} className="text-muted empty-icon" />
          <h3 className="empty-title">No Segment Selected</h3>
          <p className="empty-desc">
            Click any 500m road segment on the satellite map or corridor list to inspect real-time safety metrics, crash history, and ML diagnostics.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="inspector-drawer-panel is-loading">
        <div className="inspector-loading-header skeleton-pulse"></div>
        <div className="inspector-loading-body">
          <div className="skeleton-card skeleton-pulse"></div>
          <div className="skeleton-card skeleton-pulse"></div>
          <div className="skeleton-card skeleton-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="inspector-drawer-panel is-error">
        <div className="inspector-error-card">
          <AlertTriangle size={32} className="text-red" />
          <h3 className="error-title">Telemetry Unavailable</h3>
          <p className="error-desc">{error || 'Could not fetch segment details from the backend.'}</p>
          <button 
            className="error-retry-btn"
            onClick={() => {
              setLoading(true);
              apiService.getSegmentDetail(selectedSegmentId)
                .then(setDetail)
                .catch(e => setError(e.message))
                .finally(() => setLoading(false));
            }}
          >
            <RotateCcw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  const { metrics, infrastructure, btp_jurisdiction, risk_explanation, vulnerable_road_users } = detail;
  const safetyScore = Math.round(metrics?.safety_score || 0);
  const tier = (metrics?.risk_tier || 'LOW').toUpperCase();

  let badgeColor = '#10B981';
  if (tier === 'CRITICAL') badgeColor = '#EF4444';
  else if (tier === 'HIGH') badgeColor = '#F97316';
  else if (tier === 'MEDIUM') badgeColor = '#FBBF24';

  // Semi-circular gauge math
  const radius = 68;
  const circumference = Math.PI * radius; // ~213.6
  const strokeDashoffset = circumference - (circumference * safetyScore) / 100;

  return (
    <div className="inspector-drawer-panel">
      {/* 1. Header Banner */}
      <div className="inspector-header-bar">
        <div className="header-meta-wrap">
          <div className="header-meta-row">
            <span className="segment-id-badge">{detail.segment_id}</span>
            <span className="corridor-tag-badge">{detail.corridor_id}</span>
            <span className="risk-tier-pill" style={{ backgroundColor: badgeColor }}>
              {tier} RISK
            </span>
          </div>

          <h2 className="inspector-road-title">{detail.road_name || 'Road Segment'}</h2>
          <div className="inspector-subtitle">
            <span>{detail.corridor_name}</span>
            <span className="meta-sep">•</span>
            <span>{infrastructure?.road_type}</span>
            <span className="meta-sep">•</span>
            <span>{metrics?.segment_length_m}m</span>
          </div>

          {btp_jurisdiction?.station_name && (
            <div className="police-jurisdiction-chip">
              <Building2 size={12} className="text-muted" />
              <span>{btp_jurisdiction.station_name}</span>
            </div>
          )}
        </div>

        <div className="header-actions-group">
          <button 
            className={`hero-bookmark-btn ${bookmarked ? 'active' : ''}`}
            onClick={() => setBookmarked(!bookmarked)}
            title="Bookmark segment for municipal review"
          >
            <Bookmark size={15} fill={bookmarked ? '#2563EB' : 'none'} color={bookmarked ? '#2563EB' : '#64748B'} />
          </button>
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
          className={`inspector-tab-btn ${activeTab === 'infrastructure' ? 'active' : ''}`}
          onClick={() => setActiveTab('infrastructure')}
        >
          Infrastructure
        </button>
        <button 
          className={`inspector-tab-btn ${activeTab === 'interventions' ? 'active' : ''}`}
          onClick={() => setActiveTab('interventions')}
        >
          Interventions
        </button>
      </div>

      {/* 3. Tab Body Container */}
      <div className="inspector-tab-body">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="overview-tab-flow">
            {/* Safety Score Gauge + BTP Crash Statistics */}
            <div className="gauge-stats-row">
              {/* Road Safety Score Gauge */}
              <div className="score-gauge-card">
                <div className="card-section-label">
                  <span>ML Safety Score</span>
                  <Info size={13} className="info-hint-icon" title="Evaluated by trained XGBoost RiskEngine with 21 empirical features" />
                </div>

                <div className="semi-gauge-visual-wrap">
                  <svg className="semi-gauge-svg" viewBox="0 0 160 95">
                    <path
                      d="M 12 85 A 68 68 0 0 1 148 85"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="11"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 12 85 A 68 68 0 0 1 148 85"
                      fill="none"
                      stroke="url(#safetyGaugeGradient)"
                      strokeWidth="11"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                    />
                    <defs>
                      <linearGradient id="safetyGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#EF4444" />
                        <stop offset="50%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="gauge-center-text">
                    <span className="gauge-score-val">{safetyScore}</span>
                    <span className="gauge-scale-max">/ 100</span>
                  </div>
                </div>

                <div className="gauge-subtext">
                  <span>Confidence: <strong>{metrics?.confidence_level}</strong></span>
                  <span className="bullet-sep">•</span>
                  <span>Risk Score: {((metrics?.risk_score || 0) * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* BTP Jurisdiction Historical Signals */}
              <div className="year-stats-card">
                <div className="card-section-label">
                  <span>BTP Jurisdiction History (2023)</span>
                </div>
                <div className="stats-triad-grid">
                  <div className="triad-col">
                    <div className="triad-val">{btp_jurisdiction?.historical_signals?.total_crashes_2023 || 0}</div>
                    <div className="triad-lbl">Total Crashes</div>
                    <div className="triad-period">Station Area</div>
                  </div>

                  <div className="triad-col">
                    <div className="triad-val text-red">{btp_jurisdiction?.historical_signals?.fatalities_2023 || 0}</div>
                    <div className="triad-lbl">Fatalities</div>
                    <div className="triad-period">{btp_jurisdiction?.historical_signals?.fatal_crashes_2023 || 0} Fatal</div>
                  </div>

                  <div className="triad-col">
                    <div className="triad-val text-orange">{btp_jurisdiction?.historical_signals?.injuries_2023 || 0}</div>
                    <div className="triad-lbl">Injuries</div>
                    <div className="triad-period">2023 Recorded</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vulnerable Road Users Summary */}
            <div className="vru-summary-card">
              <div className="card-section-label">Primary Vulnerable Road User</div>
              <div className="vru-content-row">
                <div className="vru-avatar-circle">
                  <Bike size={22} className="text-red" />
                </div>
                <div className="vru-text-meta">
                  <div className="vru-cohort-name">{vulnerable_road_users?.primary_vulnerable_group || 'Two-Wheelers'}</div>
                  <div className="vru-risk-badges">
                    <span className="risk-tag tag-red">Two-Wheelers: {vulnerable_road_users?.two_wheeler_risk}</span>
                    <span className="risk-tag tag-amber">Pedestrians: {vulnerable_road_users?.pedestrian_risk}</span>
                  </div>
                </div>
              </div>
              <p className="vru-justification">{vulnerable_road_users?.justification}</p>
            </div>

            {/* Quick Action to Simulator */}
            <div className="simulator-callout-card">
              <div className="callout-left">
                <Sparkles size={20} className="text-blue" />
                <div>
                  <div className="callout-title">Simulate Targeted Interventions</div>
                  <div className="callout-sub">Test lighting upgrades, speed radar, and junction redesign for this segment.</div>
                </div>
              </div>
              <button className="primary-action-btn" onClick={onOpenSimulator}>
                <Sliders size={14} />
                <span>Simulate</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: RISK FACTORS */}
        {activeTab === 'risk_factors' && (
          <div className="risk-factors-tab-flow">
            {/* AI Risk Explanation Summary */}
            <div className="risk-summary-card">
              <div className="card-section-label">Diagnostic Summary</div>
              <p className="risk-summary-text">{risk_explanation?.summary}</p>
            </div>

            {/* Top Contributing Factors Progress List */}
            <div className="factors-card">
              <div className="card-section-label">Top Contributing Features (Relative Weight)</div>
              <div className="factors-progress-list">
                {(risk_explanation?.top_contributing_factors || []).map((factor, idx) => {
                  const increases = factor.direction === 'increases_risk';
                  return (
                    <div key={idx} className="factor-bar-row">
                      <div className="factor-bar-labels">
                        <span className="factor-name">{factor.label}</span>
                        <span className={`factor-dir-pill ${increases ? 'dir-hazard' : 'dir-mitigate'}`}>
                          {increases ? '▲ Increases Hazard' : '▼ Mitigates Hazard'}
                        </span>
                        <span className="factor-pct">{factor.relative_contribution_pct}%</span>
                      </div>
                      <div className="factor-track">
                        <div 
                          className="factor-fill" 
                          style={{ 
                            width: `${Math.min(factor.relative_contribution_pct, 100)}%`,
                            backgroundColor: increases ? '#EF4444' : '#10B981'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INFRASTRUCTURE */}
        {activeTab === 'infrastructure' && (
          <div className="infrastructure-tab-flow">
            <div className="infra-grid-container">
              <div className="infra-data-item">
                <div className="lbl">Road Classification</div>
                <div className="val">{infrastructure?.road_type || 'N/A'}</div>
              </div>

              <div className="infra-data-item">
                <div className="lbl">Traffic Lanes</div>
                <div className="val">{infrastructure?.lanes || 'Unspecified'}</div>
              </div>

              <div className="infra-data-item">
                <div className="lbl">Speed Limit</div>
                <div className="val">{infrastructure?.speed_limit_kph ? `${infrastructure.speed_limit_kph} km/h` : '30 km/h'}</div>
              </div>

              <div className="infra-data-item">
                <div className="lbl">Street Lighting</div>
                <div className="val flex-center-val">
                  {infrastructure?.street_lighting === 'yes' ? (
                    <>
                      <Lightbulb size={14} className="text-green" />
                      <span>Verified IRC Standard</span>
                    </>
                  ) : (
                    <>
                      <LightbulbOff size={14} className="text-amber" />
                      <span>Unverified / Dark Spot</span>
                    </>
                  )}
                </div>
              </div>

              <div className="infra-data-item">
                <div className="lbl">Intersection Conflict Density</div>
                <div className="val">{infrastructure?.junction_density_per_km} junctions/km</div>
                <div className="sub">{infrastructure?.junction_count} mapped junctions</div>
              </div>

              <div className="infra-data-item">
                <div className="lbl">Pedestrian Crossings</div>
                <div className="val">{infrastructure?.crossing_count} cataloged</div>
              </div>

              <div className="infra-data-item">
                <div className="lbl">Transit Bus Stops</div>
                <div className="val">{infrastructure?.bus_stop_count} stops</div>
              </div>

              <div className="infra-data-item">
                <div className="lbl">Segment Length</div>
                <div className="val">{metrics?.segment_length_m} meters</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INTERVENTIONS */}
        {activeTab === 'interventions' && (
          <div className="interventions-tab-flow">
            <div className="sim-interventions-intro">
              <div className="card-section-label">Supported Mitigation Measures</div>
              <p className="intro-text">
                SafeRoute AI simulates empirical feature changes for this 500m segment using our trained ML risk engine.
              </p>
            </div>

            <div className="interventions-preview-list">
              <div className="intervention-preview-card">
                <div className="card-top">
                  <span className="it-title">High-Mast Smart LED Lighting Upgrade</span>
                  <span className="it-status">
                    {infrastructure?.street_lighting === 'yes' ? 'Already Verified' : 'Recommended'}
                  </span>
                </div>
                <p className="it-desc">Eliminates night dark spots, raising ambient illumination to IRC standards.</p>
              </div>

              <div className="intervention-preview-card">
                <div className="card-top">
                  <span className="it-title">Automated Speed Violation Radar</span>
                  <span className="it-status">Applicable</span>
                </div>
                <p className="it-desc">Enforces speed limit compliance upstream of high-speed conflict zones.</p>
              </div>

              <div className="intervention-preview-card">
                <div className="card-top">
                  <span className="it-title">Intersection Geometric Redesign</span>
                  <span className="it-status">
                    {infrastructure?.junction_count > 0 ? 'High Priority' : 'Standard'}
                  </span>
                </div>
                <p className="it-desc">Realigns entry/exit lanes to reduce turning friction and side-swipe collisions.</p>
              </div>

              <div className="intervention-preview-card">
                <div className="card-top">
                  <span className="it-title">Zebra Crossing with Median Refuge</span>
                  <span className="it-status">Applicable</span>
                </div>
                <p className="it-desc">Provides safe mid-block pedestrian passage near high-transit nodes.</p>
              </div>
            </div>

            <button className="full-simulator-cta-btn" onClick={onOpenSimulator}>
              <Sliders size={16} />
              <span>Launch Interactive What-If Simulator</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
