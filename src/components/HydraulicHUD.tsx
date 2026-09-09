import React from 'react';
import { TelemetryMetrics } from '../types/scrollytelling';

interface HydraulicHUDProps {
  metrics: TelemetryMetrics;
  scrollProgress: number;
  currentFrame: number;
  totalFrames: number;
}

/**
 * Compute scroll-driven opacity + translateY for a phase.
 * Features ultra-smooth sinusoidal easing for slow, elegant fade-ins and fade-outs.
 */
const getPhaseStyle = (
  progress: number,
  phaseStart: number,
  phaseEnd: number,
  isLast = false
): React.CSSProperties => {
  const range = phaseEnd - phaseStart;
  // Use a generous 30% fade zone for ultra-gradual, slow fade-in / fade-out
  const fadeZone = range * 0.30; 

  let opacity = 0;
  let y = 30;

  if (progress < phaseStart) {
    opacity = 0;
    y = 30;
  } else if (progress < phaseStart + fadeZone) {
    // Entering — smooth sinewave fade-in & slide-up
    const linearT = (progress - phaseStart) / fadeZone;
    const easeT = Math.sin((linearT * Math.PI) / 2); // 0 -> 1 smooth sine
    opacity = easeT;
    y = 30 * (1 - easeT);
  } else if (progress < phaseEnd - fadeZone || isLast) {
    // Fully visible plateau
    opacity = 1;
    y = 0;
  } else if (progress < phaseEnd) {
    // Exiting — smooth sinewave fade-out & slide-up
    const linearT = (progress - (phaseEnd - fadeZone)) / fadeZone;
    const easeT = Math.sin((linearT * Math.PI) / 2); // 0 -> 1 smooth sine
    opacity = 1 - easeT;
    y = -20 * easeT;
  } else {
    opacity = 0;
    y = -20;
  }

  return {
    opacity,
    transform: `translate3d(0, ${y}px, 0)`,
    pointerEvents: opacity > 0.05 ? 'auto' : 'none',
    transition: 'opacity 0.1s linear, transform 0.1s linear',
  };
};

export const HydraulicHUD: React.FC<HydraulicHUDProps> = ({
  metrics,
  scrollProgress,
}) => {
  const showScrollHint = scrollProgress < 0.02;

  // Intro hero brand title animation (0% -> 3.5% scroll progress)
  const introT = Math.min(1, scrollProgress / 0.035);
  const introOpacity = Math.max(0, 1 - Math.sin((introT * Math.PI) / 2));

  // Left-side headings styles (Phase 01 starts at 0.035 so it never overlaps with intro title)
  const cloudsStyle = getPhaseStyle(scrollProgress, 0.035, 0.25);
  const conduitStyle = getPhaseStyle(scrollProgress, 0.25, 0.60);
  const surchargeStyle = getPhaseStyle(scrollProgress, 0.60, 1.0, true);

  // Right-side complete card box styles
  const cloudsCardStyle = getPhaseStyle(scrollProgress, 0.045, 0.23);
  const conduitCardStyle = getPhaseStyle(scrollProgress, 0.27, 0.57);
  const surchargeCardStyle = getPhaseStyle(scrollProgress, 0.62, 1.0, true);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between">

      {/* ——— CENTER HERO INTRO: Full Landing Hero Layout ——— */}
      {introOpacity > 0.01 && (
        <div
          className="fixed inset-0 pointer-events-none z-30 px-8 md:px-14"
          style={{
            opacity: introOpacity,
            transition: 'opacity 0.1s linear',
          }}
        >
          {/* Top-right description text — floated below navbar height */}
          <div className="absolute top-36 md:top-40 right-8 md:right-16 max-w-[500px] text-right hidden lg:block">
            <p 
              className="text-white/80 text-[18px] font-medium leading-[1.6] tracking-wide"
              style={{ fontFamily: "'Clash Grotesk', sans-serif" }}
            >
              We design autonomous AI-driven drainage networks<br />
              that predict overflow, optimize flow dynamics, and<br />
              prevent urban flooding before it starts.
            </p>
          </div>

          {/* Main hero content block — pushed down to clear navbar (pt-32) */}
          <div className="w-full flex flex-col justify-start pt-20 md:pt-24">

            {/* WE SAFEGUARD pill — left-bordered accent tag */}
            <div className="mb-6 md:mb-8">
              <div
                className="inline-flex items-center px-4 py-2 rounded-sm"
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  backdropFilter: 'blur(12px)',
                  borderLeft: '3px solid rgba(56,189,248,0.9)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderLeftWidth: '3px',
                  borderLeftColor: 'rgba(56,189,248,0.9)',
                }}
              >
                <span className="font-mono text-[10px] md:text-[11px] font-semibold tracking-[0.28em] text-white/85 uppercase">
                  WE SAFEGUARD 100+ URBAN DRAINAGE NETWORKS
                </span>
              </div>
            </div>

            {/* HYDRO — left-aligned, slides LEFT on scroll */}
            <div
              className="text-left"
              style={{
                transform: `translate3d(${-introT * 160}px, 0, 0)`,
                transition: 'transform 0.1s linear',
              }}
            >
              <h1
                className="text-[clamp(5rem,17vw,13.5rem)] font-semibold uppercase leading-[0.88] tracking-[-0.04em] text-transparent bg-clip-text"
                style={{
                  fontFamily: "'Clash Grotesk', sans-serif",
                  backgroundImage: 'linear-gradient(180deg, #f1f5f9 0%, #cbd5e1 30%, #94a3b8 60%, #475569 100%)',
                  WebkitTextStroke: '0px transparent',
                  filter: 'drop-shadow(0 12px 40px rgba(0,0,0,0.85))',
                }}
              >
                HYDRO
              </h1>
            </div>

            {/* PULSE — left-aligned, stacked below, slides RIGHT on scroll */}
            <div
              className="text-left -mt-2 md:-mt-4 lg:-mt-5"
              style={{
                transform: `translate3d(${introT * 160}px, 0, 0)`,
                transition: 'transform 0.1s linear',
              }}
            >
              <h1
                className="text-[clamp(5rem,17vw,13.5rem)] font-semibold uppercase leading-[0.88] tracking-[-0.04em] text-transparent bg-clip-text"
                style={{
                  fontFamily: "'Clash Grotesk', sans-serif",
                  backgroundImage: 'linear-gradient(180deg, #e2e8f0 0%, #94a3b8 35%, #64748b 65%, #334155 100%)',
                  filter: 'drop-shadow(0 12px 40px rgba(0,0,0,0.85))',
                }}
              >
                PULSE
              </h1>
            </div>

            {/* Subtitle & Description Row */}
            {/* Subtitle */}
            <div className="mt-10 md:mt-14 w-full pr-0 lg:pr-10">
              <p className="font-sans text-[20px] md:text-[26px] font-light text-white/85 tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                Predictive. Precise. Autonomous Flow.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ——— TOP-RIGHT: Telemetry readout cards (positioned below top navbar) ——— */}
      <div className="relative pt-20 md:pt-24 px-6 md:px-10 lg:px-14 flex justify-end min-h-[220px]">
        {/* Phase 01 Card — Premium Frosted Glassmorphism */}
        <div
          style={cloudsCardStyle}
          className="absolute top-20 md:top-24 right-6 md:right-10 lg:right-14 w-[270px] rounded-2xl overflow-hidden"
        >
          <div
            className="w-full relative"
            style={{
              background: 'linear-gradient(135deg, rgba(8, 24, 18, 0.65) 0%, rgba(3, 10, 12, 0.5) 100%)',
              backdropFilter: 'blur(32px) saturate(190%)',
              WebkitBackdropFilter: 'blur(32px) saturate(190%)',
              border: '1px solid rgba(0, 255, 135, 0.25)',
              boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 0 24px -4px rgba(0, 255, 135, 0.15)',
            }}
          >
            {/* Specular top glow */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00FF87] to-transparent opacity-80" />

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-white/70 font-bold">
                  ATMOSPHERIC FORCING
                </span>
                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30">
                  NORMAL
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-[11px]">
                <div className="flex justify-between items-baseline">
                  <span className="text-white/40">Precipitation</span>
                  <span className="text-white font-semibold">{metrics.rainIntensity}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-white/40">Reflectivity</span>
                  <span className="text-white font-semibold">{metrics.radarReflectivity}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08]">
                <div className="flex-1 rounded-full overflow-hidden h-[2px] bg-white/[0.08]">
                  <div
                    className="h-full bg-[#00FF87] opacity-90 shadow-[0_0_8px_#00FF87]"
                    style={{ width: `${scrollProgress * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[9px] tabular-nums text-white/40">
                  {Math.round(scrollProgress * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 02 Card — Premium Frosted Glassmorphism */}
        <div
          style={conduitCardStyle}
          className="absolute top-20 md:top-24 right-6 md:right-10 lg:right-14 w-[270px] rounded-2xl overflow-hidden"
        >
          <div
            className="w-full relative"
            style={{
              background: 'linear-gradient(135deg, rgba(28, 20, 10, 0.65) 0%, rgba(10, 8, 3, 0.5) 100%)',
              backdropFilter: 'blur(32px) saturate(190%)',
              WebkitBackdropFilter: 'blur(32px) saturate(190%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 0 24px -4px rgba(245, 158, 11, 0.15)',
            }}
          >
            {/* Specular top glow */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent opacity-80" />

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-white/70 font-bold">
                  CONDUIT PRESSURIZATION
                </span>
                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider bg-amber-500/20 text-[#F59E0B] border border-amber-500/30">
                  WARNING
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-[11px]">
                <div className="flex justify-between items-baseline">
                  <span className="text-white/40">Conduit</span>
                  <span className="text-white font-semibold">{metrics.conduitId}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-white/40">Capacity</span>
                  <span className="text-[#F59E0B] font-semibold">{metrics.conduitCapacity}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08]">
                <div className="flex-1 rounded-full overflow-hidden h-[2px] bg-white/[0.08]">
                  <div
                    className="h-full bg-[#F59E0B] opacity-90 shadow-[0_0_8px_#F59E0B]"
                    style={{ width: `${scrollProgress * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[9px] tabular-nums text-white/40">
                  {Math.round(scrollProgress * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 03 Card — Premium Frosted Glassmorphism */}
        <div
          style={surchargeCardStyle}
          className="absolute top-20 md:top-24 right-6 md:right-10 lg:right-14 w-[270px] rounded-2xl overflow-hidden"
        >
          <div
            className="w-full relative"
            style={{
              background: 'linear-gradient(135deg, rgba(32, 10, 18, 0.65) 0%, rgba(12, 3, 6, 0.5) 100%)',
              backdropFilter: 'blur(32px) saturate(190%)',
              WebkitBackdropFilter: 'blur(32px) saturate(190%)',
              border: '1px solid rgba(255, 51, 102, 0.3)',
              boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 0 24px -4px rgba(255, 51, 102, 0.15)',
            }}
          >
            {/* Specular top glow */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#FF3366] to-transparent opacity-80" />

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-white/70 font-bold">
                  SURCHARGE INUNDATION
                </span>
                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider bg-[#FF3366]/20 text-[#FF3366] border border-[#FF3366]/30">
                  CRITICAL
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-[11px]">
                <div className="flex justify-between items-baseline">
                  <span className="text-white/40">Node</span>
                  <span className="text-[#FF3366] font-semibold">{metrics.nodeStatus}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-white/40">Depth</span>
                  <span className="text-white font-semibold">{metrics.inundationDepth}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08]">
                <div className="flex-1 rounded-full overflow-hidden h-[2px] bg-white/[0.08]">
                  <div
                    className="h-full bg-[#FF3366] opacity-90 shadow-[0_0_8px_#FF3366]"
                    style={{ width: `${scrollProgress * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[9px] tabular-nums text-white/40">
                  {Math.round(scrollProgress * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ——— BOTTOM-LEFT: Cinematic hero typography with scroll-driven entrance ——— */}
      <div className="relative p-6 md:p-10 lg:p-14 pb-20 md:pb-24 max-w-4xl min-h-[340px]">

        {/* Phase 01: Clouds */}
        <div style={cloudsStyle} className="absolute bottom-20 md:bottom-24 left-6 md:left-10 lg:left-14 max-w-xl">
          <div className="space-y-5">
            <span className="font-mono text-[12px] tracking-[0.3em] font-bold block drop-shadow-[0_0_12px_rgba(0,255,135,0.3)]"
              style={{ color: 'rgba(0, 255, 135, 0.95)' }}>
              01 — ATMOSPHERIC FORCING
            </span>
            <h2 className="text-[clamp(3rem,9vw,8rem)] font-semibold text-white leading-[0.9] tracking-[-0.03em]">
              Storm<br />Inflow
            </h2>
            <p className="text-[clamp(0.95rem,1.8vw,1.25rem)] max-w-md leading-relaxed tracking-[-0.01em]"
              style={{ color: 'rgba(255,255,255,0.45)' }}>
              Extreme precipitation at{' '}
              <span className="text-white/90 font-semibold">82.4 mm/hr</span>{' '}
              driving surface runoff into the drainage network.
            </p>
          </div>
        </div>

        {/* Phase 02: Conduit */}
        <div style={conduitStyle} className="absolute bottom-20 md:bottom-24 left-6 md:left-10 lg:left-14 max-w-xl">
          <div className="space-y-5">
            <span className="font-mono text-[12px] tracking-[0.3em] font-bold block drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]"
              style={{ color: 'rgba(245, 158, 11, 0.95)' }}>
              02 — CONDUIT PRESSURIZATION
            </span>
            <h2 className="text-[clamp(3rem,9vw,8rem)] font-semibold text-white leading-[0.9] tracking-[-0.03em]">
              Pipe at<br />Capacity
            </h2>
            <p className="text-[clamp(0.95rem,1.8vw,1.25rem)] max-w-md leading-relaxed tracking-[-0.01em]"
              style={{ color: 'rgba(255,255,255,0.45)' }}>
              Conduit <span className="text-white/90 font-semibold">SWMM-PIPE-09</span> reaches{' '}
              <span style={{ color: '#F59E0B' }} className="font-semibold">94.2%</span> barrel capacity.
            </p>
          </div>
        </div>

        {/* Phase 03: Surcharge */}
        <div style={surchargeStyle} className="absolute bottom-20 md:bottom-24 left-6 md:left-10 lg:left-14 max-w-xl">
          <div className="space-y-5">
            <span className="font-mono text-[12px] tracking-[0.3em] font-bold block drop-shadow-[0_0_12px_rgba(255,51,102,0.3)]"
              style={{ color: 'rgba(255, 51, 102, 0.95)' }}>
              03 — SURCHARGE INUNDATION
            </span>
            <h2 className="text-[clamp(3rem,9vw,8rem)] font-semibold text-white leading-[0.9] tracking-[-0.03em]">
              Street<br />Submerged
            </h2>
            <p className="text-[clamp(0.95rem,1.8vw,1.25rem)] max-w-md leading-relaxed tracking-[-0.01em]"
              style={{ color: 'rgba(255,255,255,0.45)' }}>
              Inundation depth{' '}
              <span className="text-white/90 font-semibold">+46 cm</span>.
              Bidirectional backflow at node{' '}
              <span style={{ color: '#FF3366' }} className="font-semibold">#MH-104</span>.
            </p>
          </div>
        </div>

      </div>

      {/* ——— BOTTOM-RIGHT: Scroll prompt ——— */}
      <div
        className="absolute bottom-8 right-8 md:right-14"
        style={{
          opacity: showScrollHint ? 0.65 : 0,
          transition: 'opacity 0.7s ease',
        }}
      >
        <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.28em] uppercase"
          style={{ color: 'rgba(255,255,255,0.45)' }}>
          <span>SCROLL TO SIMULATE</span>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="animate-bounce">
            <path d="M6 2L6 10M6 10L2 6M6 10L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
