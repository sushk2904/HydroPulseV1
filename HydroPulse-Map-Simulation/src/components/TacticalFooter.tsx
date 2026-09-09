import React, { memo } from 'react';

export const TacticalFooter = memo(function TacticalFooter() {
  return (
    <footer className="relative w-full mt-8 bg-[#0b0e13]/95 backdrop-blur-xl border-t border-[#3c494d]/40 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
      <div className="h-12 w-full max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between font-['Lexend'] text-xs tracking-wider">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00d9ff] animate-pulse shadow-[0_0_8px_#00d9ff]" />
            <span className="text-[#00d9ff] uppercase font-bold">SYS // ACTIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[#859398]">
            <span className="text-[#bbc9ce]">LAT/LON:</span>
            <span>19.0760° N, 72.8777° E [BOM-METRO]</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[#859398]">
            <span className="text-[#bbc9ce]">SWMM-CORE:</span>
            <span className="text-[#afecff] font-semibold">ONLINE // CALIBRATED</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[#859398]">
          <span className="hidden sm:inline text-[#bbc9ce]">PRECIP LEVEL:</span>
          <span className="text-[#ffdeaa] font-bold">ELEVATED (MONSOON T1)</span>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="material-symbols-outlined text-[#00d9ff] text-[16px]">radar</span>
            <span className="text-[#afecff] font-bold">STREAM OK</span>
          </div>
        </div>
      </div>
    </footer>
  );
});
