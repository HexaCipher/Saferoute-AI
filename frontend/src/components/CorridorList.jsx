import React, { useState } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Route, 
  X, 
  AlertCircle,
  LightbulbOff,
  GitMerge
} from 'lucide-react';

export default function CorridorList({ 
  corridors = [], 
  segments = [],
  selectedSegmentId, 
  onSelectSegment,
  selectedCorridorId = 'ALL',
  onSelectCorridor,
  isCollapsed = false, 
  onToggleCollapse,
  loading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTierFilter, setActiveTierFilter] = useState('ALL');

  // Filter segments based on search, corridor, and risk tier
  const filteredSegments = segments.filter((feat) => {
    const p = feat.properties || {};
    const term = searchTerm.toLowerCase().trim();

    // 1. Search Query Match
    const matchesSearch = !term || (
      (p.segment_id || '').toLowerCase().includes(term) ||
      (p.road_name || '').toLowerCase().includes(term) ||
      (p.corridor_name || '').toLowerCase().includes(term) ||
      (p.btp_station || '').toLowerCase().includes(term) ||
      (p.risk_tier || '').toLowerCase().includes(term)
    );

    if (!matchesSearch) return false;

    // 2. Corridor Filter
    if (selectedCorridorId !== 'ALL' && p.corridor_id !== selectedCorridorId) {
      return false;
    }

    // 3. Risk Tier Filter
    if (activeTierFilter !== 'ALL' && (p.risk_tier || '').toUpperCase() !== activeTierFilter) {
      return false;
    }

    return true;
  });

  // Calculate counts across the active corridor
  const corridorSegments = selectedCorridorId === 'ALL' 
    ? segments 
    : segments.filter(f => f.properties?.corridor_id === selectedCorridorId);

  const criticalCount = corridorSegments.filter(f => (f.properties?.risk_tier || '').toUpperCase() === 'CRITICAL').length;
  const highCount = corridorSegments.filter(f => (f.properties?.risk_tier || '').toUpperCase() === 'HIGH').length;
  const mediumCount = corridorSegments.filter(f => (f.properties?.risk_tier || '').toUpperCase() === 'MEDIUM').length;

  if (isCollapsed) {
    return (
      <aside className="corridors-sidebar-panel collapsed">
        <button 
          className="corridor-collapse-toggle-btn"
          onClick={onToggleCollapse}
          title="Expand Road Corridors List"
        >
          <ChevronRight size={16} />
        </button>

        <div className="collapsed-corridors-spine">
          <Route size={16} className="text-muted" />
          <div className="vertical-spine-text">
            <span>{segments.length} Segments</span>
          </div>

          <div className="mini-pills-stack">
            {segments.slice(0, 8).map(feat => {
              const p = feat.properties || {};
              const isSelected = selectedSegmentId === p.segment_id;
              const isCrit = (p.risk_tier || '').toUpperCase() === 'CRITICAL';
              return (
                <button
                  key={p.segment_id}
                  className={`mini-score-dot ${isCrit ? 'bg-red' : 'bg-orange'} ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => onSelectSegment && onSelectSegment(p.segment_id)}
                  title={`${p.segment_id}: Safety ${Math.round(p.safety_score || 0)}`}
                >
                  {Math.round(p.safety_score || 0)}
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="corridors-sidebar-panel">
      {/* Panel Header */}
      <div className="corridors-panel-header">
        <div className="corridors-title-row">
          <div className="corridors-title-left">
            <h2 className="panel-title">Road Corridors</h2>
            <span className="corridors-count-chip">{segments.length} segments</span>
          </div>
          <div className="header-actions-group">
            <button 
              className="corridor-collapse-btn" 
              onClick={onToggleCollapse}
              title="Collapse list to maximize map"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
        <p className="panel-subtitle">Explore 500m high-risk road network segments</p>

        {/* Corridor Breakdown Pills (ORR, OMR, HOSUR) */}
        {corridors.length > 0 && (
          <div className="corridor-selector-chips">
            <button
              className={`corridor-chip ${selectedCorridorId === 'ALL' ? 'active' : ''}`}
              onClick={() => onSelectCorridor && onSelectCorridor('ALL')}
            >
              All ({segments.length})
            </button>
            {corridors.map(c => {
              const label = c.corridor_id.replace('BLR_', '');
              return (
                <button
                  key={c.corridor_id}
                  className={`corridor-chip ${selectedCorridorId === c.corridor_id ? 'active' : ''}`}
                  onClick={() => onSelectCorridor && onSelectCorridor(c.corridor_id)}
                  title={`${c.corridor_name} — Avg Safety: ${c.average_safety_score}/100`}
                >
                  {label} ({c.segment_count})
                </button>
              );
            })}
          </div>
        )}

        {/* Search Field */}
        <div className="corridors-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Filter by road, ID or police station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="search-clear-btn" 
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Risk Tier Filter Tabs */}
        <div className="corridors-filter-tabs">
          <button 
            className={`filter-tab-pill ${activeTierFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTierFilter('ALL')}
          >
            All ({corridorSegments.length})
          </button>
          <button 
            className={`filter-tab-pill ${activeTierFilter === 'CRITICAL' ? 'active' : ''}`}
            onClick={() => setActiveTierFilter('CRITICAL')}
          >
            Critical ({criticalCount})
          </button>
          <button 
            className={`filter-tab-pill ${activeTierFilter === 'HIGH' ? 'active' : ''}`}
            onClick={() => setActiveTierFilter('HIGH')}
          >
            High ({highCount})
          </button>
          <button 
            className={`filter-tab-pill ${activeTierFilter === 'MEDIUM' ? 'active' : ''}`}
            onClick={() => setActiveTierFilter('MEDIUM')}
          >
            Medium ({mediumCount})
          </button>
        </div>
      </div>

      {/* Segments Scrollable List */}
      <div className="corridors-cards-scroll">
        {loading ? (
          <div className="corridors-loading-state">
            <div className="map-loading-spinner"></div>
            <span>Fetching live segments...</span>
          </div>
        ) : filteredSegments.length === 0 ? (
          <div className="corridors-empty-state">
            <AlertCircle size={22} className="text-muted empty-icon" />
            <div className="empty-title">No matching road segments</div>
            <p className="empty-sub">
              {searchTerm 
                ? `No segments found matching "${searchTerm}".` 
                : 'No segments match the selected corridor and tier filters.'}
            </p>
            <button 
              className="empty-reset-btn"
              onClick={() => {
                setSearchTerm('');
                setActiveTierFilter('ALL');
                if (onSelectCorridor) onSelectCorridor('ALL');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredSegments.map((feat) => {
            const p = feat.properties || {};
            const isSelected = selectedSegmentId === p.segment_id;
            const tier = (p.risk_tier || '').toUpperCase();
            
            let badgeClass = 'score-green';
            if (tier === 'CRITICAL') badgeClass = 'score-red';
            else if (tier === 'HIGH') badgeClass = 'score-orange';
            else if (tier === 'MEDIUM') badgeClass = 'score-amber';

            return (
              <div
                key={p.segment_id}
                className={`corridor-list-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectSegment && onSelectSegment(p.segment_id)}
              >
                <div className="corridor-card-info">
                  <div className="corridor-name-row">
                    <span className="corridor-road-name" title={p.road_name}>
                      {p.road_name || 'Segment'}
                    </span>
                    <span className={`corridor-score-badge ${badgeClass}`}>
                      {Math.round(p.safety_score || 0)} Safety
                    </span>
                  </div>

                  <div className="corridor-sub-row">
                    <span className="corridor-id-tag">{p.segment_id}</span>
                    <span className="corridor-dot">•</span>
                    <span className="corridor-loc-text">{p.btp_station || p.corridor_name}</span>
                  </div>

                  {/* Infrastructure Attributes */}
                  <div className="corridor-stats-row">
                    {p.junction_count > 0 && (
                      <span className="stat-pill" title={`${p.junction_count} intersections`}>
                        <GitMerge size={11} className="text-red" />
                        <span>{p.junction_count} junctions</span>
                      </span>
                    )}
                    {p.street_lighting !== 'yes' && (
                      <span className="stat-pill" title="Unverified ambient lighting">
                        <LightbulbOff size={11} className="text-amber" />
                        <span>Dark spot</span>
                      </span>
                    )}
                    <span className="stat-pill tier-pill">
                      {tier}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
