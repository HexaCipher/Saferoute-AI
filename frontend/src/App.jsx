import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CityStats from './components/CityStats';
import RiskMap from './components/RiskMap';
import SpotListSidebar from './components/SpotListSidebar';
import SpotInspector from './components/SpotInspector';
import { apiService } from './services/api';

export default function App() {
  const [hotspots, setHotspots] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [spotsData, metricsData] = await Promise.all([
          apiService.getHotspots(),
          apiService.getCityMetrics()
        ]);
        setHotspots(spotsData);
        setMetrics(metricsData);
        if (spotsData.length > 0) {
          // Select highest risk spot (Silk Board) by default
          setSelectedSpot(spotsData[0]);
        }
      } catch (err) {
        console.error('Failed to load initial road intelligence data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const handleSelectSpot = (spot) => {
    setSelectedSpot(spot);
  };

  const handleResetSelection = () => {
    if (hotspots.length > 0) {
      setSelectedSpot(hotspots[0]);
    }
  };

  return (
    <div className="app-container">
      {/* 1. Master Navbar */}
      <Navbar onResetSelection={handleResetSelection} />

      {/* 2. Top City Stats Summary Strip */}
      <CityStats metrics={metrics} />

      {/* 3. Main Dashboard Workspace (Sidebar + Map + Actionable Inspector) */}
      <main className="dashboard-grid">
        {/* Left: Corridor Browser */}
        <SpotListSidebar 
          hotspots={hotspots}
          selectedSpot={selectedSpot}
          onSelectSpot={handleSelectSpot}
        />

        {/* Center: Leaflet Interactive Risk Map */}
        <section className="map-section">
          <RiskMap 
            hotspots={hotspots}
            selectedSpot={selectedSpot}
            onSelectSpot={handleSelectSpot}
          />
        </section>

        {/* Right: PS3 Actionable Intelligence Panel */}
        <aside className="inspector-section">
          <SpotInspector 
            spot={selectedSpot} 
            onClose={() => setSelectedSpot(null)} 
          />
        </aside>
      </main>

      {/* Footer / Status Bar */}
      <footer className="footer-bar">
        <div className="footer-left">
          <span>Sourced from <strong>MoRTH 2023</strong> & <strong>Bengaluru City Traffic Police Blackspot Audit</strong></span>
        </div>
        <div className="footer-center">
          <span>AI Model: Gradient Boosting Classifier + Bayesian Impact Optimization (R²: 0.86)</span>
        </div>
        <div className="footer-right">
          <span>IBM Bob Hackathon 2026 • PS3 RoadSafe India</span>
        </div>
      </footer>
    </div>
  );
}
