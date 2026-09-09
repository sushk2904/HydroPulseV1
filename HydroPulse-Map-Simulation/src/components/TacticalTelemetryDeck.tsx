import React, { memo, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export interface DispatchHistoryItem {
  id: string;
  timestamp: string;
  origin: string;
  destination: string;
  stormIntensity: number;
  status: 'COMPLETED' | 'REROUTED' | 'DIRECT';
  statusLabel: string;
  hazardsBypassed: number;
  estTime: string;
  elevationClearance: string;
  routeSector: string;
}

interface TacticalTelemetryDeckProps {
  refreshKey?: number;
  onReplayVector?: (item: DispatchHistoryItem) => void;
}

export const TacticalTelemetryDeck = memo(function TacticalTelemetryDeck({
  refreshKey = 0,
  onReplayVector,
}: TacticalTelemetryDeckProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<DispatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'REROUTED' | 'COMPLETED' | 'DIRECT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch live per-user history from backend
  useEffect(() => {
    const token = localStorage.getItem('hydropulse_token');
    if (!token) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch('/api/routes/history', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch history');
        return res.json();
      })
      .then((data) => {
        setHistory(data.history || []);
      })
      .catch(() => {
        setHistory([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [refreshKey]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      // 1. Header Reveal on Scroll
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // 2. Staggered History Cards Reveal
      if (cardsRef.current && cardsRef.current.children.length > 0) {
        const cards = cardsRef.current.children;
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    },
    { scope: sectionRef, dependencies: [history.length] }
  );

  const filteredHistory = history.filter((item) => {
    if (filter !== 'ALL' && item.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.origin.toLowerCase().includes(q) ||
        item.destination.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <section
      ref={sectionRef}
      id="catchment-telemetry"
      className="relative w-full bg-[#070a0f] py-10 px-4 sm:px-6 lg:px-8 border-t border-[#00d9ff]/20 text-[#e0e2ea] font-['Lexend']"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* 1. Header Section */}
        <div ref={headerRef} className="flex flex-col gap-3 border-b border-[#3c494d]/30 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 uppercase">
                Real-Time User Dispatch & Incident Route Archive
              </h2>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {(['ALL', 'REROUTED', 'COMPLETED', 'DIRECT'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1 rounded-md text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
                    filter === cat
                      ? 'bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/50 font-bold'
                      : 'bg-[#111722]/60 text-slate-400 border border-transparent hover:text-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'ALL VECTORS' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-2.5 top-1.5 text-slate-500 text-[16px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search origin, destination, or log ID..."
                className="w-full bg-[#111722]/80 border border-[#3c494d]/50 focus:border-[#00d9ff] focus:outline-none rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 2. Grid Matrix or Empty State */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center font-mono">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
            <span className="text-xs text-slate-400 tracking-wider">RETRIEVING OPERATOR TELEMETRY ARCHIVE...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 px-6 rounded-2xl bg-[#0b0f17]/60 border border-slate-800 flex flex-col items-center justify-center text-center max-w-xl mx-auto shadow-inner">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(0,217,255,0.15)]">
              <span className="material-symbols-outlined text-2xl">history_toggle_off</span>
            </div>
            <h3 className="text-base font-bold font-mono tracking-wide text-slate-200 mb-1">
              NO DISPATCH LOGS ARCHIVED YET
            </h3>
            <p className="text-xs text-slate-400 font-mono leading-relaxed max-w-md mb-6">
              Configure your origin and destination in the Command Deck above and calculate safe routes. All simulated emergency dispatches will automatically be logged and archived here for your account.
            </p>
            <button
              onClick={() => {
                const grid = document.getElementById('query-grid');
                if (grid) grid.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-semibold tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">navigation</span>
              <span>CALCULATE ROUTE IN COMMAND DECK</span>
            </button>
          </div>
        ) : (
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="relative bg-[#0b0f17]/90 backdrop-blur-xl rounded-xl border border-cyan-500/20 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col justify-between hover:border-cyan-400/50 transition-all group"
              >
                {/* Corner Accents */}
                <div className="pointer-events-none absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#00d9ff]/60" />
                <div className="pointer-events-none absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#00d9ff]/60" />

                <div>
                  {/* Log Header */}
                  <div className="flex items-center justify-between border-b border-[#3c494d]/30 pb-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
                        {item.id}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {item.timestamp}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider ${
                        item.status === 'REROUTED'
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                          : item.status === 'COMPLETED'
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                          : 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Route Vector Details */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-cyan-400 text-[14px] mt-0.5">
                        trip_origin
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-slate-400 font-mono">ORIGIN</span>
                        <span className="text-xs font-semibold text-slate-200 leading-tight">
                          {item.origin}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#00FF66] text-[14px] mt-0.5">
                        location_on
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-slate-400 font-mono">DESTINATION</span>
                        <span className="text-xs font-semibold text-slate-200 leading-tight">
                          {item.destination}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metric Strip */}
                  <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-[#111722]/80 border border-[#3c494d]/30 text-[9px] font-mono mb-3">
                    <div>
                      <span className="text-slate-500 block">STORM SURGE</span>
                      <span className="text-amber-400 font-bold">{item.stormIntensity} mm/h</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">HAZARDS</span>
                      <span className="text-[#00FF66] font-bold">{item.hazardsBypassed} BYPASSED</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">EST. DURATION</span>
                      <span className="text-cyan-300 font-bold">{item.estTime}</span>
                    </div>
                  </div>
                </div>

                {/* Action Strip */}
                <div className="flex items-center justify-between pt-2 border-t border-[#3c494d]/30 text-[9px] font-mono text-slate-400">
                  <span className="truncate pr-2">SECTOR: {item.routeSector}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onReplayVector) {
                        onReplayVector(item);
                      } else {
                        const grid = document.getElementById('query-grid');
                        if (grid) grid.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 transition-colors flex items-center gap-1 cursor-pointer font-semibold shrink-0"
                  >
                    <span>REPLAY</span>
                    <span className="material-symbols-outlined text-[11px]">redo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

export default TacticalTelemetryDeck;
