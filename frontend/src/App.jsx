import React, { useState, useEffect, useCallback } from 'react';
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
import { Map, ListFilter, BarChart3, AlertTriangle, RotateCcw, Terminal } from 'lucide-react';

export default function App() {
  const [segments, setSegments] = useState([]);
  const [segmentsMetadata, setSegmentsMetadata] = useState(null);
  const [summary, setSummary] = useState(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);
  const [selectedCorridorId, setSelectedCorridorId] = useState('ALL');
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
  const [error, setError] = useState(null);
  const [backendHealth, setBackendHealth] = useState({ isHealthy: false, totalSegments: 0 });

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
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed, corridorListCollapsed]);

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

  // Refresh / Retry Data Fetcher
  const handleRetryConnection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [healthRes, summaryData, segmentsData] = await Promise.all([
        apiService.checkHealth().catch(() => null),
        apiService.getAnalyticsSummary(),
        apiService.getSegments()
      ]);

      const isHealthy = healthRes?.status === 'healthy';
      setBackendHealth({
        isHealthy,
        totalSegments: healthRes?.total_segments || segmentsData.features?.length || 0
      });

      setSummary(summaryData);
      setSegments(segmentsData.features || []);
      setSegmentsMetadata(segmentsData.metadata || null);

      if (segmentsData.features && segmentsData.features.length > 0) {
        const criticalFirst = segmentsData.features.find(f => f.properties?.risk_tier === 'CRITICAL');
        const defaultId = criticalFirst ? criticalFirst.properties.segment_id : segmentsData.features[0].properties.segment_id;
        setSelectedSegmentId(prev => prev || defaultId);
      }
    } catch (err) {
      console.error('Failed to load live data from FastAPI backend:', err);
      setError(err.message || 'Cannot reach FastAPI backend server on http://localhost:8000');
      setBackendHealth({ isHealthy: false, totalSegments: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial mount data load
  useEffect(() => {
    let isMounted = true;

    async function initializeDashboard() {
      try {
        const [healthRes, summaryData, segmentsData] = await Promise.all([
          apiService.checkHealth().catch(() => null),
          apiService.getAnalyticsSummary(),
          apiService.getSegments()
        ]);

        if (!isMounted) return;

        const isHealthy = healthRes?.status === 'healthy';
        setBackendHealth({
          isHealthy,
          totalSegments: healthRes?.total_segments || segmentsData.features?.length || 0
        });

        setSummary(summaryData);
        setSegments(segmentsData.features || []);
        setSegmentsMetadata(segmentsData.metadata || null);

        if (segmentsData.features && segmentsData.features.length > 0) {
          const criticalFirst = segmentsData.features.find(f => f.properties?.risk_tier === 'CRITICAL');
          const defaultId = criticalFirst ? criticalFirst.properties.segment_id : segmentsData.features[0].properties.segment_id;
          setSelectedSegmentId(prev => prev || defaultId);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load live data from FastAPI backend:', err);
        setError(err.message || 'Cannot reach FastAPI backend server on http://localhost:8000');
        setBackendHealth({ isHealthy: false, totalSegments: 0 });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectSegment = (segmentId) => {
    setSelectedSegmentId(segmentId);
    if (window.innerWidth < 900) {
      setMobileActiveView('inspector');
    }
  };

  const handleSelectCorridor = (corridorId) => {
    setSelectedCorridorId(corridorId);
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
        {/* Top Header Bar with Live Connectivity Status */}
        <TopHeader 
          onOpenSearch={() => setSearchOpen(true)}
          onToggleMobileMenu={() => setMobileNavOpen(!mobileNavOpen)}
          backendHealth={backendHealth}
          onRetryBackend={handleRetryConnection}
        />

        {/* Global Connection Error State (Never falls back to mock data) */}
        {error && !loading ? (
          <div className="dashboard-backend-error-overlay">
            <div className="backend-error-card">
              <div className="error-icon-circle">
                <AlertTriangle size={36} className="text-red" />
              </div>
              <h2 className="error-card-title">FastAPI Backend Offline</h2>
              <p className="error-card-subtitle">
                The SafeRoute AI dashboard requires a live connection to the backend. No mock data is displayed.
              </p>

              <div className="terminal-instruction-box">
                <div className="terminal-header">
                  <Terminal size={14} />
                  <span>Start Local Backend</span>
                </div>
                <code>python -m uvicorn backend.main:app --port 8000 --host 127.0.0.1</code>
              </div>

              <div className="error-actions-row">
                <button className="primary-retry-btn" onClick={handleRetryConnection}>
                  <RotateCcw size={15} />
                  <span>Retry Connection</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Scrollable Dashboard Body */
          <div className="dashboard-content-scroll">
            {/* Subheader & 5 Macro KPI Metrics Strip */}
            <KpiMetricsRow summary={summary} loading={loading} />

            {/* Mobile View Switcher Tabs (Only visible on screens < 900px) */}
            <div className="mobile-view-switcher">
              <button 
                className={`switcher-pill ${mobileActiveView === 'corridors' ? 'active' : ''}`}
                onClick={() => setMobileActiveView('corridors')}
              >
                <ListFilter size={14} />
                <span>Corridors ({summary?.corridor_breakdown?.length || 3})</span>
              </button>
              <button 
                className={`switcher-pill ${mobileActiveView === 'map' ? 'active' : ''}`}
                onClick={() => setMobileActiveView('map')}
              >
                <Map size={14} />
                <span>Satellite Map ({segments.length})</span>
              </button>
              <button 
                className={`switcher-pill ${mobileActiveView === 'inspector' ? 'active' : ''}`}
                onClick={() => setMobileActiveView('inspector')}
              >
                <BarChart3 size={14} />
                <span>Telemetry</span>
              </button>
            </div>

            {/* 3-Column Core Command Center Grid */}
            <main className={`command-grid-layout ${corridorListCollapsed ? 'corridors-collapsed' : ''} ${mapMaximized ? 'map-maximized' : ''} mobile-view-${mobileActiveView}`}>
              {/* Column 1: Road Corridors & 500m Segments List */}
              <div className="grid-col-corridors">
                <CorridorList 
                  corridors={summary?.corridor_breakdown || []}
                  segments={segments}
                  selectedSegmentId={selectedSegmentId}
                  onSelectSegment={handleSelectSegment}
                  selectedCorridorId={selectedCorridorId}
                  onSelectCorridor={handleSelectCorridor}
                  isCollapsed={corridorListCollapsed}
                  onToggleCollapse={() => setCorridorListCollapsed(!corridorListCollapsed)}
                  loading={loading}
                />
              </div>

              {/* Column 2: Center Realistic 3D Satellite Map (Real GeoJSON) */}
              <section className="grid-col-map map-view-column">
                <SatelliteRiskMap 
                  segments={segments}
                  metadata={segmentsMetadata}
                  selectedSegmentId={selectedSegmentId}
                  onSelectSegment={handleSelectSegment}
                  isMaximized={mapMaximized}
                  onToggleMaximize={() => setMapMaximized(!mapMaximized)}
                  loading={loading}
                />
              </section>

              {/* Column 3: Segment Telemetry Inspector Drawer */}
              <aside className="grid-col-inspector inspector-view-column">
                <InspectorDrawer 
                  selectedSegmentId={selectedSegmentId}
                  onOpenSimulator={() => setSimulatorOpen(true)}
                />
              </aside>
            </main>
          </div>
        )}

        {/* Global Footer Telemetry Bar */}
        <FooterBar />
      </div>

      {/* Quick Search Palette (⌘K) — Real Segment Search */}
      <SearchModal 
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        segments={segments}
        onSelectSegment={handleSelectSegment}
      />

      {/* Interactive What-If Safety Simulator Modal (Live ML Feature Mutation) */}
      <SimulatorModal 
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        segments={segments}
        initialSegmentId={selectedSegmentId}
      />
    </div>
  );
}
