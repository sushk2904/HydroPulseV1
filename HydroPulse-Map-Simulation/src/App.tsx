import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { TacticalNavbar } from './components/TacticalNavbar';
import { HeroSection } from './components/HeroSection';
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

  // Compute dynamic flood-aware route
  const executeRouting = useCallback(async (
    orig = originLoc,
    dest = destLoc,
    intensity = stormIntensity,
    floodedNodes = flashFloodedNodes
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
    } catch (e) {
      console.error('Error computing dynamic route:', e);
    }
  }, [originLoc, destLoc, stormIntensity, flashFloodedNodes]);

  // Initial calculation on mount
  useEffect(() => {
    executeRouting(originLoc, destLoc, stormIntensity, flashFloodedNodes);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-route when origin/dest changes (immediate)
  const handleSelectOrigin = useCallback((loc: MumbaiLocation) => {
    setOriginLoc(loc);
    executeRouting(loc, destLoc, stormIntensity, flashFloodedNodes);
  }, [destLoc, stormIntensity, flashFloodedNodes, executeRouting]);

  const handleSelectDest = useCallback((loc: MumbaiLocation) => {
    setDestLoc(loc);
    executeRouting(originLoc, loc, stormIntensity, flashFloodedNodes);
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

  const handleScrollToGrid = useCallback(() => {
    const gridElem = document.getElementById('query-grid');
    if (gridElem) {
      gridElem.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // GSAP ScrollTrigger entrance animation for Tactical Command Deck
  useGSAP(
    () => {
      const deck = commandDeckRef.current;
      const container = deckContainerRef.current;
      if (!deck || !container) return;

      gsap.fromTo(
        container,
        {
          opacity: 0.2,
          y: 60,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: deck,
            start: 'top 85%',
            end: 'top 45%',
            scrub: false,
            toggleActions: 'play none none reverse',
          },
        }
      );
    },
    { scope: commandDeckRef }
  );

  return (
    <div className="bg-[#05070A] font-['Metrophobic'] text-[#e0e2ea] antialiased selection:bg-[#00d9ff]/30 selection:text-[#00d9ff] scroll-smooth">
      {/* Navigation */}
      <TacticalNavbar />

      {/* SECTION 1: Hero */}
      <HeroSection onEnterGrid={handleScrollToGrid} />

      {/* SECTION 2: Command Deck */}
      <section
        ref={commandDeckRef}
        id="query-grid"
        className="relative w-full bg-[#0d1117] py-4 sm:py-6 px-3 sm:px-4 lg:px-6 flex flex-col justify-start"
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
                onCalculateRoute={() => executeRouting(originLoc, destLoc, stormIntensity, flashFloodedNodes)}
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

      {/* SECTION 3: Telemetry */}
      <TacticalTelemetryDeck />
    </div>
  );
}

export default App;
