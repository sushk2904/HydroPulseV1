import React, { memo, useState, useEffect, useRef } from 'react';
import { fetchModelStatus } from '../services/modelApi';

export const TacticalNavbar = memo(function TacticalNavbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [modelOnline, setModelOnline] = useState(true);

  useEffect(() => {
    fetchModelStatus().then((data) => {
      setModelOnline(data.status.includes('ONLINE'));
    });
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e14]/95 border-b border-slate-800/60">
      {/* Scroll Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-900/60 overflow-hidden">
        <div
          className="h-full bg-slate-400/50 transition-transform duration-75 ease-out origin-left"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#/';
            }}
            className="flex items-center gap-2.5 group"
          >
            {/* Simple icon */}
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                <path d="M16 5C13 10 9 14.8 9 18.5C9 22.64 12.13 26 16 26C19.87 26 23 22.64 23 18.5C23 14.8 19 10 16 5Z" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="16" cy="16.5" r="1.8" fill="#94a3b8" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] text-sm tracking-wide font-semibold text-slate-100 group-hover:text-white transition-colors">
                HydroPulse
              </span>
              <span className="text-[10px] font-mono text-slate-500 tracking-wide">
                Mumbai Dispatch
              </span>
            </div>
          </a>

          {/* Model Status — minimal */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/50 border border-slate-700/40 text-[10px] font-mono text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${modelOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            <span>ST-GNN {modelOnline ? 'Active' : 'Standby'}</span>
            <span className="text-slate-600">·</span>
            <span>SWMM 5.2</span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <a
            href="#query-grid"
            onClick={scrollToSection('query-grid')}
            className="flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-slate-200 transition-colors tracking-wide px-3 py-1.5 rounded-md hover:bg-slate-800/50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">grid_view</span>
            <span>Grid</span>
          </a>
          <a
            href="#query-grid"
            onClick={scrollToSection('query-grid')}
            className="flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-slate-200 transition-colors tracking-wide px-3 py-1.5 rounded-md hover:bg-slate-800/50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">alt_route</span>
            <span>Routes</span>
          </a>
          <a
            href="#catchment-telemetry"
            onClick={scrollToSection('catchment-telemetry')}
            className="flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-slate-200 transition-colors tracking-wide px-3 py-1.5 rounded-md hover:bg-slate-800/50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">water_drop</span>
            <span>Telemetry</span>
          </a>
        </nav>

        {/* Right: Back + Profile */}
        <div className="flex items-center gap-2.5">
          {/* Back to Story */}
          <button
            onClick={() => {
              window.location.hash = '#/';
            }}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 text-slate-400 hover:text-slate-200 font-mono text-[11px] tracking-wide transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span className="hidden sm:inline">Back to Story</span>
          </button>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              type="button"
              className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-slate-300 font-mono text-xs font-medium">
                SV
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-slate-200">S. Varma</span>
              </div>
              <span className="material-symbols-outlined text-[14px] text-slate-500">
                {profileOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-[#0d1117] rounded-lg border border-slate-700/60 shadow-lg p-2 z-50">
                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2 mb-2 px-2">
                  <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-sm text-slate-300">
                    SV
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200 text-xs">Capt. S. Varma</span>
                    <span className="text-[10px] text-slate-500 font-mono">varma.ops@bmc.gov.in</span>
                  </div>
                </div>

                <div className="space-y-0.5 text-xs">
                  <button type="button" className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors text-left cursor-pointer">
                    <span className="material-symbols-outlined text-[15px]">settings</span>
                    <span>Settings</span>
                  </button>
                  <button type="button" className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors text-left cursor-pointer">
                    <span className="material-symbols-outlined text-[15px]">help_outline</span>
                    <span>Help & Support</span>
                  </button>
                  <div className="h-px bg-slate-800 my-1" />
                  <button type="button" className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors text-left cursor-pointer">
                    <span className="material-symbols-outlined text-[15px]">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});
