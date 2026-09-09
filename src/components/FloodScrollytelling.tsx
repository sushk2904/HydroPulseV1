import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { HydraulicHUD } from './HydraulicHUD';
import { BreakoutDashboard } from './BreakoutDashboard';
import { TelemetryMetrics } from '../types/scrollytelling';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 301;

export const FloodScrollytelling: React.FC = () => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);

  const getTelemetryMetrics = useCallback((progress: number): TelemetryMetrics => {
    if (progress <= 0.25) {
      return {
        phase: 'clouds',
        phaseTitle: 'ATMOSPHERIC FORCING',
        phaseSubheading: 'Heavy Convective Cloud Mass',
        rainIntensity: '82.4 mm/hr',
        radarReflectivity: '52.4 dBZ',
        atmosphericStatus: 'EXTREME INFLOW',
        conduitId: 'SWMM-PIPE-09',
        conduitCapacity: '42.1%',
        flowVelocity: '1.2 m/s',
        hydraulicGrade: '+0.4m HGL',
        nodeStatus: 'NORMAL INFLOW',
        nodeId: '#MH-104',
        inundationDepth: '0 cm',
        evacStatus: 'STANDBY',
        riskLevel: 'NORMAL',
      };
    } else if (progress <= 0.60) {
      return {
        phase: 'conduit',
        phaseTitle: 'CONDUIT PRESSURIZATION',
        phaseSubheading: 'Subterranean Storm Culvert Flow',
        rainIntensity: '94.1 mm/hr',
        radarReflectivity: '58.0 dBZ',
        atmosphericStatus: 'TORRENTIAL DOWNPOUR',
        conduitId: 'SWMM-PIPE-09',
        conduitCapacity: '94.2%',
        flowVelocity: '3.4 m/s',
        hydraulicGrade: '+2.8m HGL',
        nodeStatus: 'CAPACITY THRESHOLD',
        nodeId: '#MH-104',
        inundationDepth: '+14 cm',
        evacStatus: 'WARNING ISSUED',
        riskLevel: 'WARNING',
      };
    } else {
      return {
        phase: 'surcharge',
        phaseTitle: 'SURCHARGE INUNDATION',
        phaseSubheading: 'Submerged Street & Urban Backflow',
        rainIntensity: '112.0 mm/hr',
        radarReflectivity: '64.2 dBZ',
        atmosphericStatus: 'MAXIMUM SURCHARGE',
        conduitId: 'SWMM-PIPE-09',
        conduitCapacity: '100% OVERFLOW',
        flowVelocity: '4.8 m/s',
        hydraulicGrade: '+4.2m HGL',
        nodeStatus: 'SURCHARGE DETECTED',
        nodeId: '#MH-104',
        inundationDepth: '+46 cm',
        evacStatus: 'CALCULATING...',
        riskLevel: 'CRITICAL',
      };
    }
  }, []);

  const telemetryMetrics = getTelemetryMetrics(scrollProgress);

  // Canvas render — object-fit: cover math using getBoundingClientRect
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    // Use the actual rendered size of the canvas element
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (w === 0 || h === 0) return;

    // Set buffer resolution (high DPI)
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Object-fit: cover
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const canvasAspect = w / h;
    const imgAspect = imgW / imgH;

    let dw: number, dh: number, dx: number, dy: number;
    if (canvasAspect > imgAspect) {
      dw = w;
      dh = w / imgAspect;
      dx = 0;
      dy = (h - dh) / 2;
    } else {
      dh = h;
      dw = h * imgAspect;
      dx = (w - dw) / 2;
      dy = 0;
    }

    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  // Progressive frame loading
  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let loaded = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const padded = String(i).padStart(4, '0');
      const webpPath = `/sequence/frame_${padded}.webp`;
      const jpgPath = `/sequence/frame_${padded}.jpg`;

      img.onload = () => {
        if (cancelled) return;
        loaded++;
        setLoadProgress(loaded / TOTAL_FRAMES);
        if (i - 1 === currentFrameRef.current) {
          renderFrame(i - 1);
        }
        if (loaded === 1) {
          renderFrame(i - 1);
        }
      };

      img.onerror = () => {
        if (img.src.includes('.webp')) {
          img.src = jpgPath;
          return;
        }
        if (cancelled) return;
        loaded++;
        setLoadProgress(loaded / TOTAL_FRAMES);
      };

      img.src = webpPath;
      images[i - 1] = img;
    }

    imagesRef.current = images;
    return () => { cancelled = true; };
  }, [renderFrame]);

  // Lenis + ScrollTrigger
  useEffect(() => {
    if (!containerRef.current) return;

    // Give the DOM a frame to settle before rendering
    requestAnimationFrame(() => renderFrame(0));

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);
    const tickerCb = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const progress = self.progress;
        setScrollProgress(progress);

        const frameIdx = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
        );

        currentFrameRef.current = frameIdx;
        setCurrentFrameIndex(frameIdx);
        requestAnimationFrame(() => renderFrame(frameIdx));
      },
    });

    const onResize = () => {
      requestAnimationFrame(() => renderFrame(currentFrameRef.current));
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      st.kill();
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
    };
  }, [renderFrame]);

  return (
    <div style={{ position: 'relative', background: '#1a1a1a' }}>
      {/* Scroll container — 700vh for cinematic pacing */}
      <div
        ref={containerRef}
        style={{ position: 'relative', height: '1150vh' }}
      >
        {/* Sticky viewport — stays pinned while scrolling through 500vh */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          {/* Canvas — fills the entire sticky viewport */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />

          {/* HUD — inside sticky so it pins with the canvas */}
          <HydraulicHUD
            metrics={telemetryMetrics}
            scrollProgress={scrollProgress}
            currentFrame={currentFrameIndex}
            totalFrames={TOTAL_FRAMES}
          />

          {/* Loading bar */}
          {loadProgress < 1 && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              background: 'rgba(255,255,255,0.05)',
              zIndex: 40,
            }}>
              <div style={{
                height: '100%',
                background: '#00FF87',
                opacity: 0.7,
                transition: 'width 200ms',
                width: `${loadProgress * 100}%`,
              }} />
            </div>
          )}
          
          {/* Bottom fade overlay for seamless transition to BreakoutDashboard */}
          <div 
            style={{
              position: 'absolute',
              bottom: -1, // -1 to prevent pixel rounding gaps
              left: 0,
              right: 0,
              height: '25vh',
              background: 'linear-gradient(to bottom, transparent 0%, #1a1a1a 100%)',
              pointerEvents: 'none',
              zIndex: 30,
            }}
          />
        </div>
      </div>

      <BreakoutDashboard />
    </div>
  );
};
