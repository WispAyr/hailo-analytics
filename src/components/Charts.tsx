import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useStore } from '../store';

type ChartView = 'hourly' | 'daily' | 'zones';

export function Charts() {
  const [view, setView] = useState<ChartView>('hourly');
  const { chartData } = useStore();

  if (!chartData) {
    return (
      <div className="p-6 bg-[#12121a] rounded-xl border border-[#2a2a35] text-center text-gray-500">
        <div className="text-4xl mb-2">📊</div>
        <p>Loading chart data...</p>
      </div>
    );
  }

  const tabs: { id: ChartView; label: string; icon: string }[] = [
    { id: 'hourly', label: 'Hourly', icon: '⏱️' },
    { id: 'daily', label: 'Daily', icon: '📅' },
    { id: 'zones', label: 'By Zone', icon: '📍' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-[#12121a] rounded-xl border border-[#2a2a35]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📈</span> Crowd Analytics
        </h2>
        
        {/* View tabs */}
        <div className="flex bg-[#0a0a0f] rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                view === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        {view === 'hourly' && <HourlyChart data={chartData.hourly} />}
        {view === 'daily' && <DailyChart data={chartData.daily} />}
        {view === 'zones' && <ZoneChart data={chartData.byZone} />}
      </div>
    </motion.div>
  );
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  
  return (
    <div className="bg-[#1a1a25] border border-[#2a2a35] rounded-lg p-3 shadow-xl">
      <p className="text-cyan-400 font-semibold mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-mono">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

function HourlyChart({ data }: { data: { time: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorCrowd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
        <XAxis 
          dataKey="time" 
          stroke="#888" 
          tick={{ fill: '#888', fontSize: 10 }}
          interval={2}
        />
        <YAxis 
          stroke="#888" 
          tick={{ fill: '#888', fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          name="People"
          stroke="#00d4ff"
          strokeWidth={2}
          fill="url(#colorCrowd)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function DailyChart({ data }: { data: { time: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
        <XAxis 
          dataKey="time" 
          stroke="#888" 
          tick={{ fill: '#888', fontSize: 11 }}
        />
        <YAxis 
          stroke="#888" 
          tick={{ fill: '#888', fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="value"
          name="Total People"
          fill="#ff9500"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ZoneChart({ data }: { data: { zoneId: string; zoneName: string; data: { time: string; value: number }[] }[] }) {
  // Transform data for multi-line chart
  const chartData = data[0]?.data.map((point, i) => {
    const obj: Record<string, string | number> = { time: point.time };
    data.forEach(zone => {
      obj[zone.zoneName] = zone.data[i]?.value ?? 0;
    });
    return obj;
  }) || [];

  const colors = ['#00d4ff', '#ff9500', '#00ff88', '#9945ff', '#ff3b3b'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
        <XAxis 
          dataKey="time" 
          stroke="#888" 
          tick={{ fill: '#888', fontSize: 10 }}
        />
        <YAxis 
          stroke="#888" 
          tick={{ fill: '#888', fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
        />
        {data.map((zone, i) => (
          <Line
            key={zone.zoneId}
            type="monotone"
            dataKey={zone.zoneName}
            stroke={colors[i % colors.length]}
            strokeWidth={2}
            dot={{ fill: colors[i % colors.length], r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Mini stat chart for dashboard cards
export function MiniChart({ data, color = '#00d4ff' }: { data: number[]; color?: string }) {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
