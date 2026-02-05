import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { CameraCard } from './CameraCard';

export function CameraGrid() {
  const { cameras, selectedCamera, setSelectedCamera } = useStore();

  // Sort cameras: online first, then by name
  const sortedCameras = [...cameras].sort((a, b) => {
    if (a.status === 'online' && b.status !== 'online') return -1;
    if (a.status !== 'online' && b.status === 'online') return 1;
    return a.name.localeCompare(b.name);
  });

  const handleCameraClick = (cameraId: string) => {
    setSelectedCamera(selectedCamera === cameraId ? null : cameraId);
  };

  return (
    <div className="flex-1 p-4 overflow-auto">
      <motion.div
        layout
        className="grid gap-4 auto-rows-fr"
        style={{
          gridTemplateColumns: selectedCamera
            ? 'repeat(auto-fill, minmax(280px, 1fr))'
            : 'repeat(auto-fill, minmax(350px, 1fr))',
        }}
      >
        <AnimatePresence mode="popLayout">
          {selectedCamera && (
            <motion.div
              key="expanded"
              layout
              className="col-span-full lg:col-span-2 lg:row-span-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {cameras
                .filter(c => c.id === selectedCamera)
                .map(camera => (
                  <CameraCard
                    key={camera.id}
                    camera={camera}
                    onClick={() => handleCameraClick(camera.id)}
                    expanded
                  />
                ))}
            </motion.div>
          )}

          {sortedCameras
            .filter(c => selectedCamera ? c.id !== selectedCamera : true)
            .map((camera, i) => (
              <motion.div
                key={camera.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <CameraCard
                  camera={camera}
                  onClick={() => handleCameraClick(camera.id)}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
