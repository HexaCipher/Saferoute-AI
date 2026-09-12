import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Bike, 
  Users, 
  Zap, 
  Activity, 
  TrendingDown, 
  Building2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export default function RiskAnalysisView({
  summary,
  segments = [],
  onSelectSegment,
  onNavigateToOverview
}) {
  const riskDist = summary?.risk_distribution || {};
  const vruBreakdown = summary?.vru_vulnerability_breakdown || {};
  const infra = summary?.infrastructure_highlights || {};
  const projectedImpact = summary?.projected_impact || {};

  // Aggregate segments by BTP station
  const stationStats = {};
  segments.forEach((seg) => {
    const station = seg.properties?.btp_station || 'Unknown';
    if (!stationStats[station]) {
      stationStats[station] = {
        name: station,
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        totalKm: 0,
        sampleSegmentId: seg.properties?.segment_id
      };
    }
    stationStats[station].total += 1;
    stationStats[station].totalKm += (seg.properties?.segment_length_m || 500) / 1000;
    const tier = seg.properties?.risk_tier;
    if (tier === 'CRITICAL') stationStats[station].critical += 1;
    else if (tier === 'HIGH') stationStats[station].high += 1;
    else if (tier === 'MEDIUM') stationStats[station].medium += 1;
    else if (tier === 'LOW') stationStats[station].low += 1;
  });

  const sortedStations = Object.values(stationStats)
    .sort((a, b) => (b.critical * 3 + b.high) - (a.critical * 3 + a.high));

  return (
    <div className="risk-analysis-view-container">
      {/* Header Banner */}
      <div className="view-header-bar">
        <div>
          <div className="view-tag">
            <ShieldAlert size={13} className="text-red" />
            <span>Empirical ML Risk Engine</span>
          </div>
          <h2 className="view-title">Bengaluru Night-Time Risk Architecture</h2>
          <p className="view-subtitle">
            Calibrated probabilistic model combining BTP accident history (2022–2023), OpenStreetMap road geometries, and MoRTH night-time crash coefficients
          </p>
        </div>
      </div>

      {/* 4 Risk Tier Overview Cards */}
      <div className="risk-tiers-grid">
        <div className="risk-tier-card critical">
          <div className="tier-header">
            <span className="tier-badge critical">CRITICAL RISK</span>
            <AlertTriangle size={18} className="text-red" />
          </div>
          <div className="tier-main-num">
            {riskDist.CRITICAL?.segment_count || 29}
            <span className="tier-unit">segments</span>
          </div>
          <div className="tier-progress-track">
            <div 
              className="tier-progress-fill critical" 
              style={{ width: `${riskDist.CRITICAL?.percentage || 6.8}%` }}
            />
          </div>
          <div className="tier-stats-footer">
            <span>{riskDist.CRITICAL?.percentage || 6.8}% of network</span>
            <span>{riskDist.CRITICAL?.total_km || 3.02} km hazard</span>
          </div>
          <p className="tier-desc">Safety score &lt; 40. Immediate engineering or enforcement intervention required.</p>
        </div>

        <div className="risk-tier-card high">
          <div className="tier-header">
            <span className="tier-badge high">HIGH RISK</span>
            <AlertCircle size={18} className="text-orange" />
          </div>
          <div className="tier-main-num">
            {riskDist.HIGH?.segment_count || 125}
            <span className="tier-unit">segments</span>
          </div>
          <div className="tier-progress-track">
            <div 
              className="tier-progress-fill high" 
              style={{ width: `${riskDist.HIGH?.percentage || 29.2}%` }}
            />
          </div>
          <div className="tier-stats-footer">
            <span>{riskDist.HIGH?.percentage || 29.2}% of network</span>
            <span>{riskDist.HIGH?.total_km || 52.1} km stretch</span>
          </div>
          <p className="tier-desc">Safety score 40–59. Elevated nighttime conflict points and weaving friction.</p>
        </div>

        <div className="risk-tier-card medium">
          <div className="tier-header">
            <span className="tier-badge medium">MEDIUM RISK</span>
            <Activity size={18} className="text-amber" />
          </div>
          <div className="tier-main-num">
            {riskDist.MEDIUM?.segment_count || 134}
            <span className="tier-unit">segments</span>
          </div>
          <div className="tier-progress-track">
            <div 
              className="tier-progress-fill medium" 
              style={{ width: `${riskDist.MEDIUM?.percentage || 31.3}%` }}
            />
          </div>
          <div className="tier-stats-footer">
            <span>{riskDist.MEDIUM?.percentage || 31.3}% of network</span>
            <span>{riskDist.MEDIUM?.total_km || 52.14} km stretch</span>
          </div>
          <p className="tier-desc">Safety score 60–79. Moderate speeds with periodic crossing or lighting gaps.</p>
        </div>

        <div className="risk-tier-card low">
          <div className="tier-header">
            <span className="tier-badge low">LOW RISK / SAFE</span>
            <ShieldCheck size={18} className="text-emerald" />
          </div>
          <div className="tier-main-num">
            {riskDist.LOW?.segment_count || 131}
            <span className="tier-unit">segments</span>
          </div>
          <div className="tier-progress-track">
            <div 
              className="tier-progress-fill low" 
              style={{ width: `${riskDist.LOW?.percentage || 30.6}%` }}
            />
          </div>
          <div className="tier-stats-footer">
            <span>{riskDist.LOW?.percentage || 30.6}% of network</span>
            <span>{riskDist.LOW?.total_km || 54.66} km stretch</span>
          </div>
          <p className="tier-desc">Safety score 80–100. Lower operating speeds, grade separation, and calm flows.</p>
        </div>
      </div>

      {/* Two Column In-Depth Analysis */}
      <div className="risk-analysis-columns">
        {/* Left Column: VRU Vulnerability & Infrastructure Deficit */}
        <div className="analysis-col">
          {/* VRU Card */}
          <div className="analysis-card">
            <div className="card-header-with-icon">
              <div className="icon-badge vru">
                <Bike size={18} />
              </div>
              <div>
                <h3 className="card-header-title">Vulnerable Road User (VRU) Vulnerability</h3>
                <p className="card-header-subtitle">Night-time casualty distribution aligned with MoRTH national data</p>
              </div>
            </div>

            <div className="vru-breakdown-list">
              <div className="vru-row-item">
                <div className="vru-info">
                  <div className="vru-label-wrap">
                    <Bike size={16} className="text-red" />
                    <span className="vru-name">Two-Wheelers (Motorcycles / Scooters)</span>
                  </div>
                  <span className="vru-pct text-red">{vruBreakdown['Two-Wheelers'] || 90.0}%</span>
                </div>
                <div className="vru-bar-track">
                  <div className="vru-bar-fill red" style={{ width: `${vruBreakdown['Two-Wheelers'] || 90}%` }} />
                </div>
                <p className="vru-meta-text">
                  Multi-lane arterials with 60–80 km/h speed differentials and weaving near flyover on/off-ramps create acute rear-end fatality hazards.
                </p>
              </div>

              <div className="vru-row-item">
                <div className="vru-info">
                  <div className="vru-label-wrap">
                    <Users size={16} className="text-orange" />
                    <span className="vru-name">Two-Wheelers & Pedestrians (Mixed Conflicts)</span>
                  </div>
                  <span className="vru-pct text-orange">{vruBreakdown['Two-Wheelers & Pedestrians'] || 8.2}%</span>
                </div>
                <div className="vru-bar-track">
                  <div className="vru-bar-fill orange" style={{ width: `${(vruBreakdown['Two-Wheelers & Pedestrians'] || 8.2) * 5}%` }} />
                </div>
                <p className="vru-meta-text">
                  Occurs at high-density transit stops (bus bays, tech park entries) lacking grade-separated crossing facilities.
                </p>
              </div>

              <div className="vru-row-item">
                <div className="vru-info">
                  <div className="vru-label-wrap">
                    <Users size={16} className="text-amber" />
                    <span className="vru-name">Pedestrians (Isolated Crossings)</span>
                  </div>
                  <span className="vru-pct text-amber">{vruBreakdown['Pedestrians'] || 1.9}%</span>
                </div>
                <div className="vru-bar-track">
                  <div className="vru-bar-fill amber" style={{ width: `${(vruBreakdown['Pedestrians'] || 1.9) * 10}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Deficit Diagnostics */}
          <div className="analysis-card">
            <div className="card-header-with-icon">
              <div className="icon-badge infra">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="card-header-title">Infrastructure Deficit Diagnostics</h3>
                <p className="card-header-subtitle">Key structural hazard drivers identified across 161.9 km</p>
              </div>
            </div>

            <div className="infra-grid-stats">
              <div className="infra-stat-box">
                <span className="box-metric text-red">{infra.unverified_or_unlit_km || 161.9} km</span>
                <span className="box-title">Unverified / Dark Stretches</span>
                <span className="box-sub">Street lighting lacks smart verification or telemetry</span>
              </div>

              <div className="infra-stat-box">
                <span className="box-metric text-orange">{infra.avg_junction_density_per_km || 6.94} /km</span>
                <span className="box-title">Conflict Density</span>
                <span className="box-sub">Average intersections and weaving points per kilometer</span>
              </div>

              <div className="infra-stat-box">
                <span className="box-metric text-blue">{infra.total_crossings_cataloged || 742}</span>
                <span className="box-title">Pedestrian Crossings</span>
                <span className="box-sub">Crossings mapped across 428 segments</span>
              </div>

              <div className="infra-stat-box">
                <span className="box-metric text-amber">{infra.total_bus_stops_cataloged || 35}</span>
                <span className="box-title">Transit Friction Nodes</span>
                <span className="box-sub">Bus bays inducing mid-block pedestrian crossing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Police Station Risk Breakdown & Projected Impact */}
        <div className="analysis-col">
          {/* Projected Impact Card */}
          <div className="analysis-card highlighted">
            <div className="impact-header-row">
              <div className="impact-icon-badge">
                <TrendingDown size={22} className="text-emerald" />
              </div>
              <div>
                <span className="impact-tag">VISION ZERO PROJECTION</span>
                <h3 className="impact-title">Projected Casualty Reduction</h3>
              </div>
              <div className="impact-highlight-num">
                -{projectedImpact.estimated_casualty_reduction_if_critical_fixed_pct || 26.5}%
              </div>
            </div>

            <p className="impact-body-text">
              {projectedImpact.key_takeaway || 
                'Addressing the 29 critical segments with targeted lighting upgrades, automated speed enforcement radars, and intersection channelization delivers a projected 26.5% reduction in night-time severe crashes.'
              }
            </p>

            <div className="impact-quick-stats">
              <div className="impact-qstat">
                <span className="qstat-val">{projectedImpact.critical_segments_count || 29}</span>
                <span className="qstat-label">Critical Segments</span>
              </div>
              <div className="impact-qstat">
                <span className="qstat-val">{projectedImpact.critical_segments_km || 3.02} km</span>
                <span className="qstat-label">Target Network</span>
              </div>
              <div className="impact-qstat">
                <span className="qstat-val text-blue">High ROI</span>
                <span className="qstat-label">Action Priority</span>
              </div>
            </div>
          </div>

          {/* BTP Police Station Jurisdictions Ranking */}
          <div className="analysis-card">
            <div className="card-header-with-icon">
              <div className="icon-badge police">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="card-header-title">BTP Police Jurisdiction Hotspots</h3>
                <p className="card-header-subtitle">Traffic Police Stations ranked by critical risk exposure</p>
              </div>
            </div>

            <div className="station-hotspots-table-wrap">
              <table className="station-data-table">
                <thead>
                  <tr>
                    <th>Police Station</th>
                    <th>Critical</th>
                    <th>High</th>
                    <th>Total Km</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStations.slice(0, 8).map((st) => (
                    <tr key={st.name} className="station-row">
                      <td>
                        <span className="station-name-text">{st.name}</span>
                        <span className="station-segments-sub">{st.total} segments monitored</span>
                      </td>
                      <td>
                        <span className={`station-count-pill ${st.critical > 0 ? 'critical' : 'zero'}`}>
                          {st.critical}
                        </span>
                      </td>
                      <td>
                        <span className={`station-count-pill ${st.high > 0 ? 'high' : 'zero'}`}>
                          {st.high}
                        </span>
                      </td>
                      <td>
                        <span className="km-text">{st.totalKm.toFixed(1)} km</span>
                      </td>
                      <td>
                        <button 
                          className="station-view-btn"
                          onClick={() => {
                            if (st.sampleSegmentId && onSelectSegment) {
                              onSelectSegment(st.sampleSegmentId);
                            }
                            if (onNavigateToOverview) {
                              onNavigateToOverview('ALL', st.sampleSegmentId);
                            }
                          }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
