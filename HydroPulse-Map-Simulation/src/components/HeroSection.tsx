import React, { memo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onEnterGrid?: () => void;
}

export const HeroSection = memo(function HeroSection({ onEnterGrid }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      // 1. Parallax background clouds layer
      if (cloudRef.current) {
        gsap.to(cloudRef.current, {
          yPercent: 28,
          scale: 1.06,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // 2. Parallax and smooth dispersion for hero center content
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          y: -75,
          opacity: 0.1,
          scale: 0.94,
          filter: 'blur(4px)',
          ease: 'power1.out',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '85% top',
            scrub: true,
          },
        });
      }

      // 3. Bottom HUD Cue quick fade out on initial scroll
      if (footerRef.current) {
        gsap.to(footerRef.current, {
          opacity: 0,
          y: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '30% top',
            scrub: true,
          },
        });
      }
    },
    { scope: sectionRef }
  );

  const handleScrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onEnterGrid) {
      onEnterGrid();
    } else {
      const target = document.getElementById('query-grid');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen min-h-[700px] flex flex-col justify-between overflow-hidden bg-[#05070A] select-none pt-16"
    >
      {/* 1. Background atmospheric cloud layer with slow cinematic drift + scroll parallax */}
      <div
        ref={cloudRef}
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none will-change-transform"
      >
        <img
          src="/textures/clouds.png"
          alt="Atmospheric monsoon cloud cover"
          className="w-full h-full object-cover object-center animate-drift-slow brightness-[0.75] contrast-[1.15] opacity-85"
        />
        {/* Vignette and color grading overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/80 via-[#05070A]/35 to-[#05070A] mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,#05070A_95%)]" />
        {/* Subtle scanline micro-texture */}
        <div className="absolute inset-0 scanlines opacity-40" />
      </div>

      {/* Empty top buffer balancing the bottom bar */}
      <div className="w-full h-4" />

      {/* 2. Centered Headline Block & CTA */}
      <main
        ref={contentRef}
        className="relative z-20 max-w-[1440px] mx-auto px-6 w-full my-auto flex flex-col items-center justify-center text-center py-8 will-change-transform"
      >
        <div className="max-w-4xl flex flex-col items-center">
          {/* Technical JetBrains Mono telemetry label */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-lg bg-[#0A0E14]/70 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_16px_rgba(0,217,255,0.14)] mb-5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-['JetBrains_Mono',monospace] text-xs md:text-[13px] tracking-[0.2em] text-cyan-400 uppercase font-semibold">
              [ REAL-TIME MONSOON OPERATIONS // MUMBAI METROPOLIS ]
            </span>
          </div>

          {/* Headline with Neon Cyan Glow */}
          <h1 className="font-['Space_Grotesk'] text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-bold tracking-[0.24em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-[#00D9FF] hud-cyan-glow select-none pl-4 leading-tight">
            HYDROPULSE
          </h1>

          {/* One-line mission statement */}
          <p className="mt-6 font-['Inter',sans-serif] text-base sm:text-lg md:text-xl font-normal text-slate-300 tracking-wide max-w-2xl leading-relaxed">
            Flood-aware dynamic routing for emergency and transit vectors, governed by deterministic 1D/2D hydraulic physics.
          </p>

          {/* Primary CTA Button */}
          <div className="mt-9 flex items-center gap-4">
            <button
              onClick={handleScrollClick}
              type="button"
              className="hud-btn-primary px-8 py-3.5 rounded-lg font-['Inter',sans-serif] text-sm md:text-base font-semibold text-[#05070A] tracking-wider uppercase inline-flex items-center gap-3 cursor-pointer group shadow-[0_0_30px_rgba(0,217,255,0.45)] hover:shadow-[0_0_40px_rgba(0,217,255,0.7)] transition-all transform active:scale-95"
            >
              <span>Initialize Command Deck</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8H13M13 8L9 4M13 8L9 12"
                  stroke="#05070A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* 3. Subtle Bottom Scroll Cue Footer */}
      <footer
        ref={footerRef}
        className="relative z-20 w-full px-6 lg:px-8 py-3.5 flex items-center justify-between bg-[#0A0E14]/70 backdrop-blur-xl border-t border-[#00d9ff]/20 shadow-[0_-4px_20px_rgba(0,217,255,0.08)] will-change-transform"
      >
        <div className="flex items-center gap-3 font-['JetBrains_Mono',monospace] text-[11px] text-slate-500 tracking-wider">
          <span className="text-cyan-500/80 font-semibold">GRID_TELEMETRY:</span>
          <span className="text-slate-400">ATMOSPHERIC MONITORING ACTIVE</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-slate-400">18.9220° N, 72.8346° E // EPSG:4326</span>
        </div>

        <button
          onClick={handleScrollClick}
          type="button"
          className="flex items-center gap-2 text-cyan-400/80 hover:text-cyan-300 transition-colors group cursor-pointer focus:outline-none"
        >
          <span className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.28em] text-cyan-400/90 group-hover:text-cyan-300 transition-colors uppercase font-medium">
            SCROLL TO ENGAGE
          </span>
          <div className="animate-bounce-subtle flex flex-col items-center">
            <svg
              className="w-3.5 h-3.5 stroke-cyan-400 group-hover:stroke-cyan-300 transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>

        <div className="flex items-center gap-2 font-['JetBrains_Mono',monospace] text-[11px] text-slate-500 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/90 animate-pulse" />
          <span className="text-slate-400">SWMM_PHYSICS: SYNCED</span>
        </div>
      </footer>
    </section>
  );
});
