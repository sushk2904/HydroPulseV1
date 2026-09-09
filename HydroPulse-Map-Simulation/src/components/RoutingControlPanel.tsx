import React, { useState, memo } from 'react';
import { MUMBAI_LOCATIONS, MUMBAI_FLOOD_HOTSPOTS, MumbaiLocation } from '../services/mumbaiLocations';
import { DynamicRouteResult, AlgorithmLogEntry } from '../services/routingService';
import { SectorWeatherData } from '../services/weatherService';

interface RoutingControlPanelProps {
  weatherData: SectorWeatherData | null;
  routeActive: boolean;
  activeRoute: DynamicRouteResult | null;
  originLoc: MumbaiLocation;
  destLoc: MumbaiLocation;
  stormIntensity: number;
  flashFloodedNodes: string[];
  algorithmLog: AlgorithmLogEntry[];
  lastRecalcMs: number;
  modelUsed: boolean;
  onSelectOrigin: (loc: MumbaiLocation) => void;
  onSelectDest: (loc: MumbaiLocation) => void;
  onCalculateRoute: () => void;
  onIntensityChange: (value: number, immediate?: boolean) => void;
  onFlashFlood: (nodeId: string) => void;
  onRandomFlashFlood: () => void;
  onClearFlashFloods: () => void;
  onTogglePinMode?: (type: 'origin' | 'dest') => void;
  pinMode?: 'none' | 'origin' | 'dest';
}

const INTENSITY_PRESETS = [
  { label: '10 mm/hr', value: 10, desc: 'Light' },
  { label: '50 mm/hr', value: 50, desc: 'Moderate' },
  { label: '100 mm/hr', value: 100, desc: 'Heavy' },
  { label: '150+ mm/hr', value: 155, desc: '2005 Level' },
];

const ROUTE_PRESETS = [
  { origId: 'bandra-west', destId: 'seepz-andheri', label: 'Bandra → SEEPZ' },
  { origId: 'colaba-nariman', destId: 'bkc-financial', label: 'South Coast → BKC' },
  { origId: 'dadar-tt', destId: 'powai-iit', label: 'Dadar → Powai' },
  { origId: 'airport-t2', destId: 'borivali-west', label: 'Airport → Borivali' },
];

export const RoutingControlPanel = memo(function RoutingControlPanel({
  weatherData,
  routeActive,
  activeRoute,
  originLoc,
  destLoc,
  stormIntensity,
  flashFloodedNodes,
  algorithmLog,
  lastRecalcMs,
  modelUsed,
  onSelectOrigin,
  onSelectDest,
  onCalculateRoute,
  onIntensityChange,
  onFlashFlood,
  onRandomFlashFlood,
  onClearFlashFloods,
  onTogglePinMode,
  pinMode = 'none',
}: RoutingControlPanelProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAlgoLog, setShowAlgoLog] = useState(true);

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

  // Surge level color
  const getSurgeColor = (level: string) => {
    switch (level) {
      case 'HEAVY SURGE': return 'text-red-400 bg-red-950/40';
      case 'HIGH ALERT': return 'text-amber-300 bg-amber-950/40';
      case 'MODERATE MONSOON': return 'text-blue-300 bg-blue-950/40';
      default: return 'text-slate-300 bg-slate-800/40';
    }
  };

  const logStatusIcon = (status: AlgorithmLogEntry['status']) => {
    switch (status) {
      case 'success': return '✓';
      case 'warn': return '⚠';
      case 'error': return '✗';
      case 'info': return '●';
    }
  };

  const logStatusColor = (status: AlgorithmLogEntry['status']) => {
    switch (status) {
      case 'success': return 'text-emerald-400';
      case 'warn': return 'text-amber-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-slate-400';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-[#0d1117] rounded-xl border border-slate-800/60 p-4 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-8rem)] scrollbar-none">

        {/* ──────── PANEL HEADER ──────── */}
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
          <h2 className="text-sm font-semibold text-slate-100 font-['Space_Grotesk']">
            Route Configuration
          </h2>
        </div>

        {/* ──────── ROUTE PRESETS ──────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-slate-500 font-medium shrink-0">Presets:</span>
          {ROUTE_PRESETS.map((p) => {
            const isActive = originLoc.id === p.origId && destLoc.id === p.destId;
            return (
              <button
                key={p.origId}
                type="button"
                onClick={() => handlePresetSelect(p.origId, p.destId)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* ──────── ORIGIN / DESTINATION ──────── */}
        <div className="space-y-2.5">
          {/* Origin */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Origin
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-slate-500 text-[16px] pointer-events-none">
                trip_origin
              </span>
              <select
                value={originLoc.id}
                onChange={(e) => {
                  const found = MUMBAI_LOCATIONS.find((l) => l.id === e.target.value);
                  if (found) onSelectOrigin(found);
                }}
                className="w-full bg-slate-800/60 border border-slate-700/60 focus:border-blue-500 focus:outline-none rounded-lg px-2.5 py-2 pl-8 pr-20 text-xs text-slate-100 transition-colors appearance-none cursor-pointer"
              >
                {MUMBAI_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id} className="bg-[#0d1117] text-slate-200">
                    {loc.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onTogglePinMode && onTogglePinMode('origin')}
                className={`absolute right-1.5 px-2 py-1 rounded text-[10px] transition-colors font-medium cursor-pointer ${
                  pinMode === 'origin'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-700/60 hover:bg-slate-600/60 text-slate-300'
                }`}
                title="Click on map to pin custom origin"
              >
                {pinMode === 'origin' ? 'Click Map…' : 'Pin on Map'}
              </button>
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Destination
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-slate-500 text-[16px] pointer-events-none">
                location_on
              </span>
              <select
                value={destLoc.id}
                onChange={(e) => {
                  const found = MUMBAI_LOCATIONS.find((l) => l.id === e.target.value);
                  if (found) onSelectDest(found);
                }}
                className="w-full bg-slate-800/60 border border-slate-700/60 focus:border-emerald-500 focus:outline-none rounded-lg px-2.5 py-2 pl-8 pr-20 text-xs text-slate-100 transition-colors appearance-none cursor-pointer"
              >
                {MUMBAI_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id} className="bg-[#0d1117] text-slate-200">
                    {loc.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onTogglePinMode && onTogglePinMode('dest')}
                className={`absolute right-1.5 px-2 py-1 rounded text-[10px] transition-colors font-medium cursor-pointer ${
                  pinMode === 'dest'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-700/60 hover:bg-slate-600/60 text-slate-300'
                }`}
                title="Click on map to pin custom destination"
              >
                {pinMode === 'dest' ? 'Click Map…' : 'Pin on Map'}
              </button>
            </div>
          </div>
        </div>

        {/* ──────── DYNAMIC WEATHER CONTROLS ──────── */}
        <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-slate-400">cloud</span>
              Rainfall Intensity
            </span>
            <span className={`font-semibold px-2 py-0.5 rounded-md text-[10px] ${weatherData ? getSurgeColor(weatherData.surgeLevel) : 'text-slate-400'}`}>
              {stormIntensity} mm/hr{weatherData ? ` — ${weatherData.surgeLevel}` : ''}
            </span>
          </div>

          {/* Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono w-4 shrink-0">0</span>
            <input
              type="range"
              min={0}
              max={200}
              step={1}
              value={stormIntensity}
              onChange={(e) => onIntensityChange(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full appearance-none bg-slate-700 cursor-pointer accent-blue-500
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-mono w-8 shrink-0 text-right">200</span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {INTENSITY_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onIntensityChange(preset.value, true)}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                  stormIntensity === preset.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Weather Metrics Grid */}
          {weatherData && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] border-t border-slate-700/30 pt-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Radar</span>
                <span className="text-slate-300 font-medium">{weatherData.dopplerRadarDbz} dBZ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pressure</span>
                <span className="text-slate-300 font-medium">{weatherData.barometricPressureHpa} hPa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Humidity</span>
                <span className="text-slate-300 font-medium">{weatherData.relativeHumidityPct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wind</span>
                <span className="text-slate-300 font-medium">{weatherData.windSpeedKmh} km/h {weatherData.windDirection}</span>
              </div>
            </div>
          )}
        </div>

        {/* ──────── ROUTE RESULTS (Below Weather Controls) ──────── */}
        {activeRoute && (
          <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/40 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                <span className="material-symbols-outlined text-[14px] text-slate-400">alt_route</span>
                Computed Route
              </span>
              <span className="text-emerald-400 font-medium text-[11px]">
                {activeRoute.safeRoute.passability}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] border-t border-slate-700/30 pt-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Distance</span>
                <span className="text-slate-300 font-medium">{activeRoute.safeRoute.distanceKm} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Est. Time</span>
                <span className="text-slate-300 font-medium">{activeRoute.safeRoute.durationMin} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Elevation</span>
                <span className="text-slate-300 font-medium">+{activeRoute.safeRoute.elevationGainM}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hazards Bypassed</span>
                <span className="text-slate-300 font-medium">{activeRoute.safeRoute.hazardsBypassedCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* ──────── CALCULATE BUTTON ──────── */}
        <button
          onClick={handleCalculateClick}
          disabled={isCalculating}
          type="button"
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs tracking-wide rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-sm"
        >
          {isCalculating ? (
            <>
              <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
              <span>Computing route…</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">navigation</span>
              <span>{routeActive ? 'Recalculate Route' : 'Calculate Safe Route'}</span>
            </>
          )}
        </button>

        {/* ──────── FLASH FLOOD INJECTION ──────── */}
        <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-red-400">flash_on</span>
              Flash Flood Simulation
            </span>
            <div className="flex items-center gap-1.5">
              {flashFloodedNodes.length > 0 && (
                <button
                  type="button"
                  onClick={onClearFlashFloods}
                  className="px-2 py-0.5 rounded text-[10px] text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-700/60 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={onRandomFlashFlood}
                className="px-2 py-1 rounded-md text-[10px] font-medium bg-red-950/40 text-red-300 hover:bg-red-900/40 border border-red-800/30 transition-colors cursor-pointer"
              >
                ⚡ Random Hazard
              </button>
            </div>
          </div>

          {/* Hotspot List */}
          <div className="space-y-1">
            {MUMBAI_FLOOD_HOTSPOTS.map((hotspot) => {
              const isFlooded = flashFloodedNodes.includes(hotspot.id);
              const zoneState = activeRoute?.activeFloodZones.find((z) => z.id === hotspot.id);
              return (
                <div
                  key={hotspot.id}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] transition-colors ${
                    isFlooded
                      ? 'bg-red-950/30 border border-red-800/40'
                      : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isFlooded
                          ? 'bg-red-400'
                          : zoneState?.status === 'IMPASSABLE'
                          ? 'bg-red-400'
                          : zoneState?.status === 'CRITICAL'
                          ? 'bg-amber-400'
                          : zoneState?.status === 'ELEVATED'
                          ? 'bg-yellow-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span className="text-slate-300 truncate">{hotspot.name}</span>
                    {isFlooded && (
                      <span className="text-[9px] text-red-400 font-mono font-medium shrink-0">4.8m ∞</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onFlashFlood(hotspot.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer shrink-0 ml-2 ${
                      isFlooded
                        ? 'bg-slate-700/60 text-slate-300 hover:bg-slate-600/60'
                        : 'bg-red-950/40 text-red-300 hover:bg-red-900/40'
                    }`}
                  >
                    {isFlooded ? 'Remove' : 'Flood'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ──────── ALGORITHM LOG ──────── */}
        <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60 space-y-2">
          <button
            type="button"
            onClick={() => setShowAlgoLog(!showAlgoLog)}
            className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[14px]">terminal</span>
              Algorithm Log
            </span>
            <div className="flex items-center gap-2">
              {lastRecalcMs > 0 && (
                <span className="font-mono text-[10px] text-slate-500">{lastRecalcMs}ms</span>
              )}
              <span className="material-symbols-outlined text-[14px]">
                {showAlgoLog ? 'expand_less' : 'expand_more'}
              </span>
            </div>
          </button>

          {showAlgoLog && algorithmLog.length > 0 && (
            <div className="space-y-1 font-mono text-[10px]">
              {algorithmLog.map((entry, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`shrink-0 ${logStatusColor(entry.status)}`}>
                    {logStatusIcon(entry.status)}
                  </span>
                  <span className="text-slate-500 shrink-0">{entry.label}:</span>
                  <span className={`${logStatusColor(entry.status)} break-all`}>{entry.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default RoutingControlPanel;
