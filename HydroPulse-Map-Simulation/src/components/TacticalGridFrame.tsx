import React, { useRef, useState, useCallback, useEffect, memo } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { GridSkeletonScene } from './GridSkeletonScene';

interface TacticalGridFrameProps {
  stormIntensity: number;
  routeActive: boolean;
  activeRoute?: any;
}

export const TacticalGridFrame = memo(function TacticalGridFrame({
  stormIntensity,
  routeActive,
  activeRoute,
}: TacticalGridFrameProps) {
  const targetProgressRef = useRef<number>(0.0);
  const currentProgressRef = useRef<number>(0.0);
  const isAutoPlayingRef = useRef<boolean>(false);
  const [hasDived, setHasDived] = useState<boolean>(false);

  // DOM & Three.js Refs
  const frameRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const coordReadoutRef = useRef<HTMLSpanElement>(null);
  const inundationStatusRef = useRef<HTMLSpanElement>(null);

  const handleDiveComplete = useCallback(() => {
    setHasDived(true);
  }, []);

  // PREVENT WEBPAGE FROM SCROLLING ON MOUSE WHEEL OVER THE 3D MAP BOX
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    let isOverFrame = false;

    const handleMouseEnter = () => {
      isOverFrame = true;
    };
    const handleMouseLeave = () => {
      isOverFrame = false;
    };

    const handleWindowWheel = (e: WheelEvent) => {
      if (isOverFrame) {
        // Prevent default browser scrolling without blocking OrbitControls
        e.preventDefault();
      }
    };

    frame.addEventListener('mouseenter', handleMouseEnter);
    frame.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('wheel', handleWindowWheel, { passive: false, capture: true });

    return () => {
      frame.removeEventListener('mouseenter', handleMouseEnter);
      frame.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('wheel', handleWindowWheel, { capture: true });
    };
  }, []);

  // Viewport capture wheel listener as secondary guarantee
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onCanvasWheel = (e: WheelEvent) => {
      e.preventDefault();
      // If user scrolls inside frame while still viewing globe, smoothly trigger the dive!
      if (!hasDived && targetProgressRef.current < 0.70) {
        targetProgressRef.current = 0.70;
      }
    };
    el.addEventListener('wheel', onCanvasWheel, { passive: false, capture: true });
    return () => {
      el.removeEventListener('wheel', onCanvasWheel, { capture: true });
    };
  }, [hasDived]);

  // Real-time mouse coordinate tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewportRef.current || !coordReadoutRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const yRatio = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const lat = (19.269 - yRatio * (19.269 - 18.992)).toFixed(4);
    const lon = (72.773 + xRatio * (72.981 - 72.773)).toFixed(4);

    coordReadoutRef.current.innerHTML = `LAT: <span class="text-[#afecff] font-semibold">${lat}° N</span>  LON: <span class="text-[#afecff] font-semibold">${lon}° E</span>`;
  };

  const handleMouseLeave = () => {
    if (coordReadoutRef.current) {
      coordReadoutRef.current.innerHTML = `LAT: <span class="text-[#afecff] font-semibold">19.0760° N</span>  LON: <span class="text-[#afecff] font-semibold">72.8777° E</span>`;
    }
  };

  // Zero-rerender telemetry update directly manipulating DOM
  const handleTelemetryUpdate = useCallback((p: number) => {
    if (inundationStatusRef.current) {
      inundationStatusRef.current.textContent =
        p >= 0.65 ? 'SURGE SIMULATION: ACTIVE' : 'SURGE SIMULATION: STANDBY';
      inundationStatusRef.current.className =
        p >= 0.65 ? 'text-[#00d9ff] font-semibold' : 'text-[#859398]';
    }
  }, []);


  return (
    <div ref={frameRef} className="w-full flex flex-col font-['Lexend']">
      {/* 3D Viewport Frame with Cyber Glass Styling */}
      <div className="relative bg-[#0b0e13]/90 backdrop-blur-xl rounded-xl border border-[#00d9ff]/25 shadow-[0_4px_24px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
        {/* Futuristic Tactical Corner Brackets */}
        <div className="pointer-events-none absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00d9ff] z-30" />
        <div className="pointer-events-none absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00d9ff] z-30" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00d9ff] z-30" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00d9ff] z-30" />

        {/* Minimal Tactical Header Strip */}
        <div className="px-3 py-2 bg-[#12161c]/90 border-b border-[#3c494d]/40 flex items-center justify-between z-20 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d9ff] animate-ping" />
            <span className="font-bold text-[#e0e2ea] tracking-wider uppercase font-['Space_Grotesk'] text-[11px]">
              Tactical Grid Viewport
            </span>
            <span className="text-[#3c494d]">|</span>
            <span ref={inundationStatusRef} className="text-[#859398]">
              SURGE SIMULATION: STANDBY
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[9px]">
            <span ref={coordReadoutRef} className="text-[#859398] tracking-wider">
              LAT: <span className="text-[#afecff] font-semibold">19.0760° N</span>  LON: <span className="text-[#afecff] font-semibold">72.8777° E</span>
            </span>
          </div>
        </div>

        {/* Main 3D Canvas Viewport (Fixed Height) */}
        <div
          ref={viewportRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full h-[470px] sm:h-[490px] bg-[#05070a] overflow-hidden"
        >
          {/* Embedded 3D Canvas Scene */}
          <div className="absolute inset-0 w-full h-full">
            <GridSkeletonScene
              targetProgressRef={targetProgressRef}
              currentProgressRef={currentProgressRef}
              isAutoPlayingRef={isAutoPlayingRef}
              onTelemetryUpdate={handleTelemetryUpdate}
              stormIntensity={stormIntensity}
              routeActive={routeActive}
              activeRoute={activeRoute}
              externalControlsRef={controlsRef}
              hasDived={hasDived}
              onDiveComplete={handleDiveComplete}
            />
          </div>

          {/* Floating Map Legend (Tactical Glass Pill) */}
          <div className="absolute bottom-2.5 left-3 z-20 bg-[#0b0e13]/90 backdrop-blur-md px-2.5 py-1 rounded border border-[#3c494d]/50 flex items-center gap-2.5 font-['Lexend'] text-[9px] shadow-lg pointer-events-none">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] shadow-[0_0_5px_#00FF66]" />
              <span className="text-[#e0e2ea] tracking-wide">SAFE ROUTE</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_5px_#FFD700]" />
              <span className="text-[#e0e2ea] tracking-wide">NODE</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A4D] shadow-[0_0_5px_#FF2A4D]" />
              <span className="text-[#e0e2ea] tracking-wide">FULL / SURGE</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF] shadow-[0_0_5px_#00D9FF]" />
              <span className="text-[#e0e2ea] tracking-wide">GRID CITY</span>
            </div>
          </div>

          {/* Tactical Compass Rose Overlay (Bottom Right) */}
          <div className="absolute bottom-2.5 right-3 z-20 pointer-events-none flex flex-col items-center justify-center w-8 h-8 rounded-full border border-[#3c494d]/40 bg-[#0b0e13]/70 backdrop-blur-sm text-[8px] font-['Lexend'] text-[#859398] shadow-md">
            <span className="text-[#00d9ff] font-bold text-[8px]">N</span>
            <div className="w-2.5 h-[1px] bg-[#00d9ff]/50 my-0.2" />
            <span className="text-[6px] text-[#afecff]">GRID</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TacticalGridFrame;
