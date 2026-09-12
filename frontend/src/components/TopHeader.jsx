import React from 'react';
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Sun, 
  Target, 
  Command,
  Menu,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function TopHeader({ 
  onOpenSearch, 
  onToggleMobileMenu,
  backendHealth,
  onRetryBackend
}) {
  const isHealthy = backendHealth?.isHealthy;

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
          {/* Stylized Road Ribbon SVG */}
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 27L16 4L27 27H20L16 16L12 27H5Z" fill="#F59E0B" />
            <path d="M14 27L16 20L18 27H14Z" fill="#FFFFFF" />
          </svg>
        </div>
        <div className="brand-text">
          <div className="brand-title">SafeRoute AI</div>
          <div className="brand-tagline">Bengaluru Night-time Intelligence</div>
        </div>
      </div>

      {/* Center: Global Quick Search with ⌘K */}
      <div className="header-search-container" onClick={onOpenSearch}>
        <Search size={15} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search 428 road segments, police stations, junctions..." 
          readOnly 
          className="search-input-fake"
        />
        <div className="kbd-badge">
          <Command size={10} />
          <span>K</span>
        </div>
      </div>

      {/* Right: Status & Connectivity Controls */}
      <div className="header-right-controls">
        {/* Backend Live Connectivity Badge */}
        {isHealthy ? (
          <div 
            className="backend-health-chip is-live"
            title="Connected to live FastAPI backend at http://localhost:8000/api/v1"
          >
            <span className="health-dot-pulse"></span>
            <Activity size={12} className="text-green" />
            <span className="health-label">Live API ({backendHealth?.totalSegments || 428} Segments)</span>
          </div>
        ) : (
          <button 
            className="backend-health-chip is-offline"
            onClick={onRetryBackend}
            title="FastAPI server offline. Click to test connection."
          >
            <span className="health-dot-offline"></span>
            <AlertCircle size={12} className="text-red" />
            <span className="health-label">Backend Offline (Retry)</span>
          </button>
        )}

        {/* City Selector */}
        <div className="city-selector-chip">
          <MapPin size={13} className="pin-icon" />
          <span className="city-name">Bengaluru</span>
          <ChevronDown size={13} className="chevron" />
        </div>

        {/* Live Weather & Time */}
        <div className="weather-time-chip desktop-only">
          <Sun size={14} className="weather-icon text-amber" />
          <span className="weather-temp">24°C</span>
          <span className="chip-sep">•</span>
          <span className="live-date">Mon, 15 Oct 2024</span>
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
