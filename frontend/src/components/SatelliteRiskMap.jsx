import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  Layers,
  ChevronDown, 
  Moon,
  Maximize2, 
  Minimize2
} from 'lucide-react';

export default function SatelliteRiskMap({ 
  segments = [], 
  metadata = null,
  selectedSegmentId, 
  onSelectSegment,
  isMaximized = false,
  onToggleMaximize,
  loading = false
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const labelsLayerRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const highlightLayerRef = useRef(null);
  const initialFitDoneRef = useRef(false);
  const isFirstMountRef = useRef(true);

  // Map Modes: 'map' | 'satellite' | 'dark'
  const [mapMode, setMapMode] = useState('satellite');
  
  // Real Property-Backed Layer Toggles
  const [layersDropdownOpen, setLayersDropdownOpen] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    allSegments: true,
    darkSpots: true,
    junctionFriction: true,
    crossings: true,
    nightRisk: true
  });

  const toggleLayer = (layerKey) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // 1. Initialize Map on Mount
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Bengaluru city center / Outer Ring Road
    const map = L.map(mapContainerRef.current, {
      center: [12.9600, 77.6500],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Satellite Imagery Layer
    const satelliteTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, crossOrigin: true }
    ).addTo(map);

    // Labels overlay
    const labelsTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, crossOrigin: true, opacity: 0.85 }
    ).addTo(map);

    tileLayerRef.current = satelliteTiles;
    labelsLayerRef.current = labelsTiles;
    geoJsonLayerRef.current = L.featureGroup().addTo(map);
    highlightLayerRef.current = L.featureGroup().addTo(map);
    mapInstanceRef.current = map;

    // Staged size invalidation to guarantee Leaflet expands to fill the container
    const t1 = setTimeout(() => { if (map._container) map.invalidateSize(); }, 50);
    const t2 = setTimeout(() => { if (map._container) map.invalidateSize(); }, 150);
    const t3 = setTimeout(() => { if (map._container) map.invalidateSize(); }, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      try {
        map.remove();
      } catch {
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
        } catch {
          // ignore during unmounting
        }
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 2b. Invalidate map size when isMaximized or segments change
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        if (mapInstanceRef.current && mapInstanceRef.current._container) {
          try {
            mapInstanceRef.current.invalidateSize();
          } catch {
            // pane not attached
          }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isMaximized, segments]);

  // 3. Handle Map Mode Switching (Street / Satellite / Dark)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const map = mapInstanceRef.current;

    map.removeLayer(tileLayerRef.current);
    if (labelsLayerRef.current) {
      map.removeLayer(labelsLayerRef.current);
      labelsLayerRef.current = null;
    }

    if (mapMode === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, crossOrigin: true }
      ).addTo(map);

      labelsLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, crossOrigin: true, opacity: 0.85 }
      ).addTo(map);
    } else if (mapMode === 'dark') {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(map);
    }

    // Bring GeoJSON road segments and highlights back to top
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.bringToFront();
    }
    if (highlightLayerRef.current) {
      highlightLayerRef.current.bringToFront();
    }
  }, [mapMode]);

  // 4. Render Live GeoJSON Segments with Real Risk Colors
  useEffect(() => {
    if (!mapInstanceRef.current || !geoJsonLayerRef.current || !highlightLayerRef.current) return;

    const geoGroup = geoJsonLayerRef.current;
    const highlightGroup = highlightLayerRef.current;
    geoGroup.clearLayers();
    highlightGroup.clearLayers();

    if (!segments || segments.length === 0 || !activeLayers.allSegments) return;

    // Filter segments according to active layer toggles
    const visibleFeatures = segments.filter(feat => {
      const p = feat.properties || {};
      
      // If user turned off darkSpots, skip segments that are unlit
      if (!activeLayers.darkSpots && p.street_lighting !== 'yes') {
        return false;
      }
      return true;
    });

    // Draw all visible road segments
    visibleFeatures.forEach(feature => {
      const p = feature.properties || {};
      const segId = p.segment_id;
      const isSelected = segId === selectedSegmentId;
      const tier = (p.risk_tier || '').toUpperCase();

      // Official Color Scale according to Risk Tier
      let strokeColor = '#10B981'; // LOW (Safe)
      let weight = 3.5;
      let opacity = 0.85;

      if (tier === 'CRITICAL') {
        strokeColor = '#EF4444'; // Red
        weight = 5.5;
        opacity = 0.95;
      } else if (tier === 'HIGH') {
        strokeColor = '#F97316'; // Orange
        weight = 4.5;
        opacity = 0.90;
      } else if (tier === 'MEDIUM') {
        strokeColor = '#FBBF24'; // Yellow/Amber
        weight = 3.8;
        opacity = 0.85;
      }

      // GeoJSON LineString coordinates in Leaflet are [lat, lng]
      const rawCoords = feature.geometry?.coordinates || [];
      const coords = rawCoords.map(([lng, lat]) => [lat, lng]);

      if (coords.length < 2) return;

      const polyline = L.polyline(coords, {
        color: strokeColor,
        weight,
        opacity,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Attach feature reference for later lookup
      polyline.feature = feature;

      // Interactive Tooltip on Hover
      const tooltipContent = `
        <div class="map-segment-tooltip">
          <div class="tooltip-header">
            <strong>${p.road_name || 'Road Segment'}</strong>
            <span class="tooltip-tier tier-${tier.toLowerCase()}">${tier}</span>
          </div>
          <div class="tooltip-sub">${p.corridor_name || ''}</div>
          <div class="tooltip-meta-grid">
            <div class="tooltip-meta-item">
              <span class="lbl">Safety Score:</span>
              <span class="val score-${tier.toLowerCase()}">${Math.round(p.safety_score || 0)}/100</span>
            </div>
            <div class="tooltip-meta-item">
              <span class="lbl">Night Multiplier:</span>
              <span class="val">${p.night_risk_multiplier || 1.0}x</span>
            </div>
          </div>
          <div class="tooltip-btp">${p.btp_station || ''}</div>
          <div class="tooltip-cta">Click to inspect telemetry</div>
        </div>
      `;

      polyline.bindTooltip(tooltipContent, {
        sticky: true,
        direction: 'top',
        className: 'leaflet-custom-segment-tooltip'
      });

      // Hover feedback
      polyline.on('mouseover', () => {
        if (segId !== selectedSegmentId) {
          polyline.setStyle({ weight: weight + 2, opacity: 1 });
        }
      });
      polyline.on('mouseout', () => {
        if (segId !== selectedSegmentId) {
          polyline.setStyle({ weight, opacity });
        }
      });

      // Click to select
      polyline.on('click', () => {
        if (onSelectSegment) {
          onSelectSegment(segId);
        }
      });

      polyline.addTo(geoGroup);

      // If Selected: add prominent highlight halo & marker
      if (isSelected) {
        const glowLine = L.polyline(coords, {
          color: '#38BDF8', // Cyan Halo
          weight: weight + 6,
          opacity: 0.65,
          lineCap: 'round'
        });
        glowLine.addTo(highlightGroup);

        const coreLine = L.polyline(coords, {
          color: '#FFFFFF',
          weight: weight + 1.5,
          opacity: 1,
          lineCap: 'round'
        });
        coreLine.addTo(highlightGroup);
      }

      // Feature specific overlays (Junctions, Crossings)
      if (activeLayers.junctionFriction && p.junction_count > 0 && coords[0]) {
        const jDot = L.circleMarker(coords[0], {
          radius: Math.min(3 + p.junction_count, 6),
          color: '#EF4444',
          fillColor: '#EF4444',
          fillOpacity: 0.7,
          weight: 1
        });
        jDot.bindTooltip(`Junction Conflict (${p.junction_count} points)`, { direction: 'top' });
        jDot.addTo(geoGroup);
      }
    });

    // Auto-Fit Network Bounds ONCE when features first arrive
    if (!initialFitDoneRef.current && visibleFeatures.length > 0) {
      try {
        const bounds = geoGroup.getBounds();
        if (bounds && bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [35, 35] });
          initialFitDoneRef.current = true;
        }
      } catch {
        // bounds calculation error ignored
      }
    }
  }, [segments, selectedSegmentId, activeLayers, onSelectSegment]);

  // 5. Fly to selected segment ONLY on subsequent user clicks/changes
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    if (!mapInstanceRef.current || !selectedSegmentId || !geoJsonLayerRef.current) return;

    let targetLayer = null;
    geoJsonLayerRef.current.eachLayer(layer => {
      if (layer.feature?.properties?.segment_id === selectedSegmentId) {
        targetLayer = layer;
      }
    });

    if (targetLayer && targetLayer.getBounds) {
      try {
        const center = targetLayer.getBounds().getCenter();
        mapInstanceRef.current.flyTo(center, Math.max(mapInstanceRef.current.getZoom(), 14), {
          duration: 0.6
        });
      } catch {
        // ignore
      }
    }
  }, [selectedSegmentId]);

  // Controls Handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetCenter = () => {
    if (geoJsonLayerRef.current) {
      try {
        const bounds = geoJsonLayerRef.current.getBounds();
        if (bounds && bounds.isValid()) {
          mapInstanceRef.current?.fitBounds(bounds, { padding: [35, 35] });
          return;
        }
      } catch {
        // fallback
      }
    }
    mapInstanceRef.current?.setView([12.9600, 77.6500], 12);
  };

  return (
    <div className={`satellite-map-container ${isMaximized ? 'is-maximized' : ''}`}>
      {/* 1. Leaflet Mount Container (Always Absolute 100%) */}
      <div ref={mapContainerRef} className="leaflet-mount-container" />

      {/* Loading Overlay */}
      {loading && (
        <div className="map-loading-overlay">
          <div className="map-loading-spinner"></div>
          <span>Loading live road network telemetry...</span>
        </div>
      )}

      {/* 2. Top Controls Bar */}
      <div className="map-top-bar">
        {/* Map / Satellite / Dark Switcher */}
        <div className="segmented-map-toggle">
          <button 
            className={`seg-btn ${mapMode === 'map' ? 'active' : ''}`}
            onClick={() => setMapMode('map')}
          >
            Street
          </button>
          <button 
            className={`seg-btn ${mapMode === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapMode('satellite')}
          >
            Satellite
          </button>
          <button 
            className={`seg-btn ${mapMode === 'dark' ? 'active' : ''}`}
            onClick={() => setMapMode('dark')}
          >
            Dark OS
          </button>
        </div>

        {/* Right Controls: Live Filters Toggle + Maximize */}
        <div className="map-top-right-actions">
          <button 
            className={`night-risk-pill-btn ${layersDropdownOpen ? 'active' : ''}`}
            onClick={() => setLayersDropdownOpen(!layersDropdownOpen)}
          >
            <Moon size={13} className="text-amber" />
            <span>Live Filters</span>
            <ChevronDown size={13} />
          </button>

          {onToggleMaximize && (
            <button 
              className="map-maximize-btn" 
              onClick={onToggleMaximize}
              title={isMaximized ? "Restore Layout" : "Maximize Map Canvas"}
            >
              {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              <span className="max-text desktop-only">{isMaximized ? "Restore" : "Expand Map"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Left Zoom & Reset Floating Controls */}
      <div className="map-left-controls">
        <button className="map-ctrl-btn" onClick={handleZoomIn} title="Zoom In">
          <Plus size={15} />
        </button>
        <button className="map-ctrl-btn" onClick={handleZoomOut} title="Zoom Out">
          <Minus size={15} />
        </button>
        <div className="ctrl-divider"></div>
        <button className="map-ctrl-btn" onClick={handleResetCenter} title="Fit Network Bounds (Bengaluru)">
          <Crosshair size={15} />
        </button>
        <button 
          className={`map-ctrl-btn ${layersDropdownOpen ? 'active' : ''}`} 
          onClick={() => setLayersDropdownOpen(!layersDropdownOpen)}
          title="Toggle Filters Panel"
        >
          <Layers size={15} />
        </button>
      </div>

      {/* 4. Floating Layers Checklist Panel (Top-Right) */}
      {layersDropdownOpen && (
        <div className="floating-layers-card">
          <div className="popover-title" style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px', color: '#0F172A' }}>
            Live Attribute Layers
          </div>
          <div className="layer-item">
            <input 
              type="checkbox" 
              id="layer-all-segments" 
              checked={activeLayers.allSegments}
              onChange={() => toggleLayer('allSegments')}
            />
            <label htmlFor="layer-all-segments">Road Segments ({segments.length})</label>
          </div>
          <div className="layer-item">
            <input 
              type="checkbox" 
              id="layer-dark-spots" 
              checked={activeLayers.darkSpots}
              onChange={() => toggleLayer('darkSpots')}
            />
            <label htmlFor="layer-dark-spots">Dark Spots (Unlit)</label>
          </div>
          <div className="layer-item">
            <input 
              type="checkbox" 
              id="layer-junctions" 
              checked={activeLayers.junctionFriction}
              onChange={() => toggleLayer('junctionFriction')}
            />
            <label htmlFor="layer-junctions">High-Conflict Junctions</label>
          </div>
          <div className="layer-item">
            <input 
              type="checkbox" 
              id="layer-crossings" 
              checked={activeLayers.crossings}
              onChange={() => toggleLayer('crossings')}
            />
            <label htmlFor="layer-crossings">Pedestrian Crossings</label>
          </div>
          <div className="layer-item">
            <input 
              type="checkbox" 
              id="layer-night-risk" 
              checked={activeLayers.nightRisk}
              onChange={() => toggleLayer('nightRisk')}
            />
            <label htmlFor="layer-night-risk">Night Risk Multiplier</label>
          </div>
        </div>
      )}

      {/* 5. Bottom Left: Official Score Scale Legend */}
      <div className="map-risk-legend">
        <div className="legend-title">
          ML Safety Score {metadata?.score_scale ? `(${metadata.score_scale})` : ''}
        </div>
        <div className="legend-grid">
          <div className="legend-item">
            <span className="legend-bullet red"></span>
            <span>Critical (0–39)</span>
          </div>
          <div className="legend-item">
            <span className="legend-bullet orange"></span>
            <span>High Risk (40–59)</span>
          </div>
          <div className="legend-item">
            <span className="legend-bullet yellow"></span>
            <span>Medium (60–79)</span>
          </div>
          <div className="legend-item">
            <span className="legend-bullet green"></span>
            <span>Safe (80–100)</span>
          </div>
        </div>
        <div className="legend-sub">
          {metadata?.total_features ? `${metadata.total_features} segments loaded` : 'Empirical XGBoost RiskEngine'}
        </div>
      </div>
    </div>
  );
}
