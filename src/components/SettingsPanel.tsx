import { motion } from 'framer-motion';
import { useStore } from '../store';
import { HeatmapLegend } from './HeatmapOverlay';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const {
    useMockData,
    toggleMockData,
    showHeatmap,
    toggleHeatmap,
    showSkeletons,
    toggleSkeletons,
    showZones,
    toggleZones,
    isLiveMode,
    toggleLiveMode,
    wsConnected,
  } = useStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-80 bg-[#12121a] border-l border-[#2a2a35] z-50 overflow-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a35]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>⚙️</span> Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Data Source */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Data Source
            </h3>
            <div className="space-y-3">
              <Toggle
                label="Use Mock Data"
                description="Switch between mock and live API data"
                checked={useMockData}
                onChange={toggleMockData}
                color="yellow"
              />
              <Toggle
                label="Live Updates"
                description="Enable real-time data streaming"
                checked={isLiveMode}
                onChange={toggleLiveMode}
                disabled={useMockData}
              />
              
              {/* Connection status */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 p-2 bg-[#0a0a0f] rounded">
                <span className={`w-2 h-2 rounded-full ${
                  useMockData ? 'bg-yellow-500' : wsConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>
                  {useMockData 
                    ? 'Using mock data (simulated)'
                    : wsConnected 
                    ? 'Connected to backend' 
                    : 'Disconnected'}
                </span>
              </div>
            </div>
          </section>

          {/* Overlays */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Camera Overlays
            </h3>
            <div className="space-y-3">
              <Toggle
                label="Show Zones"
                description="Display zone boundaries on cameras"
                checked={showZones}
                onChange={toggleZones}
                color="purple"
              />
              <Toggle
                label="Show Heatmap"
                description="Display crowd density visualization"
                checked={showHeatmap}
                onChange={toggleHeatmap}
                color="orange"
              />
              <Toggle
                label="Show Skeletons"
                description="Display pose estimation overlays"
                checked={showSkeletons}
                onChange={toggleSkeletons}
                color="cyan"
              />

              {/* Heatmap legend */}
              {showHeatmap && (
                <div className="mt-3 p-3 bg-[#0a0a0f] rounded-lg">
                  <HeatmapLegend />
                </div>
              )}
            </div>
          </section>

          {/* Alert Thresholds */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Alert Thresholds
            </h3>
            <div className="space-y-4">
              <RangeInput
                label="Loitering Warning (seconds)"
                value={30}
                min={10}
                max={120}
                color="orange"
              />
              <RangeInput
                label="Loitering Alert (seconds)"
                value={60}
                min={30}
                max={300}
                color="red"
              />
              <RangeInput
                label="Crowd Density Warning (%)"
                value={70}
                min={50}
                max={90}
                color="yellow"
              />
            </div>
          </section>

          {/* API Configuration */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              API Configuration
            </h3>
            <div className="space-y-3">
              <InputField
                label="API Base URL"
                value="http://localhost:3851"
                placeholder="http://host:port"
              />
              <InputField
                label="WebSocket URL"
                value="ws://localhost:3851/ws"
                placeholder="ws://host:port/ws"
              />
            </div>
          </section>

          {/* About */}
          <section className="pt-4 border-t border-[#2a2a35]">
            <div className="text-center text-xs text-gray-500">
              <p className="font-semibold text-cyan-400">Hailo AI Analytics</p>
              <p className="mt-1">Prototype Dashboard v1.0</p>
              <p className="mt-2">Powered by Hailo-8 Edge AI</p>
            </div>
          </section>
        </div>
      </motion.div>
    </>
  );
}

// Toggle component
function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  color = 'cyan',
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  color?: 'cyan' | 'orange' | 'purple' | 'yellow' | 'red';
}) {
  const colorClasses = {
    cyan: 'bg-cyan-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className={`flex items-start justify-between ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <p className="text-sm text-white">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? colorClasses[color] : 'bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

// Range input component
function RangeInput({
  label,
  value,
  min,
  max,
  color = 'cyan',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  color?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-400">{label}</span>
        <span className={`text-sm font-mono text-${color}-400`}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-[#2a2a35] accent-${color}-500`}
        onChange={() => {}}
      />
    </div>
  );
}

// Input field component
function InputField({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2a2a35] rounded-lg text-sm text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
        onChange={() => {}}
      />
    </div>
  );
}
