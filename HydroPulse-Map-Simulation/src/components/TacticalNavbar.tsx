import React, { memo, useState, useEffect, useRef } from 'react';
import { ProfileModal, AuthUser } from '@/components/ProfileModal';

export const TacticalNavbar = memo(function TacticalNavbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Restore session from stored JWT
  useEffect(() => {
    const token = localStorage.getItem('hydropulse_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Session expired');
          return res.json();
        })
        .then((data) => {
          setCurrentUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem('hydropulse_token');
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hydropulse_token');
    setCurrentUser(null);
    setProfileOpen(false);
    setShowProfileModal(false);
    window.location.hash = '#/';
  };

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

  return (
    <>
      <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: 'rgba(6, 10, 16, 0.45)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Scroll Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white/[0.04] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 shadow-[0_0_8px_rgba(0,217,255,0.8)] transition-transform duration-75 ease-out origin-left"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3.5">
          <a
            href="#query-grid"
            onClick={(e) => {
              e.preventDefault();
              const elem = document.getElementById('query-grid');
              if (elem) {
                elem.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            {/* Sleek glass icon */}
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center group-hover:border-cyan-400/70 group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_12px_rgba(0,217,255,0.4)] transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-4.5 h-4.5" fill="none">
                <path d="M16 5C13 10 9 14.8 9 18.5C9 22.64 12.13 26 16 26C19.87 26 23 22.64 23 18.5C23 14.8 19 10 16 5Z" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="16" cy="16.5" r="1.8" fill="#38bdf8" />
              </svg>
            </div>
            <span className="font-['Space_Grotesk'] text-sm tracking-wider font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-white transition-all">
              HydroPulse
            </span>
          </a>
        </div>

        {/* Center: Sleek Navigation Links Pill */}
        <nav
          className="hidden md:flex items-center gap-1 px-1.5 py-1 rounded-full border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.3)]"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <a
            href="#query-grid"
            onClick={scrollToSection('query-grid')}
            className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300 hover:text-cyan-300 transition-all duration-200 tracking-wider uppercase px-3 py-1 rounded-full hover:bg-white/[0.08] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px] text-cyan-400">grid_view</span>
            <span>Grid</span>
          </a>
          <a
            href="#tactical-2d-map"
            onClick={scrollToSection('tactical-2d-map')}
            className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300 hover:text-emerald-300 transition-all duration-200 tracking-wider uppercase px-3 py-1 rounded-full hover:bg-white/[0.08] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px] text-emerald-400">alt_route</span>
            <span>Routes</span>
          </a>
          <a
            href="#catchment-telemetry"
            onClick={scrollToSection('catchment-telemetry')}
            className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300 hover:text-blue-300 transition-all duration-200 tracking-wider uppercase px-3 py-1 rounded-full hover:bg-white/[0.08] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px] text-blue-400">water_drop</span>
            <span>Telemetry</span>
          </a>
        </nav>

        {/* Right: User Profile Capsule */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                type="button"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(0,217,255,0.12),inset_0_1px_0_0_rgba(255,255,255,0.1)] group"
                style={{
                  backgroundColor: 'rgba(12, 18, 28, 0.65)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400/40 flex items-center justify-center text-cyan-50 font-mono text-[11px] font-bold shadow-[0_0_8px_rgba(0,217,255,0.4)]">
                  {currentUser.name
                    ? currentUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'OP'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                    {currentUser.name}
                  </span>
                </div>
                <span
                  className="material-symbols-outlined text-[14px] text-cyan-400 transition-transform duration-200"
                  style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  expand_more
                </span>
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl border border-cyan-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(0,217,255,0.15)] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    backgroundColor: 'rgba(10, 15, 23, 0.85)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  }}
                >
                  <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-2.5 mb-2 px-1.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400/50 flex items-center justify-center font-mono text-sm text-cyan-100 font-bold shadow-[0_0_10px_rgba(0,217,255,0.4)]">
                      {currentUser.name
                        ? currentUser.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                        : 'OP'}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold text-slate-100 text-xs truncate">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono truncate">
                        {currentUser.email}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-cyan-300 hover:text-white hover:bg-cyan-500/15 transition-colors text-left cursor-pointer font-mono"
                    >
                      <span className="material-symbols-outlined text-[16px]">account_circle</span>
                      <span>Operator Profile & Password</span>
                    </button>
                    <div className="h-px bg-white/[0.08] my-1" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors text-left cursor-pointer font-mono"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                window.location.hash = '#/';
              }}
              type="button"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/50 text-cyan-300 font-mono text-[11px] font-semibold tracking-wider transition-all duration-200 shadow-[0_0_12px_rgba(0,217,255,0.25)] hover:shadow-[0_0_20px_rgba(0,217,255,0.45)] cursor-pointer"
            >
              <span>SIGN IN</span>
            </button>
          )}
        </div>
      </div>
    </header>

    {/* Operator Profile Modal */}
    <ProfileModal
      isOpen={showProfileModal}
      onClose={() => setShowProfileModal(false)}
      user={currentUser}
      onUpdateUser={(updated) => setCurrentUser(updated)}
      onLogout={handleLogout}
    />
  </>
);
});
