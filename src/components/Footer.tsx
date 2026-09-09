import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#030708] border-t border-white/[0.06] py-16 px-6 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        <div className="space-y-1 text-center md:text-left">
          <span className="font-mono text-[12px] font-bold text-white/60 tracking-wider">
            HYDRO-NOWCAST // SIH 26085
          </span>
          <p className="text-[12px] text-white/25 font-mono">
            Urban Flood Nowcasting System — 301-frame scrollytelling digital twin.
          </p>
        </div>

        <div className="flex items-center gap-8 font-mono text-[11px] text-white/25">
          <span>GSAP ScrollTrigger</span>
          <span>Lenis Smooth Scroll</span>
          <span>React + TypeScript</span>
        </div>

      </div>
    </footer>
  );
};
