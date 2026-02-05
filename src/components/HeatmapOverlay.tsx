import { useRef, useEffect } from 'react';
import type { HeatmapData } from '../types';

interface HeatmapOverlayProps {
  data: HeatmapData;
  width: number;
  height: number;
}

export function HeatmapOverlay({ data, width, height }: HeatmapOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw heatmap points with gaussian blur effect
    data.points.forEach(point => {
      const x = point.x * width;
      const y = point.y * height;
      const radius = Math.max(30, point.value * 80);
      
      // Create radial gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      
      // Color based on intensity (green -> yellow -> orange -> red)
      const intensity = point.value;
      let color: string;
      if (intensity < 0.25) {
        color = `rgba(0, 255, 136, ${intensity * 2})`; // Green
      } else if (intensity < 0.5) {
        color = `rgba(255, 221, 0, ${intensity * 1.5})`; // Yellow
      } else if (intensity < 0.75) {
        color = `rgba(255, 149, 0, ${intensity})`; // Orange
      } else {
        color = `rgba(255, 59, 59, ${intensity * 0.8})`; // Red
      }
      
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    // Apply blur effect
    ctx.filter = 'blur(10px)';
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';

  }, [data, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none mix-blend-screen"
      style={{ opacity: 0.6 }}
    />
  );
}

// Standalone heatmap legend component
export function HeatmapLegend() {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-400">Density:</span>
      <div className="flex items-center">
        <span className="text-green-400">Low</span>
        <div className="w-24 h-2 mx-2 rounded heatmap-gradient" />
        <span className="text-red-400">High</span>
      </div>
    </div>
  );
}
