import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, AlertCircle, ArrowRight } from 'lucide-react';

export default function SearchModal({ 
  isOpen, 
  onClose, 
  corridors, 
  onSelectCorridor 
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // Toggle
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const matches = corridors.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.corridor_name.toLowerCase().includes(query.toLowerCase()) ||
    c.highway.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="search-palette-window" onClick={e => e.stopPropagation()}>
        <div className="palette-input-bar">
          <Search size={18} className="text-muted" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a road, blackspot junction, or national highway..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="palette-search-field"
          />
          <button className="palette-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="palette-results-list">
          <div className="palette-section-title">
            {query ? `Found ${matches.length} matching corridors` : 'High Priority Bengaluru Corridors'}
          </div>

          {matches.map(item => (
            <div 
              key={item.id} 
              className="palette-result-row"
              onClick={() => {
                onSelectCorridor(item);
                onClose();
              }}
            >
              <div className="result-left">
                <MapPin size={16} className={item.risk_tier === 'Critical' ? 'text-red' : 'text-orange'} />
                <div>
                  <div className="result-name">{item.name}</div>
                  <div className="result-sub">{item.corridor_name} • {item.highway}</div>
                </div>
              </div>

              <div className="result-right">
                <span className={`result-score-badge ${item.risk_tier === 'Critical' ? 'score-red' : 'score-orange'}`}>
                  {item.risk_score} Risk
                </span>
                <ArrowRight size={14} className="result-arrow" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
