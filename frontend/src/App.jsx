import React, { useState, useEffect } from 'react';
import SidebarNav from './components/SidebarNav';
import TopHeader from './components/TopHeader';
import KpiMetricsRow from './components/KpiMetricsRow';
import CorridorList from './components/CorridorList';
import SatelliteRiskMap from './components/SatelliteRiskMap';
import InspectorDrawer from './components/InspectorDrawer';
import FooterBar from './components/FooterBar';
import SearchModal from './components/SearchModal';
import SimulatorModal from './components/SimulatorModal';
import { apiService } from './services/api';
import { Map, ListFilter, BarChart3 } from 'lucide-react';

export default function App() {
  const [corridors, setCorridors] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedCorridor, setSelectedCorridor] = useState(null);
  const [activeNav, setActiveNav] = useState('overview');
  
  // Responsive / Collapsible Layout States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [corridorListCollapsed, setCorridorListCollapsed] = useState(false);
  const [mapMaximized, setMapMaximized] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileActiveView, setMobileActiveView] = useState('map'); // 'map' | 'corridors' | 'inspector'

  const [searchOpen, setSearchOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auto-adapt on smaller screen sizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1180 && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
      if (window.innerWidth < 1000 && !corridorListCollapsed) {
        setCorridorListCollapsed(true);
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global ⌘K / Ctrl+K keyboard shortcut listener for quick search palette
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Load Initial Datasets
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [corridorsData, metricsData] = await Promise.all([
          apiService.getCorridors(),
          apiService.getCityMetrics()
        ]);
        setCorridors(corridorsData);
        setMetrics(metricsData);
        if (corridorsData.length > 0) {
          setSelectedCorridor(corridorsData[0]);
        }
      } catch (err) {
        console.error('Failed to load road safety intelligence data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSelectCorridor = (corridor) => {
    setSelectedCorridor(corridor);
    if (window.innerWidth < 900) {
      setMobileActiveView('inspector');
    }
  };

  return (
    <div className="roadsafe-app-root">
      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div 
          className="mobile-nav-backdrop" 
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* 1. Global Left Sidebar Navigation */}
      <div className={`sidebar-wrapper ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <SidebarNav 
          activeNav={activeNav}
          onSelectNav={(id) => {
            setActiveNav(id);
            setMobileNavOpen(false);
          }}
          onOpenSimulator={() => {
            setSimulatorOpen(true);
            setMobileNavOpen(false);
          }}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* 2. Main Content Canvas */}
      <div className="main-viewport-container">
        {/* Top Header Bar */}
        <TopHeader 
          onOpenSearch={() => setSearchOpen(true)}
          onToggleMobileMenu={() => setMobileNavOpen(!mobileNavOpen)}
        />

        {/* Scrollable Dashboard Body */}
        <div className="dashboard-content-scroll">
          {/* Subheader & 5 KPI Metrics Strip */}
          <KpiMetricsRow metrics={metrics} />

          {/* Mobile View Switcher Tabs (Only visible on screens < 900px) */}
          <div className="mobile-view-switcher">
            <button 
              className={`switcher-pill ${mobileActiveView === 'corridors' ? 'active' : ''}`}
              onClick={() => setMobileActiveView('corridors')}
            >
              <ListFilter size={14} />
              <span>Corridors ({corridors.length})</span>
            </button>
            <button 
              className={`switcher-pill ${mobileActiveView === 'map' ? 'active' : ''}`}
              onClick={() => setMobileActiveView('map')}
            >
              <Map size={14} />
              <span>Satellite Map</span>
            </button>
            <button 
              className={`switcher-pill ${mobileActiveView === 'inspector' ? 'active' : ''}`}
              onClick={() => setMobileActiveView('inspector')}
            >
              <BarChart3 size={14} />
              <span>Intelligence</span>
            </button>
          </div>

          {/* 3-Column Core Command Center Grid */}
          <main className={`command-grid-layout ${corridorListCollapsed ? 'corridors-collapsed' : ''} ${mapMaximized ? 'map-maximized' : ''} mobile-view-${mobileActiveView}`}>
            {/* Column 1: Road Corridors List */}
            <div className="grid-col-corridors">
              <CorridorList 
                corridors={corridors}
                selectedCorridor={selectedCorridor}
                onSelectCorridor={handleSelectCorridor}
                isCollapsed={corridorListCollapsed}
                onToggleCollapse={() => setCorridorListCollapsed(!corridorListCollapsed)}
              />
            </div>

            {/* Column 2: Center Realistic Satellite Map */}
            <section className="grid-col-map map-view-column">
              <SatelliteRiskMap 
                corridors={corridors}
                selectedCorridor={selectedCorridor}
                onSelectCorridor={handleSelectCorridor}
                isMaximized={mapMaximized}
                onToggleMaximize={() => setMapMaximized(!mapMaximized)}
              />
            </section>

            {/* Column 3: Segment Intelligence Drawer */}
            <aside className="grid-col-inspector inspector-view-column">
              <InspectorDrawer 
                corridor={selectedCorridor}
                onOpenSimulator={() => setSimulatorOpen(true)}
              />
            </aside>
          </main>
        </div>

        {/* Global Footer Telemetry Bar */}
        <FooterBar />
      </div>

      {/* Quick Search Palette (⌘K) */}
      <SearchModal 
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        corridors={corridors}
        onSelectCorridor={handleSelectCorridor}
      />

      {/* Interactive What-If Safety Simulator Modal */}
      <SimulatorModal 
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        corridors={corridors}
        initialCorridor={selectedCorridor}
      />
    </div>
  );
}
