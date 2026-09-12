import React from 'react';
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Sun, 
  Target, 
  Command,
  Menu
} from 'lucide-react';

export default function TopHeader({ onOpenSearch, onToggleMobileMenu }) {
  return (
    <header className="top-header">
      {/* Left: Mobile Menu Button + Brand Logo */}
      <div className="header-brand">
        <button 
          className="mobile-menu-trigger"
          onClick={onToggleMobileMenu}
          title="Toggle Navigation Menu"
          aria-label="Toggle Menu"
        >
          <Menu size={20} />
        </button>

        <div className="brand-logo-mark">
          {/* Stylized Road Ribbon SVG matching ui_dashboard.png */}
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 27L16 4L27 27H20L16 16L12 27H5Z" fill="#F59E0B" />
            <path d="M14 27L16 20L18 27H14Z" fill="#FFFFFF" />
          </svg>
        </div>
        <div className="brand-text">
          <div className="brand-title">RoadSafe AI</div>
          <div className="brand-tagline">Safer Roads. Brighter Tomorrows.</div>
        </div>
      </div>

      {/* Center: Global Quick Search with ⌘K */}
      <div className="header-search-container" onClick={onOpenSearch}>
        <Search size={15} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search road, junction..." 
          readOnly 
          className="search-input-fake"
        />
        <div className="kbd-badge">
          <Command size={10} />
          <span>K</span>
        </div>
      </div>

      {/* Right: Status Controls */}
      <div className="header-right-controls">
        {/* City Selector */}
        <div className="city-selector-chip">
          <MapPin size={13} className="pin-icon" />
          <span className="city-name">Bengaluru</span>
          <ChevronDown size={13} className="chevron" />
        </div>

        {/* Live Weather & Time */}
        <div className="weather-time-chip">
          <Sun size={14} className="weather-icon text-amber" />
          <span className="weather-temp">24°C</span>
          <span className="chip-sep desktop-only">•</span>
          <span className="live-date desktop-only">Mon, 15 Oct 2024</span>
          <span className="live-time tablet-desktop-only">6:24 PM</span>
        </div>

        {/* Vision Zero 2030 Initiative Badge */}
        <div className="vision-zero-badge desktop-only">
          <div className="target-icon-wrap">
            <Target size={13} className="target-icon" />
          </div>
          <div className="vision-badge-text">
            <span className="vision-title">Vision Zero 2030</span>
            <span className="vision-sub">Safer People. Safe Streets.</span>
          </div>
        </div>

        {/* User / Team Profile */}
        <div className="user-profile-chip">
          <div className="avatar-circle">A</div>
          <span className="team-name desktop-only">Team Null Pointers</span>
          <ChevronDown size={13} className="chevron desktop-only" />
        </div>
      </div>
    </header>
  );
}
