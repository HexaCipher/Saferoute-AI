import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, AlertCircle, ArrowRight, CornerDownLeft } from 'lucide-react';

export default function SearchModal({ 
  isOpen, 
  onClose, 
  corridors = [], 
  onSelectCorridor 
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Quick suggestion tags
  const SUGGESTIONS = ['Silk Board', 'Hebbal', 'Outer Ring Road', 'Hosur Road', 'Critical', 'NH 44'];

  const matches = corridors.filter(c => {
    const term = query.toLowerCase().trim();
    if (!term) return true;
    return (
      (c.name || '').toLowerCase().includes(term) ||
      (c.corridor_name || '').toLowerCase().includes(term) ||
      (c.location || '').toLowerCase().includes(term) ||
      (c.highway || '').toLowerCase().includes(term) ||
      (c.risk_tier || '').toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

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
          onSelectCorridor(matches[selectedIndex]);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, matches, selectedIndex, onClose, onSelectCorridor]);

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
            placeholder="Search road, blackspot junction, highway (e.g. Silk Board, NH 44)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="palette-search-field"
          />
          {query && (
            <button 
              className="palette-clear-btn" 
              onClick={() => setQuery('')}
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
                onClick={() => setQuery(s)}
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
              ? `Found ${matches.length} matching corridor${matches.length === 1 ? '' : 's'}` 
              : `All Monitored Bengaluru Corridors (${corridors.length})`}
          </div>

          {matches.length === 0 ? (
            <div className="palette-empty-state">
              <AlertCircle size={28} className="text-muted empty-icon" />
              <div className="empty-title">No corridors found</div>
              <p className="empty-desc">
                No matching roads or blackspots found for "{query}". Try searching for <strong>Silk Board</strong>, <strong>Hebbal</strong>, or <strong>Outer Ring Road</strong>.
              </p>
            </div>
          ) : (
            matches.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const isCritical = item.risk_tier === 'Critical';
              const isHigh = item.risk_tier === 'High';

              let badgeClass = 'score-red';
              if (isHigh) badgeClass = 'score-orange';
              if (item.risk_tier === 'Medium') badgeClass = 'score-amber';

              return (
                <div 
                  key={item.id} 
                  className={`palette-result-row ${isSelected ? 'is-highlighted' : ''}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    onSelectCorridor(item);
                    onClose();
                  }}
                >
                  <div className="result-left">
                    <MapPin size={16} className={isCritical ? 'text-red' : isHigh ? 'text-amber' : 'text-slate'} />
                    <div>
                      <div className="result-name">{item.name}</div>
                      <div className="result-sub">{item.corridor_name} • {item.highway || 'Bengaluru Urban'}</div>
                    </div>
                  </div>

                  <div className="result-right">
                    <span className={`result-score-badge ${badgeClass}`}>
                      {item.risk_score} Risk
                    </span>
                    <span className="result-tier-pill">{item.risk_tier}</span>
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
