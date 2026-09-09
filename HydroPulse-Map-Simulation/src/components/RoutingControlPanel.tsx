import React, { useState, memo } from 'react';
import { MUMBAI_LOCATIONS, MumbaiLocation } from '../services/mumbaiLocations';
import { DynamicRouteResult } from '../services/routingService';
import { SectorWeatherData } from '../services/weatherService';

interface RoutingControlPanelProps {
  weatherData: SectorWeatherData | null;
  routeActive: boolean;
  activeRoute: DynamicRouteResult | null;
  originLoc: MumbaiLocation;
  destLoc: MumbaiLocation;
  onSelectOrigin: (loc: MumbaiLocation) => void;
  onSelectDest: (loc: MumbaiLocation) => void;
  onCalculateRoute: () => void;
  onTogglePinMode?: (type: 'origin' | 'dest') => void;
}

export const RoutingControlPanel = memo(function RoutingControlPanel({
  weatherData,
  routeActive,
  activeRoute,
  originLoc,
  destLoc,
  onSelectOrigin,
  onSelectDest,
  onCalculateRoute,
  onTogglePinMode,
}: RoutingControlPanelProps) {
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculateClick = async () => {
    setIsCalculating(true);
    try {
      await onCalculateRoute();
    } finally {
      setTimeout(() => setIsCalculating(false), 300);
    }
  };

  const handlePresetSelect = (origId: string, destId: string) => {
    const orig = MUMBAI_LOCATIONS.find((l) => l.id === origId);
    const dest = MUMBAI_LOCATIONS.find((l) => l.id === destId);
    if (orig) onSelectOrigin(orig);
    if (dest) onSelectDest(dest);
  };

  return (
    <div className="h-full min-h-[470px] sm:min-h-[490px] flex flex-col font-['Lexend']">
      {/* ROUTING PARAMETERS (Glassmorphism HUD Card - Full Space) */}
      <div className="relative flex-1 bg-[#090d15]/92 backdrop-blur-2xl rounded-xl border border-cyan-500/25 p-3.5 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col justify-between">
        {/* Futuristic Cyber Corner Accents */}
        <div className="pointer-events-none absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00d9ff] z-10" />
        <div className="pointer-events-none absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00d9ff] z-10" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00d9ff] z-10" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00d9ff] z-10" />

        {/* Top Section */}
        <div>
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-[#3c494d]/35 pb-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00d9ff] text-[18px]">tune</span>
              <h2 className="text-xs tracking-[0.16em] uppercase font-bold text-slate-100 font-['Space_Grotesk']">
                Multi-Route Tactical Engine
              </h2>
            </div>
          </div>

          {/* Quick Preset Route Selectors */}
          <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-[9px]">
            <span className="text-slate-400 text-[8px] uppercase tracking-wider shrink-0">PRESETS:</span>
            <button
              type="button"
              onClick={() => handlePresetSelect('bandra-west', 'seepz-andheri')}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer shrink-0 ${
                originLoc.id === 'bandra-west' && destLoc.id === 'seepz-andheri'
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                  : 'bg-[#141b27] text-slate-300 hover:text-cyan-300 border-slate-700/60'
              }`}
            >
              Bandra ➔ SEEPZ
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('colaba-nariman', 'bkc-financial')}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer shrink-0 ${
                originLoc.id === 'colaba-nariman' && destLoc.id === 'bkc-financial'
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                  : 'bg-[#141b27] text-slate-300 hover:text-cyan-300 border-slate-700/60'
              }`}
            >
              South Coast ➔ BKC
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('dadar-tt', 'powai-iit')}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer shrink-0 ${
                originLoc.id === 'dadar-tt' && destLoc.id === 'powai-iit'
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                  : 'bg-[#141b27] text-slate-300 hover:text-cyan-300 border-slate-700/60'
              }`}
            >
              Dadar ➔ Powai
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('airport-t2', 'borivali-west')}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer shrink-0 ${
                originLoc.id === 'airport-t2' && destLoc.id === 'borivali-west'
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                  : 'bg-[#141b27] text-slate-300 hover:text-cyan-300 border-slate-700/60'
              }`}
            >
              Airport ➔ Borivali
            </button>
          </div>

          {/* Parameter Fields */}
          <div className="space-y-2.5">
            {/* Field 1: Start Location Selector */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] uppercase tracking-wider text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00d9ff]" />
                  ORIGIN [START SECTOR]
                </span>
                <span className="text-cyan-400 font-semibold">{originLoc.elevationM}m AMSL</span>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-2.5 text-cyan-400 text-[16px] pointer-events-none">
                  trip_origin
                </span>
                <select
                  value={originLoc.id}
                  onChange={(e) => {
                    const found = MUMBAI_LOCATIONS.find((l) => l.id === e.target.value);
                    if (found) onSelectOrigin(found);
                  }}
                  className="w-full bg-[#111722]/90 border border-[#3c494d]/60 focus:border-[#00d9ff] focus:ring-1 focus:ring-[#00d9ff]/30 focus:outline-none rounded-lg px-2.5 py-1.5 pl-8 pr-12 text-[11px] text-slate-100 transition-all font-mono appearance-none cursor-pointer"
                >
                  {MUMBAI_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id} className="bg-[#0f141d] text-slate-200">
                      {loc.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onTogglePinMode && onTogglePinMode('origin')}
                  className="absolute right-1.5 px-2 py-0.5 bg-[#1e2736] hover:bg-cyan-900/60 rounded text-[9px] text-cyan-300 transition-colors border border-cyan-500/25 font-mono cursor-pointer"
                  title="Click on map to pin custom origin"
                >
                  MAP PIN
                </button>
              </div>
            </div>

            {/* Field 2: Destination Selector */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] uppercase tracking-wider text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_6px_#00FF66]" />
                  TARGET [DESTINATION SECTOR]
                </span>
                <span className="text-[#00FF66] font-semibold">{destLoc.elevationM}m AMSL</span>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-2.5 text-[#00FF66] text-[16px] pointer-events-none">
                  location_on
                </span>
                <select
                  value={destLoc.id}
                  onChange={(e) => {
                    const found = MUMBAI_LOCATIONS.find((l) => l.id === e.target.value);
                    if (found) onSelectDest(found);
                  }}
                  className="w-full bg-[#111722]/90 border border-[#3c494d]/60 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 focus:outline-none rounded-lg px-2.5 py-1.5 pl-8 pr-12 text-[11px] text-slate-100 transition-all font-mono appearance-none cursor-pointer"
                >
                  {MUMBAI_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id} className="bg-[#0f141d] text-slate-200">
                      {loc.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onTogglePinMode && onTogglePinMode('dest')}
                  className="absolute right-1.5 px-2 py-0.5 bg-[#1e2736] hover:bg-emerald-900/60 rounded text-[9px] text-[#00FF66] transition-colors border border-[#00FF66]/25 font-mono cursor-pointer"
                  title="Click on map to pin custom destination"
                >
                  MAP PIN
                </button>
              </div>
            </div>

            {/* Real-time Sector Rainfall & Meteorological Intelligence Card (Calculated automatically per location) */}
            {weatherData && (
              <div className="p-2.5 bg-[#101724]/95 rounded-lg border border-cyan-500/35 font-mono text-[9px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-amber-400 text-[15px] animate-pulse">
                      thunderstorm
                    </span>
                    SECTOR REAL-TIME PRECIPITATION FEED
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded border text-[9px] ${
                      weatherData.surgeLevel === 'HEAVY SURGE'
                        ? 'text-red-300 bg-red-950/70 border-red-500/50'
                        : weatherData.surgeLevel === 'HIGH ALERT'
                        ? 'text-amber-300 bg-amber-950/70 border-amber-500/50'
                        : 'text-cyan-300 bg-cyan-950/70 border-cyan-500/50'
                    }`}
                  >
                    {weatherData.rainIntensityMmHr} MM/HR [{weatherData.surgeLevel}]
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300 text-[8.5px] border-t border-slate-700/40 pt-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">DOPPLER RADAR:</span>
                    <span className="text-cyan-300 font-semibold">{weatherData.dopplerRadarDbz} dBZ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">BAROMETER:</span>
                    <span className="text-slate-200 font-semibold">{weatherData.barometricPressureHpa} hPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">HUMIDITY:</span>
                    <span className="text-cyan-300 font-semibold">{weatherData.relativeHumidityPct}% RH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">WIND VECTOR:</span>
                    <span className="text-amber-300 font-semibold">{weatherData.windSpeedKmh} km/h {weatherData.windDirection}</span>
                  </div>
                </div>

                <div className="text-[8px] text-cyan-400/80 tracking-tight pt-0.5 truncate flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#00FF66] animate-ping" />
                  <span>AUTONOMOUS LOCAL METEOROLOGY // LIVE SECTOR RADAR SYNCED</span>
                </div>
              </div>
            )}

            {/* Live Model Corridor Telemetry Grid */}
            {activeRoute && (
              <div className="mt-1.5 p-2 bg-[#121824]/90 rounded-lg border border-[#3c494d]/40 font-mono text-[9px]">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-700/40 pb-1 mb-1">
                  <span className="flex items-center gap-1 text-cyan-300 font-bold">
                    <span className="material-symbols-outlined text-[13px]">alt_route</span>
                    ST-GNN COMPUTED SAFE VECTOR
                  </span>
                  <span className="text-[#00FF66] font-semibold">
                    PASSABILITY: {activeRoute.safeRoute.passability}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300 text-[8.5px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">DISTANCE:</span>
                    <span className="text-cyan-300 font-semibold">{activeRoute.safeRoute.distanceKm} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">EST. TIME:</span>
                    <span className="text-[#00FF66] font-semibold">{activeRoute.safeRoute.durationMin} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ELEVATION GAIN:</span>
                    <span className="text-amber-300 font-semibold">+{activeRoute.safeRoute.elevationGainM}m AMSL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">HAZARDS BYPASS:</span>
                    <span className="text-[#00FF66] font-semibold">{activeRoute.safeRoute.hazardsBypassedCount} Nodes</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions & Status */}
        <div className="mt-2.5 pt-2 border-t border-[#3c494d]/35">
          {/* Primary Action CTA Button */}
          <button
            onClick={handleCalculateClick}
            disabled={isCalculating}
            type="button"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#00d9ff] to-[#00FF66] hover:from-[#5ce5ff] hover:to-[#42ff8b] text-[#05070A] font-bold text-xs uppercase tracking-[0.14em] rounded-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,217,255,0.45)] hover:shadow-[0_0_28px_rgba(0,255,102,0.6)] transition-all transform active:scale-[0.98] disabled:opacity-80 cursor-pointer font-mono"
          >
            {isCalculating ? (
              <>
                <span>CALCULATING ST-GNN SAFE VECTOR...</span>
                <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">navigation</span>
                <span>{routeActive ? 'RE-CALCULATE ROUTE' : 'CALCULATE SAFE VECTOR'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>

          {/* Integrated Bottom Model Telemetry Badge */}
          <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d9ff] animate-pulse" />
              <span>MODEL: <span className="text-cyan-300 font-semibold">ST-GAT-GRU (27.6k)</span></span>
            </div>
            <div className="flex items-center gap-2.5">
              <span>ROUTING: <span className="text-slate-200 font-bold">OSRM REAL ROAD</span></span>
              <span>STATUS: <span className="text-[#00FF66] font-bold">NOMINAL</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default RoutingControlPanel;
