import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, AlertCircle, CornerDownLeft } from 'lucide-react';

export default function SearchModal({ 
  isOpen, 
  onClose, 
  segments = [], 
  onSelectSegment 
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Quick suggestion tags matching real database entities
  const SUGGESTIONS = ['BLR_ORR_091', 'Outer Ring Road', 'Hosur Road', 'CRITICAL', 'H.A.L Airport', 'Whitefield'];

  const matches = segments.filter(feat => {
    const p = feat.properties || {};
    const term = query.toLowerCase().trim();
    if (!term) return true;
    return (
      (p.segment_id || '').toLowerCase().includes(term) ||
      (p.road_name || '').toLowerCase().includes(term) ||
      (p.corridor_name || '').toLowerCase().includes(term) ||
      (p.corridor_id || '').toLowerCase().includes(term) ||
      (p.btp_station || '').toLowerCase().includes(term) ||
      (p.risk_tier || '').toLowerCase().includes(term)
    );
  }).slice(0, 50); // Limit to top 50 matches for fast rendering

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation: Arrow Up, Arrow Down, Enter, Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1 < matches.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : matches.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (matches[selectedIndex]) {
          const segId = matches[selectedIndex].properties?.segment_id;
          if (onSelectSegment && segId) {
            onSelectSegment(segId);
          }
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, matches, selectedIndex, onClose, onSelectSegment]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="search-palette-window" onClick={e => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="palette-input-bar">
          <Search size={18} className="text-muted" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search road, segment ID, police station, or risk tier (e.g. BLR_ORR_091)..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="palette-search-field"
          />
          {query && (
            <button 
              className="palette-clear-btn" 
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <button className="palette-close-btn" onClick={onClose} title="Close (Esc)">
            <span className="kbd-shortcut-hint">ESC</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        {!query && (
          <div className="palette-suggestions-row">
            <span className="suggestions-label">Popular:</span>
            {SUGGESTIONS.map(s => (
              <button 
                key={s} 
                className="palette-suggestion-chip"
                onClick={() => {
                  setQuery(s);
                  setSelectedIndex(0);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div className="palette-results-list" ref={resultsContainerRef}>
          <div className="palette-section-title">
            {query 
              ? `Found ${matches.length} matching segment${matches.length === 1 ? '' : 's'}` 
              : `All Monitored Road Segments (${segments.length})`}
          </div>

          {matches.length === 0 ? (
            <div className="palette-empty-state">
              <AlertCircle size={28} className="text-muted empty-icon" />
              <div className="empty-title">No road segments found</div>
              <p className="empty-desc">
                No matching segments for "{query}". Try searching by <strong>BLR_ORR</strong>, <strong>Outer Ring Road</strong>, or <strong>CRITICAL</strong>.
              </p>
            </div>
          ) : (
            matches.map((item, idx) => {
              const p = item.properties || {};
              const isSelected = idx === selectedIndex;
              const tier = (p.risk_tier || '').toUpperCase();
              const isCrit = tier === 'CRITICAL';
              const isHigh = tier === 'HIGH';

              let badgeClass = 'score-green';
              if (isCrit) badgeClass = 'score-red';
              else if (isHigh) badgeClass = 'score-orange';
              else if (tier === 'MEDIUM') badgeClass = 'score-amber';

              return (
                <div 
                  key={p.segment_id} 
                  className={`palette-result-row ${isSelected ? 'is-highlighted' : ''}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    if (onSelectSegment && p.segment_id) {
                      onSelectSegment(p.segment_id);
                    }
                    onClose();
                  }}
                >
                  <div className="result-left">
                    <MapPin size={16} className={isCrit ? 'text-red' : isHigh ? 'text-amber' : 'text-slate'} />
                    <div>
                      <div className="result-name">{p.road_name || 'Road Segment'}</div>
                      <div className="result-sub">
                        <span className="code-id">{p.segment_id}</span> • {p.corridor_id} • {p.btp_station || 'Bengaluru'}
                      </div>
                    </div>
                  </div>

                  <div className="result-right">
                    <span className={`result-score-badge ${badgeClass}`}>
                      {Math.round(p.safety_score || 0)} Safety
                    </span>
                    <span className="result-tier-pill">{tier}</span>
                    <CornerDownLeft size={13} className="result-enter-icon" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Keyboard Guide */}
        <div className="palette-footer-hints">
          <div className="hint-item"><span className="kbd-mini">↑</span><span className="kbd-mini">↓</span> Navigate</div>
          <div className="hint-item"><span className="kbd-mini">↵</span> Select</div>
          <div className="hint-item"><span className="kbd-mini">ESC</span> Close</div>
        </div>
      </div>
    </div>
  );
}
