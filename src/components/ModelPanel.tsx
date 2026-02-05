import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import type { OperationMode } from '../types';

interface ModelPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModelPanel({ isOpen, onClose }: ModelPanelProps) {
  const {
    models,
    currentMode,
    availableModes,
    toggleModel,
    setOperationMode,
    setModelStatus,
  } = useStore();

  // Persist model config to localStorage
  useEffect(() => {
    const config = { 
      models: models.map(m => ({ id: m.id, enabled: m.enabled })),
      currentMode 
    };
    localStorage.setItem('hailo-model-config', JSON.stringify(config));
  }, [models, currentMode]);

  // Load config on mount (only once)
  useEffect(() => {
    const saved = localStorage.getItem('hailo-model-config');
    if (saved) {
      try {
        const { currentMode: savedMode } = JSON.parse(saved);
        if (savedMode && savedMode !== 'custom') {
          setOperationMode(savedMode);
        }
      } catch (e) {
        console.error('Failed to load model config:', e);
      }
    }
  }, []);

  // Simulate FPS updates for active models (mock mode)
  useEffect(() => {
    const interval = setInterval(() => {
      models.forEach((model) => {
        if (model.enabled) {
          const baseFps: Record<string, number> = { yolo: 30, pose: 25, face: 20, lpr: 15 };
          const base = baseFps[model.id] || 20;
          const variance = Math.random() * 4 - 2;
          setModelStatus(model.id, 'running', Math.round(base + variance));
        } else {
          setModelStatus(model.id, 'idle', undefined);
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [models, setModelStatus]);

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
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed left-0 top-0 bottom-0 w-96 bg-[#12121a] border-r border-[#2a2a35] z-50 overflow-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a35]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>🧠</span> AI Models
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Operation Modes */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Operation Mode
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {availableModes.map((mode) => (
                <ModeButton
                  key={mode.id}
                  mode={mode}
                  isActive={currentMode === mode.id}
                  onClick={() => setOperationMode(mode.id)}
                />
              ))}
            </div>
          </section>

          {/* Model Toggles */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Active Models
            </h3>
            <div className="space-y-2">
              {models.map((model) => (
                <ModelToggle
                  key={model.id}
                  model={model}
                  onToggle={() => toggleModel(model.id)}
                />
              ))}
            </div>
          </section>

          {/* Performance Summary */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Performance
            </h3>
            <div className="bg-[#0a0a0f] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Active Models</span>
                <span className="text-cyan-400 font-mono">
                  {models.filter(m => m.enabled).length}/{models.length}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Est. Combined FPS</span>
                <span className="text-green-400 font-mono">
                  {getEstimatedFPS(models)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">GPU Load</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-[#2a2a35] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full transition-all"
                      style={{ width: `${getGPULoadPercent(models)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {getGPULoadPercent(models)}%
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Info */}
          <section className="pt-4 border-t border-[#2a2a35]">
            <div className="flex items-start gap-3 text-xs text-gray-500">
              <span className="text-cyan-400 text-lg">💡</span>
              <p>
                Running multiple models shares the Hailo-8's 26 TOPS compute. 
                Each enabled model reduces per-model FPS but increases detection coverage.
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </>
  );
}

function ModeButton({ 
  mode, 
  isActive, 
  onClick 
}: { 
  mode: { id: OperationMode; name: string; description: string; icon: string };
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
        isActive
          ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
          : 'bg-[#0a0a0f] border-[#2a2a35] text-gray-400 hover:border-cyan-500/30'
      }`}
    >
      <span className="text-2xl">{mode.icon}</span>
      <div className="flex-1">
        <p className="font-medium">{mode.name}</p>
        <p className="text-xs text-gray-500">{mode.description}</p>
      </div>
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-3 h-3 rounded-full bg-cyan-500"
        />
      )}
    </button>
  );
}

function ModelToggle({ 
  model, 
  onToggle 
}: { 
  model: { id: string; name: string; description: string; icon: string; enabled: boolean; fps: number | null; status: string };
  onToggle: () => void;
}) {
  const statusColors = {
    idle: 'bg-gray-500',
    running: 'bg-green-500',
    loading: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <motion.div
      layout
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        model.enabled
          ? 'bg-[#1a1a25] border-[#2a2a35]'
          : 'bg-[#0a0a0f] border-transparent opacity-60'
      }`}
    >
      <span className="text-2xl">{model.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-white truncate">{model.name}</p>
          {model.enabled && model.fps && (
            <span className="text-xs font-mono text-green-400 bg-green-400/20 px-1.5 py-0.5 rounded">
              {model.fps} FPS
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{model.description}</p>
      </div>
      
      {/* Status indicator */}
      <div className={`w-2 h-2 rounded-full ${statusColors[model.status as keyof typeof statusColors]}`} />
      
      {/* Toggle */}
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          model.enabled ? 'bg-cyan-500' : 'bg-gray-700'
        }`}
      >
        <motion.span
          layout
          className="absolute top-1 w-4 h-4 rounded-full bg-white"
          animate={{ left: model.enabled ? 24 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </motion.div>
  );
}

// Helper functions
function getEstimatedFPS(models: { id: string; enabled: boolean }[]): string {
  const activeCount = models.filter(m => m.enabled).length;
  if (activeCount === 0) return '—';
  
  // Rough estimates based on Hailo-8 performance
  const baseFPS: Record<string, number> = {
    yolo: 190,
    pose: 120,
    face: 200,
    lpr: 1000,
  };
  
  const activeModels = models.filter(m => m.enabled);
  const avgFPS = activeModels.reduce((sum, m) => sum + (baseFPS[m.id] || 100), 0) / activeCount;
  
  // Shared compute reduces individual FPS
  const sharedFPS = Math.round(avgFPS / Math.sqrt(activeCount));
  return `~${sharedFPS}`;
}

function getGPULoadPercent(models: { enabled: boolean }[]): number {
  const activeCount = models.filter(m => m.enabled).length;
  // Each model adds ~25% load, maxing at 100%
  return Math.min(100, activeCount * 25);
}

// Compact inline version for toolbar
export function ModelStatusBar() {
  const { models, currentMode, availableModes } = useStore();
  const activeModels = models.filter(m => m.enabled);
  const modeConfig = availableModes.find(m => m.id === currentMode);

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-[#1a1a25] rounded-lg border border-[#2a2a35]">
      <span className="text-sm">{modeConfig?.icon}</span>
      <span className="text-xs text-gray-400">{modeConfig?.name}</span>
      <div className="w-px h-4 bg-[#2a2a35]" />
      <div className="flex items-center gap-1">
        {activeModels.map(m => (
          <span key={m.id} className="text-sm" title={m.name}>{m.icon}</span>
        ))}
      </div>
      <span className="text-xs font-mono text-green-400">
        {getEstimatedFPS(models)} FPS
      </span>
    </div>
  );
}
