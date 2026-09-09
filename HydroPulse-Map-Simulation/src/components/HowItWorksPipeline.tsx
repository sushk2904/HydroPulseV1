import React, { memo } from 'react';

interface HowItWorksPipelineProps {
  onLaunchDemo?: () => void;
}

export const HowItWorksPipeline = memo(function HowItWorksPipeline({
  onLaunchDemo,
}: HowItWorksPipelineProps) {
  const handleLaunchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLaunchDemo) {
      onLaunchDemo();
    } else {
      const target = document.getElementById('query-grid');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="how-it-works" className="relative w-full overflow-hidden bg-[#0b0e13] text-[#e0e2ea] py-24 select-none border-t border-[#00d9ff]/15">
      {/* Ambient Tactical HUD Grid Background */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern height="64" id="tacticalGridPattern" patternUnits="userSpaceOnUse" width="64">
              <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#00d9ff" strokeOpacity="0.25" strokeWidth="0.75" />
              <circle cx="0" cy="0" fill="#00d9ff" fillOpacity="0.4" r="1.5" />
            </pattern>
            <radialGradient cx="50%" cy="35%" id="vignetteGrad" r="65%">
              <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.06" />
              <stop offset="60%" stopColor="#0b0e13" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0b0e13" stopOpacity="1" />
            </radialGradient>
          </defs>
          <rect fill="url(#tacticalGridPattern)" height="100%" width="100%" />
          <rect fill="url(#vignetteGrad)" height="100%" width="100%" />
        </svg>
      </div>

      {/* Decorative Orbit HUD Rings (Subtle Radar Overlay) */}
      <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] pointer-events-none rounded-full bg-[#0b0e13]/10 shadow-[0_0_120px_rgba(0,217,255,0.04)] flex items-center justify-center">
        <div className="w-[720px] h-[720px] rounded-full bg-transparent shadow-[0_0_60px_rgba(0,217,255,0.03)] flex items-center justify-center">
          <div className="w-[460px] h-[460px] rounded-full bg-transparent" />
        </div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center pb-16">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#181c21]/90 shadow-[0_0_16px_rgba(0,217,255,0.15)] mb-4 border border-[#3c494d]/40">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d9ff] animate-ping" />
          <span className="font-['Lexend'] text-xs uppercase tracking-[0.25em] text-[#00d9ff] font-semibold">
            [ PIPELINE ARCHITECTURE ]
          </span>
        </div>

        {/* Main Title */}
        <h2 className="font-['Space_Grotesk'] text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#e0e2ea] leading-tight">
          How HydroPulse <span className="text-[#afecff] drop-shadow-[0_0_24px_rgba(0,217,255,0.35)]">Actually Works</span>
        </h2>

        {/* Subtitle / Mission Statement */}
        <p className="font-['Metrophobic'] text-base sm:text-lg text-[#bbc9ce] max-w-2xl mx-auto mt-4 leading-relaxed">
          Every number on this site traces back to real geospatial data and physics simulation — nothing here is placeholder.
        </p>

        {/* Tactical Quick Meta Grid Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-['Lexend'] text-[#859398]">
          <div className="flex items-center gap-2 bg-[#181c21]/90 px-3 py-1.5 rounded border border-[#3c494d]/40 shadow-sm">
            <span className="text-[#bbc9ce]">REGION:</span>
            <span className="text-[#afecff] font-semibold">MUMBAI METROPOLIS // 437.7 KM²</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-[#181c21]/90 px-3 py-1.5 rounded border border-[#3c494d]/40 shadow-sm">
            <span className="text-[#bbc9ce]">HYDRAULICS:</span>
            <span className="text-[#b7c4ff] font-semibold">EPA-SWMM 5.2 (1D/2D)</span>
          </div>
          <div className="flex items-center gap-2 bg-[#181c21]/90 px-3 py-1.5 rounded border border-[#3c494d]/40 shadow-sm">
            <span className="text-[#bbc9ce]">CORE STATUS:</span>
            <span className="text-[#00d9ff] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d9ff] animate-pulse" />
              DETERMINISTIC
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Pipeline Alternating Workflow */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 lg:px-8">
        {/* Central Spine Guide Line (Desktop HUD Axis) */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-16 -translate-x-1/2 w-px bg-gradient-to-b from-[#00d9ff]/20 via-[#00d9ff]/40 to-transparent" />
        <div className="hidden lg:block absolute left-1/2 top-12 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#00d9ff] shadow-[0_0_12px_#00d9ff]" />
        <div className="hidden lg:block absolute left-1/2 bottom-16 -translate-x-1/2 w-2 h-2 rounded-full bg-[#b7c4ff] shadow-[0_0_10px_#b7c4ff]" />

        <div className="flex flex-col gap-16 sm:gap-24 relative">
          {/* ================= PHASE 01 : LEFT ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 relative">
            {/* Card Left Column */}
            <div className="lg:col-span-6 flex justify-start">
              <article className="w-full bg-[#181c21]/85 backdrop-blur-xl rounded-xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_24px_rgba(0,217,255,0.08)] border border-[#3c494d]/40 relative group transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_32px_rgba(0,217,255,0.18)]">
                {/* Top HUD Edge Bar */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#272a30] text-[#00d9ff] font-['Lexend'] text-xs font-bold shadow-inner">
                      01
                    </span>
                    <span className="font-['Lexend'] text-xs uppercase tracking-widest text-[#00d9ff] font-semibold">
                      PHASE 01 // THE PROBLEM
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-['Lexend'] text-[#ffdeaa]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffbb2a]" />
                    <span>SURFACE BOTTLENECK</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-['Space_Grotesk'] text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#e0e2ea] mb-3 leading-snug">
                  Flood Maps Tell You Where. <br className="hidden sm:inline" />
                  <span className="text-[#bbc9ce] font-medium">Not Where To Go.</span>
                </h3>

                {/* Body */}
                <p className="font-['Metrophobic'] text-sm sm:text-base text-[#bbc9ce] leading-relaxed mb-6">
                  During Mumbai's monsoon, static flood maps show water on a screen — they don't tell an ambulance driver which street is actually still passable. HydroPulse closes that gap: real-time, flood-aware routing instead of a picture of the problem.
                </p>

                {/* Diagnostic Coordinate Terminal Box */}
                <div className="bg-[#0b0e13]/90 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-['Lexend'] text-[#bbc9ce] border border-[#3c494d]/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00d9ff] text-[18px]">crisis_alert</span>
                    <span>TARGET REF: <span className="text-[#e0e2ea] font-semibold">HINDMATA_JUNCTION</span></span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span>ELEV: <span className="text-[#afecff] font-bold">+3.2M</span></span>
                    <span>STATUS: <span className="text-[#ffb4ab] font-bold">IMPASSABLE (&gt;0.45m)</span></span>
                  </div>
                </div>

                {/* Corner Accent Decals */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#00d9ff]/80 rounded-tl" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#00d9ff]/80 rounded-br" />
              </article>
            </div>

            {/* Center Node Connector */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center z-20">
              <div className="w-8 h-8 rounded-full bg-[#0b0e13] border border-[#00d9ff]/40 flex items-center justify-center shadow-[0_0_16px_rgba(0,217,255,0.4)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00d9ff]" />
              </div>
            </div>

            {/* Right Telemetry Console */}
            <div className="lg:col-span-6 hidden lg:flex flex-col justify-center pl-8 text-[#859398] pointer-events-none select-none">
              <div className="p-6 rounded-xl bg-[#0b0e13]/60 border border-[#3c494d]/30 max-w-sm ml-auto space-y-2">
                <div className="flex justify-between font-['Lexend'] text-[10px] tracking-widest text-[#859398] uppercase">
                  <span>TEL // STREAM 0x1A</span>
                  <span>GEO_ZONE: DOWNTOWN_SOUTH</span>
                </div>
                <div className="h-1 w-full bg-[#272a30] rounded overflow-hidden">
                  <div className="h-full bg-[#00d9ff] w-2/3" />
                </div>
                <p className="font-['JetBrains_Mono',monospace] text-xs text-[#bbc9ce]/80 tracking-tight leading-relaxed pt-1">
                  &gt; STATIC_RASTER_INGEST: 100%<br />
                  &gt; ADAPTIVE_DYNAMIC_REROUTE: REQUIRED<br />
                  &gt; VECTOR_DRIFT: ZERO TOLERANCE
                </p>
              </div>
            </div>
          </div>

          {/* ================= PHASE 02 : RIGHT ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 relative">
            {/* Left Telemetry Console */}
            <div className="lg:col-span-6 hidden lg:flex flex-col justify-center pr-8 text-[#859398] pointer-events-none select-none order-2 lg:order-1">
              <div className="p-6 rounded-xl bg-[#0b0e13]/60 border border-[#3c494d]/30 max-w-sm space-y-2">
                <div className="flex justify-between font-['Lexend'] text-[10px] tracking-widest text-[#859398] uppercase">
                  <span>DATASET INTEGRITY // HASH 9F20B</span>
                  <span>SRTM 30m / LULC 10m</span>
                </div>
                <div className="h-1 w-full bg-[#272a30] rounded overflow-hidden">
                  <div className="h-full bg-[#b7c4ff] w-full" />
                </div>
                <p className="font-['JetBrains_Mono',monospace] text-xs text-[#bbc9ce]/80 tracking-tight leading-relaxed pt-1">
                  &gt; TOPOLOGICAL_CROSSCHECK: PASS (11/11)<br />
                  &gt; CONDUIT_MANHOLE_MATCH: SYNCHRONIZED<br />
                  &gt; HYDROGRAPHIC_SLOPE: COMPUTED
                </p>
              </div>
            </div>

            {/* Center Node Connector */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center z-20">
              <div className="w-8 h-8 rounded-full bg-[#0b0e13] border border-[#00d9ff]/40 flex items-center justify-center shadow-[0_0_16px_rgba(0,217,255,0.4)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00d9ff]" />
              </div>
            </div>

            {/* Card Right Column */}
            <div className="lg:col-span-6 flex justify-end order-1 lg:order-2">
              <article className="w-full bg-[#181c21]/85 backdrop-blur-xl rounded-xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_24px_rgba(0,217,255,0.08)] border border-[#3c494d]/40 relative group transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_32px_rgba(0,217,255,0.18)]">
                {/* Top HUD Edge Bar */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#272a30] text-[#00d9ff] font-['Lexend'] text-xs font-bold shadow-inner">
                      02
                    </span>
                    <span className="font-['Lexend'] text-xs uppercase tracking-widest text-[#00d9ff] font-semibold">
                      PHASE 02 // REAL GEOSPATIAL DATA
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-['Lexend'] text-[#b7c4ff]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b7c4ff]" />
                    <span>GEO_VALIDATED</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-['Space_Grotesk'] text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#e0e2ea] mb-3 leading-snug">
                  Built On The Actual City, <br className="hidden sm:inline" />
                  <span className="text-[#bbc9ce] font-medium">Not A Guess.</span>
                </h3>

                {/* Body */}
                <p className="font-['Metrophobic'] text-sm sm:text-base text-[#bbc9ce] leading-relaxed mb-6">
                  Road network, elevation, and drainage topology extracted directly from OpenStreetMap and DEM terrain data for Mumbai, then validated end-to-end before any simulation runs on it.
                </p>

                {/* Stat Callouts (Two side-by-side tactical blocks) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0b0e13]/90 rounded-lg p-4 border border-[#3c494d]/30 shadow-sm">
                    <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#afecff] tracking-tight">
                      41,804
                    </div>
                    <div className="font-['Lexend'] text-[11px] tracking-wider text-[#859398] uppercase mt-1">
                      Network Nodes
                    </div>
                    <div className="mt-2 text-[11px] font-['Lexend'] text-[#bbc9ce] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#00d9ff] text-[15px]">alt_route</span>
                      <span>Intersections &amp; Culverts</span>
                    </div>
                  </div>

                  <div className="bg-[#0b0e13]/90 rounded-lg p-4 border border-[#3c494d]/30 shadow-sm">
                    <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#00d9ff] tracking-tight">
                      11 / 11
                    </div>
                    <div className="font-['Lexend'] text-[11px] tracking-wider text-[#859398] uppercase mt-1">
                      Datasets Validated
                    </div>
                    <div className="mt-2 text-[11px] font-['Lexend'] text-[#b7c4ff] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">verified</span>
                      <span>Zero Broken Topology</span>
                    </div>
                  </div>
                </div>

                {/* Corner Accent Decals */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#00d9ff]/80 rounded-tl" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#00d9ff]/80 rounded-br" />
              </article>
            </div>
          </div>

          {/* ================= PHASE 03 : LEFT ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 relative">
            {/* Card Left Column */}
            <div className="lg:col-span-6 flex justify-start">
              <article className="w-full bg-[#181c21]/85 backdrop-blur-xl rounded-xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_24px_rgba(0,217,255,0.08)] border border-[#3c494d]/40 relative group transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_32px_rgba(0,217,255,0.18)]">
                {/* Top HUD Edge Bar */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#272a30] text-[#00d9ff] font-['Lexend'] text-xs font-bold shadow-inner">
                      03
                    </span>
                    <span className="font-['Lexend'] text-xs uppercase tracking-widest text-[#00d9ff] font-semibold">
                      PHASE 03 // PHYSICS-BASED SIMULATION
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-['Lexend'] text-[#00d9ff]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00d9ff] animate-pulse" />
                    <span>HYDRAULIC CORE ACTIVE</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-['Space_Grotesk'] text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#e0e2ea] mb-3 leading-snug">
                  500 Storms, <br className="hidden sm:inline" />
                  <span className="text-[#bbc9ce] font-medium">Simulated With Real Hydraulics.</span>
                </h3>

                {/* Body */}
                <p className="font-['Metrophobic'] text-sm sm:text-base text-[#bbc9ce] leading-relaxed mb-6">
                  Every scenario runs through EPA-SWMM's dynamic wave hydraulic solver using Rational Method rainfall-runoff physics — not a shortcut model. Latin Hypercube Sampling spans everything from light drizzle to extreme cloudburst intensity.
                </p>

                {/* Stat Callouts */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0b0e13]/90 rounded-lg p-4 border border-[#3c494d]/30 shadow-sm">
                    <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#afecff] tracking-tight">
                      500
                    </div>
                    <div className="font-['Lexend'] text-[11px] tracking-wider text-[#859398] uppercase mt-1">
                      Simulated Storms
                    </div>
                    <div className="mt-2 text-[11px] font-['Lexend'] text-[#bbc9ce] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#00d9ff] text-[15px]">cyclone</span>
                      <span>Latin Hypercube Dist</span>
                    </div>
                  </div>

                  <div className="bg-[#0b0e13]/90 rounded-lg p-4 border border-[#3c494d]/30 shadow-sm">
                    <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#ffdeaa] tracking-tight">
                      5–150 <span className="text-xs font-['Lexend'] font-normal text-[#859398]">MM/HR</span>
                    </div>
                    <div className="font-['Lexend'] text-[11px] tracking-wider text-[#859398] uppercase mt-1">
                      Precip Range
                    </div>
                    <div className="mt-2 text-[11px] font-['Lexend'] text-[#ffdeaa] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">water_drop</span>
                      <span>Drizzle to Cloudburst</span>
                    </div>
                  </div>
                </div>

                {/* Corner Accent Decals */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#00d9ff]/80 rounded-tl" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#00d9ff]/80 rounded-br" />
              </article>
            </div>

            {/* Center Node Connector */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center z-20">
              <div className="w-8 h-8 rounded-full bg-[#0b0e13] border border-[#00d9ff]/40 flex items-center justify-center shadow-[0_0_16px_rgba(0,217,255,0.4)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00d9ff]" />
              </div>
            </div>

            {/* Right Telemetry Console */}
            <div className="lg:col-span-6 hidden lg:flex flex-col justify-center pl-8 text-[#859398] pointer-events-none select-none">
              <div className="p-6 rounded-xl bg-[#0b0e13]/60 border border-[#3c494d]/30 max-w-sm ml-auto space-y-2">
                <div className="flex justify-between font-['Lexend'] text-[10px] tracking-widest text-[#859398] uppercase">
                  <span>SOLVER: ST. VENANT EQUATIONS</span>
                  <span>TIME_STEP: 1.0s</span>
                </div>
                {/* Miniature Hydrology Curve SVG */}
                <div className="py-2">
                  <svg className="w-full h-10 overflow-visible" viewBox="0 0 200 40">
                    <path
                      d="M 0 35 Q 40 33, 70 20 T 110 5 T 150 28 T 200 32"
                      fill="none"
                      stroke="#afecff"
                      strokeWidth="2"
                    />
                    <path
                      d="M 0 35 Q 40 33, 70 20 T 110 5 T 150 28 T 200 32 L 200 40 L 0 40 Z"
                      fill="#00d9ff"
                      fillOpacity="0.12"
                    />
                  </svg>
                </div>
                <p className="font-['JetBrains_Mono',monospace] text-xs text-[#bbc9ce]/80 tracking-tight leading-relaxed">
                  &gt; CONVERGENCE_RATE: 99.98%<br />
                  &gt; HYDROGRAPH_PEAK_OFFSET: +14m<br />
                  &gt; BACKWATER_EFFECT: COMPUTED
                </p>
              </div>
            </div>
          </div>

          {/* ================= PHASE 04 : RIGHT ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 relative">
            {/* Left Telemetry Console */}
            <div className="lg:col-span-6 hidden lg:flex flex-col justify-center pr-8 text-[#859398] pointer-events-none select-none order-2 lg:order-1">
              <div className="p-6 rounded-xl bg-[#0b0e13]/60 border border-[#3c494d]/30 max-w-sm space-y-2">
                <div className="flex justify-between font-['Lexend'] text-[10px] tracking-widest text-[#859398] uppercase">
                  <span>NEURAL ENGINE // GNN-EDGE-04</span>
                  <span>ONNX RUNTIME</span>
                </div>
                <div className="h-1 w-full bg-[#272a30] rounded overflow-hidden">
                  <div className="h-full bg-[#00d9ff] animate-pulse w-full" />
                </div>
                <p className="font-['JetBrains_Mono',monospace] text-xs text-[#bbc9ce]/80 tracking-tight leading-relaxed pt-1">
                  &gt; GRAPH_ATTENTION_LAYERS: 6<br />
                  &gt; EDGE_WEIGHT_CONV: REALTIME<br />
                  &gt; DISPATCH_RESPONSE: OPTIMAL
                </p>
              </div>
            </div>

            {/* Center Node Connector */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center z-20">
              <div className="w-8 h-8 rounded-full bg-[#0b0e13] border border-[#00d9ff]/40 flex items-center justify-center shadow-[0_0_16px_rgba(0,217,255,0.4)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00d9ff]" />
              </div>
            </div>

            {/* Card Right Column */}
            <div className="lg:col-span-6 flex justify-end order-1 lg:order-2">
              <article className="w-full bg-[#181c21]/85 backdrop-blur-xl rounded-xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_24px_rgba(0,217,255,0.08)] border border-[#3c494d]/40 relative group transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_32px_rgba(0,217,255,0.18)]">
                {/* Top HUD Edge Bar */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#272a30] text-[#00d9ff] font-['Lexend'] text-xs font-bold shadow-inner">
                      04
                    </span>
                    <span className="font-['Lexend'] text-xs uppercase tracking-widest text-[#00d9ff] font-semibold">
                      PHASE 04 // LEARNING TO PREDICT
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-['Lexend'] text-[#afecff]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00d9ff]" />
                    <span>INFERENCE READY</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-['Space_Grotesk'] text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#e0e2ea] mb-3 leading-snug">
                  A Graph Neural Network <br className="hidden sm:inline" />
                  <span className="text-[#bbc9ce] font-medium">That Learned The City's Behavior.</span>
                </h3>

                {/* Body */}
                <p className="font-['Metrophobic'] text-sm sm:text-base text-[#bbc9ce] leading-relaxed mb-6">
                  Trained on the full simulation dataset, the model predicts street-level flood risk in milliseconds — fast enough to power live routing decisions instead of waiting on a fresh multi-minute physics simulation for every query.
                </p>

                {/* Single Stat Callout */}
                <div className="bg-[#0b0e13]/90 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#3c494d]/30 shadow-sm">
                  <div className="flex flex-col">
                    <span className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold text-[#00d9ff] tracking-tight">
                      &lt; 4.2 MS
                    </span>
                    <span className="font-['Lexend'] text-[11px] tracking-wider text-[#859398] uppercase mt-1">
                      Millisecond Inference Latency
                    </span>
                  </div>
                  <div className="sm:text-right border-t sm:border-t-0 border-[#3c494d]/30 pt-2 sm:pt-0 w-full sm:w-auto">
                    <span className="inline-flex items-center gap-1.5 text-xs font-['Lexend'] text-[#b7c4ff] px-3 py-1.5 rounded bg-[#272a30]/80 border border-[#b7c4ff]/30">
                      <span className="material-symbols-outlined text-[16px]">bolt</span>
                      A* ROUTE COMPATIBLE
                    </span>
                  </div>
                </div>

                {/* Corner Accent Decals */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#00d9ff]/80 rounded-tl" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#00d9ff]/80 rounded-br" />
              </article>
            </div>
          </div>
        </div>

        {/* Bottom Pipeline Endcap CTA / Telemetry Summary Box */}
        <div className="mt-16 w-full max-w-4xl mx-auto rounded-xl bg-[#181c21]/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_24px_rgba(0,217,255,0.06)] border border-[#00d9ff]/30 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-['Lexend'] text-[#00d9ff]">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span className="font-semibold uppercase tracking-widest">PIPELINE INTEGRITY: VERIFIED</span>
            </div>
            <h4 className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-[#e0e2ea]">
              Explore Mumbai Sector In The Live Simulator
            </h4>
            <p className="font-['Metrophobic'] text-xs sm:text-sm text-[#bbc9ce] max-w-md leading-relaxed">
              Inject rainfall scenarios or test active emergency route queries against the validated GNN engine.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={handleLaunchClick}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00d9ff] text-[#001f26] font-['Lexend'] text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(0,217,255,0.4)] hover:bg-[#afecff] transition-all duration-200 cursor-pointer group"
            >
              <span>Launch Live Demo</span>
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});
