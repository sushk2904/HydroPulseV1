import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CornerUpRight } from 'lucide-react';
import { WaveGridBackground } from './WaveGridBackground';

gsap.registerPlugin(ScrollTrigger);

interface BreakoutDashboardProps {
  onLaunchSimulation?: () => void;
}

export const BreakoutDashboard: React.FC<BreakoutDashboardProps> = ({ onLaunchSimulation }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // GSAP scroll-triggered card swipe animations
  useEffect(() => {
    if (!cardsRef.current || !headerRef.current) return;

    const ctx = gsap.context(() => {
      // Header text reveal
      gsap.from(headerRef.current!, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headerRef.current!,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });

      const cards = cardsRef.current!.children;

      // Card 1: swipe in from LEFT
      if (cards[0]) {
        gsap.from(cards[0], {
          x: -150,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cards[0],
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Card 2: swipe up from BOTTOM
      if (cards[1]) {
        gsap.from(cards[1], {
          y: 100,
          opacity: 0,
          duration: 1.1,
          delay: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cards[1],
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Card 3: swipe in from RIGHT
      if (cards[2]) {
        gsap.from(cards[2], {
          x: 150,
          opacity: 0,
          duration: 1.1,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cards[2],
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="command-deck"
      className="relative text-white border-t border-white/[0.04] bg-[#1a1a1a] min-h-screen flex flex-col justify-center overflow-hidden"
    >
      {/* Wave grid background — cool slate-cyan palette */}
      <div className="absolute inset-0 z-0 opacity-60 mix-blend-screen">
        <WaveGridBackground 
          colorBase="#1a1a1a" 
          colorHigh="#38bdf8" 
          waveAmplitude={0.35} 
          waveSpeed={3.5} 
        />
      </div>

      <div className="relative z-10 py-14 md:py-18 px-6 md:px-14 lg:px-16 max-w-7xl mx-auto space-y-8 md:space-y-10 pointer-events-none w-full flex flex-col justify-center">

        {/* Header */}
        <div ref={headerRef} className="space-y-3 max-w-3xl pointer-events-auto">
          <span className="font-mono text-[11px] tracking-[0.3em] text-cyan-400/80 font-medium">
            COMMAND DECK
          </span>
          <h2 className="text-[clamp(2.2rem,4.5vw,4.25rem)] font-semibold tracking-[-0.03em] leading-[0.95] drop-shadow-md">
            Post-Inundation<br />Intelligence
          </h2>
          <p className="text-[clamp(0.95rem,1.5vw,1.15rem)] text-white/50 font-normal leading-relaxed max-w-2xl tracking-[-0.01em]">
            Real-time 1D subterranean pipe hydraulics coupled with 2D surface diffusion wave routing for instant flood response and evacuation guidance.
          </p>
        </div>

        {/* Cards Grid — animated on scroll */}
        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">

          {/* Card 1: Live Sensor Network — enters from LEFT */}
          <div className="pointer-events-auto rounded-2xl p-6 md:p-7 bg-black/40 backdrop-blur-xl border border-white/[0.06] hover:border-cyan-400/25 transition-all duration-500 flex flex-col justify-between gap-5">
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1 tracking-[-0.02em]">Live Sensor Network</h3>
                <p className="text-sm text-white/30 font-mono">142 active SWMM telemetry nodes</p>
              </div>

              <p className="text-sm text-white/40 leading-relaxed">
                Ultrasonic depth transducers and Doppler velocity meters streaming at 10Hz to edge MQTT brokers.
              </p>

              <div className="space-y-2 font-mono text-[12px]">
                <div className="flex justify-between items-center py-2.5 px-3.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-white/30">Node #MH-104</span>
                  <span className="text-[#FF3366] font-semibold">+46 cm</span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-3.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-white/30">SWMM-PIPE-09</span>
                  <span className="text-amber-400 font-semibold">3.4 m/s</span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-3.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-white/30">Rain Gauge RG-02</span>
                  <span className="text-cyan-400 font-semibold">82.4 mm/hr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: PostGIS Heatmap — enters from BOTTOM */}
          <div className="pointer-events-auto rounded-2xl p-6 md:p-7 bg-black/40 backdrop-blur-xl border border-white/[0.06] hover:border-cyan-400/25 transition-all duration-500 flex flex-col justify-between gap-5">
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1 tracking-[-0.02em]">PostGIS Topological Heatmap</h3>
                <p className="text-sm text-white/30 font-mono">2D overland inundation grid</p>
              </div>

              <p className="text-sm text-white/40 leading-relaxed">
                Digital elevation model raster overlay computed via WebGL fragment shaders with 10m resolution.
              </p>

              {/* Mock GIS visual */}
              <div className="relative h-24 rounded-xl bg-black/40 border border-white/[0.04] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-6 rounded-full bg-gradient-to-r from-red-500/15 via-amber-500/10 to-emerald-500/5 blur-xl" />
                <div className="relative font-mono text-center space-y-1">
                  <span className="text-[11px] font-medium text-white/60 block">EPSG:4326 // 19.076°N, 72.877°E</span>
                  <span className="text-[10px] text-white/30">10m × 10m Resolution</span>
                </div>
              </div>

              <div className="space-y-2 font-mono text-[12px]">
                <div className="flex justify-between text-white/40">
                  <span>Critical zone</span>
                  <span className="text-[#FF3366] font-semibold">1.42 km²</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span>Peak velocity</span>
                  <span className="text-amber-400 font-semibold">1.8 m/s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Safe Routing — enters from RIGHT */}
          <div className="pointer-events-auto rounded-2xl p-6 md:p-7 bg-black/40 backdrop-blur-xl border border-white/[0.06] hover:border-[#FF3366]/25 transition-all duration-500 flex flex-col justify-between gap-5">
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1 tracking-[-0.02em]">Safe Navigation Routing</h3>
                <p className="text-sm text-white/30 font-mono">A* evacuation path engine</p>
              </div>

              <p className="text-sm text-white/40 leading-relaxed">
                Computes dry-foot evacuation corridors avoiding all inundated nodes with water depth exceeding 15cm.
              </p>

              <div className="space-y-2.5 font-mono text-[12px]">
                <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.04] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/40">Route</span>
                    <span className="text-cyan-400 font-semibold">CORRIDOR B-NORTH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Bypass</span>
                    <span className="text-[#FF3366]">#MH-104 (+46cm)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">ETA</span>
                    <span className="text-white font-semibold">8 min (2.4 km)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Climax Handoff CTA: Launch 3D Tactical Command Deck */}
        <div className="mt-4 md:mt-6 text-center max-w-2xl mx-auto flex flex-col items-center">
          <button
            onClick={onLaunchSimulation || (() => { window.location.hash = '#/simulation'; })}
            className="group relative px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-mono text-xs md:text-sm font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 shadow-[0_0_35px_rgba(0,217,255,0.45)] hover:shadow-[0_0_60px_rgba(0,217,255,0.8)] flex items-center gap-3 cursor-pointer pointer-events-auto"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
            <span>LAUNCH 3D TACTICAL COMMAND DECK</span>
            <CornerUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
