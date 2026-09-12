import React from 'react';
import { AlertOctagon, TrendingDown, HeartPulse, DollarSign, MapPin } from 'lucide-react';

export default function CityStats({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="stats-strip">
      <div className="stat-card">
        <div className="stat-icon-wrapper red">
          <AlertOctagon size={20} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Critical Blackspots</div>
          <div className="stat-val">{metrics.critical_zones_count} <span className="stat-unit">/ {metrics.total_corridors_analyzed} corridors</span></div>
          <div className="stat-hint text-red">High casualty probability</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper orange">
          <MapPin size={20} />
        </div>
        <div className="stat-content">
          <div className="stat-label">2023 Corridor Fatalities</div>
          <div className="stat-val">{metrics.total_fatalities_2023} <span className="stat-unit">deaths</span></div>
          <div className="stat-hint">{metrics.total_accidents_2023} total collisions logged</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper green">
          <HeartPulse size={20} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Modeled Lives Saved / Yr</div>
          <div className="stat-val text-green">+{metrics.potential_lives_saved_modeled} <span className="stat-unit">lives</span></div>
          <div className="stat-hint">Via top 3 ranked interventions</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper blue">
          <TrendingDown size={20} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Accident Reduction Est.</div>
          <div className="stat-val text-blue">38.4% <span className="stat-unit">avg drop</span></div>
          <div className="stat-hint">Across prioritized corridors</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper purple">
          <DollarSign size={20} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Socio-Economic Savings</div>
          <div className="stat-val text-purple">₹{metrics.estimated_economic_loss_prevented_cr} Cr</div>
          <div className="stat-hint">Healthcare & economic value saved</div>
        </div>
      </div>
    </div>
  );
}
