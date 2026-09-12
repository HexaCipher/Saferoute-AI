import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  ChevronDown, 
  Moon,
  Maximize2, 
  Minimize2,
  LightbulbOff,
  GitMerge,
  Footprints
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

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Bengaluru Outer Ring Road / City center
    const map = L.map(mapContainerRef.current, {
      center: [12.9600, 77.6500],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Satellite Imagery Layer
    const satelliteTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18, crossOrigin: true }
    ).addTo(map);

    // Labels overlay
    const labelsTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18, crossOrigin: true, opacity: 0.85 }
    ).addTo(map);

    tileLayerRef.current = satelliteTiles;
    labelsLayerRef.current = labelsTiles;
    geoJsonLayerRef.current = L.featureGroup().addTo(map);
    highlightLayerRef.current = L.featureGroup().addTo(map);
    mapInstanceRef.current = map;

    // Invalidate size safely on mount
    const timer = setTimeout(() => {
      if (mapInstanceRef.current && mapInstanceRef.current._container) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch {
          // Leaflet pane unmounted during fast transitions
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
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
          // ignore during transitions
        }
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 2b. Invalidate map size when isMaximized toggles
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
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [isMaximized]);

  // 3. Handle Map Mode Switching (Map / Satellite / Dark)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const map = mapInstanceRef.current;

    map.removeLayer(tileLayerRef.current);
    if (labelsLayerRef.current) {
      map.removeLayer(labelsLayerRef.current);
    }

    if (mapMode === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18, crossOrigin: true }
      ).addTo(map);

      labelsLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18, crossOrigin: true, opacity: 0.85 }
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

    // Bring GeoJSON segments back to top
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
      let strokeColor = '#10B981'; // LOW
      let weight = 3.5;
      let opacity = 0.85;

      if (tier === 'CRITICAL') {
        strokeColor = '#EF4444'; // Red
        weight = 5.5;
        opacity = 0.95;
      } else if (tier === 'HIGH') {
        strokeColor = '#F97316'; // Orange
        weight = 4.5;
        opacity = 0.9;
      } else if (tier === 'MEDIUM') {
        strokeColor = '#FBBF24'; // Amber
        weight = 3.8;
        opacity = 0.85;
      }

      // Feature LineString coordinates: GeoJSON is [lng, lat], Leaflet wants [lat, lng]
      const coords = (feature.geometry?.coordinates || []).map(pt => [pt[1], pt[0]]);
      if (coords.length === 0) return;

      const polyline = L.polyline(coords, {
        color: strokeColor,
        weight,
        opacity,
        lineCap: 'round',
        lineJoin: 'round'
      });

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
          opacity: 0.6,
          lineCap: 'round'
        });
        glowLine.addTo(highlightGroup);

        const coreLine = L.polyline(coords, {
          color: '#FFFFFF',
          weight: weight + 1,
          opacity: 1,
          lineCap: 'round'
        });
        coreLine.addTo(highlightGroup);

        // Fly smoothly to selected segment center
        const center = polyline.getBounds().getCenter();
        mapInstanceRef.current.flyTo(center, Math.max(mapInstanceRef.current.getZoom(), 14), {
          duration: 0.7
        });
      }

      // Feature specific overlays (Junctions, Crossings, Night Risk indicators)
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

    // Initial Auto-Fit Bounds to loaded road network
    if (!initialFitDoneRef.current && visibleFeatures.length > 0) {
      try {
        const bounds = geoGroup.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
          initialFitDoneRef.current = true;
        }
      } catch {
        // bounds error ignored
      }
    }
  }, [segments, selectedSegmentId, activeLayers, onSelectSegment]);

  // Controls Handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetCenter = () => {
    if (geoJsonLayerRef.current) {
      try {
        const bounds = geoJsonLayerRef.current.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current?.fitBounds(bounds, { padding: [30, 30] });
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
      {/* 1. Leaflet Container */}
      <div ref={mapContainerRef} className="leaflet-map-canvas" />

      {/* Loading Overlay */}
      {loading && (
        <div className="map-loading-overlay">
          <div className="map-loading-spinner"></div>
          <span>Loading live road network telemetry...</span>
        </div>
      )}

      {/* 2. Top-Left: Map Mode Segmented Selector */}
      <div className="map-mode-selector-strip">
        <button 
          className={`map-mode-pill ${mapMode === 'map' ? 'active' : ''}`}
          onClick={() => setMapMode('map')}
        >
          Street
        </button>
        <button 
          className={`map-mode-pill ${mapMode === 'satellite' ? 'active' : ''}`}
          onClick={() => setMapMode('satellite')}
        >
          Satellite
        </button>
        <button 
          className={`map-mode-pill ${mapMode === 'dark' ? 'active' : ''}`}
          onClick={() => setMapMode('dark')}
        >
          Dark OS
        </button>
      </div>

      {/* 3. Top-Right: Property-Backed Layer Toggle Dropdown */}
      <div className="map-layer-dropdown-container">
        <button 
          className="layer-trigger-btn"
          onClick={() => setLayersDropdownOpen(!layersDropdownOpen)}
        >
          <Moon size={14} className="text-amber" />
          <span>Real-time Filters</span>
          <ChevronDown size={14} className="chevron" />
        </button>

        {layersDropdownOpen && (
          <div className="layer-options-popover">
            <div className="popover-title">Live Attribute Layers</div>
            
            <label className="layer-item">
              <input 
                type="checkbox" 
                checked={activeLayers.allSegments}
                onChange={() => toggleLayer('allSegments')}
              />
              <span className="layer-name">Road Segments ({segments.length})</span>
            </label>

            <label className="layer-item">
              <input 
                type="checkbox" 
                checked={activeLayers.darkSpots}
                onChange={() => toggleLayer('darkSpots')}
              />
              <LightbulbOff size={13} className="text-amber" />
              <span className="layer-name">Dark / Unverified Lighting</span>
            </label>

            <label className="layer-item">
              <input 
                type="checkbox" 
                checked={activeLayers.junctionFriction}
                onChange={() => toggleLayer('junctionFriction')}
              />
              <GitMerge size={13} className="text-red" />
              <span className="layer-name">High-Conflict Junctions</span>
            </label>

            <label className="layer-item">
              <input 
                type="checkbox" 
                checked={activeLayers.crossings}
                onChange={() => toggleLayer('crossings')}
              />
              <Footprints size={13} className="text-blue" />
              <span className="layer-name">Pedestrian Crossings</span>
            </label>

            <label className="layer-item">
              <input 
                type="checkbox" 
                checked={activeLayers.nightRisk}
                onChange={() => toggleLayer('nightRisk')}
              />
              <Moon size={13} className="text-amber" />
              <span className="layer-name">Night Risk Multiplier</span>
            </label>
          </div>
        )}
      </div>

      {/* 4. Left Zoom & Reset Floating Controls */}
      <div className="map-floating-controls">
        <button className="ctrl-btn" onClick={handleZoomIn} title="Zoom In">
          <Plus size={16} />
        </button>
        <button className="ctrl-btn" onClick={handleZoomOut} title="Zoom Out">
          <Minus size={16} />
        </button>
        <button className="ctrl-btn" onClick={handleResetCenter} title="Fit Network Bounds">
          <Crosshair size={16} />
        </button>
        <button 
          className="ctrl-btn" 
          onClick={onToggleMaximize} 
          title={isMaximized ? "Restore Layout" : "Maximize Map Canvas"}
        >
          {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

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
          {metadata?.score_scale || '0 = Extreme Hazard • 100 = Optimal Safety'}
          {metadata?.total_features ? ` • ${metadata.total_features} segments loaded` : ''}
        </div>
      </div>
    </div>
  );
}
