import React, { memo } from 'react';

export const TacticalHeader = memo(function TacticalHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1 border-b border-[#3c494d]/30 pb-1.5 relative">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00d9ff] animate-ping" />
          <h1 className="font-['Space_Grotesk'] text-base sm:text-lg md:text-xl font-bold tracking-tight text-[#e0e2ea] uppercase leading-none">
            Query The Grid
          </h1>
        </div>
        <span className="font-['Lexend'] text-[9px] sm:text-[10px] text-[#00d9ff] font-semibold tracking-wider">
          [ LIVE INFERENCE ENGINE ]
        </span>
        <span className="font-['Metrophobic'] text-[#859398] text-[10px] sm:text-[11px] hidden md:inline">
          — Real-time flood-aware routing across Mumbai's CartoDEM topological grid
        </span>
      </div>
    </div>
  );
});

export default TacticalHeader;
