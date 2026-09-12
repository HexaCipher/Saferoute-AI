import React from 'react';

export default function FooterBar() {
  return (
    <footer className="global-footer-bar">
      <div className="footer-left-sources">
        <span className="source-label">Data Sources:</span>
        <span className="source-item">BTP (Bengaluru Traffic Police)</span>
        <span className="source-pipe">|</span>
        <span className="source-item">MoRTH/NCRB</span>
        <span className="source-pipe">|</span>
        <span className="source-item">OpenStreetMap</span>
        <span className="source-pipe">|</span>
        <span className="source-date">Last Updated: 15 Oct 2024, 14:32</span>
      </div>

      <div className="footer-right-telemetry">
        <span className="model-tag">Model: <strong>XGBoost v1.2</strong></span>
        <span className="source-pipe">|</span>
        <div className="system-status-indicator">
          <span className="live-status-dot"></span>
          <span>All Systems Operational</span>
        </div>
        <span className="source-pipe">|</span>
        <span className="script-signature">Safer Bengaluru</span>
      </div>
    </footer>
  );
}
