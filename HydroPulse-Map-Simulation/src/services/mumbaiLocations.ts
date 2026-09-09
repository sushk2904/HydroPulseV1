export interface MumbaiLocation {
  id: string;
  name: string;
  shortLabel: string;
  lat: number;
  lng: number;
  elevationM: number;
  sector: string;
}

export const MUMBAI_LOCATIONS: MumbaiLocation[] = [
  {
    id: 'bandra-west',
    name: 'SECTOR A-12 [BANDRA WEST / WEH CORRIDOR]',
    shortLabel: 'Bandra West',
    lat: 19.0596,
    lng: 72.8295,
    elevationM: 8.5,
    sector: 'Western Coastal Ridge',
  },
  {
    id: 'seepz-andheri',
    name: 'SECTOR E-04 [SEEPZ / NORTH TERMINAL]',
    shortLabel: 'SEEPZ Andheri',
    lat: 19.1465,
    lng: 72.8810,
    elevationM: 14.2,
    sector: 'North Hub Elevated',
  },
  {
    id: 'colaba-nariman',
    name: 'SECTOR S-01 [SOUTH COAST / COASTAL FREEWAY]',
    shortLabel: 'South Coastal Spur',
    lat: 19.0060,
    lng: 72.8220,
    elevationM: 6.8,
    sector: 'South Coastal Viaduct',
  },
  {
    id: 'bkc-financial',
    name: 'SECTOR C-08 [BKC FINANCIAL COMPLEX]',
    shortLabel: 'BKC Complex',
    lat: 19.0680,
    lng: 72.8680,
    elevationM: 4.2,
    sector: 'Central Mithi Fringe',
  },
  {
    id: 'dadar-tt',
    name: 'SECTOR D-05 [DADAR TT / CENTRAL CIRCLE]',
    shortLabel: 'Dadar TT',
    lat: 19.0178,
    lng: 72.8478,
    elevationM: 4.8,
    sector: 'Central Transit Hub',
  },
  {
    id: 'powai-iit',
    name: 'SECTOR P-09 [POWAI LAKE / IIT TECH PARK]',
    shortLabel: 'Powai Tech Park',
    lat: 19.1257,
    lng: 72.9150,
    elevationM: 28.5,
    sector: 'Eastern Ridge High Ground',
  },
  {
    id: 'airport-t2',
    name: 'SECTOR T-02 [CHHATRAPATI SHIVAJI T2 AIRPORT]',
    shortLabel: 'Airport Terminal 2',
    lat: 19.0886,
    lng: 72.8679,
    elevationM: 11.0,
    sector: 'Elevated Air Corridor',
  },
  {
    id: 'borivali-west',
    name: 'SECTOR B-15 [BORIVALI WEST / SUBURBAN]',
    shortLabel: 'Borivali West',
    lat: 19.2307,
    lng: 72.8567,
    elevationM: 9.8,
    sector: 'North Suburban Spine',
  },
  {
    id: 'worli-seaface',
    name: 'SECTOR W-03 [WORLI SEAFACE / COASTAL RD]',
    shortLabel: 'Worli Seaface',
    lat: 19.0068,
    lng: 72.8155,
    elevationM: 7.2,
    sector: 'Coastal Expressway',
  },
  {
    id: 'goregaon-hub',
    name: 'SECTOR G-11 [GOREGAON IT / WEH ELEVATED]',
    shortLabel: 'Goregaon IT Park',
    lat: 19.1663,
    lng: 72.8526,
    elevationM: 16.5,
    sector: 'Western Elevated Ridge',
  },
  {
    id: 'vashi-bridge',
    name: 'SECTOR V-22 [VASHI / NAVI MUMBAI GATEWAY]',
    shortLabel: 'Vashi Gateway',
    lat: 19.0771,
    lng: 72.9986,
    elevationM: 8.0,
    sector: 'Thane Creek Viaduct',
  },
  {
    id: 'kurla-west',
    name: 'SECTOR K-06 [KURLA WEST / MITHI BASIN]',
    shortLabel: 'Kurla West (Hazard)',
    lat: 19.0700,
    lng: 72.8750,
    elevationM: 2.1,
    sector: 'Lowland Basin Basin',
  },
];

// Physical Hotspot Hydro-Topographic Parameters
export interface FloodHotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  baseRadiusM: number;
  elevationAMSL: number;       // In metres (lower elevation = higher ponding risk)
  drainageCapacityMmHr: number; // Infiltration and storm sewer outfall capacity
  catchmentAreaKm2: number;
  baseVulnerability: number;   // Topographic slope & impervious surface index (0.0 to 1.0)
  description: string;
}

// Live state calculated dynamically from real rainfall in that area
export interface DynamicHotspotState {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rainIntensityMmHr: number;
  vulnerability: number;       // Dynamically computed 0.0 to 1.0 (0% to 100%)
  waterDepthM: number;         // Dynamic ponding depth in metres
  radiusM: number;             // Dynamic surge spread radius
  status: 'CLEAR' | 'ELEVATED' | 'CRITICAL' | 'IMPASSABLE';
  color: string;
  description: string;
}

export const MUMBAI_FLOOD_HOTSPOTS: FloodHotspot[] = [
  {
    id: 'mithi-kurla',
    name: 'Mithi River / Kurla Basin',
    lat: 19.0728,
    lng: 72.8780,
    baseRadiusM: 900,
    elevationAMSL: 2.1,
    drainageCapacityMmHr: 35.0,
    catchmentAreaKm2: 12.4,
    baseVulnerability: 0.95,
    description: 'Central drainage overflow into rail corridor & low-elevation basin',
  },
  {
    id: 'hindmata-dadar',
    name: 'Hindmata / Dadar TT Bowl',
    lat: 19.0145,
    lng: 72.8420,
    baseRadiusM: 550,
    elevationAMSL: 2.4,
    drainageCapacityMmHr: 30.0,
    catchmentAreaKm2: 4.8,
    baseVulnerability: 0.88,
    description: 'Low-lying saucer depression between Dadar and Parel arteries',
  },
  {
    id: 'milan-subway',
    name: 'Milan Subway / Santacruz West',
    lat: 19.0850,
    lng: 72.8410,
    baseRadiusM: 400,
    elevationAMSL: 1.8,
    drainageCapacityMmHr: 22.0,
    catchmentAreaKm2: 3.2,
    baseVulnerability: 0.92,
    description: 'Severe railway underpass bottleneck with rapid storm runoff ponding',
  },
  {
    id: 'sakinaka-junction',
    name: 'Saki Naka / Andheri-Ghatkopar Link',
    lat: 19.1060,
    lng: 72.8880,
    baseRadiusM: 600,
    elevationAMSL: 3.5,
    drainageCapacityMmHr: 42.0,
    catchmentAreaKm2: 6.5,
    baseVulnerability: 0.82,
    description: 'Confluence zone of hill runoff into storm channels and junction',
  },
  {
    id: 'dharavi-creek',
    name: 'Dharavi / Mahim Creek Tidal Outfall',
    lat: 19.0430,
    lng: 72.8550,
    baseRadiusM: 700,
    elevationAMSL: 1.5,
    drainageCapacityMmHr: 28.0,
    catchmentAreaKm2: 8.9,
    baseVulnerability: 0.90,
    description: 'Tidal high-surge backflow zone where Mahim creek meets runoff',
  },
];

/**
 * Dynamically computes real-time vulnerability, water depth, and flood radius
 * based on the specific rainfall amount (rainIntensityMmHr) in that area.
 */
export function calculateHotspotVulnerability(
  hotspot: FloodHotspot,
  rainIntensityMmHr: number
): DynamicHotspotState {
  // 1. Calculate rainfall volume exceeding local drainage capacity
  const excessRain = Math.max(0, rainIntensityMmHr - hotspot.drainageCapacityMmHr);

  // 2. Physical depth scaling: depth increases with excess rain and inversely with elevation AMSL
  let depth = 0;
  if (excessRain > 0) {
    depth = (excessRain / 30.0) * (4.5 / Math.max(1.2, hotspot.elevationAMSL)) * hotspot.baseVulnerability;
  } else {
    // Residual wetness below drainage capacity
    depth = (rainIntensityMmHr / hotspot.drainageCapacityMmHr) * 0.08;
  }
  depth = +Math.max(0, Math.min(4.8, depth)).toFixed(2);

  // 3. Dynamic Vulnerability Formula:
  // Combines rainfall intensity ratio, intrinsic terrain vulnerability, and elevation penalty
  const rainRatio = rainIntensityMmHr / 75.0; // Normalized to 75mm/hr standard alert
  const elevationFactor = Math.max(0.6, 5.0 / Math.max(1.5, hotspot.elevationAMSL));
  
  let vuln = 0;
  if (rainIntensityMmHr <= 15) {
    vuln = 0.08 * (rainIntensityMmHr / 15.0);
  } else {
    vuln = Math.min(
      1.0,
      Math.max(0.05, (rainRatio * 0.65 + (excessRain > 0 ? (excessRain / 60.0) * 0.35 : 0)) * hotspot.baseVulnerability * (elevationFactor / 2.0))
    );
  }
  vuln = +vuln.toFixed(2);

  // 4. Dynamic Status & Color categorization
  let status: DynamicHotspotState['status'] = 'CLEAR';
  let color = '#00FF66';

  if (vuln >= 0.80 || depth >= 0.45) {
    status = 'IMPASSABLE';
    color = '#FF2A4D'; // Neon Red
  } else if (vuln >= 0.55 || depth >= 0.20) {
    status = 'CRITICAL';
    color = '#FFA000'; // Amber/Orange
  } else if (vuln >= 0.25 || depth >= 0.08) {
    status = 'ELEVATED';
    color = '#FFD700'; // Yellow
  } else {
    status = 'CLEAR';
    color = '#00D9FF'; // Cyan / Clear
  }

  // 5. Dynamic Flood Surge Radius (expands non-linearly with rain intensity)
  const spreadScale = Math.max(0.35, Math.sqrt(rainIntensityMmHr / Math.max(20, hotspot.drainageCapacityMmHr)));
  const dynamicRadius = Math.round(hotspot.baseRadiusM * Math.min(2.2, spreadScale));

  return {
    id: hotspot.id,
    name: hotspot.name,
    lat: hotspot.lat,
    lng: hotspot.lng,
    rainIntensityMmHr,
    vulnerability: vuln,
    waterDepthM: depth,
    radiusM: dynamicRadius,
    status,
    color,
    description: hotspot.description,
  };
}
