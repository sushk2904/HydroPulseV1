import React, { memo } from 'react';

export const TacticalHeader = memo(function TacticalHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1.5 border-b border-slate-800/60 pb-2.5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <div className="flex items-center gap-2">
          <h1 className="font-['Space_Grotesk'] text-base sm:text-lg md:text-xl font-semibold tracking-tight text-slate-100">
            Grid Map
          </h1>
        </div>
      </div>
    </div>
  );
});

export default TacticalHeader;
