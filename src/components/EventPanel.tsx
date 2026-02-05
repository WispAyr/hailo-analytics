import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import type { HailoEvent, EventType, EventSeverity } from '../types';

export function EventPanel() {
  const { events, eventFilter, setEventFilter, acknowledgeEvent, cameras } = useStore();
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const filteredEvents = events.filter(e => eventFilter.includes(e.type));

  const eventTypeConfig: Record<EventType, { icon: string; label: string; color: string }> = {
    person_detected: { icon: '👤', label: 'Person', color: 'text-blue-400' },
    fall_detected: { icon: '🚨', label: 'Fall', color: 'text-red-400' },
    loiter_alert: { icon: '👁️', label: 'Loiter', color: 'text-orange-400' },
    crowd_alert: { icon: '👥', label: 'Crowd', color: 'text-yellow-400' },
    zone_update: { icon: '📍', label: 'Zone', color: 'text-purple-400' },
  };

  const severityConfig: Record<EventSeverity, { bg: string; border: string }> = {
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    warning: { bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    critical: { bg: 'bg-red-500/10', border: 'border-red-500/30' },
  };

  const toggleFilter = (type: EventType) => {
    if (eventFilter.includes(type)) {
      setEventFilter(eventFilter.filter(t => t !== type));
    } else {
      setEventFilter([...eventFilter, type]);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getCameraName = (cameraId: string) => {
    return cameras.find(c => c.id === cameraId)?.name || cameraId;
  };

  return (
    <div className="w-80 bg-[#12121a] border-l border-[#2a2a35] flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2a35]">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span>📋</span> Event Log
          <span className="ml-auto bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-xs font-mono">
            {filteredEvents.length}
          </span>
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(eventTypeConfig) as EventType[]).map(type => {
            const config = eventTypeConfig[type];
            const isActive = eventFilter.includes(type);
            const count = events.filter(e => e.type === type).length;
            
            return (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                  isActive
                    ? `${config.color} bg-white/10`
                    : 'text-gray-500 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
                {count > 0 && (
                  <span className="bg-white/20 px-1 rounded text-[10px]">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="popLayout">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">No events matching filters</p>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                config={eventTypeConfig[event.type]}
                severityConfig={severityConfig[event.severity]}
                cameraName={getCameraName(event.cameraId)}
                formatTime={formatTime}
                isExpanded={expandedEvent === event.id}
                onToggle={() => setExpandedEvent(
                  expandedEvent === event.id ? null : event.id
                )}
                onAcknowledge={() => acknowledgeEvent(event.id)}
                delay={index * 0.02}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface EventCardProps {
  event: HailoEvent;
  config: { icon: string; label: string; color: string };
  severityConfig: { bg: string; border: string };
  cameraName: string;
  formatTime: (timestamp: number) => string;
  isExpanded: boolean;
  onToggle: () => void;
  onAcknowledge: () => void;
  delay: number;
}

function EventCard({
  event,
  config,
  severityConfig,
  cameraName,
  formatTime,
  isExpanded,
  onToggle,
  onAcknowledge,
  delay,
}: EventCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay }}
      className={`border-b border-[#2a2a35] ${severityConfig.bg} ${
        !event.acknowledged && event.severity === 'critical' ? 'animate-pulse-glow' : ''
      }`}
    >
      <div
        onClick={onToggle}
        className="p-3 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-start gap-3">
          {/* Icon and severity indicator */}
          <div className={`text-lg ${event.severity === 'critical' ? 'animate-pulse' : ''}`}>
            {config.icon}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-semibold text-sm ${config.color}`}>
                {config.label}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                event.severity === 'critical' 
                  ? 'bg-red-500/30 text-red-300'
                  : event.severity === 'warning'
                  ? 'bg-orange-500/30 text-orange-300'
                  : 'bg-blue-500/30 text-blue-300'
              }`}>
                {event.severity.toUpperCase()}
              </span>
              {!event.acknowledged && (
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              )}
            </div>

            {/* Message */}
            <p className="text-sm text-gray-300 line-clamp-2">{event.message}</p>

            {/* Meta */}
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <span>📹 {cameraName}</span>
              <span>•</span>
              <span>{formatTime(event.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-[#2a2a35]">
              {/* Snapshot preview */}
              {event.snapshotUrl && (
                <div className="mb-2 rounded overflow-hidden bg-black/50">
                  <div className="aspect-video flex items-center justify-center text-gray-500">
                    <span className="text-2xl">🖼️</span>
                    <span className="ml-2 text-xs">{event.snapshotUrl}</span>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {event.metadata && (
                <div className="text-xs text-gray-400 mb-2 font-mono bg-black/30 p-2 rounded">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-cyan-400">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {!event.acknowledged && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcknowledge();
                    }}
                    className="flex-1 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded text-xs font-medium transition-colors"
                  >
                    ✓ Acknowledge
                  </button>
                )}
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded text-xs font-medium transition-colors"
                >
                  View Camera
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
