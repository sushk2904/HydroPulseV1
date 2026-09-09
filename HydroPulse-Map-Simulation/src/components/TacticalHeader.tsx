import React, { memo } from 'react';

export const TacticalHeader = memo(function TacticalHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1.5 border-b border-slate-800/60 pb-2.5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <div className="flex items-center gap-2">
          <h1 className="font-['Space_Grotesk'] text-base sm:text-lg md:text-xl font-semibold tracking-tight text-slate-100">
            Query The Grid
          </h1>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/30 text-[10px] font-mono text-emerald-400 font-medium">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>
        <span className="text-slate-500 text-[11px] hidden md:inline">
          Real-time flood-aware routing across Mumbai's CartoDEM topological grid
        </span>
      </div>
    </div>
  );
});

export default TacticalHeader;
