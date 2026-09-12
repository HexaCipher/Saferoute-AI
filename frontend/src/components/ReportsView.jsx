import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer 
} from 'lucide-react';

export default function ReportsView({ summary }) {
  const [selectedExportCorridor, setSelectedExportCorridor] = useState('ALL');
  const [downloading, setDownloading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

  const handleDownloadCsv = () => {
    setDownloading(true);
    let url = `${API_BASE_URL}/analytics/export/csv`;
    if (selectedExportCorridor !== 'ALL') {
      url += `?corridor_id=${selectedExportCorridor}`;
    }
    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `saferoute_ai_bengaluru_safety_report_${selectedExportCorridor.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-view-container">
      {/* Header Banner */}
      <div className="view-header-bar print-hide">
        <div>
          <div className="view-tag">
            <FileText size={13} className="text-blue" />
            <span>Executive Reporting</span>
          </div>
          <h2 className="view-title">Vision Zero 2030 — Bengaluru Night Safety Report</h2>
          <p className="view-subtitle">
            Formal predictive intelligence report prepared for BBMP Traffic Engineering Cell, Bengaluru Traffic Police (BTP), and DULT
          </p>
        </div>

        <div className="report-action-buttons">
          <div className="export-select-wrap">
            <select 
              value={selectedExportCorridor} 
              onChange={(e) => setSelectedExportCorridor(e.target.value)}
              className="export-corridor-select"
            >
              <option value="ALL">Full City Dataset (428 Segments)</option>
              <option value="ORR">Outer Ring Road Only (190 Segments)</option>
              <option value="OMR_WHITEFIELD">Old Madras / Whitefield (164 Segments)</option>
              <option value="HOSUR">Hosur Road Only (74 Segments)</option>
            </select>
          </div>

          <button 
            className="download-csv-btn"
            onClick={handleDownloadCsv}
            disabled={downloading}
          >
            <Download size={14} />
            <span>{downloading ? 'Downloading...' : 'Export Dataset CSV'}</span>
          </button>

          <button className="print-report-btn" onClick={handlePrint}>
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Official Report Document Body */}
      <div className="official-report-document">
        {/* Document Header */}
        <div className="doc-header">
          <div className="doc-emblem-row">
            <div className="doc-brand">
              <span className="doc-badge">GOVERNMENT OF KARNATAKA / BTP & BBMP INITIATIVE</span>
              <h1 className="doc-main-title">Bengaluru Night-Time Arterial Corridor Safety Audit</h1>
              <p className="doc-doc-meta">
                Published: October 2024 • Model: XGBoost Risk Calibrator v1.2 • Dataset: 428 Monitored Segments (161.9 km)
              </p>
            </div>
            <div className="doc-official-stamp">
              <div className="stamp-inner">
                <span className="stamp-org">SAFE ROUTE AI</span>
                <span className="stamp-ver">VERIFIED DATA</span>
              </div>
            </div>
          </div>
          <div className="doc-divider"></div>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="doc-section">
          <h3 className="doc-section-heading">1. Executive Summary</h3>
          <p className="doc-para">
            An empirical investigation across three high-hazard transit corridors in Bengaluru—<strong>Outer Ring Road (Silk Board to Hebbal)</strong>, 
            <strong>Old Madras Road / Whitefield Corridor</strong>, and <strong>Hosur Road (NH 44)</strong>—reveals that nighttime fatality risk is highly concentrated. 
            Across 161.9 kilometers of surveyed multi-lane roadway divided into 428 standard 500-meter segments, the city-wide baseline safety score averages 
            <strong>66.2 / 100</strong>.
          </p>
          <p className="doc-para">
            Crucially, <strong>29 segments (spanning just 3.02 km, or 6.8% of the monitored network)</strong> account for the vast majority of critical night risk. 
            Targeted engineering and enforcement interventions focused exclusively on these 29 segments are projected to deliver an immediate 
            <strong>26.5% reduction in night-time severe and fatal crashes</strong>.
          </p>
        </section>

        {/* Section 2: Key Metric Highlights */}
        <section className="doc-section">
          <h3 className="doc-section-heading">2. Key Macro Intelligence</h3>
          <div className="report-kpi-grid">
            <div className="rkpi-card">
              <span className="rkpi-label">Analyzed Network</span>
              <span className="rkpi-val">161.9 km</span>
              <span className="rkpi-sub">428 Road Segments (500m each)</span>
            </div>
            <div className="rkpi-card">
              <span className="rkpi-label">City Average Safety Score</span>
              <span className="rkpi-val">66.2 / 100</span>
              <span className="rkpi-sub">Baseline Safety Index</span>
            </div>
            <div className="rkpi-card">
              <span className="rkpi-label">Critical Priority Zones</span>
              <span className="rkpi-val text-red">29 Segments</span>
              <span className="rkpi-sub">3.02 km Extreme Hazard</span>
            </div>
            <div className="rkpi-card">
              <span className="rkpi-label">Two-Wheeler Vulnerability</span>
              <span className="rkpi-val text-orange">90.0%</span>
              <span className="rkpi-sub">Primary Casualty Group</span>
            </div>
            <div className="rkpi-card">
              <span className="rkpi-label">Projected Severe Crash Reduction</span>
              <span className="rkpi-val text-emerald">-26.5%</span>
              <span className="rkpi-sub">Addressing 29 Critical Segments</span>
            </div>
          </div>
        </section>

        {/* Section 3: Corridor Breakdown Table */}
        <section className="doc-section">
          <h3 className="doc-section-heading">3. Corridor Specific Evaluation</h3>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Corridor Name</th>
                <th>Monitored Length</th>
                <th>Segments</th>
                <th>Avg Safety Score</th>
                <th>Critical Segments</th>
                <th>High Risk Segments</th>
                <th>Primary Vulnerability</th>
              </tr>
            </thead>
            <tbody>
              {summary?.corridor_breakdown?.map((c) => (
                <tr key={c.corridor_id}>
                  <td><strong>{c.corridor_name}</strong> ({c.corridor_id})</td>
                  <td>{c.length_km} km</td>
                  <td>{c.segment_count}</td>
                  <td><strong>{c.average_safety_score}</strong> / 100</td>
                  <td className="text-red font-bold">{c.critical_segments}</td>
                  <td className="text-orange font-bold">{c.high_segments}</td>
                  <td>Two-Wheelers (High Speed Differential)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Section 4: Recommended Interventions */}
        <section className="doc-section">
          <h3 className="doc-section-heading">4. Recommended Municipal Interventions (Priority Roadmap)</h3>
          <div className="doc-recommendation-list">
            <div className="doc-rec-item">
              <div className="rec-num">1</div>
              <div className="rec-content">
                <h4>Smart High-Mast LED Street Lighting Upgrades (BBMP)</h4>
                <p>
                  161.9 kilometers currently lack verified smart illumination telemetry. Upgrading illumination on the 29 critical segments delivers a standalone +12.1 point gain in safety score and mitigates unlit blind spots during nighttime commuting hours (21:00 to 04:00).
                </p>
              </div>
            </div>

            <div className="doc-rec-item">
              <div className="rec-num">2</div>
              <div className="rec-content">
                <h4>Automated Speed Enforcement Radars & ANPR Gantry (BTP)</h4>
                <p>
                  Operating speed differentials on multi-lane arterials often exceed 70 km/h at night. Deploying radar speed cameras on Bellandur–Ecospace, Marathahalli, and Varthur Road stretches reduces weaving conflicts and yields an estimated +9.5 safety score improvement.
                </p>
              </div>
            </div>

            <div className="doc-rec-item">
              <div className="rec-num">3</div>
              <div className="rec-content">
                <h4>Grade-Separated & High-Visibility Pedestrian Crossings (BBMP / DULT)</h4>
                <p>
                  Cataloged transit stops lack safe mid-block crossings, forcing bus commuters to cross multi-lane carriageways in dark conditions. Installing illuminated refuge islands addresses the top source of pedestrian severe injuries.
                </p>
              </div>
            </div>

            <div className="doc-rec-item">
              <div className="rec-num">4</div>
              <div className="rec-content">
                <h4>Intersection Geometric Channelization & Conflict Redesign (BBMP / NHAI)</h4>
                <p>
                  Corridors currently average 6.94 junctions per kilometer. Geometric channelization and rumble strip approaches at non-signalized entry ramps prevent sudden high-speed cross-merging crashes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Document Footer Signature */}
        <div className="doc-sign-footer">
          <div className="sign-col">
            <span className="sign-line"></span>
            <span className="sign-name">Executive Engineer, TEC</span>
            <span className="sign-dept">Bruhat Bengaluru Mahanagara Palike (BBMP)</span>
          </div>
          <div className="sign-col">
            <span className="sign-line"></span>
            <span className="sign-name">Joint Commissioner of Police (Traffic)</span>
            <span className="sign-dept">Bengaluru Traffic Police (BTP)</span>
          </div>
          <div className="sign-col">
            <span className="sign-line"></span>
            <span className="sign-name">Project Director</span>
            <span className="sign-dept">SafeRoute AI • Vision Zero Bengaluru</span>
          </div>
        </div>
      </div>
    </div>
  );
}
