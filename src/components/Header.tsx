import { motion } from 'framer-motion';
import { useStore } from '../store';

export function Header() {
  const { stats, wsConnected, useMockData } = useStore();

  const statItems = [
    {
      label: 'People Now',
      value: stats?.totalPeopleNow ?? '--',
      color: 'text-cyan-400',
      icon: '👥',
    },
    {
      label: 'Detections Today',
      value: stats?.totalDetectionsToday?.toLocaleString() ?? '--',
      color: 'text-green-400',
      icon: '📊',
    },
    {
      label: 'Alerts Today',
      value: stats?.alertsToday ?? '--',
      color: stats?.criticalAlertsToday ? 'text-red-400' : 'text-orange-400',
      icon: '⚠️',
    },
    {
      label: 'Falls Detected',
      value: stats?.fallsDetected ?? '--',
      color: 'text-red-400',
      icon: '🚨',
    },
    {
      label: 'Loitering',
      value: stats?.loiteringIncidents ?? '--',
      color: 'text-yellow-400',
      icon: '👁️',
    },
    {
      label: 'Avg Dwell',
      value: stats?.avgDwellTime ? `${Math.floor(stats.avgDwellTime / 60)}m ${stats.avgDwellTime % 60}s` : '--',
      color: 'text-purple-400',
      icon: '⏱️',
    },
    {
      label: 'Peak Hour',
      value: stats?.peakHour ?? '--',
      color: 'text-cyan-400',
      icon: '📈',
    },
  ];

  return (
    <header className="bg-[#12121a] border-b border-[#2a2a35] px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-orange-500 flex items-center justify-center"
          >
            <span className="text-2xl">🎯</span>
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
              Hailo AI Analytics
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span
                className={`w-2 h-2 rounded-full ${
                  useMockData
                    ? 'bg-yellow-500'
                    : wsConnected
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-red-500'
                }`}
              />
              {useMockData ? 'Mock Data' : wsConnected ? 'Live' : 'Disconnected'}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-4 lg:gap-6">
          {statItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 px-3 py-2 bg-[#1a1a25] rounded-lg border border-[#2a2a35]"
            >
              <span className="text-lg">{item.icon}</span>
              <div>
                <div className={`text-lg font-mono font-bold ${item.color}`}>
                  {item.value}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  {item.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </header>
  );
}
