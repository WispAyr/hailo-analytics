import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import type { Camera } from '../types';

interface CameraSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}


const DEFAULT_GO2RTC_URL = 'http://localhost:1984';

export function CameraSetup({ isOpen, onClose, onComplete }: CameraSetupProps) {
  const [go2rtcUrl, setGo2rtcUrl] = useState(() => 
    localStorage.getItem('go2rtc_url') || DEFAULT_GO2RTC_URL
  );
  const [discovering, setDiscovering] = useState(false);
  const [discoveredStreams, setDiscoveredStreams] = useState<string[]>([]);
  const [selectedStreams, setSelectedStreams] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [previewStream, setPreviewStream] = useState<string | null>(null);
  
  const { setCameras } = useStore();

  // Load previously selected cameras
  useEffect(() => {
    const saved = localStorage.getItem('selected_cameras');
    if (saved) {
      setSelectedStreams(new Set(JSON.parse(saved)));
    }
  }, []);

  const discoverCameras = async () => {
    setDiscovering(true);
    setError(null);
    setDiscoveredStreams([]);
    
    try {
      const response = await fetch(`${go2rtcUrl}/api/streams`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const streams = await response.json();
      const streamIds = Object.keys(streams);
      
      if (streamIds.length === 0) {
        setError('No streams found in go2rtc');
      } else {
        setDiscoveredStreams(streamIds);
        // Auto-select all if none selected
        if (selectedStreams.size === 0) {
          setSelectedStreams(new Set(streamIds));
        }
      }
      
      // Save the working URL
      localStorage.setItem('go2rtc_url', go2rtcUrl);
    } catch (err) {
      setError(`Failed to connect to go2rtc: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDiscovering(false);
    }
  };

  const toggleStream = (streamId: string) => {
    const newSelected = new Set(selectedStreams);
    if (newSelected.has(streamId)) {
      newSelected.delete(streamId);
    } else {
      newSelected.add(streamId);
    }
    setSelectedStreams(newSelected);
  };

  const selectAll = () => setSelectedStreams(new Set(discoveredStreams));
  const selectNone = () => setSelectedStreams(new Set());

  const applySelection = () => {
    // Convert selected streams to Camera objects
    const newCameras: Camera[] = Array.from(selectedStreams).map((id, _index) => ({
      id,
      name: formatCameraName(id),
      location: 'Auto-discovered',
      streamUrl: `${go2rtcUrl}/api/frame.jpeg?src=${id}`,
      status: 'online' as const,
      resolution: '1920x1080',
      fps: 30,
    }));
    
    setCameras(newCameras);
    localStorage.setItem('selected_cameras', JSON.stringify(Array.from(selectedStreams)));
    localStorage.setItem('go2rtc_url', go2rtcUrl);
    
    onComplete();
  };

  const formatCameraName = (id: string): string => {
    return id
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#12121a] rounded-2xl border border-[#2a2a35] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a35]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="text-2xl">📷</span>
              Camera Setup
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Discover and select cameras from go2rtc
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* go2rtc URL input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">go2rtc Server URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={go2rtcUrl}
                onChange={(e) => setGo2rtcUrl(e.target.value)}
                placeholder="http://localhost:1984"
                className="flex-1 px-4 py-2 bg-[#0a0a0f] border border-[#2a2a35] rounded-lg text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
              />
              <button
                onClick={discoverCameras}
                disabled={discovering}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {discovering ? (
                  <>
                    <span className="animate-spin">⟳</span>
                    Discovering...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Discover
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Discovered cameras */}
          {discoveredStreams.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-400">
                  Found {discoveredStreams.length} cameras
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded text-gray-300"
                  >
                    Select All
                  </button>
                  <button
                    onClick={selectNone}
                    className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded text-gray-300"
                  >
                    Select None
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {discoveredStreams.map((streamId) => (
                  <CameraCard
                    key={streamId}
                    streamId={streamId}
                    name={formatCameraName(streamId)}
                    selected={selectedStreams.has(streamId)}
                    onToggle={() => toggleStream(streamId)}
                    onPreview={() => setPreviewStream(streamId)}
                    go2rtcUrl={go2rtcUrl}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!discovering && discoveredStreams.length === 0 && !error && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📹</div>
              <p>Click "Discover" to find available cameras</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#2a2a35] bg-[#0a0a0f]">
          <div className="text-sm text-gray-500">
            {selectedStreams.size} camera{selectedStreams.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={applySelection}
              disabled={selectedStreams.size === 0}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg font-medium transition-colors"
            >
              Apply ({selectedStreams.size})
            </button>
          </div>
        </div>

        {/* Preview modal */}
        <AnimatePresence>
          {previewStream && (
            <PreviewModal
              streamId={previewStream}
              go2rtcUrl={go2rtcUrl}
              onClose={() => setPreviewStream(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function CameraCard({
  streamId,
  name,
  selected,
  onToggle,
  onPreview,
  go2rtcUrl,
}: {
  streamId: string;
  name: string;
  selected: boolean;
  onToggle: () => void;
  onPreview: () => void;
  go2rtcUrl: string;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  // Refresh thumbnail periodically
  useEffect(() => {
    const interval = setInterval(() => setImageKey(k => k + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      layout
      onClick={onToggle}
      className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
        selected
          ? 'border-green-500 ring-2 ring-green-500/30'
          : 'border-[#2a2a35] hover:border-cyan-500/50'
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-black relative">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
            <span className="text-2xl">📷</span>
          </div>
        )}
        <img
          key={imageKey}
          src={`${go2rtcUrl}/api/frame.jpeg?src=${streamId}`}
          alt={name}
          className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => { setImageLoaded(true); setImageError(false); }}
          onError={() => { setImageError(true); setImageLoaded(false); }}
        />
        
        {/* Selection indicator */}
        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
          selected ? 'bg-green-500 border-green-500' : 'border-white/50 bg-black/50'
        }`}>
          {selected && <span className="text-white text-xs">✓</span>}
        </div>

        {/* Preview button */}
        <button
          onClick={(e) => { e.stopPropagation(); onPreview(); }}
          className="absolute bottom-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 rounded text-white text-xs"
        >
          🔍
        </button>
      </div>

      {/* Name */}
      <div className="p-2 bg-[#1a1a25]">
        <p className="text-sm font-medium text-white truncate">{name}</p>
        <p className="text-xs text-gray-500 truncate">{streamId}</p>
      </div>
    </motion.div>
  );
}

function PreviewModal({
  streamId,
  go2rtcUrl,
  onClose,
}: {
  streamId: string;
  go2rtcUrl: string;
  onClose: () => void;
}) {
  const [imageKey, setImageKey] = useState(0);

  // Refresh preview every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => setImageKey(k => k + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/90 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="relative max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={imageKey}
          src={`${go2rtcUrl}/api/frame.jpeg?src=${streamId}`}
          alt={streamId}
          className="w-full rounded-xl"
        />
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 rounded-lg">
          <span className="text-white font-medium">{streamId}</span>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-black/90 rounded-lg text-white"
        >
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
}

// Export a hook to check if setup is needed
export function useNeedsSetup(): boolean {
  const { cameras } = useStore();
  const savedCameras = localStorage.getItem('selected_cameras');
  return cameras.length === 0 && !savedCameras;
}
