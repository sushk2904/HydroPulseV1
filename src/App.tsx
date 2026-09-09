import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from './components/Navbar';
import { FloodScrollytelling } from './components/FloodScrollytelling';
import { AboutSection } from './components/AboutSection';
import TacticalSimulationApp from '../HydroPulse-Map-Simulation/src/App';

type RouteView = 'landing' | 'simulation';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<RouteView>(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('hydropulse_token');
      if (token) return 'simulation';
      return window.location.hash.toLowerCase().includes('simulation') ? 'simulation' : 'landing';
    }
    return 'landing';
  });

  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionProgress, setTransitionProgress] = useState<number>(0);
  const [bootMessageIndex, setBootMessageIndex] = useState<number>(0);
  const transitionTimeoutRef = useRef<number | null>(null);

  const BOOT_MESSAGES = [
    'INITIATING EMERGENCY TACTICAL PROTOCOL...',
    'SYNCING SWMM 5.2 HYDROLOGICAL MODEL...',
    'CALIBRATING MUMBAI 3D DEM TERRAIN (30M RESOLUTION)...',
    'MOUNTING ST-GAT-GRU EVACUATION ROUTE ENGINE...',
    'TACTICAL COMMAND DECK // ONLINE',
  ];

  // Clean transition handler with GSAP teardown and emergency cyber boot sequence
  const navigateTo = useCallback((target: RouteView) => {
    if (target === activeView && !isTransitioning) return;

    setIsTransitioning(true);
    setTransitionProgress(0);
    setBootMessageIndex(0);

    // Flawlessly tear down any residual GSAP ScrollTriggers when leaving landing
    if (activeView === 'landing') {
      try {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      } catch (err) {
        console.warn('ScrollTrigger cleanup warning:', err);
      }
    }

    // Dynamic boot telemetry sequence
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setBootMessageIndex((prev) => Math.min(prev + 1, BOOT_MESSAGES.length - 1));
      setTransitionProgress((prev) => Math.min(prev + 25, 100));

      if (currentStep >= 4) {
        clearInterval(interval);
      }
    }, 130);

    // Execute state switch at the climax of the cyber wipe
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = window.setTimeout(() => {
      setActiveView(target);
      window.location.hash = target === 'simulation' ? '#/simulation' : '#/';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      // Fade out the boot overlay
      window.setTimeout(() => {
        setIsTransitioning(false);
        setTransitionProgress(0);
        // Refresh ScrollTrigger after DOM layout stabilizes
        try {
          ScrollTrigger.refresh();
        } catch {
          // ignore
        }
      }, 250);
    }, 650);
  }, [activeView, isTransitioning, BOOT_MESSAGES.length]);

  // URL Hash Synchronizer: When logged in, strictly enforce simulation view
  useEffect(() => {
    const handleHashChange = () => {
      const token = localStorage.getItem('hydropulse_token');
      if (token) {
        if (activeView !== 'simulation') {
          setActiveView('simulation');
          window.location.hash = '#/simulation';
        }
        return;
      }

      const hash = window.location.hash.toLowerCase();
      const target: RouteView = hash.includes('simulation') ? 'simulation' : 'landing';
      if (target !== activeView && !isTransitioning) {
        navigateTo(target);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeView, isTransitioning, navigateTo]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#030708] text-white relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* =========================================================
          CYBER-GLOW EMERGENCY BOOT TRANSITION OVERLAY
         ========================================================= */}
      {isTransitioning && (
        <div
          className="fixed inset-0 z-[9999] bg-[#05070a]/95 backdrop-blur-2xl flex flex-col items-center justify-center pointer-events-auto transition-opacity duration-300 select-none overflow-hidden"
          style={{
            boxShadow: 'inset 0 0 100px rgba(0, 217, 255, 0.25)',
          }}
        >
          {/* Subtle CRT scanlines */}
          <div className="absolute inset-0 scanlines opacity-60 pointer-events-none" />

          {/* Horizontal animated laser scanline */}
          <div
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00d9ff] to-transparent shadow-[0_0_20px_#00d9ff] animate-pulse"
            style={{
              top: `${transitionProgress}%`,
              transition: 'top 120ms ease-out',
            }}
          />

          {/* Center Emergency HUD Terminal */}
          <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto px-6 text-center">
            {/* Pulsing Hex Radar Badge */}
            <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl border border-cyan-400/40 animate-ping opacity-30" />
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-[#00d9ff] shadow-[0_0_30px_rgba(0,217,255,0.6)] flex items-center justify-center">
                <span className="font-mono text-cyan-400 text-xl font-bold tracking-tighter animate-pulse">
                  HP
                </span>
              </div>
            </div>

            {/* Tactical Status Subtitle */}
            <div className="flex items-center gap-2 mb-2 font-mono text-[11px] tracking-[0.25em] text-cyan-400/90 uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>DISASTER RESPONSE PROTOCOL</span>
            </div>

            {/* Dynamic Telemetry Terminal Readout */}
            <h2 className="font-mono text-base sm:text-lg font-bold text-white tracking-wide mb-6 h-8 flex items-center justify-center drop-shadow-[0_0_12px_rgba(0,217,255,0.7)]">
              {BOOT_MESSAGES[bootMessageIndex]}
            </h2>

            {/* High-Tech Progress Bar */}
            <div className="w-64 sm:w-80 h-1.5 bg-slate-900/90 border border-cyan-500/30 rounded-full overflow-hidden p-0.5 shadow-[0_0_15px_rgba(0,217,255,0.3)]">
              <div
                className="h-full bg-gradient-to-r from-[#00d9ff] via-[#5B7FFF] to-[#00FF87] rounded-full shadow-[0_0_10px_#00d9ff] transition-all duration-150 ease-out"
                style={{ width: `${Math.max(10, transitionProgress)}%` }}
              />
            </div>

            {/* Coordinates / Metadata telemetry */}
            <div className="mt-4 flex items-center justify-between w-64 sm:w-80 font-mono text-[9px] text-slate-400 tracking-wider">
              <span>LAT 19.0760° N</span>
              <span className="text-cyan-400">{transitionProgress}%</span>
              <span>LON 72.8777° E</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ROUTED VIEWS
         ========================================================= */}
      {activeView === 'landing' ? (
        <div className="landing-view-container animate-in fade-in duration-300">
          <Navbar onLaunchSimulation={() => navigateTo('simulation')} />
          <main>
            <FloodScrollytelling onLaunchSimulation={() => navigateTo('simulation')} />
          </main>
          <AboutSection onLaunchSimulation={() => navigateTo('simulation')} />
        </div>
      ) : (
        <div className="simulation-view-container animate-in fade-in duration-300">
          <TacticalSimulationApp />
        </div>
      )}
    </div>
  );
};

export default App;
