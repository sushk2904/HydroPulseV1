export interface FrameLoadState {
  totalFrames: number;
  loadedFrames: number;
  progressPercentage: number;
  isComplete: boolean;
  statusMessage: string;
}

export type PhaseType = 'clouds' | 'conduit' | 'surcharge';

export interface TelemetryMetrics {
  phase: PhaseType;
  phaseTitle: string;
  phaseSubheading: string;
  rainIntensity: string;      // e.g. "82.4 mm/hr"
  radarReflectivity: string;  // e.g. "52 dBZ"
  atmosphericStatus: string;  // e.g. "EXTREME INFLOW"
  conduitId: string;          // e.g. "SWMM-PIPE-09"
  conduitCapacity: string;    // e.g. "94.2%"
  flowVelocity: string;       // e.g. "3.4 m/s"
  hydraulicGrade: string;     // e.g. "+2.8m HGL"
  nodeStatus: string;         // e.g. "SURCHARGE DETECTED"
  nodeId: string;             // e.g. "#MH-104"
  inundationDepth: string;    // e.g. "+46 cm"
  evacStatus: string;         // e.g. "CALCULATING..."
  riskLevel: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface FrameInfo {
  index: number;
  progress: number;
  phase: PhaseType;
}
