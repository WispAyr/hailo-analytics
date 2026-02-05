import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import type { Zone } from '../types';
import { ZoneTypeBadge } from './ZoneOverlay';

interface ZoneEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ZoneEditor({ isOpen, onClose }: ZoneEditorProps) {
  const { zones, cameras, addZone, updateZone, deleteZone } = useStore();
  const [editMode, setEditMode] = useState<'list' | 'edit' | 'create'>('list');
  const [editingZone, setEditingZone] = useState<Partial<Zone>>({});

  const getCameraName = (cameraId: string) => {
    return cameras.find(c => c.id === cameraId)?.name || cameraId;
  };

  const handleCreateNew = () => {
    setEditingZone({
      id: `zone-${Date.now()}`,
      name: '',
      cameraId: cameras[0]?.id || '',
      points: [],
      color: '#00d4ff',
      type: 'crowd',
      maxCapacity: 50,
      loiterThreshold: 60,
    });
    setEditMode('create');
  };

  const handleEdit = (zone: Zone) => {
    setEditingZone({ ...zone });
    setEditMode('edit');
  };

  const handleSave = () => {
    if (!editingZone.name || !editingZone.cameraId) return;
    
    const zone: Zone = {
      id: editingZone.id || `zone-${Date.now()}`,
      name: editingZone.name,
      cameraId: editingZone.cameraId,
      points: editingZone.points || [],
      color: editingZone.color || '#00d4ff',
      type: editingZone.type || 'crowd',
      maxCapacity: editingZone.maxCapacity,
      loiterThreshold: editingZone.loiterThreshold,
    };

    if (editMode === 'create') {
      addZone(zone);
    } else {
      updateZone(zone);
    }
    
    setEditMode('list');
    setEditingZone({});
  };

  const handleDelete = (zoneId: string) => {
    if (confirm('Delete this zone?')) {
      deleteZone(zoneId);
    }
  };

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

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-4 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[800px] lg:max-h-[80vh] bg-[#12121a] border border-[#2a2a35] rounded-xl z-50 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a35]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>📍</span> 
            {editMode === 'list' ? 'Zone Manager' : editMode === 'create' ? 'Create Zone' : 'Edit Zone'}
          </h2>
          <div className="flex items-center gap-2">
            {editMode !== 'list' && (
              <button
                onClick={() => {
                  setEditMode('list');
                  setEditingZone({});
                }}
                className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <AnimatePresence mode="wait">
            {editMode === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Create button */}
                <button
                  onClick={handleCreateNew}
                  className="w-full mb-4 p-4 border-2 border-dashed border-[#2a2a35] rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-colors text-gray-400 hover:text-cyan-400"
                >
                  <span className="text-2xl">+</span>
                  <span className="ml-2">Create New Zone</span>
                </button>

                {/* Zone list */}
                <div className="space-y-3">
                  {zones.map(zone => (
                    <div
                      key={zone.id}
                      className={`p-4 bg-[#1a1a25] rounded-xl border border-[#2a2a35] hover:border-[${zone.color}]/50 transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: zone.color }}
                            />
                            <h3 className="font-semibold text-white">{zone.name}</h3>
                            <ZoneTypeBadge type={zone.type} />
                          </div>
                          <p className="text-sm text-gray-400">
                            📹 {getCameraName(zone.cameraId)}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {zone.maxCapacity && (
                              <span>👥 Max: {zone.maxCapacity}</span>
                            )}
                            {zone.loiterThreshold && (
                              <span>⏱️ Loiter: {zone.loiterThreshold}s</span>
                            )}
                            <span>📐 {zone.points.length} points</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(zone)}
                            className="px-3 py-1.5 text-sm bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(zone.id)}
                            className="px-3 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {zones.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📍</div>
                    <p>No zones defined yet</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Zone form */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Zone Name</label>
                    <input
                      type="text"
                      value={editingZone.name || ''}
                      onChange={e => setEditingZone({ ...editingZone, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2a2a35] rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="e.g., Main Entrance"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Camera</label>
                    <select
                      value={editingZone.cameraId || ''}
                      onChange={e => setEditingZone({ ...editingZone, cameraId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2a2a35] rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    >
                      {cameras.map(cam => (
                        <option key={cam.id} value={cam.id}>{cam.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Zone Type</label>
                    <select
                      value={editingZone.type || 'crowd'}
                      onChange={e => setEditingZone({ ...editingZone, type: e.target.value as Zone['type'] })}
                      className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2a2a35] rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="crowd">Crowd Zone</option>
                      <option value="entry">Entry</option>
                      <option value="exit">Exit</option>
                      <option value="restricted">Restricted</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editingZone.color || '#00d4ff'}
                        onChange={e => setEditingZone({ ...editingZone, color: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingZone.color || '#00d4ff'}
                        onChange={e => setEditingZone({ ...editingZone, color: e.target.value })}
                        className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-[#2a2a35] rounded-lg text-white font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Max Capacity</label>
                    <input
                      type="number"
                      value={editingZone.maxCapacity || ''}
                      onChange={e => setEditingZone({ ...editingZone, maxCapacity: parseInt(e.target.value) || undefined })}
                      className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2a2a35] rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Loiter Threshold (seconds)</label>
                    <input
                      type="number"
                      value={editingZone.loiterThreshold || ''}
                      onChange={e => setEditingZone({ ...editingZone, loiterThreshold: parseInt(e.target.value) || undefined })}
                      className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2a2a35] rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Points editor */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Zone Points ({editingZone.points?.length || 0})
                  </label>
                  <div className="p-4 bg-[#0a0a0f] rounded-lg border border-[#2a2a35]">
                    {editingZone.points && editingZone.points.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {editingZone.points.map((point, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1 px-2 py-1 bg-[#1a1a25] rounded text-xs font-mono"
                          >
                            <span className="text-cyan-400">{i + 1}:</span>
                            <span>({point.x.toFixed(2)}, {point.y.toFixed(2)})</span>
                            <button
                              onClick={() => {
                                const newPoints = editingZone.points?.filter((_, idx) => idx !== i);
                                setEditingZone({ ...editingZone, points: newPoints });
                              }}
                              className="text-red-400 hover:text-red-300 ml-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Click on the camera preview to add points, or use the polygon drawing tool.
                      </p>
                    )}
                    
                    {/* Quick polygon presets */}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setEditingZone({
                          ...editingZone,
                          points: [
                            { x: 0.1, y: 0.1 },
                            { x: 0.9, y: 0.1 },
                            { x: 0.9, y: 0.9 },
                            { x: 0.1, y: 0.9 },
                          ],
                        })}
                        className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30"
                      >
                        Full Frame
                      </button>
                      <button
                        onClick={() => setEditingZone({
                          ...editingZone,
                          points: [
                            { x: 0.25, y: 0.25 },
                            { x: 0.75, y: 0.25 },
                            { x: 0.75, y: 0.75 },
                            { x: 0.25, y: 0.75 },
                          ],
                        })}
                        className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30"
                      >
                        Center Box
                      </button>
                      <button
                        onClick={() => setEditingZone({ ...editingZone, points: [] })}
                        className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end gap-2 pt-4 border-t border-[#2a2a35]">
                  <button
                    onClick={() => {
                      setEditMode('list');
                      setEditingZone({});
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!editingZone.name || !editingZone.cameraId}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors"
                  >
                    {editMode === 'create' ? 'Create Zone' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
