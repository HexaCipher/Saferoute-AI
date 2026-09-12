import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowRight, 
  ExternalLink,
  Search
} from 'lucide-react';

export default function CorridorsView({
  corridors = [],
  segments = [],
  onSelectSegment,
  onNavigateToOverview
}) {
  const [selectedCorridorId, setSelectedCorridorId] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter segments for the selected corridor and search term
  const filteredSegments = segments.filter((seg) => {
    const props = seg.properties || {};
    const matchesCorridor = selectedCorridorId === 'ALL' || props.corridor_id === selectedCorridorId;
    const matchesSearch = !searchTerm || 
      (props.road_name && props.road_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (props.segment_id && props.segment_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (props.btp_station && props.btp_station.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCorridor && matchesSearch;
  });

  const criticalSegments = filteredSegments.filter(s => s.properties?.risk_tier === 'CRITICAL');
  const highSegments = filteredSegments.filter(s => s.properties?.risk_tier === 'HIGH');

  const getTierBadgeClass = (tier) => {
    switch (tier?.toUpperCase()) {
      case 'CRITICAL': return 'tier-pill critical';
      case 'HIGH': return 'tier-pill high';
      case 'MEDIUM': return 'tier-pill medium';
      default: return 'tier-pill low';
    }
  };

  const getScoreColor = (score) => {
    if (score < 40) return '#EF4444';
    if (score < 60) return '#F97316';
    if (score < 75) return '#F59E0B';
    return '#10B981';
  };

  return (
    <div className="corridors-view-container">
      {/* Header Banner */}
      <div className="view-header-bar">
        <div>
          <div className="view-tag">
            <TrendingUp size={13} className="text-blue" />
            <span>Corridor Intelligence</span>
          </div>
          <h2 className="view-title">Bengaluru Major Arterial Corridors</h2>
          <p className="view-subtitle">
            Empirical telemetry across 3 high-volume transit corridors spanning {corridors.reduce((acc, c) => acc + (c.length_km || 0), 0).toFixed(1)} km
          </p>
        </div>
      </div>

      {/* Corridor Macro Cards Grid */}
      <div className="corridor-cards-grid">
        {corridors.map((c) => {
          const isSelected = selectedCorridorId === c.corridor_id;
          return (
            <div 
              key={c.corridor_id}
              className={`corridor-macro-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedCorridorId(isSelected ? 'ALL' : c.corridor_id)}
            >
              <div className="card-top-row">
                <span className="corridor-id-tag">{c.corridor_id}</span>
                <span 
                  className="corridor-avg-score-badge"
                  style={{ color: getScoreColor(c.average_safety_score) }}
                >
                  {c.average_safety_score} / 100
                </span>
              </div>

              <h3 className="corridor-card-name">{c.corridor_name}</h3>

              <div className="corridor-stats-row">
                <div className="stat-pill">
                  <span className="stat-label">Length</span>
                  <span className="stat-value">{c.length_km} km</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-label">500m Segments</span>
                  <span className="stat-value">{c.segment_count}</span>
                </div>
                <div className="stat-pill critical">
                  <span className="stat-label">Critical</span>
                  <span className="stat-value">{c.critical_segments}</span>
                </div>
                <div className="stat-pill high">
                  <span className="stat-label">High Risk</span>
                  <span className="stat-value">{c.high_segments}</span>
                </div>
              </div>

              <div className="corridor-card-footer">
                <button 
                  className="explore-corridor-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onNavigateToOverview) {
                      onNavigateToOverview(c.corridor_id);
                    }
                  }}
                >
                  <span>Explore On Map</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Segment Breakdown for Selected Corridor */}
      <div className="corridor-segments-section">
        <div className="section-toolbar">
          <div className="section-title-wrap">
            <h3 className="section-title">
              {selectedCorridorId === 'ALL' ? 'All Monitored Road Segments' : `${selectedCorridorId} Segments`}
            </h3>
            <span className="count-tag">{filteredSegments.length} Segments ({criticalSegments.length} Critical, {highSegments.length} High)</span>
          </div>

          <div className="toolbar-controls">
            <div className="filter-pills-row">
              <button 
                className={`filter-tab ${selectedCorridorId === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedCorridorId('ALL')}
              >
                All Corridors
              </button>
              {corridors.map(c => (
                <button 
                  key={c.corridor_id}
                  className={`filter-tab ${selectedCorridorId === c.corridor_id ? 'active' : ''}`}
                  onClick={() => setSelectedCorridorId(c.corridor_id)}
                >
                  {c.corridor_id}
                </button>
              ))}
            </div>

            <div className="corridor-search-box">
              <Search size={14} className="search-icon" />
              <input 
                type="text"
                placeholder="Filter by road, ID, police station..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="corridor-search-input"
              />
            </div>
          </div>
        </div>

        {/* Segments Table */}
        <div className="segments-table-wrapper">
          <table className="custom-data-table">
            <thead>
              <tr>
                <th>Segment ID</th>
                <th>Corridor / Road Name</th>
                <th>Safety Score</th>
                <th>Risk Tier</th>
                <th>Vulnerable Road User</th>
                <th>BTP Station</th>
                <th>Infrastructure</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSegments.slice(0, 30).map((seg) => {
                const p = seg.properties || {};
                return (
                  <tr key={p.segment_id} className="table-data-row">
                    <td>
                      <span className="segment-code">{p.segment_id}</span>
                    </td>
                    <td>
                      <div className="road-cell">
                        <span className="road-title">{p.road_name || 'Arterial Stretch'}</span>
                        <span className="corridor-sub">{p.corridor_name || p.corridor_id}</span>
                      </div>
                    </td>
                    <td>
                      <div className="score-cell">
                        <span 
                          className="score-number"
                          style={{ color: getScoreColor(p.safety_score) }}
                        >
                          {p.safety_score?.toFixed(1)}
                        </span>
                        <span className="score-total">/100</span>
                      </div>
                    </td>
                    <td>
                      <span className={getTierBadgeClass(p.risk_tier)}>
                        {p.risk_tier}
                      </span>
                    </td>
                    <td>
                      <span className="vru-cell-text">{p.primary_vulnerable_group || 'Two-Wheelers'}</span>
                    </td>
                    <td>
                      <span className="station-cell-text">{p.btp_station || 'BTP Station'}</span>
                    </td>
                    <td>
                      <div className="infra-tags-cell">
                        <span className={`infra-pill ${p.street_lighting === 'yes' ? 'verified' : 'unverified'}`}>
                          {p.street_lighting === 'yes' ? 'Lit' : 'Unverified'}
                        </span>
                        {p.crossing_count > 0 && (
                          <span className="infra-pill crossing">{p.crossing_count} Crossings</span>
                        )}
                        {p.bus_stop_count > 0 && (
                          <span className="infra-pill transit">{p.bus_stop_count} Stops</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="inspect-action-btn"
                        onClick={() => {
                          if (onSelectSegment) onSelectSegment(p.segment_id);
                          if (onNavigateToOverview) onNavigateToOverview(p.corridor_id, p.segment_id);
                        }}
                      >
                        <span>Inspect</span>
                        <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredSegments.length > 30 && (
            <div className="table-pagination-note">
              Showing top 30 of {filteredSegments.length} road segments. Use search or corridor filter to refine.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
