import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShieldAlert, 
  GitFork, 
  Sliders, 
  FileText, 
  Database,
  ChevronLeft,
  ChevronRight,
  Target
} from 'lucide-react';

export default function SidebarNav({ 
  activeNav, 
  onSelectNav, 
  onOpenSimulator,
  isCollapsed = false,
  onToggleCollapse
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'corridors', label: 'Corridors', icon: TrendingUp },
    { id: 'risk_analysis', label: 'Risk Analysis', icon: ShieldAlert },
    { id: 'interventions', label: 'Interventions', icon: GitFork },
    { id: 'simulate', label: 'Simulate', icon: Sliders, badge: 'AI' },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'data_hub', label: 'Data Hub', icon: Database }
  ];

  const handleNavClick = (id) => {
    if (id === 'simulate') {
      onOpenSimulator();
    } else {
      onSelectNav(id);
    }
  };

  return (
    <aside className={`global-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Top Collapse / Expand Toggle Button */}
      <div className="sidebar-top-toggle-row">
        <button 
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!isCollapsed && <span className="collapse-btn-label">Collapse</span>}
        </button>
      </div>

      {/* Primary Navigation List */}
      <nav className="sidebar-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={18} className="nav-item-icon" />
              {!isCollapsed && (
                <>
                  <span className="nav-item-text">{item.label}</span>
                  {item.badge && (
                    <span className="nav-item-badge">{item.badge}</span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Vidhana Soudha City Monument Banner */}
      {!isCollapsed ? (
        <div className="sidebar-city-card">
          <div className="city-illustration-wrap">
            <svg className="vidhana-soudha-svg" viewBox="0 0 200 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 85H190" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M20 85V68H180V85" stroke="#64748B" strokeWidth="1.2" />
              <path d="M40 68V52H160V68" stroke="#64748B" strokeWidth="1.2" />
              
              {/* Center Main Dome */}
              <path d="M85 52C85 36 100 24 100 24C100 24 115 36 115 52H85Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
              <path d="M100 24V14" stroke="#475569" strokeWidth="1.5" />
              <circle cx="100" cy="12" r="2.5" fill="#EF4444" />
              <path d="M96 16H104" stroke="#475569" strokeWidth="1" />
              
              {/* Left Side Dome */}
              <path d="M45 52C45 42 55 34 55 34C55 34 65 42 65 52H45Z" fill="#F1F5F9" stroke="#64748B" strokeWidth="1" />
              <path d="M55 34V26" stroke="#64748B" strokeWidth="1" />
              <circle cx="55" cy="25" r="1.5" fill="#64748B" />

              {/* Right Side Dome */}
              <path d="M135 52C135 42 145 34 145 34C145 34 155 42 155 52H135Z" fill="#F1F5F9" stroke="#64748B" strokeWidth="1" />
              <path d="M155 34V26" stroke="#64748B" strokeWidth="1" />
              <circle cx="155" cy="25" r="1.5" fill="#64748B" />

              {/* Pillars / Colonnade */}
              <line x1="72" y1="52" x2="72" y2="68" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="82" y1="52" x2="82" y2="68" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="92" y1="52" x2="92" y2="68" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="102" y1="52" x2="102" y2="68" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="112" y1="52" x2="112" y2="68" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="122" y1="52" x2="122" y2="68" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
              
              {/* Steps */}
              <line x1="86" y1="85" x2="114" y2="85" stroke="#475569" strokeWidth="2" />
              <line x1="88" y1="82" x2="112" y2="82" stroke="#475569" strokeWidth="1.5" />
              <line x1="90" y1="79" x2="110" y2="79" stroke="#475569" strokeWidth="1.5" />
              <line x1="92" y1="76" x2="108" y2="76" stroke="#475569" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="city-card-text">
            <h4 className="city-card-title">Bengaluru<br />for Safer<br />Tomorrows</h4>
            <div className="city-card-divider"></div>
            <div className="vision-zero-tag">Vision Zero 2030</div>
            <p className="city-card-caption">Safer People. Safe Streets.<br />Smarter Cities.</p>
          </div>
        </div>
      ) : (
        <div className="sidebar-city-mini" title="Vision Zero 2030 • Bengaluru">
          <div className="mini-emblem-circle">
            <Target size={16} className="text-blue" />
          </div>
          <span className="mini-tag">VZ'30</span>
        </div>
      )}
    </aside>
  );
}
