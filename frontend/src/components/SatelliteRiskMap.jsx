import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  Layers, 
  ChevronDown, 
  Compass,
  Moon,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { CORRIDOR_POLYLINES } from '../services/mockData';

export default function SatelliteRiskMap({ 
  corridors, 
  selectedCorridor, 
  onSelectCorridor,
  isMaximized = false,
  onToggleMaximize
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const polylinesGroupRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [mapMode, setMapMode] = useState('satellite'); // 'map' | 'satellite' | 'traffic'
  const [layersOpen, setLayersOpen] = useState(false); // Closed by default to maximize visible map!
  
  // Layer checklist state
  const [activeLayers, setActiveLayers] = useState({
    hotspots: true,
    nightRisk: true,
    corridors: true,
    metro: false,
    busStops: false,
    trafficFlow: false,
    safetyInfra: false
  });

  const toggleLayer = (key) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [12.965, 77.625],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Default: High-Resolution Esri World Imagery (Satellite)
    const satelliteTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Esri, Maxar, Earthstar Geographics'
      }
    ).addTo(map);

    tileLayerRef.current = satelliteTiles;
    polylinesGroupRef.current = L.featureGroup().addTo(map);
    markersGroupRef.current = L.featureGroup().addTo(map);
    mapInstanceRef.current = map;

    // Invalidate size safely on mount
    const timer = setTimeout(() => {
      if (mapInstanceRef.current && map._container) {
        try {
          map.invalidateSize();
        } catch (err) {
          // Leaflet pane unmounted during HMR
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      try {
        map.remove();
      } catch (err) {
        // already removed
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. ResizeObserver to handle fluid resizing when panels collapse/expand
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current && mapInstanceRef.current._container) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch (err) {
          // ignore during transitions
        }
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 2b. Invalidate map size when isMaximized toggles (after CSS grid transition)
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        if (mapInstanceRef.current && mapInstanceRef.current._container) {
          try {
            mapInstanceRef.current.invalidateSize();
          } catch (err) {
            // pane not attached
          }
        }
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [isMaximized]);

  // 3. Handle Map Mode Switching (Map / Satellite / Traffic)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const map = mapInstanceRef.current;
    map.removeLayer(tileLayerRef.current);

    let newTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let subdomains = 'abc';

    if (mapMode === 'map') {
      newTileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      subdomains = 'abcd';
    } else if (mapMode === 'traffic') {
      newTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      subdomains = 'abcd';
    }

    tileLayerRef.current = L.tileLayer(newTileUrl, {
      maxZoom: 19,
      subdomains
    }).addTo(map);

    if (polylinesGroupRef.current) polylinesGroupRef.current.bringToBack();
    if (markersGroupRef.current) markersGroupRef.current.bringToFront();
  }, [mapMode]);

  // 4. Render Corridors Polylines & Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    const polylinesGroup = polylinesGroupRef.current;

    markersGroup.clearLayers();
    polylinesGroup.clearLayers();

    // A. Draw Road Corridors Polylines
    if (activeLayers.corridors) {
      CORRIDOR_POLYLINES.forEach(corridor => {
        const polyline = L.polyline(corridor.coordinates, {
          color: corridor.color,
          weight: 4,
          opacity: 0.85,
          dashArray: corridor.risk_level === 'Critical' ? '6, 6' : null,
          lineCap: 'round',
          lineJoin: 'round'
        });

        // Glow underlay polyline
        const glowLine = L.polyline(corridor.coordinates, {
          color: corridor.color,
          weight: 10,
          opacity: 0.35
        });

        glowLine.addTo(polylinesGroup);
        polyline.addTo(polylinesGroup);
      });
    }

    // B. Draw Hotspots & Danger Nodes
    if (activeLayers.hotspots) {
      corridors.forEach(spot => {
        const isSelected = selectedCorridor && selectedCorridor.id === spot.id;
        const isCritical = spot.risk_tier === 'Critical';
        const isHigh = spot.risk_tier === 'High';

        let badgeBg = '#EF4444';
        let glowColor = 'rgba(239, 68, 68, 0.45)';
        if (isHigh) {
          badgeBg = '#F97316';
          glowColor = 'rgba(249, 115, 22, 0.45)';
        } else if (spot.risk_tier === 'Medium') {
          badgeBg = '#FBBF24';
          glowColor = 'rgba(251, 191, 36, 0.45)';
        }

        // Concentric pulsing hazard ring
        if (activeLayers.nightRisk) {
          const outerPulse = L.circle([spot.latitude, spot.longitude], {
            radius: isCritical ? 900 : 650,
            color: badgeBg,
            weight: 1,
            fillColor: badgeBg,
            fillOpacity: isSelected ? 0.28 : 0.15,
            dashArray: '3, 6'
          });
          outerPulse.addTo(markersGroup);
        }

        // Custom Rich Map Marker matching ui_dashboard.png
        const markerHtml = `
          <div class="map-hazard-marker ${isSelected ? 'is-selected' : ''}">
            <div class="hazard-pulse-ring" style="background-color: ${glowColor};"></div>
            <div class="hazard-badge-pill" style="background-color: ${badgeBg};">
              <span class="hazard-score">${spot.risk_score}</span>
            </div>
            <div class="hazard-label-tag">${spot.name.split(' ')[0]}</div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-hazard-div-icon',
          html: markerHtml,
          iconSize: [52, 52],
          iconAnchor: [26, 26]
        });

        const marker = L.marker([spot.latitude, spot.longitude], { icon: customIcon });

        marker.on('click', () => {
          onSelectCorridor(spot);
        });

        marker.addTo(markersGroup);
      });
    }

    // Fly to selected spot
    if (selectedCorridor) {
      map.flyTo([selectedCorridor.latitude, selectedCorridor.longitude], 13.5, {
        duration: 0.8
      });
    }
  }, [corridors, selectedCorridor, activeLayers]);

  // Control handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (corridors.length > 0) {
      const bounds = L.latLngBounds(corridors.map(c => [c.latitude, c.longitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    } else {
      mapInstanceRef.current.flyTo([12.965, 77.625], 12);
    }
  };

  return (
    <div className="satellite-map-container">
      {/* 1. Top Controls Bar */}
      <div className="map-top-bar">
        {/* Map / Satellite / Traffic Switcher */}
        <div className="segmented-map-toggle">
          <button 
            className={`seg-btn ${mapMode === 'map' ? 'active' : ''}`}
            onClick={() => setMapMode('map')}
          >
            Map
          </button>
          <button 
            className={`seg-btn ${mapMode === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapMode('satellite')}
          >
            Satellite
          </button>
          <button 
            className={`seg-btn ${mapMode === 'traffic' ? 'active' : ''}`}
            onClick={() => setMapMode('traffic')}
          >
            Traffic
          </button>
        </div>

        {/* Right Controls: Night Risk + Expand/Focus Map */}
        <div className="map-top-right-actions">
          <div className="night-risk-pill-btn">
            <Moon size={13} className="moon-icon text-amber" />
            <span>Night-time Risk</span>
            <ChevronDown size={13} />
          </div>

          {onToggleMaximize && (
            <button 
              className="map-maximize-btn" 
              onClick={onToggleMaximize}
              title={isMaximized ? "Restore Panels View" : "Maximize Map View"}
            >
              {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              <span className="max-text desktop-only">{isMaximized ? "Restore" : "Expand Map"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Left Zoom / Tool Stack Controls */}
      <div className="map-left-controls">
        <button className="map-ctrl-btn" onClick={handleZoomIn} title="Zoom In">
          <Plus size={15} />
        </button>
        <button className="map-ctrl-btn" onClick={handleZoomOut} title="Zoom Out">
          <Minus size={15} />
        </button>
        <div className="ctrl-divider"></div>
        <button className="map-ctrl-btn" onClick={handleRecenter} title="Fit All Blackspots (Bengaluru)">
          <Crosshair size={15} />
        </button>
        <button 
          className={`map-ctrl-btn ${layersOpen ? 'active' : ''}`} 
          onClick={() => setLayersOpen(!layersOpen)}
          title="Toggle Layers Panel"
        >
          <Layers size={15} />
        </button>
      </div>

      {/* 3. Floating Layers Checklist Panel (Top-Right) */}
      {layersOpen && (
        <div className="floating-layers-card">
          <div className="layer-item">
            <input 
              type="checkbox" 
              id="layer-hotspots" 
              checked={activeLayers.hotspots}
              onChange={() => toggleLayer('hotspots')}
            />
            <label htmlFor="layer-hotspots">Accident Hotspots</label>
          </div>
          <div className="layer-item">
            <input 
              type="checkbox" 
              id="layer-night" 
              checked={activeLayers.nightRisk}
              onChange={() => toggleLayer('nightRisk')}
            />
            <label htmlFor="layer-night">Night-time Risk</label>
          </div>
          <div className="layer-item">
            <input 
              type="checkbox" 
              id="layer-corridors" 
              checked={activeLayers.corridors}
              onChange={() => toggleLayer('corridors')}
            />
            <label htmlFor="layer-corridors">Road Corridors</label>
          </div>
          <div className="layer-item">
            <input 
              type="checkbox" 
              id="layer-metro" 
              checked={activeLayers.metro}
              onChange={() => toggleLayer('metro')}
            />
            <label htmlFor="layer-metro">Metro Stations</label>
          </div>
          <div className="layer-item">
            <input 
              type="checkbox" 
              id="layer-bus" 
              checked={activeLayers.busStops}
              onChange={() => toggleLayer('busStops')}
            />
            <label htmlFor="layer-bus">Bus Stops</label>
          </div>
          <div className="layer-item">
            <input 
              type="checkbox" 
              id="layer-traffic" 
              checked={activeLayers.trafficFlow}
              onChange={() => toggleLayer('trafficFlow')}
            />
            <label htmlFor="layer-traffic">Traffic Flow</label>
          </div>
          <div className="layer-item">
            <input 
              type="checkbox" 
              id="layer-infra" 
              checked={activeLayers.safetyInfra}
              onChange={() => toggleLayer('safetyInfra')}
            />
            <label htmlFor="layer-infra">Safety Infrastructure</label>
          </div>
        </div>
      )}

      {/* 4. Directional Highway Tags (Overlay on Map) */}
      <div className="map-highway-overlay">
        <div className="highway-shield nh44">NH 44</div>
        <div className="highway-shield nh48">NH 48</div>
        <div className="dir-tag tumkur">← Tumkur</div>
        <div className="dir-tag mysuru">← Mysuru</div>
        <div className="dir-tag hosur">Hosur →</div>
        <div className="dir-tag whitefield">Whitefield →</div>
        <div className="landmark-tag lalbagh">Lalbagh</div>
        <div className="landmark-tag hsr">HSR Layout</div>
        <div className="landmark-tag city-center">Bengaluru</div>
      </div>

      {/* 5. Bottom Left Risk Score Legend */}
      <div className="map-risk-legend">
        <div className="legend-title">Risk Score</div>
        <div className="legend-grid">
          <div className="legend-item">
            <span className="legend-bullet red"></span>
            <span>Critical (80–100)</span>
          </div>
          <div className="legend-item">
            <span className="legend-bullet orange"></span>
            <span>High (60–79)</span>
          </div>
          <div className="legend-item">
            <span className="legend-bullet yellow"></span>
            <span>Medium (40–59)</span>
          </div>
          <div className="legend-item">
            <span className="legend-bullet green"></span>
            <span>Low (&lt;40)</span>
          </div>
        </div>
      </div>

      {/* 6. Bottom Right Compass & Scale */}
      <div className="map-scale-compass">
        <div className="compass-icon-wrap" title="North">
          <Compass size={16} className="compass-icon" />
          <span className="north-arrow">N</span>
        </div>
        <div className="scale-bar-wrap">
          <div className="scale-line"></div>
          <span className="scale-text">5 km</span>
        </div>
      </div>

      {/* Leaflet Mount Element */}
      <div ref={mapContainerRef} className="leaflet-mount-container" />
    </div>
  );
}
