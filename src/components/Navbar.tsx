import React from 'react';

interface NavbarProps {
  onLaunchSimulation?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLaunchSimulation }) => {
  const handleLaunch = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLaunchSimulation) {
      onLaunchSimulation();
    } else {
      window.location.hash = '#/simulation';
    }
  };

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      {/* Centered Expanded Pill / Capsule Navbar with VisionOS Glass Finish */}
      <div
        className="flex items-center gap-3 md:gap-4 px-6 py-2.5 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.03) 100%)',
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Brand Name */}
        <a
          href="#/"
          onClick={(e) => { e.preventDefault(); window.location.hash = '#/'; }}
          className="font-mono text-[11px] font-bold tracking-[0.22em] text-white uppercase pr-1 hover:opacity-80 transition-opacity cursor-pointer"
        >
          HYDROPULSE
        </a>

        {/* Vertical subtle divider */}
        <span className="h-4 w-[1px] bg-white/20" />

        {/* Navigation Buttons + Primary Simulation Launcher */}
        <nav className="flex items-center gap-1.5">
          <a
            href="#about"
            className="px-3 py-1.5 rounded-full font-mono text-[10px] md:text-[11px] font-medium tracking-[0.16em] text-white/65 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            NOWCAST STORY
          </a>

          {/* Quick-Switch Toggle to Simulation */}
          <button
            onClick={handleLaunch}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-[10px] md:text-[11px] font-semibold tracking-[0.16em] bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-400/30 hover:border-cyan-400 transition-all duration-200 shadow-[0_0_15px_rgba(0,217,255,0.25)] cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>3D SIMULATION</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
