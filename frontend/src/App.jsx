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

export default function App() {
  const [corridors, setCorridors] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedCorridor, setSelectedCorridor] = useState(null);
  const [activeNav, setActiveNav] = useState('overview');
  const [searchOpen, setSearchOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
          // Default selection to Silk Board Junction (highest risk blackspot)
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
  };

  return (
    <div className="roadsafe-app-root">
      {/* 1. Global Left Sidebar Navigation */}
      <SidebarNav 
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        onOpenSimulator={() => setSimulatorOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <div className="main-viewport-container">
        {/* Top Header Bar */}
        <TopHeader 
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* Scrollable Dashboard Body */}
        <div className="dashboard-content-scroll">
          {/* Subheader & 5 KPI Metrics Strip */}
          <KpiMetricsRow metrics={metrics} />

          {/* 3-Column Core Command Center Grid */}
          <main className="command-grid-layout">
            {/* Column 1: Road Corridors List */}
            <CorridorList 
              corridors={corridors}
              selectedCorridor={selectedCorridor}
              onSelectCorridor={handleSelectCorridor}
            />

            {/* Column 2: Center Realistic Satellite Map */}
            <section className="map-view-column">
              <SatelliteRiskMap 
                corridors={corridors}
                selectedCorridor={selectedCorridor}
                onSelectCorridor={handleSelectCorridor}
              />
            </section>

            {/* Column 3: Segment Intelligence Drawer */}
            <aside className="inspector-view-column">
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
