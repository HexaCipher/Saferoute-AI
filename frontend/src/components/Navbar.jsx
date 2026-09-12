import React from 'react';
import { ShieldAlert, Activity, Navigation, Radio, Award } from 'lucide-react';

export default function Navbar({ onResetSelection, activeCity = "Bengaluru Urban" }) {
  return (
    <header className="navbar">
      <div className="nav-left">
        <div className="logo-badge" onClick={onResetSelection}>
          <div className="logo-icon-wrap">
            <ShieldAlert className="logo-icon" size={24} />
          </div>
          <div>
            <div className="brand-title">
              RoadSafe<span className="brand-accent">AI</span>
            </div>
            <div className="brand-sub">Predictive Road Safety Intelligence Platform</div>
          </div>
        </div>

        <div className="city-pill">
          <Navigation size={14} className="city-icon" />
          <span>{activeCity}</span>
          <span className="live-dot" title="Live Model Connected"></span>
        </div>
      </div>

      <div className="nav-center">
        <div className="mission-pill">
          <Activity size={14} className="mission-icon" />
          <span>India Vision Zero 2030 Target: <strong>-50% Road Fatalities</strong></span>
        </div>
      </div>

      <div className="nav-right">
        <div className="team-badge">
          <Award size={14} />
          <span>IBM Bob Hackathon • Team 042</span>
        </div>
        <div className="status-badge">
          <Radio size={12} className="pulse-radio" />
          <span>AI Engine Active</span>
        </div>
      </div>
    </header>
  );
}
