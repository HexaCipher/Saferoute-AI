import React from 'react';
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Sun, 
  Target, 
  Command
} from 'lucide-react';

export default function TopHeader({ onOpenSearch }) {
  return (
    <header className="top-header">
      {/* 1. Brand Logo */}
      <div className="header-brand">
        <div className="brand-logo-mark">
          {/* Stylized Road Ribbon SVG matching ui_dashboard.png */}
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 27L16 4L27 27H20L16 16L12 27H5Z" fill="#F59E0B" />
            <path d="M14 27L16 20L18 27H14Z" fill="#FFFFFF" />
          </svg>
        </div>
        <div className="brand-text">
          <div className="brand-title">RoadSafe AI</div>
          <div className="brand-tagline">Safer Roads. Brighter Tomorrows.</div>
        </div>
      </div>

      {/* 2. Global Quick Search with ⌘K */}
      <div className="header-search-container" onClick={onOpenSearch}>
        <Search size={16} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search road, junction, or area..." 
          readOnly 
          className="search-input-fake"
        />
        <div className="kbd-badge">
          <Command size={11} />
          <span>K</span>
        </div>
      </div>

      {/* 3. Right Status Controls */}
      <div className="header-right-controls">
        {/* City Selector */}
        <div className="city-selector-chip">
          <MapPin size={14} className="pin-icon" />
          <span className="city-name">Bengaluru</span>
          <ChevronDown size={14} className="chevron" />
        </div>

        {/* Live Weather & Time */}
        <div className="weather-time-chip">
          <Sun size={15} className="weather-icon text-amber" />
          <span className="weather-temp">24°C</span>
          <span className="chip-sep">•</span>
          <span className="live-date">Mon, 15 Oct 2024</span>
          <span className="live-time">6:24 PM</span>
        </div>

        {/* Vision Zero 2030 Initiative Badge */}
        <div className="vision-zero-badge">
          <div className="target-icon-wrap">
            <Target size={14} className="target-icon" />
          </div>
          <div className="vision-badge-text">
            <span className="vision-title">Vision Zero 2030</span>
            <span className="vision-sub">Safer People. Safe Streets.</span>
          </div>
        </div>

        {/* User / Team Profile */}
        <div className="user-profile-chip">
          <div className="avatar-circle">A</div>
          <span className="team-name">Team Null Pointers</span>
          <ChevronDown size={14} className="chevron" />
        </div>
      </div>
    </header>
  );
}
