import React from 'react';
import { 
  Bike, 
  Skull, 
  Footprints, 
  Moon, 
  ArrowUpRight 
} from 'lucide-react';

export default function KpiMetricsRow({ metrics }) {
  if (!metrics) return null;

  return (
    <section className="kpi-overview-section">
      <div className="kpi-title-block">
        <h1 className="page-title">Bengaluru Night-time Safety Overview</h1>
        <p className="page-subtitle">AI-powered risk analysis for a safer, smarter Bengaluru</p>
      </div>

      <div className="kpi-cards-grid">
        {/* Card 1: Total Crashes */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-circle bg-red-soft">
              <Bike size={18} className="text-red" />
            </div>
            <div className="kpi-body">
              <div className="kpi-value-row">
                <span className="kpi-number">{metrics.total_crashes_2023.toLocaleString()}</span>
              </div>
              <div className="kpi-label">Total Crashes (2023)</div>
              <div className="kpi-delta-tag text-red">
                <ArrowUpRight size={13} />
                <span>12%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Deaths */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-circle bg-red-soft">
              <Skull size={18} className="text-red" />
            </div>
            <div className="kpi-body">
              <div className="kpi-value-row">
                <span className="kpi-number">{metrics.total_fatalities_2023.toLocaleString()}</span>
              </div>
              <div className="kpi-label">Total Deaths</div>
              <div className="kpi-delta-tag text-red">
                <ArrowUpRight size={13} />
                <span>8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Total Injuries */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-circle bg-slate-soft">
              <Footprints size={18} className="text-slate" />
            </div>
            <div className="kpi-body">
              <div className="kpi-value-row">
                <span className="kpi-number">{metrics.total_injuries_2023.toLocaleString()}</span>
              </div>
              <div className="kpi-label">Total Injuries</div>
              <div className="kpi-delta-tag text-red">
                <ArrowUpRight size={13} />
                <span>11%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Motorcyclist Fatalities with Progress Bar */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-circle bg-slate-soft">
              <Bike size={18} className="text-slate" />
            </div>
            <div className="kpi-body">
              <div className="kpi-value-row">
                <span className="kpi-number">{metrics.motorcyclist_fatalities_pct}%</span>
              </div>
              <div className="kpi-label">Motorcyclist Fatalities</div>
              <div className="kpi-bar-track">
                <div 
                  className="kpi-bar-fill bg-red" 
                  style={{ width: `${metrics.motorcyclist_fatalities_pct}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Night-time Deaths with Amber Progress Bar */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-circle bg-amber-soft">
              <Moon size={18} className="text-amber" />
            </div>
            <div className="kpi-body">
              <div className="kpi-value-row">
                <span className="kpi-number">{metrics.night_time_deaths_pct}%</span>
              </div>
              <div className="kpi-label">Night-time Deaths ({metrics.night_time_window})</div>
              <div className="kpi-bar-track">
                <div 
                  className="kpi-bar-fill bg-amber" 
                  style={{ width: `${metrics.night_time_deaths_pct}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
