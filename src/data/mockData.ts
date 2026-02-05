import type { Camera, Zone, Person, HailoEvent, DashboardStats, HeatmapData, CrowdChartData, EventType, EventSeverity } from '../types';

// Mock Cameras
export const mockCameras: Camera[] = [
  {
    id: 'cam-01',
    name: 'Main Entrance',
    location: 'Building A - Front',
    streamUrl: '/streams/cam-01/stream.mjpeg',
    status: 'online',
    resolution: '1920x1080',
    fps: 30,
  },
  {
    id: 'cam-02',
    name: 'Lobby',
    location: 'Building A - Ground Floor',
    streamUrl: '/streams/cam-02/stream.mjpeg',
    status: 'online',
    resolution: '1920x1080',
    fps: 30,
  },
  {
    id: 'cam-03',
    name: 'Cafeteria',
    location: 'Building A - Floor 1',
    streamUrl: '/streams/cam-03/stream.mjpeg',
    status: 'online',
    resolution: '1920x1080',
    fps: 25,
  },
  {
    id: 'cam-04',
    name: 'Parking Lot',
    location: 'External - North',
    streamUrl: '/streams/cam-04/stream.mjpeg',
    status: 'online',
    resolution: '2560x1440',
    fps: 30,
  },
  {
    id: 'cam-05',
    name: 'Loading Dock',
    location: 'Building B - Rear',
    streamUrl: '/streams/cam-05/stream.mjpeg',
    status: 'offline',
    resolution: '1920x1080',
    fps: 30,
  },
  {
    id: 'cam-06',
    name: 'Stairwell A',
    location: 'Building A - Central',
    streamUrl: '/streams/cam-06/stream.mjpeg',
    status: 'online',
    resolution: '1280x720',
    fps: 20,
  },
];

// Mock Zones
export const mockZones: Zone[] = [
  {
    id: 'zone-01',
    name: 'Entry Queue',
    cameraId: 'cam-01',
    points: [
      { x: 0.1, y: 0.3 },
      { x: 0.5, y: 0.3 },
      { x: 0.5, y: 0.9 },
      { x: 0.1, y: 0.9 },
    ],
    color: '#00d4ff',
    type: 'entry',
    maxCapacity: 20,
    loiterThreshold: 60,
  },
  {
    id: 'zone-02',
    name: 'Reception Desk',
    cameraId: 'cam-02',
    points: [
      { x: 0.3, y: 0.2 },
      { x: 0.7, y: 0.2 },
      { x: 0.7, y: 0.6 },
      { x: 0.3, y: 0.6 },
    ],
    color: '#ff9500',
    type: 'crowd',
    maxCapacity: 10,
    loiterThreshold: 120,
  },
  {
    id: 'zone-03',
    name: 'Seating Area',
    cameraId: 'cam-03',
    points: [
      { x: 0.05, y: 0.1 },
      { x: 0.95, y: 0.1 },
      { x: 0.95, y: 0.85 },
      { x: 0.05, y: 0.85 },
    ],
    color: '#00ff88',
    type: 'crowd',
    maxCapacity: 50,
  },
  {
    id: 'zone-04',
    name: 'Restricted Area',
    cameraId: 'cam-04',
    points: [
      { x: 0.6, y: 0.5 },
      { x: 0.95, y: 0.5 },
      { x: 0.95, y: 0.95 },
      { x: 0.6, y: 0.95 },
    ],
    color: '#ff3b3b',
    type: 'restricted',
    loiterThreshold: 30,
  },
  {
    id: 'zone-05',
    name: 'Exit Gate',
    cameraId: 'cam-01',
    points: [
      { x: 0.6, y: 0.3 },
      { x: 0.9, y: 0.3 },
      { x: 0.9, y: 0.9 },
      { x: 0.6, y: 0.9 },
    ],
    color: '#9945ff',
    type: 'exit',
    maxCapacity: 15,
  },
];

// Generate realistic mock people with keypoints
function generateMockPerson(id: number, cameraId: string, zoneId?: string): Person {
  const baseX = Math.random() * 0.8 + 0.1;
  const baseY = Math.random() * 0.6 + 0.2;
  
  return {
    id: `person-${id}`,
    trackId: `track-${id}`,
    cameraId,
    zoneId,
    bbox: {
      x: baseX,
      y: baseY,
      width: 0.08 + Math.random() * 0.04,
      height: 0.15 + Math.random() * 0.1,
    },
    keypoints: [
      { name: 'nose', x: baseX + 0.04, y: baseY + 0.02, confidence: 0.95 },
      { name: 'left_eye', x: baseX + 0.035, y: baseY + 0.015, confidence: 0.92 },
      { name: 'right_eye', x: baseX + 0.045, y: baseY + 0.015, confidence: 0.91 },
      { name: 'left_shoulder', x: baseX + 0.02, y: baseY + 0.05, confidence: 0.88 },
      { name: 'right_shoulder', x: baseX + 0.06, y: baseY + 0.05, confidence: 0.89 },
      { name: 'left_elbow', x: baseX + 0.01, y: baseY + 0.08, confidence: 0.82 },
      { name: 'right_elbow', x: baseX + 0.07, y: baseY + 0.08, confidence: 0.84 },
      { name: 'left_wrist', x: baseX + 0.005, y: baseY + 0.11, confidence: 0.78 },
      { name: 'right_wrist', x: baseX + 0.075, y: baseY + 0.11, confidence: 0.76 },
      { name: 'left_hip', x: baseX + 0.025, y: baseY + 0.1, confidence: 0.85 },
      { name: 'right_hip', x: baseX + 0.055, y: baseY + 0.1, confidence: 0.86 },
      { name: 'left_knee', x: baseX + 0.02, y: baseY + 0.14, confidence: 0.8 },
      { name: 'right_knee', x: baseX + 0.06, y: baseY + 0.14, confidence: 0.81 },
      { name: 'left_ankle', x: baseX + 0.02, y: baseY + 0.18, confidence: 0.75 },
      { name: 'right_ankle', x: baseX + 0.06, y: baseY + 0.18, confidence: 0.74 },
    ],
    confidence: 0.85 + Math.random() * 0.15,
    timestamp: Date.now(),
    dwellTime: Math.floor(Math.random() * 300000),
    isLoitering: Math.random() > 0.85,
    isFallen: Math.random() > 0.98,
  };
}

export const mockPeople: Person[] = [
  ...Array(5).fill(null).map((_, i) => generateMockPerson(i, 'cam-01', i % 2 === 0 ? 'zone-01' : 'zone-05')),
  ...Array(8).fill(null).map((_, i) => generateMockPerson(i + 5, 'cam-02', 'zone-02')),
  ...Array(15).fill(null).map((_, i) => generateMockPerson(i + 13, 'cam-03', 'zone-03')),
  ...Array(3).fill(null).map((_, i) => generateMockPerson(i + 28, 'cam-04', 'zone-04')),
  ...Array(2).fill(null).map((_, i) => generateMockPerson(i + 31, 'cam-06')),
];

// Mock Events
export const mockEvents: HailoEvent[] = [
  {
    id: 'evt-001',
    type: 'fall_detected',
    severity: 'critical',
    cameraId: 'cam-06',
    zoneId: undefined,
    personId: 'person-31',
    message: 'Fall detected in Stairwell A - Person appears to have fallen',
    timestamp: Date.now() - 180000,
    acknowledged: false,
    snapshotUrl: '/snapshots/fall-001.jpg',
    metadata: { confidence: 0.94, duration_ms: 2500 },
  },
  {
    id: 'evt-002',
    type: 'loiter_alert',
    severity: 'warning',
    cameraId: 'cam-04',
    zoneId: 'zone-04',
    personId: 'person-28',
    message: 'Loitering detected in Restricted Area - 2m 15s duration',
    timestamp: Date.now() - 300000,
    acknowledged: false,
    snapshotUrl: '/snapshots/loiter-001.jpg',
    metadata: { duration_seconds: 135, threshold: 30 },
  },
  {
    id: 'evt-003',
    type: 'crowd_alert',
    severity: 'warning',
    cameraId: 'cam-03',
    zoneId: 'zone-03',
    message: 'Crowd density warning - Cafeteria at 80% capacity',
    timestamp: Date.now() - 600000,
    acknowledged: true,
    metadata: { currentCount: 40, maxCapacity: 50, percentage: 80 },
  },
  {
    id: 'evt-004',
    type: 'loiter_alert',
    severity: 'critical',
    cameraId: 'cam-01',
    zoneId: 'zone-01',
    personId: 'person-02',
    message: 'Extended loitering at Entry Queue - 5m 30s duration',
    timestamp: Date.now() - 900000,
    acknowledged: true,
    snapshotUrl: '/snapshots/loiter-002.jpg',
    metadata: { duration_seconds: 330, threshold: 60 },
  },
  {
    id: 'evt-005',
    type: 'person_detected',
    severity: 'info',
    cameraId: 'cam-04',
    zoneId: 'zone-04',
    personId: 'person-29',
    message: 'Person entered Restricted Area',
    timestamp: Date.now() - 1200000,
    acknowledged: true,
  },
  {
    id: 'evt-006',
    type: 'fall_detected',
    severity: 'critical',
    cameraId: 'cam-02',
    personId: 'person-08',
    message: 'Fall detected in Lobby - Immediate response required',
    timestamp: Date.now() - 3600000,
    acknowledged: true,
    snapshotUrl: '/snapshots/fall-002.jpg',
    metadata: { confidence: 0.89, response_time_ms: 45000 },
  },
  {
    id: 'evt-007',
    type: 'zone_update',
    severity: 'info',
    cameraId: 'cam-03',
    zoneId: 'zone-03',
    message: 'Zone configuration updated - Seating Area capacity changed',
    timestamp: Date.now() - 7200000,
    acknowledged: true,
    metadata: { old_capacity: 40, new_capacity: 50 },
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalPeopleNow: 33,
  totalDetectionsToday: 1247,
  alertsToday: 12,
  criticalAlertsToday: 2,
  fallsDetected: 2,
  loiteringIncidents: 8,
  avgDwellTime: 145,
  peakHour: '12:00',
  cameras: [
    {
      cameraId: 'cam-01',
      totalDetections: 312,
      currentPeople: 5,
      zones: [
        { zoneId: 'zone-01', currentCount: 3, maxCount: 20, avgDwellTime: 45, peakTime: '09:00' },
        { zoneId: 'zone-05', currentCount: 2, maxCount: 15, avgDwellTime: 15, peakTime: '17:00' },
      ],
    },
    {
      cameraId: 'cam-02',
      totalDetections: 445,
      currentPeople: 8,
      zones: [
        { zoneId: 'zone-02', currentCount: 8, maxCount: 10, avgDwellTime: 180, peakTime: '11:00' },
      ],
    },
    {
      cameraId: 'cam-03',
      totalDetections: 289,
      currentPeople: 15,
      zones: [
        { zoneId: 'zone-03', currentCount: 15, maxCount: 50, avgDwellTime: 900, peakTime: '12:30' },
      ],
    },
    {
      cameraId: 'cam-04',
      totalDetections: 87,
      currentPeople: 3,
      zones: [
        { zoneId: 'zone-04', currentCount: 3, maxCount: 5, avgDwellTime: 60, peakTime: '14:00' },
      ],
    },
    {
      cameraId: 'cam-06',
      totalDetections: 114,
      currentPeople: 2,
      zones: [],
    },
  ],
};

// Mock Heatmap Data
export const mockHeatmapData: Record<string, HeatmapData> = {
  'cam-01': {
    cameraId: 'cam-01',
    timestamp: Date.now(),
    points: [
      { x: 0.25, y: 0.5, value: 0.8 },
      { x: 0.3, y: 0.55, value: 0.9 },
      { x: 0.35, y: 0.6, value: 0.7 },
      { x: 0.75, y: 0.5, value: 0.6 },
      { x: 0.8, y: 0.6, value: 0.5 },
    ],
  },
  'cam-02': {
    cameraId: 'cam-02',
    timestamp: Date.now(),
    points: [
      { x: 0.5, y: 0.4, value: 0.95 },
      { x: 0.45, y: 0.45, value: 0.85 },
      { x: 0.55, y: 0.35, value: 0.75 },
      { x: 0.4, y: 0.5, value: 0.6 },
      { x: 0.6, y: 0.5, value: 0.65 },
    ],
  },
  'cam-03': {
    cameraId: 'cam-03',
    timestamp: Date.now(),
    points: [
      { x: 0.3, y: 0.4, value: 0.7 },
      { x: 0.5, y: 0.5, value: 0.9 },
      { x: 0.7, y: 0.4, value: 0.6 },
      { x: 0.4, y: 0.6, value: 0.8 },
      { x: 0.6, y: 0.6, value: 0.75 },
      { x: 0.5, y: 0.3, value: 0.5 },
    ],
  },
  'cam-04': {
    cameraId: 'cam-04',
    timestamp: Date.now(),
    points: [
      { x: 0.75, y: 0.7, value: 0.6 },
      { x: 0.8, y: 0.75, value: 0.5 },
    ],
  },
};

// Mock Chart Data
export const mockCrowdChartData: CrowdChartData = {
  hourly: [
    { time: '00:00', value: 5 },
    { time: '01:00', value: 3 },
    { time: '02:00', value: 2 },
    { time: '03:00', value: 1 },
    { time: '04:00', value: 2 },
    { time: '05:00', value: 5 },
    { time: '06:00', value: 12 },
    { time: '07:00', value: 28 },
    { time: '08:00', value: 45 },
    { time: '09:00', value: 52 },
    { time: '10:00', value: 48 },
    { time: '11:00', value: 55 },
    { time: '12:00', value: 68 },
    { time: '13:00', value: 62 },
    { time: '14:00', value: 50 },
    { time: '15:00', value: 48 },
    { time: '16:00', value: 45 },
    { time: '17:00', value: 52 },
    { time: '18:00', value: 35 },
    { time: '19:00', value: 22 },
    { time: '20:00', value: 15 },
    { time: '21:00', value: 10 },
    { time: '22:00', value: 8 },
    { time: '23:00', value: 6 },
  ],
  daily: [
    { time: 'Mon', value: 342 },
    { time: 'Tue', value: 378 },
    { time: 'Wed', value: 395 },
    { time: 'Thu', value: 410 },
    { time: 'Fri', value: 385 },
    { time: 'Sat', value: 225 },
    { time: 'Sun', value: 180 },
  ],
  byZone: [
    {
      zoneId: 'zone-01',
      zoneName: 'Entry Queue',
      data: [
        { time: '08:00', value: 12 },
        { time: '09:00', value: 18 },
        { time: '10:00', value: 15 },
        { time: '11:00', value: 14 },
        { time: '12:00', value: 22 },
      ],
    },
    {
      zoneId: 'zone-03',
      zoneName: 'Cafeteria',
      data: [
        { time: '08:00', value: 5 },
        { time: '09:00', value: 8 },
        { time: '10:00', value: 12 },
        { time: '11:00', value: 25 },
        { time: '12:00', value: 45 },
      ],
    },
  ],
};

// Utility to generate new mock events for simulation
export function generateMockEvent(): HailoEvent {
  const types: EventType[] = ['person_detected', 'fall_detected', 'loiter_alert', 'crowd_alert'];
  const severities: EventSeverity[] = ['info', 'warning', 'critical'];
  const cameras = mockCameras.filter(c => c.status === 'online');
  const randomCamera = cameras[Math.floor(Math.random() * cameras.length)];
  const randomType = types[Math.floor(Math.random() * types.length)];
  const randomSeverity = randomType === 'fall_detected' ? 'critical' : 
    randomType === 'person_detected' ? 'info' : 
    severities[Math.floor(Math.random() * severities.length)];

  const messages: Record<EventType, string[]> = {
    person_detected: ['Person entered zone', 'New detection in area', 'Movement detected'],
    fall_detected: ['Fall detected - immediate response needed', 'Person down alert', 'Emergency: Fall detected'],
    loiter_alert: ['Loitering detected', 'Extended presence in zone', 'Suspicious activity - loitering'],
    crowd_alert: ['Crowd density warning', 'Area approaching capacity', 'High density detected'],
    zone_update: ['Zone configuration changed', 'Zone boundary updated'],
  };

  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: randomType,
    severity: randomSeverity,
    cameraId: randomCamera.id,
    message: messages[randomType][Math.floor(Math.random() * messages[randomType].length)],
    timestamp: Date.now(),
    acknowledged: false,
  };
}
