import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, ChevronRight } from 'lucide-react';

export default function SpotListSidebar({ hotspots, selectedSpot, onSelectSpot }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filteredSpots = hotspots.filter((spot) => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          spot.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSeverity === 'ALL' || spot.risk_level.toUpperCase() === filterSeverity;
    return matchesSearch && matchesFilter;
  });

  return (
    <aside className="sidebar-corridors">
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <h3>Bengaluru Corridors</h3>
          <span className="count-badge">{filteredSpots.length} Zones</span>
        </div>

        {/* Search input */}
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search Silk Board, ORR, Hebbal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="filter-pills">
          <button 
            className={`pill-btn ${filterSeverity === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterSeverity('ALL')}
          >
            All
          </button>
          <button 
            className={`pill-btn red-pill ${filterSeverity === 'CRITICAL' ? 'active' : ''}`}
            onClick={() => setFilterSeverity('CRITICAL')}
          >
            Critical (88-100)
          </button>
          <button 
            className={`pill-btn orange-pill ${filterSeverity === 'HIGH' ? 'active' : ''}`}
            onClick={() => setFilterSeverity('HIGH')}
          >
            High Risk (75-87)
          </button>
        </div>
      </div>

      <div className="corridors-list">
        {filteredSpots.map((spot) => {
          const isSelected = selectedSpot && selectedSpot.id === spot.id;
          const isCritical = spot.risk_level === 'Critical';

          return (
            <div
              key={spot.id}
              className={`corridor-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectSpot(spot)}
            >
              <div className="card-risk-indicator" style={{ backgroundColor: isCritical ? '#ef4444' : '#f97316' }}></div>
              
              <div className="card-main">
                <div className="card-header-row">
                  <span className="spot-name">{spot.name}</span>
                  <span className={`risk-pill ${isCritical ? 'bg-red-soft text-red' : 'bg-orange-soft text-orange'}`}>
                    {spot.risk_score}
                  </span>
                </div>

                <div className="spot-meta">
                  <span>{spot.accident_count_2023} crashes</span>
                  <span>•</span>
                  <span className="text-red">{spot.fatalities_2023} deaths</span>
                  <span>•</span>
                  <span className="spot-corridor-type">{spot.corridor_type.split(' ')[0]}</span>
                </div>

                <div className="spot-cause-hint">
                  ⚡ {spot.primary_cause}
                </div>
              </div>

              <ChevronRight size={16} className="arrow-icon" />
            </div>
          );
        })}

        {filteredSpots.length === 0 && (
          <div className="no-results">
            <AlertTriangle size={24} />
            <p>No matching road corridors found.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
