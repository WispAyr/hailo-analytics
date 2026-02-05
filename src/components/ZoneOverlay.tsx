import type { Zone } from '../types';

interface ZoneOverlayProps {
  zones: Zone[];
  width: number;
  height: number;
}

export function ZoneOverlay({ zones, width, height }: ZoneOverlayProps) {
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        {zones.map(zone => (
          <linearGradient
            key={`gradient-${zone.id}`}
            id={`zone-gradient-${zone.id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={zone.color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={zone.color} stopOpacity={0.1} />
          </linearGradient>
        ))}
      </defs>

      {zones.map(zone => {
        // Convert normalized points to pixel coordinates
        const points = zone.points
          .map(p => `${p.x * width},${p.y * height}`)
          .join(' ');

        // Calculate centroid for label
        const centroidX = zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length * width;
        const centroidY = zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length * height;

        return (
          <g key={zone.id}>
            {/* Zone fill */}
            <polygon
              points={points}
              fill={`url(#zone-gradient-${zone.id})`}
              stroke={zone.color}
              strokeWidth={2}
              strokeDasharray={zone.type === 'restricted' ? '5,5' : undefined}
            />

            {/* Zone label background */}
            <rect
              x={centroidX - 40}
              y={centroidY - 12}
              width={80}
              height={24}
              rx={4}
              fill="rgba(0,0,0,0.7)"
            />

            {/* Zone label text */}
            <text
              x={centroidX}
              y={centroidY + 4}
              textAnchor="middle"
              fill={zone.color}
              fontSize={10}
              fontFamily="monospace"
              fontWeight="bold"
            >
              {zone.name}
            </text>

            {/* Zone type icon */}
            <text
              x={centroidX - 30}
              y={centroidY + 4}
              fontSize={10}
            >
              {zone.type === 'entry' ? '🚪' : 
               zone.type === 'exit' ? '🚶' : 
               zone.type === 'restricted' ? '⛔' : '📍'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Zone type badge component for UI
export function ZoneTypeBadge({ type }: { type: Zone['type'] }) {
  const config = {
    crowd: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Crowd Zone' },
    entry: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Entry' },
    exit: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Exit' },
    restricted: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Restricted' },
  };

  const { bg, text, label } = config[type];

  return (
    <span className={`px-2 py-1 rounded text-xs font-mono ${bg} ${text}`}>
      {label}
    </span>
  );
}
