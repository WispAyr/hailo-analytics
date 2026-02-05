import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './store';
import { useWebSocket } from './hooks/useWebSocket';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { CameraGrid } from './components/CameraGrid';
import { EventPanel } from './components/EventPanel';
import { Charts } from './components/Charts';
import { SettingsPanel } from './components/SettingsPanel';
import { ZoneEditor } from './components/ZoneEditor';
import { ModelPanel } from './components/ModelPanel';
import {
  mockCameras,
  mockZones,
  mockPeople,
  mockEvents,
  mockDashboardStats,
  mockHeatmapData,
  mockCrowdChartData,
} from './data/mockData';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showZoneEditor, setShowZoneEditor] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showModels, setShowModels] = useState(false);
  
  const {
    useMockData,
    setCameras,
    setZones,
    setPeople,
    addEvent,
    setStats,
    setHeatmap,
    setChartData,
    startMockSimulation,
    stopMockSimulation,
  } = useStore();

  // WebSocket connection (only when not using mock data)
  useWebSocket('ws://localhost:3851/ws');

  // Initialize with mock data on mount
  useEffect(() => {
    if (useMockData) {
      setCameras(mockCameras);
      setZones(mockZones);
      setPeople(mockPeople);
      mockEvents.forEach(event => addEvent(event));
      setStats(mockDashboardStats);
      Object.entries(mockHeatmapData).forEach(([cameraId, data]) => {
        setHeatmap(cameraId, data);
      });
      setChartData(mockCrowdChartData);
      startMockSimulation();
    } else {
      stopMockSimulation();
    }

    return () => stopMockSimulation();
  }, [useMockData]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col grid-overlay">
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a25',
            color: '#fff',
            border: '1px solid #2a2a35',
          },
          success: {
            iconTheme: {
              primary: '#00ff88',
              secondary: '#0a0a0f',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff3b3b',
              secondary: '#0a0a0f',
            },
          },
        }}
      />

      {/* Header with stats */}
      <Header />

      {/* Toolbar */}
      <Toolbar
        onOpenSettings={() => setShowSettings(true)}
        onOpenZoneEditor={() => setShowZoneEditor(true)}
        onOpenModels={() => setShowModels(true)}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Camera grid area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Charts toggle */}
          <div className="px-4 pt-4">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showCharts
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-[#12121a] text-gray-400 border border-[#2a2a35] hover:border-cyan-500/30'
              }`}
            >
              <span>📊</span>
              <span>{showCharts ? 'Hide' : 'Show'} Analytics</span>
            </button>
          </div>

          {/* Charts (collapsible) */}
          <AnimatePresence>
            {showCharts && (
              <div className="px-4 pt-4">
                <Charts />
              </div>
            )}
          </AnimatePresence>

          {/* Camera grid */}
          <CameraGrid />
        </div>

        {/* Event panel (sidebar) */}
        <EventPanel />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showZoneEditor && (
          <ZoneEditor
            isOpen={showZoneEditor}
            onClose={() => setShowZoneEditor(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModels && (
          <ModelPanel
            isOpen={showModels}
            onClose={() => setShowModels(false)}
          />
        )}
      </AnimatePresence>

      {/* LCARS-style decorative corner */}
      <div className="fixed bottom-0 left-0 w-32 h-8 pointer-events-none">
        <svg width="128" height="32" viewBox="0 0 128 32">
          <path
            d="M0 32 L0 8 Q0 0 8 0 L128 0"
            fill="none"
            stroke="url(#lcars-gradient)"
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="lcars-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="100%" stopColor="#ff9500" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Status bar */}
      <div className="fixed bottom-0 left-40 right-0 h-8 bg-[#0a0a0f]/80 backdrop-blur border-t border-[#2a2a35] flex items-center justify-between px-4 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Hailo-8 Edge AI</span>
          <span>•</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>v1.0.0-prototype</span>
          <span>•</span>
          <span className="text-cyan-400">AI-Powered Analytics</span>
        </div>
      </div>
    </div>
  );
}

export default App;
