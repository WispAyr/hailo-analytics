import { useRef, useEffect } from 'react';
import type { Person, Keypoint } from '../types';

interface SkeletonOverlayProps {
  people: Person[];
  width: number;
  height: number;
}

// Skeleton connections (pairs of keypoint names)
const SKELETON_CONNECTIONS: [string, string][] = [
  ['nose', 'left_eye'],
  ['nose', 'right_eye'],
  ['left_eye', 'right_eye'],
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['right_shoulder', 'right_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['right_hip', 'right_knee'],
  ['left_knee', 'left_ankle'],
  ['right_knee', 'right_ankle'],
];

export function SkeletonOverlay({ people, width, height }: SkeletonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    people.forEach(person => {
      if (!person.keypoints || person.keypoints.length === 0) return;

      const keypointMap = new Map<string, Keypoint>();
      person.keypoints.forEach(kp => keypointMap.set(kp.name, kp));

      // Determine color based on state
      const color = person.isFallen 
        ? '#ff3b3b' // Red for fallen
        : person.isLoitering 
        ? '#ff9500' // Orange for loitering
        : '#00d4ff'; // Cyan default

      // Draw skeleton lines
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      SKELETON_CONNECTIONS.forEach(([from, to]) => {
        const fromKp = keypointMap.get(from);
        const toKp = keypointMap.get(to);
        
        if (fromKp && toKp && fromKp.confidence > 0.5 && toKp.confidence > 0.5) {
          ctx.beginPath();
          ctx.moveTo(fromKp.x * width, fromKp.y * height);
          ctx.lineTo(toKp.x * width, toKp.y * height);
          ctx.stroke();
        }
      });

      // Draw keypoints
      person.keypoints.forEach(kp => {
        if (kp.confidence < 0.5) return;

        const x = kp.x * width;
        const y = kp.y * height;
        const radius = 3;

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;
      });
    });

  }, [people, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
    />
  );
}

// Fall detection visualization helper
export function isFallPose(keypoints: Keypoint[]): boolean {
  const keypointMap = new Map<string, Keypoint>();
  keypoints.forEach(kp => keypointMap.set(kp.name, kp));

  const leftShoulder = keypointMap.get('left_shoulder');
  const rightShoulder = keypointMap.get('right_shoulder');
  const leftHip = keypointMap.get('left_hip');
  const rightHip = keypointMap.get('right_hip');

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return false;
  }

  // Calculate body orientation
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipMidY = (leftHip.y + rightHip.y) / 2;
  
  // If shoulders and hips are at similar height (body horizontal)
  const verticalDiff = Math.abs(shoulderMidY - hipMidY);
  const isHorizontal = verticalDiff < 0.1;

  // Check if body is in lower half of frame (person on ground)
  const bodyHeight = Math.max(shoulderMidY, hipMidY);
  const isLow = bodyHeight > 0.6;

  return isHorizontal && isLow;
}
