import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import type { Camera, Person } from '../types';
import { HeatmapOverlay } from './HeatmapOverlay';
import { SkeletonOverlay } from './SkeletonOverlay';
import { ZoneOverlay } from './ZoneOverlay';

interface CameraCardProps {
  camera: Camera;
  onClick?: () => void;
  expanded?: boolean;
}

export function CameraCard({ camera, onClick, expanded = false }: CameraCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const { 
    zones, 
    people, 
    heatmaps, 
    showHeatmap, 
    showSkeletons, 
    showZones,
    selectedCamera,
    stats,
    cyclingCameraId,
    cyclingEnabled,
  } = useStore();

  const cameraZones = zones.filter(z => z.cameraId === camera.id);
  const cameraPeople = people.filter(p => p.cameraId === camera.id);
  const cameraHeatmap = heatmaps[camera.id];
  const cameraStats = stats?.cameras.find(c => c.cameraId === camera.id);
  
  const isSelected = selectedCamera === camera.id;
  const isOnline = camera.status === 'online';
  const isCyclingActive = cyclingEnabled && cyclingCameraId === camera.id;

  // Track container dimensions for overlays
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [expanded]);

  // Get loiterers for this camera
  const loiterers = cameraPeople.filter(p => p.isLoitering);
  const fallenPeople = cameraPeople.filter(p => p.isFallen);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: expanded ? 1 : 1.02 }}
      onClick={onClick}
      className={`
        relative rounded-xl overflow-hidden cursor-pointer
        border-2 transition-all duration-150
        ${isCyclingActive
          ? 'border-green-400 ring-2 ring-green-400/50 shadow-[0_0_25px_rgba(74,222,128,0.4)]'
          : isSelected 
          ? 'border-cyan-500 glow-cyan' 
          : fallenPeople.length > 0
          ? 'border-red-500 glow-red animate-pulse'
          : loiterers.length > 0
          ? 'border-orange-500 glow-orange'
          : 'border-[#2a2a35] hover:border-cyan-500/50'
        }
        ${expanded ? 'col-span-2 row-span-2' : ''}
      `}
    >
      {/* Video/Placeholder Container */}
      <div 
        ref={containerRef}
        className={`relative bg-[#0a0a0f] ${expanded ? 'aspect-video' : 'aspect-video'}`}
      >
        {isOnline ? (
          <>
            {/* Placeholder for MJPEG stream */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a25] to-[#0a0a0f] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📹</div>
                <div className="text-xs text-gray-500 font-mono">{camera.streamUrl}</div>
              </div>
            </div>
            
            {/* Overlays */}
            {showZones && dimensions.width > 0 && (
              <ZoneOverlay 
                zones={cameraZones} 
                width={dimensions.width} 
                height={dimensions.height} 
              />
            )}
            
            {showHeatmap && cameraHeatmap && dimensions.width > 0 && (
              <HeatmapOverlay 
                data={cameraHeatmap} 
                width={dimensions.width} 
                height={dimensions.height} 
              />
            )}
            
            {showSkeletons && dimensions.width > 0 && (
              <SkeletonOverlay 
                people={cameraPeople} 
                width={dimensions.width} 
                height={dimensions.height} 
              />
            )}
            
            {/* Bounding boxes */}
            {cameraPeople.map(person => (
              <PersonBoundingBox 
                key={person.id} 
                person={person} 
                containerWidth={dimensions.width}
                containerHeight={dimensions.height}
              />
            ))}
          </>
        ) : (
          <div className="absolute inset-0 bg-[#1a1a25] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📵</div>
              <div className="text-sm">Camera Offline</div>
            </div>
          </div>
        )}
      </div>

      {/* Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm">{camera.name}</h3>
            <p className="text-xs text-gray-400">{camera.location}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Person count badge */}
            <div className="flex items-center gap-1 bg-cyan-500/20 px-2 py-1 rounded text-cyan-400 text-xs font-mono">
              <span>👥</span>
              <span>{cameraStats?.currentPeople ?? cameraPeople.length}</span>
            </div>
            
            {/* Alert badges */}
            {fallenPeople.length > 0 && (
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="bg-red-500/20 px-2 py-1 rounded text-red-400 text-xs font-mono"
              >
                🚨 FALL
              </motion.div>
            )}
            
            {loiterers.length > 0 && (
              <div className="bg-orange-500/20 px-2 py-1 rounded text-orange-400 text-xs font-mono">
                👁️ {loiterers.length}
              </div>
            )}
            
            {/* Status indicator */}
            <div className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
        </div>
      </div>

      {/* Recording / Cycling indicator */}
      {isOnline && (
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {isCyclingActive ? (
            <>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
                className="w-3 h-3 rounded-full bg-green-400"
              />
              <span className="text-xs text-green-400 font-mono font-bold">SCAN</span>
            </>
          ) : (
            <>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
              <span className="text-xs text-red-400 font-mono">REC</span>
            </>
          )}
        </div>
      )}

      {/* Resolution/FPS badge */}
      <div className="absolute top-3 right-3 bg-black/50 px-2 py-1 rounded text-xs text-gray-400 font-mono">
        {camera.resolution} • {camera.fps}fps
      </div>
    </motion.div>
  );
}

// Bounding box component
function PersonBoundingBox({ 
  person, 
  containerWidth, 
  containerHeight 
}: { 
  person: Person; 
  containerWidth: number;
  containerHeight: number;
}) {
  const { bbox, isLoitering, isFallen, dwellTime } = person;
  
  const style = {
    left: bbox.x * containerWidth,
    top: bbox.y * containerHeight,
    width: bbox.width * containerWidth,
    height: bbox.height * containerHeight,
  };

  const borderColor = isFallen 
    ? 'border-red-500' 
    : isLoitering 
    ? 'border-orange-500' 
    : 'border-cyan-500';

  const formatDwellTime = (ms?: number) => {
    if (!ms) return '';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`absolute border-2 ${borderColor} rounded pointer-events-none`}
      style={style}
    >
      {/* Label */}
      <div className={`absolute -top-5 left-0 text-xs px-1 rounded ${
        isFallen ? 'bg-red-500' : isLoitering ? 'bg-orange-500' : 'bg-cyan-500'
      } text-black font-mono`}>
        {isFallen ? '🚨 FALL' : isLoitering ? `👁️ ${formatDwellTime(dwellTime)}` : person.trackId}
      </div>
      
      {/* Confidence */}
      <div className="absolute -bottom-4 left-0 text-[10px] text-gray-400 font-mono">
        {Math.round(person.confidence * 100)}%
      </div>
    </motion.div>
  );
}
