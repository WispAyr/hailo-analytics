import { motion } from 'framer-motion';
import { useStore } from '../store';
import { ModelStatusBar } from './ModelPanel';

interface ToolbarProps {
  onOpenSettings: () => void;
  onOpenZoneEditor: () => void;
  onOpenModels: () => void;
}

export function Toolbar({ onOpenSettings, onOpenZoneEditor, onOpenModels }: ToolbarProps) {
  const {
    showHeatmap,
    toggleHeatmap,
    showSkeletons,
    toggleSkeletons,
    showZones,
    toggleZones,
    useMockData,
    toggleMockData,
    selectedCamera,
    setSelectedCamera,
    cyclingEnabled,
    startCycling,
    stopCycling,
    cycleIntervalMs,
    setCycleInterval,
    cycleIndex,
    cameras,
  } = useStore();

  const onlineCameras = cameras.filter(c => c.status === 'online');
  const cycleTimeTotal = (onlineCameras.length * cycleIntervalMs / 1000).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-3 bg-[#0a0a0f] border-b border-[#2a2a35]"
    >
      {/* Left side - View controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider mr-2">Overlays:</span>
        
        <ToolbarButton
          icon="📍"
          label="Zones"
          active={showZones}
          onClick={toggleZones}
          color="purple"
        />
        
        <ToolbarButton
          icon="🔥"
          label="Heatmap"
          active={showHeatmap}
          onClick={toggleHeatmap}
          color="orange"
        />
        
        <ToolbarButton
          icon="🦴"
          label="Skeleton"
          active={showSkeletons}
          onClick={toggleSkeletons}
          color="cyan"
        />

        <div className="w-px h-6 bg-[#2a2a35] mx-2" />

        <ToolbarButton
          icon={useMockData ? '🎭' : '📡'}
          label={useMockData ? 'Mock' : 'Live'}
          active={true}
          onClick={toggleMockData}
          color={useMockData ? 'yellow' : 'green'}
        />

        <div className="w-px h-6 bg-[#2a2a35] mx-2" />

        {/* Camera Cycling Controls */}
        <div className="flex items-center gap-2">
          <ToolbarButton
            icon={cyclingEnabled ? '⏸️' : '🔄'}
            label={cyclingEnabled ? `${cycleIndex + 1}/${onlineCameras.length}` : 'Cycle'}
            active={cyclingEnabled}
            onClick={() => cyclingEnabled ? stopCycling() : startCycling()}
            color="green"
          />
          
          {cyclingEnabled && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-1 text-xs text-gray-400"
            >
              <span className="text-green-400 font-mono">{cycleTimeTotal}s</span>
              <span>cycle</span>
            </motion.div>
          )}
          
          {/* Speed selector */}
          <select
            value={cycleIntervalMs}
            onChange={(e) => setCycleInterval(Number(e.target.value))}
            className="bg-[#1a1a25] border border-[#2a2a35] rounded px-2 py-1 text-xs text-gray-300 focus:border-green-500 focus:outline-none"
          >
            <option value={250}>250ms (Fast)</option>
            <option value={400}>400ms (Normal)</option>
            <option value={500}>500ms (Slow)</option>
          </select>
        </div>
      </div>

      {/* Center - Selected camera */}
      {selectedCamera && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 rounded-lg"
        >
          <span className="text-cyan-400 text-sm">📹 Viewing: {selectedCamera}</span>
          <button
            onClick={() => setSelectedCamera(null)}
            className="text-cyan-400 hover:text-cyan-300 text-xs"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Model Status */}
        <ModelStatusBar />
        
        <button
          onClick={onOpenModels}
          className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm transition-colors"
        >
          <span>🧠</span>
          <span>Models</span>
        </button>
        
        <button
          onClick={onOpenZoneEditor}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm transition-colors"
        >
          <span>📐</span>
          <span>Zones</span>
        </button>
        
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-colors"
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button>
      </div>
    </motion.div>
  );
}

function ToolbarButton({
  icon,
  label,
  active,
  onClick,
  color = 'cyan',
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  color?: 'cyan' | 'orange' | 'purple' | 'yellow' | 'green' | 'red';
}) {
  const colorClasses = {
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    green: 'bg-green-500/20 text-green-400 border-green-500/50',
    red: 'bg-red-500/20 text-red-400 border-red-500/50',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
        active
          ? colorClasses[color]
          : 'bg-[#1a1a25] text-gray-500 border-transparent hover:bg-[#1a1a25]/80'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
