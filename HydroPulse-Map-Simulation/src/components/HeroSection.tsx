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
  const contentRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      // Parallax fade for hero content on scroll
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          y: -60,
          opacity: 0.1,
          scale: 0.96,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '85% top',
            scrub: true,
          },
        });
      }

      // Bottom bar fade on scroll
      if (footerRef.current) {
        gsap.to(footerRef.current, {
          opacity: 0,
          y: 15,
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
      {/* Background — clean dark gradient, no animated cloud image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-[#05070A] to-[#05070A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,217,255,0.06)_0%,transparent_60%)]" />
      </div>

      {/* Spacer */}
      <div className="w-full h-4" />

      {/* Center Content */}
      <main
        ref={contentRef}
        className="relative z-20 max-w-[1440px] mx-auto px-6 w-full my-auto flex flex-col items-center justify-center text-center py-8 will-change-transform"
      >
        <div className="max-w-3xl flex flex-col items-center">
          {/* Status Badge — clean, minimal */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs tracking-wide text-slate-300">
              Live Operations — Mumbai Metropolis
            </span>
          </div>

          {/* Headline — clean white, no neon glow */}
          <h1 className="font-['Space_Grotesk'] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.05]">
            HydroPulse
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
            Flood-aware dynamic routing for emergency and transit vectors, powered by deterministic 1D/2D hydraulic physics.
          </p>

          {/* Primary CTA — clean solid button */}
          <div className="mt-8">
            <button
              onClick={handleScrollClick}
              type="button"
              className="px-7 py-3 rounded-lg bg-white text-slate-900 text-sm font-semibold tracking-wide inline-flex items-center gap-2.5 cursor-pointer hover:bg-slate-100 transition-colors active:scale-[0.98]"
            >
              <span>Open Command Deck</span>
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom bar — minimal info */}
      <footer
        ref={footerRef}
        className="relative z-20 w-full px-6 lg:px-8 py-3 flex items-center justify-between border-t border-slate-800/60 will-change-transform"
      >
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 tracking-wide">
          <span className="text-slate-400">Mumbai, India</span>
          <span className="text-slate-700">·</span>
          <span>19.0760° N, 72.8346° E</span>
        </div>

        <button
          onClick={handleScrollClick}
          type="button"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          <span className="font-mono text-[11px] tracking-wide">Scroll to explore</span>
          <svg className="w-3.5 h-3.5 animate-bounce" viewBox="0 0 24 24" fill="none">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
          <span>SWMM 5.2 Active</span>
        </div>
      </footer>
    </section>
  );
});
