import React, { memo, useState, useEffect, useRef } from 'react';
import { fetchModelStatus } from '../services/modelApi';

export const TacticalNavbar = memo(function TacticalNavbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

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
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#070a0f]/75 backdrop-blur-2xl border-b border-[#00d9ff]/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      {/* Dynamic Scroll Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-900/80 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#00d9ff] via-[#5B7FFF] to-[#00FF66] shadow-[0_0_10px_#00d9ff] transition-transform duration-75 ease-out origin-left"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Left: Brand / System Identity */}
        <div className="flex items-center gap-4">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center p-0.5 border border-cyan-400/40 bg-[#0A0E14] group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,217,255,0.25)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                className="w-full h-full"
                fill="none"
              >
                <rect width="32" height="32" rx="8" fill="#0A0E14" />
                <path
                  d="M16 5C13 10 9 14.8 9 18.5C9 22.64 12.13 26 16 26C19.87 26 23 22.64 23 18.5C23 14.8 19 10 16 5Z"
                  stroke="#00d9ff"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 19.5C12.5 21.2 14 22.5 16 22.5"
                  stroke="#5B7FFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="16" cy="16.5" r="1.8" fill="#00d9ff" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-sm tracking-[0.2em] font-bold text-slate-100 group-hover:text-cyan-300 transition-colors uppercase">
                  HYDROPULSE
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/30 rounded tracking-wider font-semibold">
                  LIVE OPS
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 tracking-wider">
                MUMBAI DISPATCH // SECTOR-04
              </span>
            </div>
          </a>

          {/* Operational Status Pill */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#10151f]/80 border border-[#00d9ff]/20 text-[10px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse shadow-[0_0_8px_#00FF66]" />
            <span className="text-cyan-400">ST-GNN MODEL:</span>
            <span className="text-slate-200">{modelOnline ? 'SYNCED (27.6k PARAMS)' : 'STANDBY'}</span>
            <span className="text-slate-600">|</span>
            <span className="text-[#00FF66]">SWMM 5.2:</span>
            <span className="text-slate-200">1D/2D ACTIVE</span>
          </div>
        </div>

        {/* Center: Tactical Quick Links */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#query-grid"
            onClick={scrollToSection('query-grid')}
            className="flex items-center gap-1.5 font-mono text-xs text-slate-300 hover:text-cyan-400 transition-colors tracking-wider uppercase cursor-pointer py-1 px-2 rounded hover:bg-cyan-950/30"
          >
            <span className="material-symbols-outlined text-[15px] text-[#00d9ff]">grid_view</span>
            <span>Tactical Grid</span>
          </a>
          <a
            href="#query-grid"
            onClick={scrollToSection('query-grid')}
            className="flex items-center gap-1.5 font-mono text-xs text-slate-300 hover:text-cyan-400 transition-colors tracking-wider uppercase cursor-pointer py-1 px-2 rounded hover:bg-cyan-950/30"
          >
            <span className="material-symbols-outlined text-[15px] text-[#00FF66]">alt_route</span>
            <span>Route Engine</span>
          </a>
          <a
            href="#catchment-telemetry"
            onClick={scrollToSection('catchment-telemetry')}
            className="flex items-center gap-1.5 font-mono text-xs text-slate-300 hover:text-cyan-400 transition-colors tracking-wider uppercase cursor-pointer py-1 px-2 rounded hover:bg-cyan-950/30"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-400">water_drop</span>
            <span>Catchment Sensors</span>
          </a>
        </nav>

        {/* Right: Notification Alerts + User Profile HUD */}
        <div className="flex items-center gap-3">
          {/* Notification Alert Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              type="button"
              className="relative p-2 rounded-lg bg-[#111722]/80 hover:bg-[#1a2333] border border-[#00d9ff]/20 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer shadow-sm"
              title="Active Flood Alerts"
            >
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF2A4D] animate-ping" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF2A4D]" />
            </button>

            {/* Notification Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0c1017]/95 backdrop-blur-2xl rounded-xl border border-cyan-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.8)] p-3 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-[#3c494d]/40 pb-2 mb-2 font-mono">
                  <span className="font-bold text-slate-200 tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A4D]" />
                    ACTIVE INCIDENTS (3)
                  </span>
                  <span className="text-[10px] text-cyan-400">REALTIME</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-[#181c21]/90 border border-red-500/30">
                    <div className="flex justify-between font-semibold text-red-300 text-[11px]">
                      <span>KURLA // BKC JUNCTION</span>
                      <span className="text-red-400 font-mono">98% CRIT</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Water level: 2.95m. Rerouting required.</p>
                  </div>
                  <div className="p-2 rounded bg-[#181c21]/90 border border-amber-500/30">
                    <div className="flex justify-between font-semibold text-amber-300 text-[11px]">
                      <span>DADAR TT // HINDMATA</span>
                      <span className="text-amber-400 font-mono">78% ELEV</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Slow drainage reported. Flow 64.1 m³/s.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Glass Badge with Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              type="button"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg bg-[#111722]/80 hover:bg-[#182130] border border-cyan-500/25 hover:border-cyan-400/50 transition-all cursor-pointer group shadow-[0_0_15px_rgba(0,217,255,0.1)]"
            >
              {/* User Avatar with Cyber Frame */}
              <div className="relative">
                <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-600 to-[#00FF66] p-0.5 flex items-center justify-center text-[#05070A] font-bold text-xs shadow-md">
                  <div className="w-full h-full bg-[#0b0f17] rounded-[5px] flex items-center justify-center text-cyan-300 font-mono text-xs">
                    SV
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00FF66] ring-1 ring-[#070a0f]" />
              </div>

              {/* User Name & Tactical Role */}
              <div className="hidden sm:flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-['Space_Grotesk'] text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    Capt. S. Varma
                  </span>
                  <span className="material-symbols-outlined text-[13px] text-slate-400 group-hover:text-cyan-300 transition-transform">
                    {profileOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[#00d9ff]/80 tracking-wider">
                  DISPATCH CHIEF // ID-904
                </span>
              </div>
            </button>

            {/* Profile Menu Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0a0e16]/95 backdrop-blur-2xl rounded-xl border border-cyan-500/30 shadow-[0_16px_50px_rgba(0,0,0,0.85)] p-3 z-50 animate-in fade-in slide-in-from-top-2">
                {/* User Info Header */}
                <div className="flex items-center gap-3 border-b border-[#3c494d]/40 pb-2.5 mb-2.5">
                  <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-mono text-sm text-cyan-300 font-bold">
                    SV
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-100 text-xs">Capt. S. Varma</span>
                    <span className="text-[10px] text-cyan-400 font-mono">varma.ops@bmc.gov.in</span>
                    <span className="text-[9px] text-slate-400 font-mono">CLEARANCE: LEVEL-4 TACTICAL</span>
                  </div>
                </div>

                {/* Tactical Actions Menu */}
                <div className="space-y-1 font-mono text-xs">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-cyan-400">admin_panel_settings</span>
                    <span>Dispatcher Console</span>
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#00FF66]">settings_input_antenna</span>
                    <span>IoT Sensor Feeds</span>
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber-400">emergency</span>
                    <span>Broadcast SOS Vector</span>
                  </button>
                  <div className="h-[1px] bg-[#3c494d]/40 my-1.5" />
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors text-left cursor-pointer font-semibold"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Lock Station / Logout</span>
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
