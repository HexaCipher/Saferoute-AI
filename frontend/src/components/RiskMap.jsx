import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Compass } from 'lucide-react';

export default function RiskMap({ hotspots, selectedSpot, onSelectSpot }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.6200],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Dark Matter tiles for sleek modern dark dashboard aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersGroupRef.current = L.featureGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    // Render custom markers for each hotspot
    hotspots.forEach((spot) => {
      const isCritical = spot.risk_level === 'Critical';
      const isSelected = selectedSpot && selectedSpot.id === spot.id;

      const markerColor = isCritical ? '#ef4444' : '#f97316';
      const badgeBg = isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(249, 115, 22, 0.15)';

      // Custom HTML Marker with pulsing animation
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="pin-wrapper ${isSelected ? 'is-selected' : ''} ${isCritical ? 'critical-pulse' : 'high-pulse'}">
            <div class="pin-glow" style="background-color: ${markerColor};"></div>
            <div class="pin-badge" style="background-color: ${markerColor};">
              <span class="pin-score">${spot.risk_score}</span>
            </div>
            <div class="pin-label">${spot.name.split('(')[0]}</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([spot.latitude, spot.longitude], { icon: customIcon });

      // Danger radius circle around the blackspot
      const radiusCircle = L.circle([spot.latitude, spot.longitude], {
        radius: isCritical ? 650 : 450,
        color: markerColor,
        weight: isSelected ? 2 : 1,
        fillColor: markerColor,
        fillOpacity: isSelected ? 0.25 : 0.12,
        dashArray: isSelected ? '4, 4' : null
      });

      radiusCircle.addTo(markersGroup);

      marker.on('click', () => {
        onSelectSpot(spot);
      });

      radiusCircle.on('click', () => {
        onSelectSpot(spot);
      });

      marker.addTo(markersGroup);
    });

    // Fly to selected spot if changed
    if (selectedSpot && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedSpot.latitude, selectedSpot.longitude], 14, {
        duration: 0.8
      });
    }
  }, [hotspots, selectedSpot]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([12.9716, 77.6200], 12);
    }
  };

  return (
    <div className="map-wrapper">
      <div className="map-toolbar">
        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-dot red-dot"></span>
            <span>Critical Risk (Score 88-100)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot orange-dot"></span>
            <span>High Risk (Score 75-87)</span>
          </div>
          <div className="legend-item">
            <span className="legend-ring"></span>
            <span>Accident Buffer Zone</span>
          </div>
        </div>

        <button className="map-action-btn" onClick={handleRecenter} title="Reset Bengaluru View">
          <Compass size={16} />
          <span>Reset View</span>
        </button>
      </div>

      <div ref={mapContainerRef} className="leaflet-map-container" />
    </div>
  );
}
