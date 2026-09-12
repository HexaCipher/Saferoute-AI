import React, { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Car, 
  Skull, 
  Footprints,
  ChevronLeft,
  ChevronRight,
  Route
} from 'lucide-react';

export default function CorridorList({ 
  corridors, 
  selectedCorridor, 
  onSelectCorridor,
  isCollapsed = false,
  onToggleCollapse
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filteredCorridors = corridors.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.corridor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.highway.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'ALL') return matchesSearch;
    if (activeFilter === 'CRITICAL') return matchesSearch && c.risk_tier === 'Critical';
    if (activeFilter === 'HIGH') return matchesSearch && c.risk_tier === 'High';
    if (activeFilter === 'MEDIUM') return matchesSearch && c.risk_tier === 'Medium';
    return matchesSearch;
  });

  const criticalCount = corridors.filter((c) => c.risk_tier === 'Critical').length;
  const highCount = corridors.filter((c) => c.risk_tier === 'High').length;
  const mediumCount = corridors.filter((c) => c.risk_tier === 'Medium').length;

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
            <span>{corridors.length} Corridors</span>
          </div>

          <div className="mini-pills-stack">
            {corridors.slice(0, 6).map(c => {
              const isSelected = selectedCorridor && selectedCorridor.id === c.id;
              const isCritical = c.risk_tier === 'Critical';
              return (
                <button
                  key={c.id}
                  className={`mini-score-dot ${isCritical ? 'bg-red' : 'bg-orange'} ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => onSelectCorridor(c)}
                  title={`${c.name} (${c.risk_score}/100)`}
                >
                  {c.risk_score}
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
            <span className="corridors-count-chip">{corridors.length}</span>
          </div>
          <div className="header-actions-group">
            <button className="filter-sliders-btn" title="Filter Settings">
              <SlidersHorizontal size={14} />
            </button>
            <button 
              className="corridor-collapse-btn" 
              onClick={onToggleCollapse}
              title="Collapse list to maximize map"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
        <p className="panel-subtitle">Explore and analyse high-risk corridors</p>

        {/* Search Field */}
        <div className="corridors-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search road, junction or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="corridors-filter-tabs">
          <button 
            className={`filter-tab-pill ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            All ({corridors.length})
          </button>
          <button 
            className={`filter-tab-pill ${activeFilter === 'CRITICAL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('CRITICAL')}
          >
            Critical ({criticalCount})
          </button>
          <button 
            className={`filter-tab-pill ${activeFilter === 'HIGH' ? 'active' : ''}`}
            onClick={() => setActiveFilter('HIGH')}
          >
            High ({highCount})
          </button>
          <button 
            className={`filter-tab-pill ${activeFilter === 'MEDIUM' ? 'active' : ''}`}
            onClick={() => setActiveFilter('MEDIUM')}
          >
            Medium ({mediumCount})
          </button>
        </div>
      </div>

      {/* Corridors Scrollable List */}
      <div className="corridors-cards-scroll">
        {filteredCorridors.map((item) => {
          const isSelected = selectedCorridor && selectedCorridor.id === item.id;
          const isCritical = item.risk_tier === 'Critical';
          const isHigh = item.risk_tier === 'High';
          
          let scoreBgClass = 'score-red';
          if (isHigh) scoreBgClass = 'score-orange';
          if (item.risk_tier === 'Medium') scoreBgClass = 'score-amber';

          return (
            <div
              key={item.id}
              className={`corridor-list-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectCorridor(item)}
            >
              {/* Thumbnail Image */}
              <div className="corridor-thumb-wrap">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="corridor-thumb-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=200&q=80';
                  }}
                />
              </div>

              {/* Card Main Info */}
              <div className="corridor-info-col">
                <div className="corridor-card-name">{item.name}</div>
                <div className="corridor-card-sub">{item.corridor_name}</div>

                {/* 3 Micro Stats */}
                <div className="corridor-stats-row">
                  <div className="micro-stat">
                    <Car size={12} className="text-muted" />
                    <span>{item.stats_2023.crashes}</span>
                  </div>
                  <div className="micro-stat">
                    <Skull size={12} className="text-muted" />
                    <span>{item.stats_2023.deaths}</span>
                  </div>
                  <div className="micro-stat">
                    <Footprints size={12} className="text-muted" />
                    <span>{item.stats_2023.injuries}</span>
                  </div>
                </div>
              </div>

              {/* Circular Risk Score Badge */}
              <div className="corridor-score-badge-col">
                <div className={`circular-score-pill ${scoreBgClass}`}>
                  {item.risk_score}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
