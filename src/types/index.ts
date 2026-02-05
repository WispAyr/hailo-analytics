// Camera types
export interface Camera {
  id: string;
  name: string;
  location: string;
  streamUrl: string;
  status: 'online' | 'offline' | 'error';
  resolution: string;
  fps: number;
}

// Zone types
export interface Point {
  x: number;
  y: number;
}

export interface Zone {
  id: string;
  name: string;
  cameraId: string;
  points: Point[];
  color: string;
  type: 'crowd' | 'restricted' | 'entry' | 'exit';
  maxCapacity?: number;
  loiterThreshold?: number; // seconds
}

// Person detection types
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Keypoint {
  name: string;
  x: number;
  y: number;
  confidence: number;
}

export interface Person {
  id: string;
  trackId: string;
  cameraId: string;
  zoneId?: string;
  bbox: BoundingBox;
  keypoints?: Keypoint[];
  confidence: number;
  timestamp: number;
  dwellTime?: number; // milliseconds in zone
  isLoitering?: boolean;
  isFallen?: boolean;
}

// Event types
export type EventType = 'person_detected' | 'fall_detected' | 'loiter_alert' | 'zone_update' | 'crowd_alert';
export type EventSeverity = 'info' | 'warning' | 'critical';

export interface HailoEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  cameraId: string;
  zoneId?: string;
  personId?: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  snapshotUrl?: string;
  metadata?: Record<string, unknown>;
}

// Stats types
export interface ZoneStats {
  zoneId: string;
  currentCount: number;
  maxCount: number;
  avgDwellTime: number;
  peakTime: string;
}

export interface CameraStats {
  cameraId: string;
  totalDetections: number;
  currentPeople: number;
  zones: ZoneStats[];
}

export interface DashboardStats {
  totalPeopleNow: number;
  totalDetectionsToday: number;
  alertsToday: number;
  criticalAlertsToday: number;
  fallsDetected: number;
  loiteringIncidents: number;
  avgDwellTime: number;
  peakHour: string;
  cameras: CameraStats[];
}

// Heatmap types
export interface HeatmapPoint {
  x: number;
  y: number;
  value: number; // 0-1 intensity
}

export interface HeatmapData {
  cameraId: string;
  points: HeatmapPoint[];
  timestamp: number;
}

// Chart data types
export interface TimeSeriesPoint {
  time: string;
  value: number;
}

export interface CrowdChartData {
  hourly: TimeSeriesPoint[];
  daily: TimeSeriesPoint[];
  byZone: {
    zoneId: string;
    zoneName: string;
    data: TimeSeriesPoint[];
  }[];
}

// WebSocket message types
export interface WSMessage {
  type: EventType;
  payload: Person | HailoEvent | ZoneStats | DashboardStats;
  timestamp: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// AI Model types
export interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  fps: number | null; // Current FPS when running, null when disabled
  status: 'idle' | 'running' | 'loading' | 'error';
}

export type OperationMode = 'security' | 'crowd' | 'access' | 'performance' | 'custom';

export interface OperationModeConfig {
  id: OperationMode;
  name: string;
  description: string;
  icon: string;
  models: string[]; // Model IDs to enable
  alertLevel: 'high' | 'medium' | 'low';
}
