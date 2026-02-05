# Hailo AI Analytics Dashboard

A comprehensive real-time analytics dashboard for Hailo-8 edge AI deployments. Features crowd analytics, fall detection, loitering detection, and zone management.

![Dashboard Preview](docs/preview.png)

## Features

### 🔄 Fast Camera Cycling (Round-Robin)
- Rapid cycling through all cameras (250-500ms per camera)
- Full cycle through all online cameras in ~2-4 seconds
- Visual "SCAN" indicator with green glow on active camera
- Configurable speed: Fast (250ms), Normal (400ms), Slow (500ms)
- Maintains fresh views of all cameras with minimal latency

### 🎯 Crowd Analytics
- Live person count per camera/zone
- Density heatmap visualization with canvas overlay
- Dwell time tracking showing how long people stay in zones
- Historical charts (hourly, daily, by zone)
- Peak hour identification

### 🚨 Fall Detection
- Real-time pose estimation display (skeleton overlay)
- Fall detection based on body orientation and position
- Severity-based alert system
- Incident log with timestamps, camera info, and snapshots

### 👁️ Loitering Detection
- Track person duration in zones
- Configurable thresholds (warning at 30s, alert at 60s by default)
- Visual indicators on camera feeds showing loiterers
- Alert escalation system

### 📍 Zone Management
- Visual zone overlay editor
- Support for different zone types (crowd, entry, exit, restricted)
- Polygon-based zone boundaries
- Per-zone capacity limits and loitering thresholds

### 🔧 General Features
- WebSocket connection for real-time updates
- Camera grid with MJPEG feed support
- Event history panel with filtering
- Stats dashboard header
- Dark NOC/LCARS-inspired theme
- Mobile responsive design
- Mock data mode for demos

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **react-hot-toast** - Notifications
- **Recharts** - Analytics charts

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dashboard runs on **http://localhost:3860** by default.

## Configuration

### Mock Data Mode
By default, the dashboard runs in mock data mode for demonstration purposes. Toggle between mock and live mode using the toolbar button or settings panel.

### API Configuration
Configure the backend API endpoints in the settings panel or modify `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3851',  // Your Hailo backend
    changeOrigin: true,
  },
  '/ws': {
    target: 'ws://localhost:3851',
    ws: true,
  },
},
```

## API Endpoints (Backend)

The dashboard expects these API endpoints from your backend:

### REST API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cameras` | GET | List all cameras |
| `/api/zones` | GET | List zones with polygon coordinates |
| `/api/stats` | GET | Current counts, alerts, etc. |
| `/api/events` | GET | Event history (supports `?type=fall\|loiter\|crowd&limit=50`) |
| `/api/heatmap/:camera_id` | GET | Density data for heatmap |

### WebSocket
Connect to `/ws` for real-time updates. Message types:

```typescript
interface WSMessage {
  type: 'person_detected' | 'fall_detected' | 'loiter_alert' | 'crowd_alert' | 'zone_update';
  payload: Person | HailoEvent | DashboardStats;
  timestamp: number;
}
```

## Project Structure

```
hailo-analytics/
├── src/
│   ├── components/
│   │   ├── Header.tsx         # Stats header bar
│   │   ├── Toolbar.tsx        # View controls
│   │   ├── CameraCard.tsx     # Individual camera view
│   │   ├── CameraGrid.tsx     # Camera grid layout
│   │   ├── EventPanel.tsx     # Event log sidebar
│   │   ├── Charts.tsx         # Analytics charts
│   │   ├── HeatmapOverlay.tsx # Density visualization
│   │   ├── SkeletonOverlay.tsx# Pose estimation display
│   │   ├── ZoneOverlay.tsx    # Zone boundaries
│   │   ├── ZoneEditor.tsx     # Zone management modal
│   │   └── SettingsPanel.tsx  # Settings sidebar
│   ├── data/
│   │   └── mockData.ts        # Mock data for demos
│   ├── hooks/
│   │   └── useWebSocket.ts    # WebSocket connection
│   ├── store/
│   │   └── index.ts           # Zustand state management
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles & theme
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Theme Customization

The dashboard uses CSS custom properties for theming. Modify `src/index.css`:

```css
:root {
  --color-background: #0a0a0f;
  --color-surface: #12121a;
  --color-cyan: #00d4ff;
  --color-orange: #ff9500;
  --color-red: #ff3b3b;
  --color-green: #00ff88;
  /* ... */
}
```

## Camera Stream Integration

Replace the placeholder in `CameraCard.tsx` with actual MJPEG stream:

```tsx
<img 
  src={`http://your-server/stream/${camera.id}/mjpeg`}
  alt={camera.name}
  className="absolute inset-0 w-full h-full object-cover"
/>
```

## Fall Detection Logic

The skeleton overlay includes a fall detection helper function:

```typescript
// Returns true if body appears horizontal and in lower frame position
function isFallPose(keypoints: Keypoint[]): boolean {
  // Checks shoulder/hip vertical alignment
  // Checks if body is in lower half of frame
}
```

## PM2 Deployment

```bash
# Build and start with PM2
npm run build
pm2 start npm --name "hailo-analytics" -- run preview

# Or use ecosystem file
pm2 start ecosystem.config.js
```

## Development Notes

### Adding New Event Types
1. Add type to `src/types/index.ts`
2. Handle in `src/hooks/useWebSocket.ts`
3. Add filter button in `src/components/EventPanel.tsx`
4. Add mock data in `src/data/mockData.ts`

### Custom Overlays
Create new overlay components following the pattern in `HeatmapOverlay.tsx`:
- Use canvas for performance-critical rendering
- Accept normalized coordinates (0-1 range)
- Scale to container dimensions

## License

MIT

---

Built for Hailo-8 Edge AI deployments 🎯
