import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { TacticalNavbar } from './components/TacticalNavbar';
import { TacticalHeader } from './components/TacticalHeader';
import { TacticalGridFrame } from './components/TacticalGridFrame';
import { RoutingControlPanel } from './components/RoutingControlPanel';
import { Tactical2DMapView } from './components/Tactical2DMapView';
import { TacticalTelemetryDeck } from './components/TacticalTelemetryDeck';
import { MUMBAI_LOCATIONS, MUMBAI_FLOOD_HOTSPOTS, MumbaiLocation } from './services/mumbaiLocations';
import { calculateDynamicMumbaiRoute, DynamicRouteResult, AlgorithmLogEntry } from './services/routingService';
import { computeWeatherFromIntensity, SectorWeatherData } from './services/weatherService';

gsap.registerPlugin(ScrollTrigger);

export function App() {
  const [routeActive, setRouteActive] = useState<boolean>(true);
  const [originLoc, setOriginLoc] = useState<MumbaiLocation>(MUMBAI_LOCATIONS[0]); // Bandra West
  const [destLoc, setDestLoc] = useState<MumbaiLocation>(MUMBAI_LOCATIONS[1]);   // SEEPZ Andheri
  const [activeRoute, setActiveRoute] = useState<DynamicRouteResult | null>(null);

  // Dynamic weather: user-controlled storm intensity
  const [stormIntensity, setStormIntensity] = useState<number>(85);

  // Flash flood injection: list of hotspot IDs force-set to IMPASSABLE
  const [flashFloodedNodes, setFlashFloodedNodes] = useState<string[]>([]);

  // Algorithm transparency log
  const [algorithmLog, setAlgorithmLog] = useState<AlgorithmLogEntry[]>([]);
  const [lastRecalcMs, setLastRecalcMs] = useState<number>(0);
  const [modelUsed, setModelUsed] = useState<boolean>(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState<number>(0);

  // Interactive map pinning mode
  const [pinMode, setPinMode] = useState<'none' | 'origin' | 'dest'>('none');

  // Compute weather display from user-controlled intensity
  const weatherData: SectorWeatherData = useMemo(() => {
    return computeWeatherFromIntensity(stormIntensity, originLoc.id, originLoc.name, originLoc.lat, originLoc.lng);
  }, [stormIntensity, originLoc]);

  const commandDeckRef = useRef<HTMLElement>(null);
  const deckContainerRef = useRef<HTMLDivElement>(null);

  // Debounce ref for slider changes
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Compute dynamic flood-aware route and optionally archive to operator history
  const executeRouting = useCallback(async (
    orig = originLoc,
    dest = destLoc,
    intensity = stormIntensity,
    floodedNodes = flashFloodedNodes,
    saveHistory = false
  ) => {
    try {
      const res = await calculateDynamicMumbaiRoute({
        originLat: orig.lat,
        originLng: orig.lng,
        originLabel: orig.name,
        destLat: dest.lat,
        destLng: dest.lng,
        destLabel: dest.name,
        stormIntensity: intensity,
        flashFloodedNodeIds: floodedNodes,
      });
      setActiveRoute(res);
      setRouteActive(true);
      setAlgorithmLog(res.algorithmLog);
      setLastRecalcMs(res.recalcTimeMs);
      setModelUsed(res.modelUsed);

      // Record dispatch log in backend if user is authenticated and archive requested
      const token = localStorage.getItem('hydropulse_token');
      if (token && saveHistory) {
        fetch('/api/routes/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            origin: orig.name,
            destination: dest.name,
            storm_intensity: intensity,
            status: res.safeRoute.passability.includes('100%') ? 'COMPLETED' : 'REROUTED',
            status_label: res.safeRoute.passability,
            hazards_bypassed: res.safeRoute.hazardsBypassedCount,
            est_time: `${res.safeRoute.durationMin} MIN`,
            elevation_clearance: `+${res.safeRoute.elevationGainM}m AMSL`,
            route_sector: `${orig.sector || 'MUMBAI CORRIDOR'} TO ${dest.sector || 'SECTOR TERMINAL'}`,
          }),
        })
          .then((r) => r.json())
          .then(() => setHistoryRefreshKey((k) => k + 1))
          .catch(() => {});
      }
    } catch (e) {
      console.error('Error computing dynamic route:', e);
    }
  }, [originLoc, destLoc, stormIntensity, flashFloodedNodes]);

  // Initial calculation on mount (without archiving dummy history)
  useEffect(() => {
    executeRouting(originLoc, destLoc, stormIntensity, flashFloodedNodes, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-route when origin/dest changes (archived to history)
  const handleSelectOrigin = useCallback((loc: MumbaiLocation) => {
    setOriginLoc(loc);
    executeRouting(loc, destLoc, stormIntensity, flashFloodedNodes, true);
  }, [destLoc, stormIntensity, flashFloodedNodes, executeRouting]);

  const handleSelectDest = useCallback((loc: MumbaiLocation) => {
    setDestLoc(loc);
    executeRouting(originLoc, loc, stormIntensity, flashFloodedNodes, true);
  }, [originLoc, stormIntensity, flashFloodedNodes, executeRouting]);

  // Storm intensity change (debounced 300ms for slider, immediate for presets)
  const handleIntensityChange = useCallback((value: number, immediate = false) => {
    setStormIntensity(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (immediate) {
      executeRouting(originLoc, destLoc, value, flashFloodedNodes);
    } else {
      debounceRef.current = setTimeout(() => {
        executeRouting(originLoc, destLoc, value, flashFloodedNodes);
      }, 300);
    }
  }, [originLoc, destLoc, flashFloodedNodes, executeRouting]);

  // Flash flood: toggle a node
  const handleFlashFlood = useCallback((nodeId: string) => {
    setFlashFloodedNodes((prev) => {
      const next = prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId];
      // Immediately recalculate
      executeRouting(originLoc, destLoc, stormIntensity, next);
      return next;
    });
  }, [originLoc, destLoc, stormIntensity, executeRouting]);

  // Random flash flood: pick a random hotspot near the route
  const handleRandomFlashFlood = useCallback(() => {
    const available = MUMBAI_FLOOD_HOTSPOTS.filter((h) => !flashFloodedNodes.includes(h.id));
    if (available.length === 0) return;
    const random = available[Math.floor(Math.random() * available.length)];
    handleFlashFlood(random.id);
  }, [flashFloodedNodes, handleFlashFlood]);

  // Clear all flash floods
  const handleClearFlashFloods = useCallback(() => {
    setFlashFloodedNodes([]);
    executeRouting(originLoc, destLoc, stormIntensity, []);
  }, [originLoc, destLoc, stormIntensity, executeRouting]);

  const handlePickLocationFromMap = useCallback((type: 'origin' | 'dest', lat: number, lng: number, label: string) => {
    setPinMode('none');
    const customLoc: MumbaiLocation = {
      id: `custom-${Date.now()}`,
      name: label,
      shortLabel: label.substring(0, 16),
      lat,
      lng,
      elevationM: 6.5,
      sector: 'Custom Pinned Coordinate',
    };
    if (type === 'origin') {
      setOriginLoc(customLoc);
      executeRouting(customLoc, destLoc, stormIntensity, flashFloodedNodes);
    } else {
      setDestLoc(customLoc);
      executeRouting(originLoc, customLoc, stormIntensity, flashFloodedNodes);
    }
  }, [originLoc, destLoc, stormIntensity, flashFloodedNodes, executeRouting]);

  const handleTogglePinMode = useCallback((type: 'origin' | 'dest') => {
    setPinMode((prev) => (prev === type ? 'none' : type));
    const mapElem = document.getElementById('tactical-2d-map');
    if (mapElem) {
      mapElem.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // GSAP entrance animation for Tactical Command Deck
  useGSAP(
    () => {
      const container = deckContainerRef.current;
      if (!container) return;

      gsap.fromTo(
        container,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );
    },
    { scope: commandDeckRef }
  );

  const handleReplayVector = useCallback((item: any) => {
    const foundOrig =
      MUMBAI_LOCATIONS.find((l) =>
        item.origin.toLowerCase().includes(l.name.toLowerCase()) ||
        l.name.toLowerCase().includes(item.origin.toLowerCase())
      ) || originLoc;
    const foundDest =
      MUMBAI_LOCATIONS.find((l) =>
        item.destination.toLowerCase().includes(l.name.toLowerCase()) ||
        l.name.toLowerCase().includes(item.destination.toLowerCase())
      ) || destLoc;

    const intensity = item.stormIntensity || 75;
    setOriginLoc(foundOrig);
    setDestLoc(foundDest);
    setStormIntensity(intensity);
    executeRouting(foundOrig, foundDest, intensity, flashFloodedNodes, true);

    const gridElem = document.getElementById('query-grid');
    if (gridElem) gridElem.scrollIntoView({ behavior: 'smooth' });
  }, [originLoc, destLoc, flashFloodedNodes, executeRouting]);

  return (
    <div className="bg-[#05070A] font-['Metrophobic'] text-[#e0e2ea] antialiased selection:bg-[#00d9ff]/30 selection:text-[#00d9ff] scroll-smooth">
      {/* Navigation */}
      <TacticalNavbar />

      {/* Command Deck Main Section */}
      <section
        ref={commandDeckRef}
        id="query-grid"
        className="relative w-full bg-[#0d1117] pt-18 sm:pt-20 pb-6 sm:pb-8 px-3 sm:px-4 lg:px-6 flex flex-col justify-start min-h-screen"
      >
        <div ref={deckContainerRef} className="w-full max-w-7xl mx-auto flex flex-col will-change-transform">
          {/* Section Header */}
          <TacticalHeader />

          {/* Command Deck Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-stretch">
            {/* LEFT COLUMN: 3D Map */}
            <div className="lg:col-span-7 flex flex-col">
              <TacticalGridFrame
                stormIntensity={stormIntensity}
                routeActive={routeActive}
                activeRoute={activeRoute}
              />
            </div>

            {/* RIGHT COLUMN: Routing Controls */}
            <div className="lg:col-span-5 flex flex-col">
              <RoutingControlPanel
                weatherData={weatherData}
                routeActive={routeActive}
                activeRoute={activeRoute}
                originLoc={originLoc}
                destLoc={destLoc}
                stormIntensity={stormIntensity}
                flashFloodedNodes={flashFloodedNodes}
                algorithmLog={algorithmLog}
                lastRecalcMs={lastRecalcMs}
                modelUsed={modelUsed}
                onSelectOrigin={handleSelectOrigin}
                onSelectDest={handleSelectDest}
                onCalculateRoute={() => executeRouting(originLoc, destLoc, stormIntensity, flashFloodedNodes, true)}
                onIntensityChange={handleIntensityChange}
                onFlashFlood={handleFlashFlood}
                onRandomFlashFlood={handleRandomFlashFlood}
                onClearFlashFloods={handleClearFlashFloods}
                pinMode={pinMode}
                onTogglePinMode={handleTogglePinMode}
              />
            </div>
          </div>

          {/* 2D Map */}
          <Tactical2DMapView
            stormIntensity={stormIntensity}
            routeActive={routeActive}
            activeRoute={activeRoute}
            onPickLocation={handlePickLocationFromMap}
            pinMode={pinMode}
            onSetPinMode={setPinMode}
          />
        </div>
      </section>

      {/* SECTION 3: Telemetry & Operator History */}
      <TacticalTelemetryDeck
        refreshKey={historyRefreshKey}
        onReplayVector={handleReplayVector}
      />
    </div>
  );
}

export default App;
