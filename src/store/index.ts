import { create } from 'zustand';
import type { Camera, Zone, Person, HailoEvent, DashboardStats, HeatmapData, CrowdChartData, AIModel, OperationMode, OperationModeConfig } from '../types';

// Default AI Models
const defaultModels: AIModel[] = [
  { id: 'yolo', name: 'Object Detection', description: 'YOLOv8n - People, vehicles, objects', icon: '🎯', enabled: true, fps: null, status: 'idle' },
  { id: 'pose', name: 'Pose Estimation', description: 'YOLOv8n-pose - Skeleton/fall detection', icon: '🦴', enabled: true, fps: null, status: 'idle' },
  { id: 'face', name: 'Face Detection', description: 'SCRFD - Face tracking', icon: '👤', enabled: false, fps: null, status: 'idle' },
  { id: 'lpr', name: 'License Plate', description: 'LPRNet - Vehicle plates', icon: '🚗', enabled: false, fps: null, status: 'idle' },
];

// Operation Mode Presets
const operationModes: OperationModeConfig[] = [
  { id: 'security', name: 'Security Mode', description: 'All models, max alerts', icon: '🔒', models: ['yolo', 'pose', 'face', 'lpr'], alertLevel: 'high' },
  { id: 'crowd', name: 'Crowd Analytics', description: 'Detection + pose for counting', icon: '👥', models: ['yolo', 'pose'], alertLevel: 'medium' },
  { id: 'access', name: 'Access Control', description: 'Face + LPR only', icon: '🚪', models: ['face', 'lpr'], alertLevel: 'medium' },
  { id: 'performance', name: 'Performance Mode', description: 'Detection only, max FPS', icon: '⚡', models: ['yolo'], alertLevel: 'low' },
  { id: 'custom', name: 'Custom', description: 'Your toggle selections', icon: '⚙️', models: [], alertLevel: 'medium' },
];
import { 
  mockCameras, 
  mockZones, 
  mockPeople, 
  mockEvents, 
  mockDashboardStats, 
  mockHeatmapData,
  mockCrowdChartData,
  generateMockEvent,
} from '../data/mockData';

interface AppState {
  // Data
  cameras: Camera[];
  zones: Zone[];
  people: Person[];
  events: HailoEvent[];
  stats: DashboardStats | null;
  heatmaps: Record<string, HeatmapData>;
  chartData: CrowdChartData | null;
  
  // UI State
  selectedCamera: string | null;
  selectedZone: string | null;
  isLiveMode: boolean;
  useMockData: boolean;
  showHeatmap: boolean;
  showSkeletons: boolean;
  showZones: boolean;
  eventFilter: string[];
  wsConnected: boolean;
  
  // Camera Cycling State
  cyclingEnabled: boolean;
  cyclingCameraId: string | null;
  cycleIntervalMs: number;
  cycleIndex: number;
  
  // AI Model State
  models: AIModel[];
  currentMode: OperationMode;
  availableModes: OperationModeConfig[];
  
  // Actions
  setCameras: (cameras: Camera[]) => void;
  setZones: (zones: Zone[]) => void;
  setPeople: (people: Person[]) => void;
  addEvent: (event: HailoEvent) => void;
  acknowledgeEvent: (eventId: string) => void;
  setStats: (stats: DashboardStats) => void;
  setHeatmap: (cameraId: string, data: HeatmapData) => void;
  setChartData: (data: CrowdChartData) => void;
  
  setSelectedCamera: (cameraId: string | null) => void;
  setSelectedZone: (zoneId: string | null) => void;
  toggleLiveMode: () => void;
  toggleMockData: () => void;
  toggleHeatmap: () => void;
  toggleSkeletons: () => void;
  toggleZones: () => void;
  setEventFilter: (filter: string[]) => void;
  setWsConnected: (connected: boolean) => void;
  
  // Mock data simulation
  startMockSimulation: () => void;
  stopMockSimulation: () => void;
  
  // Zone editing
  addZone: (zone: Zone) => void;
  updateZone: (zone: Zone) => void;
  deleteZone: (zoneId: string) => void;
  
  // Camera cycling
  startCycling: () => void;
  stopCycling: () => void;
  setCycleInterval: (ms: number) => void;
  cycleToNext: () => void;
  
  // AI Model controls
  toggleModel: (modelId: string) => void;
  setModelStatus: (modelId: string, status: AIModel['status'], fps?: number) => void;
  setOperationMode: (mode: OperationMode) => void;
  getActiveModels: () => AIModel[];
}

let mockSimulationInterval: ReturnType<typeof setInterval> | null = null;
let cameraCycleInterval: ReturnType<typeof setInterval> | null = null;

export const useStore = create<AppState>((set, get) => ({
  // Initial data
  cameras: [],
  zones: [],
  people: [],
  events: [],
  stats: null,
  heatmaps: {},
  chartData: null,
  
  // Initial UI state
  selectedCamera: null,
  selectedZone: null,
  isLiveMode: true,
  useMockData: true,
  showHeatmap: false,
  showSkeletons: true,
  showZones: true,
  eventFilter: ['fall_detected', 'loiter_alert', 'crowd_alert'],
  wsConnected: false,
  
  // Camera cycling
  cyclingEnabled: false,
  cyclingCameraId: null,
  cycleIntervalMs: 400, // 400ms per camera = ~2.4s for 6 cameras
  cycleIndex: 0,
  
  // AI Models
  models: defaultModels,
  currentMode: 'crowd' as OperationMode,
  availableModes: operationModes,
  
  // Data setters
  setCameras: (cameras) => set({ cameras }),
  setZones: (zones) => set({ zones }),
  setPeople: (people) => set({ people }),
  
  addEvent: (event) => set((state) => ({
    events: [event, ...state.events].slice(0, 100), // Keep last 100 events
  })),
  
  acknowledgeEvent: (eventId) => set((state) => ({
    events: state.events.map((e) => 
      e.id === eventId ? { ...e, acknowledged: true } : e
    ),
  })),
  
  setStats: (stats) => set({ stats }),
  setHeatmap: (cameraId, data) => set((state) => ({
    heatmaps: { ...state.heatmaps, [cameraId]: data },
  })),
  setChartData: (data) => set({ chartData: data }),
  
  // UI setters
  setSelectedCamera: (selectedCamera) => set({ selectedCamera }),
  setSelectedZone: (selectedZone) => set({ selectedZone }),
  toggleLiveMode: () => set((state) => ({ isLiveMode: !state.isLiveMode })),
  toggleMockData: () => {
    const newUseMock = !get().useMockData;
    if (newUseMock) {
      // Load mock data
      set({
        useMockData: true,
        cameras: mockCameras,
        zones: mockZones,
        people: mockPeople,
        events: mockEvents,
        stats: mockDashboardStats,
        heatmaps: mockHeatmapData,
        chartData: mockCrowdChartData,
      });
      get().startMockSimulation();
    } else {
      set({ useMockData: false });
      get().stopMockSimulation();
    }
  },
  toggleHeatmap: () => set((state) => ({ showHeatmap: !state.showHeatmap })),
  toggleSkeletons: () => set((state) => ({ showSkeletons: !state.showSkeletons })),
  toggleZones: () => set((state) => ({ showZones: !state.showZones })),
  setEventFilter: (eventFilter) => set({ eventFilter }),
  setWsConnected: (wsConnected) => set({ wsConnected }),
  
  // Mock simulation
  startMockSimulation: () => {
    if (mockSimulationInterval) return;
    
    mockSimulationInterval = setInterval(() => {
      // Randomly update people positions
      set((state) => ({
        people: state.people.map((p) => ({
          ...p,
          bbox: {
            ...p.bbox,
            x: Math.max(0.05, Math.min(0.9, p.bbox.x + (Math.random() - 0.5) * 0.02)),
            y: Math.max(0.1, Math.min(0.85, p.bbox.y + (Math.random() - 0.5) * 0.02)),
          },
          dwellTime: (p.dwellTime || 0) + 1000,
          timestamp: Date.now(),
        })),
      }));
      
      // Occasionally generate new events
      if (Math.random() > 0.85) {
        const event = generateMockEvent();
        get().addEvent(event);
      }
      
      // Update stats periodically
      set((state) => {
        if (!state.stats) return {};
        return {
          stats: {
            ...state.stats,
            totalPeopleNow: state.stats.totalPeopleNow + Math.floor(Math.random() * 3) - 1,
            totalDetectionsToday: state.stats.totalDetectionsToday + Math.floor(Math.random() * 5),
          },
        };
      });
    }, 1000);
  },
  
  stopMockSimulation: () => {
    if (mockSimulationInterval) {
      clearInterval(mockSimulationInterval);
      mockSimulationInterval = null;
    }
  },
  
  // Zone management
  addZone: (zone) => set((state) => ({
    zones: [...state.zones, zone],
  })),
  
  updateZone: (zone) => set((state) => ({
    zones: state.zones.map((z) => z.id === zone.id ? zone : z),
  })),
  
  deleteZone: (zoneId) => set((state) => ({
    zones: state.zones.filter((z) => z.id !== zoneId),
  })),
  
  // Camera cycling - fast round-robin
  startCycling: () => {
    if (cameraCycleInterval) {
      clearInterval(cameraCycleInterval);
    }
    
    const { cameras, cycleIntervalMs } = get();
    const onlineCameras = cameras.filter(c => c.status === 'online');
    console.log('[CYCLE] Starting with', onlineCameras.length, 'online cameras, interval:', cycleIntervalMs);
    if (onlineCameras.length === 0) {
      console.log('[CYCLE] No online cameras found!');
      return;
    }
    
    // Start immediately with first camera
    set({ 
      cyclingEnabled: true, 
      cycleIndex: 0,
      cyclingCameraId: onlineCameras[0]?.id || null 
    });
    
    cameraCycleInterval = setInterval(() => {
      const state = get();
      const online = state.cameras.filter(c => c.status === 'online');
      if (online.length === 0) return;
      
      const nextIndex = (state.cycleIndex + 1) % online.length;
      const nextCamera = online[nextIndex];
      
      set({ 
        cycleIndex: nextIndex,
        cyclingCameraId: nextCamera?.id || null 
      });
      
      // Here you would trigger frame capture/analysis for nextCamera
      console.log(`[CYCLE] Camera: ${nextCamera?.name} (${nextIndex + 1}/${online.length})`);
    }, cycleIntervalMs);
  },
  
  stopCycling: () => {
    if (cameraCycleInterval) {
      clearInterval(cameraCycleInterval);
      cameraCycleInterval = null;
    }
    set({ cyclingEnabled: false, cyclingCameraId: null, cycleIndex: 0 });
  },
  
  setCycleInterval: (ms) => {
    set({ cycleIntervalMs: ms });
    // Restart cycling if active to apply new interval
    const { cyclingEnabled } = get();
    if (cyclingEnabled) {
      get().stopCycling();
      get().startCycling();
    }
  },
  
  cycleToNext: () => {
    const state = get();
    const online = state.cameras.filter(c => c.status === 'online');
    if (online.length === 0) return;
    
    const nextIndex = (state.cycleIndex + 1) % online.length;
    set({ 
      cycleIndex: nextIndex,
      cyclingCameraId: online[nextIndex]?.id || null 
    });
  },
  
  // AI Model controls
  toggleModel: (modelId) => set((state) => {
    const newModels = state.models.map((m) => 
      m.id === modelId ? { ...m, enabled: !m.enabled } : m
    );
    // Switch to custom mode when manually toggling
    return { models: newModels, currentMode: 'custom' as OperationMode };
  }),
  
  setModelStatus: (modelId, status, fps) => set((state) => ({
    models: state.models.map((m) => 
      m.id === modelId ? { ...m, status, fps: fps ?? m.fps } : m
    ),
  })),
  
  setOperationMode: (mode) => {
    const modeConfig = operationModes.find((m) => m.id === mode);
    if (!modeConfig) return;
    
    set((state) => ({
      currentMode: mode,
      models: state.models.map((m) => ({
        ...m,
        enabled: modeConfig.models.includes(m.id),
      })),
    }));
  },
  
  getActiveModels: () => {
    return get().models.filter((m) => m.enabled);
  },
}));
