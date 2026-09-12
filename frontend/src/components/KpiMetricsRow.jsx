import React from 'react';
import { 
  Bike, 
  AlertOctagon, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles,
  TrendingDown
} from 'lucide-react';

export default function KpiMetricsRow({ summary, loading = false }) {
  // Skeleton / Loading placeholder state
  if (loading || !summary) {
    return (
      <section className="kpi-overview-section">
        <div className="kpi-title-block">
          <h1 className="page-title">Bengaluru Night-time Safety Overview</h1>
          <p className="page-subtitle">AI-powered risk analysis for a safer, smarter Bengaluru</p>
        </div>

        <div className="kpi-cards-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="kpi-card is-loading">
              <div className="kpi-card-header">
                <div className="kpi-icon-circle skeleton-pulse" style={{ width: 36, height: 36 }} />
                <div className="kpi-body">
                  <div className="kpi-value-row">
                    <span className="kpi-number">—</span>
                  </div>
                  <div className="kpi-label">Loading telemetry...</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const critical = summary.risk_distribution?.CRITICAL || { segment_count: 0, percentage: 0, total_km: 0 };
  const high = summary.risk_distribution?.HIGH || { segment_count: 0, percentage: 0, total_km: 0 };
  const twoWheelerPct = Math.round(summary.vru_vulnerability_breakdown?.['Two-Wheelers'] || 0);
  const casualtyReduction = summary.projected_impact?.estimated_casualty_reduction_if_critical_fixed_pct || 0;

  return (
    <section className="kpi-overview-section">
      <div className="kpi-title-block">
        <div className="title-row">
          <h1 className="page-title">Bengaluru Night-time Safety Overview</h1>
          <span className="live-dataset-badge">
            <span className="live-dot"></span>
            {summary.total_segments} Segments ({summary.total_road_network_km?.toFixed(1)} km)
          </span>
        </div>
        <p className="page-subtitle">
          Empirical ML risk evaluation across {summary.total_corridors_analyzed} major urban corridors
        </p>
      </div>

      <div className="kpi-cards-grid">
        {/* Card 1: City Average Safety Score */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-circle bg-blue-soft">
              <ShieldCheck size={18} className="text-blue" />
            </div>
            <div className="kpi-body">
              <div className="kpi-value-row">
                <span className="kpi-number">{summary.average_city_safety_score?.toFixed(1)}</span>
                <span className="kpi-unit">/ 100</span>
              </div>
              <div className="kpi-label">City Average Safety Score</div>
              <div className="kpi-delta-tag text-blue">
                <span>Baseline Index</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Critical Priority Segments */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-circle bg-red-soft">
              <AlertOctagon size={18} className="text-red" />
            </div>
            <div className="kpi-body">
              <div className="kpi-value-row">
                <span className="kpi-number text-red">{critical.segment_count}</span>
                <span className="kpi-unit">segments</span>
              </div>
              <div className="kpi-label">Critical Priority Zones</div>
              <div className="kpi-delta-tag text-red">
                <span>{critical.total_km?.toFixed(1)} km high hazard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: High Risk Segments */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-circle bg-orange-soft">
              <ShieldAlert size={18} className="text-orange" />
            </div>
            <div className="kpi-body">
              <div className="kpi-value-row">
                <span className="kpi-number text-orange">{high.segment_count}</span>
                <span className="kpi-unit">segments</span>
              </div>
              <div className="kpi-label">High Risk Stretches</div>
              <div className="kpi-delta-tag text-orange">
                <span>{high.percentage?.toFixed(1)}% of network</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Two-Wheeler Vulnerability Share */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-circle bg-slate-soft">
              <Bike size={18} className="text-slate" />
            </div>
            <div className="kpi-body">
              <div className="kpi-value-row">
                <span className="kpi-number">{twoWheelerPct}%</span>
              </div>
              <div className="kpi-label">Two-Wheeler Vulnerability</div>
              <div className="kpi-bar-track">
                <div 
                  className="kpi-bar-fill bg-red" 
                  style={{ width: `${twoWheelerPct}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Projected Casualty Reduction */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-circle bg-green-soft">
              <TrendingDown size={18} className="text-green" />
            </div>
            <div className="kpi-body">
              <div className="kpi-value-row">
                <span className="kpi-number text-green">-{casualtyReduction}%</span>
              </div>
              <div className="kpi-label">Projected Severe Crash Reduction</div>
              <div className="kpi-delta-tag text-green">
                <Sparkles size={11} />
                <span>Fixing 29 Critical Segments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
