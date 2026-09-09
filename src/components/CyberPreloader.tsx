import React from 'react';
import { FrameLoadState } from '../types/scrollytelling';

interface CyberPreloaderProps {
  loadState: FrameLoadState;
}

export const CyberPreloader: React.FC<CyberPreloaderProps> = ({ loadState }) => {
  const { loadedFrames, totalFrames, progressPercentage, statusMessage } = loadState;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#030708] text-white p-8 md:p-16 font-sans selection:bg-[#00FF87] selection:text-[#030708]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00FF87] animate-pulse" />
          <span className="font-mono text-xs tracking-widest text-slate-400 uppercase font-semibold">
            HYDRO-NOWCAST // SIH 26085
          </span>
        </div>
        <span className="font-mono text-xs text-slate-400 tracking-widest uppercase">
          RAM CACHE INGESTION
        </span>
      </div>

      {/* Main Massive Percentage & Hero Title */}
      <div className="max-w-5xl mx-auto w-full my-auto space-y-6 text-center md:text-left">
        <span className="text-xs md:text-sm font-mono tracking-widest text-[#00FF87] uppercase font-semibold block">
          Drainage-Coupled 1D/2D Digital Twin
        </span>

        <h1 className="text-4xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-none">
          Urban Flood Intelligence
        </h1>

        <div className="pt-6 flex flex-col md:flex-row md:items-baseline justify-between gap-6">
          <div className="font-mono text-7xl md:text-9xl font-black tracking-tighter text-white">
            {Math.round(progressPercentage)}
            <span className="text-4xl md:text-6xl text-[#00FF87]">%</span>
          </div>

          <div className="font-mono text-sm text-slate-400 space-y-1">
            <div className="text-white font-bold text-base">
              {loadedFrames} / {totalFrames} FRAMES CACHED
            </div>
            <p className="text-emerald-400/90 text-xs tracking-wider uppercase">
              {statusMessage}
            </p>
          </div>
        </div>

        {/* Minimal Hairline Progress Line */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-8">
          <div
            className="h-full bg-[#00FF87] transition-all duration-150 ease-out shadow-[0_0_15px_#00FF87]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Bottom Footer Metadata */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-6 border-t border-white/10">
        <span>SWMM 5.2 &bull; POSTGIS DEM</span>
        <span>HIGH PERFORMANCE CANVAS ENGINE</span>
      </div>
    </div>
  );
};
