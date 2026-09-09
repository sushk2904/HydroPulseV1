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
import { MUMBAI_LOCATIONS, MumbaiLocation } from './services/mumbaiLocations';
import { calculateDynamicMumbaiRoute, DynamicRouteResult } from './services/routingService';
import { getRealtimeSectorWeather, SectorWeatherData } from './services/weatherService';

gsap.registerPlugin(ScrollTrigger);

export function App() {
  const [routeActive, setRouteActive] = useState<boolean>(true);
  const [originLoc, setOriginLoc] = useState<MumbaiLocation>(MUMBAI_LOCATIONS[0]); // Bandra West
  const [destLoc, setDestLoc] = useState<MumbaiLocation>(MUMBAI_LOCATIONS[1]);   // SEEPZ Andheri
  const [activeRoute, setActiveRoute] = useState<DynamicRouteResult | null>(null);

  // Compute real-time weather dynamically from selected origin location
  const weatherData: SectorWeatherData = useMemo(() => {
    return getRealtimeSectorWeather(originLoc.id, originLoc.lat, originLoc.lng, originLoc.name);
  }, [originLoc]);

  const commandDeckRef = useRef<HTMLElement>(null);
  const deckContainerRef = useRef<HTMLDivElement>(null);

  // Compute dynamic flood-aware route
  const executeRouting = useCallback(async (
    orig = originLoc,
    dest = destLoc,
    intensity = weatherData.rainIntensityMmHr
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
      });
      setActiveRoute(res);
      setRouteActive(true);
    } catch (e) {
      console.error('Error computing dynamic route:', e);
    }
  }, [originLoc, destLoc, weatherData.rainIntensityMmHr]);

  // Initial calculation on mount and when parameters change
  useEffect(() => {
    executeRouting(originLoc, destLoc, weatherData.rainIntensityMmHr);
  }, [originLoc, destLoc, weatherData.rainIntensityMmHr, executeRouting]);

  const handleSelectOrigin = useCallback((loc: MumbaiLocation) => {
    setOriginLoc(loc);
  }, []);

  const handleSelectDest = useCallback((loc: MumbaiLocation) => {
    setDestLoc(loc);
  }, []);

  const handlePickLocationFromMap = useCallback((type: 'origin' | 'dest', lat: number, lng: number, label: string) => {
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
    } else {
      setDestLoc(customLoc);
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
      {/* Fixed Top Tactical Post-Login Navigation Bar with dynamic scroll progress & User Profile */}
      <TacticalNavbar />

      {/* SECTION 1: HydroPulse Hero Atmospheric Launcher with Parallax Scroll */}
      <HeroSection onEnterGrid={handleScrollToGrid} />

      {/* SECTION 2: Tactical Command Deck (Query The Grid User Operations UI) */}
      <section
        ref={commandDeckRef}
        id="query-grid"
        className="relative w-full bg-[#101419] py-3 sm:py-4 px-3 sm:px-4 lg:px-6 flex flex-col justify-start border-t border-[#00d9ff]/20 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
      >
        <div ref={deckContainerRef} className="w-full max-w-7xl mx-auto flex flex-col will-change-transform">
          {/* Section Header HUD Banner */}
          <TacticalHeader />

          {/* Command Deck Grid (60% 3D Viewport / 40% Control Deck Stack) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-stretch">
            {/* LEFT COLUMN: 60% (7 of 12) - Tactical 3D Map Instrument Panel */}
            <div className="lg:col-span-7 flex flex-col">
              <TacticalGridFrame
                stormIntensity={weatherData.rainIntensityMmHr}
                routeActive={routeActive}
                activeRoute={activeRoute}
              />
            </div>

            {/* RIGHT COLUMN: 40% (5 of 12) - Multi-Route Parameters & Realtime Meteorological Telemetry */}
            <div className="lg:col-span-5 flex flex-col">
              <RoutingControlPanel
                weatherData={weatherData}
                routeActive={routeActive}
                activeRoute={activeRoute}
                originLoc={originLoc}
                destLoc={destLoc}
                onSelectOrigin={handleSelectOrigin}
                onSelectDest={handleSelectDest}
                onCalculateRoute={() => executeRouting(originLoc, destLoc, weatherData.rainIntensityMmHr)}
              />
            </div>
          </div>

          {/* High-Accuracy 2D Road-Level Tactical Map View (Real-time OSRM & GIS Tiles) */}
          <Tactical2DMapView
            stormIntensity={weatherData.rainIntensityMmHr}
            routeActive={routeActive}
            activeRoute={activeRoute}
            onPickLocation={handlePickLocationFromMap}
          />
        </div>
      </section>

      {/* SECTION 3: Live Catchment & Sensor Telemetry Matrix (Interactive User UI Deck) */}
      <TacticalTelemetryDeck />
    </div>
  );
}

export default App;
