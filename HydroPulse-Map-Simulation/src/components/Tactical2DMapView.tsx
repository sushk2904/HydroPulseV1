import React, { useEffect, useRef, useState, memo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DynamicRouteResult } from '../services/routingService';

interface Tactical2DMapViewProps {
  stormIntensity: number;
  routeActive: boolean;
  activeRoute: DynamicRouteResult | null;
  onPickLocation?: (type: 'origin' | 'dest', lat: number, lng: number, label: string) => void;
}

export const Tactical2DMapView = memo(function Tactical2DMapView({
  stormIntensity,
  routeActive,
  activeRoute,
  onPickLocation,
}: Tactical2DMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayersGroupRef = useRef<L.LayerGroup | null>(null);
  const floodLayersGroupRef = useRef<L.LayerGroup | null>(null);
  
  const [activeLayer, setActiveLayer] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [showHazardPath, setShowHazardPath] = useState<boolean>(true);
  const [pinMode, setPinMode] = useState<'none' | 'origin' | 'dest'>('none');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [19.1000, 72.8600],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Clean Watermark-Free Esri Dark Gray Base Tiles
    const darkTileLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 17,
        attribution: '',
      }
    );
    darkTileLayer.addTo(map);

    // Layer groups
    const floodGroup = L.layerGroup().addTo(map);
    const routeGroup = L.layerGroup().addTo(map);
    floodLayersGroupRef.current = floodGroup;
    routeLayersGroupRef.current = routeGroup;

    // Map click handler for custom interactive pin placement
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (pinMode === 'origin' && onPickLocation) {
        onPickLocation('origin', lat, lng, `CUSTOM ORIGIN [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
        setPinMode('none');
      } else if (pinMode === 'dest' && onPickLocation) {
        onPickLocation('dest', lat, lng, `CUSTOM DEST [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
        setPinMode('none');
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [pinMode, onPickLocation]);

  // Update Tile Layer dynamically (100% Watermark-Free)
  const changeTileLayer = (type: 'dark' | 'satellite' | 'street') => {
    setActiveLayer(type);
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (type === 'dark') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 17,
      }).addTo(map);
    } else if (type === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
    }
  };

  // Synchronize dynamic route geometries and flood zones onto the map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayersGroupRef.current;
    const floodGroup = floodLayersGroupRef.current;
    if (!map || !routeGroup || !floodGroup || !activeRoute) return;

    // Clear previous dynamic layers
    routeGroup.clearLayers();
    floodGroup.clearLayers();

    // 1. Draw Active Flood Hazard Circles
    if (activeRoute.activeFloodZones) {
      activeRoute.activeFloodZones.forEach((spot) => {
        const circle = L.circle([spot.lat, spot.lng], {
          color: spot.color,
          fillColor: spot.color,
          fillOpacity: spot.status === 'IMPASSABLE' ? 0.38 : spot.status === 'CRITICAL' ? 0.28 : 0.16,
          weight: 2,
          dashArray: '6, 6',
          radius: spot.radiusM,
        });

        circle.bindTooltip(
          `<div style="font-family:monospace; font-size:10px; color:${spot.color}; font-weight:bold; padding:3px; background:#090d15; border-radius:4px; border:1px solid ${spot.color}; box-shadow:0 4px 12px rgba(0,0,0,0.8);">
            ⚠️ ${spot.name}<br/>
            RAIN INTENSITY: ${spot.rainIntensityMmHr} mm/h<br/>
            CALCULATED VULNERABILITY: ${(spot.vulnerability * 100).toFixed(0)}% [${spot.status}]<br/>
            WATER DEPTH: ${spot.waterDepthM}m | SURGE RADIUS: ${spot.radiusM}m
          </div>`,
          { className: 'tactical-map-tooltip', permanent: false }
        );

        circle.addTo(floodGroup);
      });
    }

    // 2. Draw Blocked Hazard Route (Red Dashed, crossing straight into flood basins)
    if (showHazardPath && activeRoute.hazardRoute?.coordinates && activeRoute.hazardRoute.coordinates.length > 1) {
      const hazardLine = L.polyline(activeRoute.hazardRoute.coordinates, {
        color: '#FF2A4D',
        weight: 3.5,
        opacity: 0.75,
        dashArray: '8, 8',
      });
      hazardLine.bindTooltip(
        `<div style="font-family:monospace; font-size:10px; color:#FF2A4D; font-weight:bold; padding:2px; background:#090d15; border:1px solid #FF2A4D; border-radius:4px;">
          BLOCKED LOWLAND VECTOR<br/>
          RISK: IMPASSABLE / SUBMERGED
        </div>`,
        { sticky: true }
      );
      hazardLine.addTo(routeGroup);
    }

    // 3. Draw Green Safe Route (Outer Glow + Core Line strictly routing AROUND flood circles)
    if (activeRoute.safeRoute?.coordinates && activeRoute.safeRoute.coordinates.length > 1) {
      // Glow Line
      L.polyline(activeRoute.safeRoute.coordinates, {
        color: '#00FF66',
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeGroup);

      // Core Line
      const safeLine = L.polyline(activeRoute.safeRoute.coordinates, {
        color: '#00FF66',
        weight: 4,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });
      safeLine.bindTooltip(
        `<div style="font-family:monospace; font-size:10px; color:#00FF66; font-weight:bold; padding:2px; background:#090d15; border:1px solid #00FF66; border-radius:4px;">
          HYDROPULSE ST-GNN SAFE ARTERY<br/>
          DISTANCE: ${activeRoute.safeRoute.distanceKm} km | TIME: ${activeRoute.safeRoute.durationMin} min<br/>
          PASSABILITY: 100% CLEAR (ELEVATED RIDGE)
        </div>`,
        { sticky: true }
      );
      safeLine.addTo(routeGroup);
    }

    // 4. Custom Origin Marker [A]
    const originIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
          <div style="width:24px; height:24px; border-radius:50%; background:rgba(0,217,255,0.25); border:2px solid #00d9ff; box-shadow:0 0 14px #00d9ff; display:flex; align-items:center; justify-content:center;">
            <div style="width:8px; height:8px; border-radius:50%; background:#00d9ff;"></div>
          </div>
          <div style="background:#090d15; color:#00d9ff; font-family:monospace; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:4px; border:1px solid #00d9ff; margin-top:3px; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.85);">
            [A] ${activeRoute.origin.label.split('[')[0]}
          </div>
        </div>
      `,
      iconSize: [140, 48],
      iconAnchor: [70, 12],
    });

    // 5. Custom Destination Marker [B]
    const destIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
          <div style="width:24px; height:24px; border-radius:50%; background:rgba(0,255,102,0.25); border:2px solid #00FF66; box-shadow:0 0 14px #00FF66; display:flex; align-items:center; justify-content:center;">
            <div style="width:8px; height:8px; border-radius:50%; background:#00FF66;"></div>
          </div>
          <div style="background:#090d15; color:#00FF66; font-family:monospace; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:4px; border:1px solid #00FF66; margin-top:3px; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.85);">
            [B] ${activeRoute.destination.label.split('[')[0]}
          </div>
        </div>
      `,
      iconSize: [140, 48],
      iconAnchor: [70, 12],
    });

    L.marker([activeRoute.origin.lat, activeRoute.origin.lng], { icon: originIcon }).addTo(routeGroup);
    L.marker([activeRoute.destination.lat, activeRoute.destination.lng], { icon: destIcon }).addTo(routeGroup);

    // Auto FlyToBounds to active corridor
    if (activeRoute.safeRoute?.coordinates && activeRoute.safeRoute.coordinates.length > 0) {
      const bounds = L.latLngBounds([
        [activeRoute.origin.lat, activeRoute.origin.lng],
        [activeRoute.destination.lat, activeRoute.destination.lng],
        ...activeRoute.safeRoute.coordinates,
      ]);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.4 });
    }
  }, [activeRoute, showHazardPath]);

  // Recenter button
  const handleRecenter = () => {
    if (!mapInstanceRef.current || !activeRoute) return;
    const bounds = L.latLngBounds([
      [activeRoute.origin.lat, activeRoute.origin.lng],
      [activeRoute.destination.lat, activeRoute.destination.lng],
      ...(activeRoute.safeRoute?.coordinates || []),
    ]);
    mapInstanceRef.current.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
  };

  return (
    <div className="w-full mt-4 font-['Lexend']">
      <div className="relative bg-[#090d15]/95 backdrop-blur-2xl rounded-xl border border-cyan-500/25 shadow-[0_8px_32px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col">
        {/* Cyber Corners */}
        <div className="pointer-events-none absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00d9ff] z-20" />
        <div className="pointer-events-none absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00d9ff] z-20" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00d9ff] z-20" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00d9ff] z-20" />

        {/* 2D Map Header Bar */}
        <div className="px-3.5 py-2.5 bg-[#12161c]/95 border-b border-[#3c494d]/40 flex flex-wrap items-center justify-between gap-2 z-10 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00FF66] text-[18px]">map</span>
            <span className="font-bold text-[#e0e2ea] tracking-wider uppercase font-['Space_Grotesk'] text-[11px]">
              2D High-Precision Tactical Road Network (Mumbai GIS)
            </span>
            <span className="text-[#3c494d]">|</span>
            <span className="text-[#00FF66] font-semibold font-mono">
              ST-GNN CORRIDOR // STRICT HAZARD BYPASS ACTIVE
            </span>
          </div>

          {/* Controls: Layer Switcher, Map Pin Mode & Recenter */}
          <div className="flex items-center gap-2 font-mono text-[9px]">
            {/* Interactive Pinning Mode */}
            <button
              type="button"
              onClick={() => setPinMode(pinMode === 'origin' ? 'none' : 'origin')}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                pinMode === 'origin'
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                  : 'bg-[#18202d] text-cyan-300 hover:bg-cyan-950/70 border-cyan-500/30'
              }`}
              title="Click on map to set Start Location"
            >
              <span className="material-symbols-outlined text-[12px]">trip_origin</span>
              <span>{pinMode === 'origin' ? 'CLICK MAP TO SET ORIGIN' : 'PIN ORIGIN'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPinMode(pinMode === 'dest' ? 'none' : 'dest')}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                pinMode === 'dest'
                  ? 'bg-[#00FF66] text-slate-950 font-bold border-[#00FF66]'
                  : 'bg-[#18202d] text-[#00FF66] hover:bg-emerald-950/70 border-[#00FF66]/30'
              }`}
              title="Click on map to set Destination"
            >
              <span className="material-symbols-outlined text-[12px]">location_on</span>
              <span>{pinMode === 'dest' ? 'CLICK MAP TO SET DEST' : 'PIN DEST'}</span>
            </button>

            {/* Tile Layer Selector */}
            <div className="flex items-center bg-[#18202d] rounded-md p-0.5 border border-cyan-500/25">
              <button
                type="button"
                onClick={() => changeTileLayer('dark')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  activeLayer === 'dark'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-cyan-300'
                }`}
              >
                TACTICAL DARK
              </button>
              <button
                type="button"
                onClick={() => changeTileLayer('satellite')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  activeLayer === 'satellite'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-cyan-300'
                }`}
              >
                SATELLITE
              </button>
              <button
                type="button"
                onClick={() => changeTileLayer('street')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  activeLayer === 'street'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-cyan-300'
                }`}
              >
                STREET
              </button>
            </div>

            {/* Recenter button */}
            <button
              type="button"
              onClick={handleRecenter}
              className="px-2.5 py-1 bg-[#1e2736] hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 rounded flex items-center gap-1 cursor-pointer transition-colors"
              title="Recenter corridor view"
            >
              <span className="material-symbols-outlined text-[13px]">my_location</span>
              <span>RECENTER</span>
            </button>
          </div>
        </div>

        {/* Leaflet 2D Map Canvas Container */}
        <div className={`relative w-full h-[370px] sm:h-[420px] bg-[#05070a] ${pinMode !== 'none' ? 'cursor-crosshair' : ''}`}>
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Road Telemetry Badge (Top Left) */}
          {activeRoute && (
            <div className="absolute top-3 left-3 z-[400] bg-[#090d15]/92 backdrop-blur-md px-3 py-2 rounded-lg border border-cyan-500/30 text-[10px] font-mono shadow-xl space-y-1 pointer-events-none max-w-xs">
              <div className="flex items-center justify-between gap-4 text-slate-300">
                <span>CORRIDOR DISTANCE:</span>
                <span className="text-cyan-300 font-bold">{activeRoute.safeRoute.distanceKm} KM</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-slate-300">
                <span>ESTIMATED TRAVEL TIME:</span>
                <span className="text-[#00FF66] font-bold">{activeRoute.safeRoute.durationMin} MIN (CLEAR)</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-slate-300">
                <span>ELEVATION CLEARANCE:</span>
                <span className="text-amber-300 font-bold">+{activeRoute.safeRoute.elevationGainM}m AMSL</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-slate-300 border-t border-slate-700/50 pt-1">
                <span>HAZARDS BYPASSED:</span>
                <span className="text-[#00FF66] font-bold">
                  {activeRoute.safeRoute.hazardsBypassedCount} FLOOD BASINS
                </span>
              </div>
            </div>
          )}

          {/* Floating Map Legend (Bottom Left) */}
          <div className="absolute bottom-3 left-3 z-[400] bg-[#090d15]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#3c494d]/50 flex items-center gap-3 font-mono text-[9px] shadow-xl">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_6px_#00FF66]" />
              <span className="text-slate-200">GNN OPTIMAL SAFE CORRIDOR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF2A4D] shadow-[0_0_6px_#FF2A4D]" />
              <span className="text-slate-200">INUNDATED FLOOD BASINS (LIVE)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowHazardPath((p) => !p)}
              className="ml-1 text-[8px] px-1.5 py-0.5 rounded bg-[#1e2736] text-slate-300 hover:text-white border border-slate-600 cursor-pointer"
            >
              {showHazardPath ? 'HIDE BLOCKED VECTOR' : 'SHOW BLOCKED VECTOR'}
            </button>
          </div>

          {/* Turn-by-Turn Road Guidance Step Pill (Bottom Right) */}
          {activeRoute?.safeRoute?.turnSteps && activeRoute.safeRoute.turnSteps.length > 0 && (
            <div className="absolute bottom-3 right-3 z-[400] bg-[#090d15]/92 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 font-mono text-[9px] text-slate-300 flex items-center gap-2 shadow-xl pointer-events-none max-w-md truncate">
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">turn_right</span>
                PRIMARY ARTERY:
              </span>
              <span className="text-slate-200 font-bold truncate">
                {activeRoute.safeRoute.turnSteps.map((s) => s.roadName).filter(Boolean).slice(0, 3).join(' ➔ ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Tactical2DMapView;
