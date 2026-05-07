import { useEffect, useState } from 'react';
import { Thermometer, Droplet, Droplets, FlaskConical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import MetricCard from '../components/MetricCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getLatestSensorData, getSensorHistory, deviceId } from '../../services/api';
import { useStore } from '../../store/useStore';

interface SensorData {
  temperature: number;
  humidity: number;
  moisture: number;
  ph: number;
  timestamp: string;
}

interface HistoryData {
  timestamp: string;
  temperature: number;
  humidity: number;
  moisture: number;
  ph: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const { setLatestSensorData, setDeviceOnline } = useStore();

  const fetchData = async () => {
    try {
      const [latestRes, historyRes] = await Promise.all([
        getLatestSensorData(deviceId),
        getSensorHistory(deviceId, 24),
      ]);

      setSensorData(latestRes.data.data);
      setHistoryData(historyRes.data.data.data);
      setLatestSensorData(latestRes.data.data);
      setDeviceOnline(true);
    } catch (error) {
      console.error('Failed to fetch sensor data:', error);
      setDeviceOnline(false);

      // Mock data for demo
      const mockData = {
        temperature: 28.5,
        humidity: 65,
        moisture: 42,
        ph: 6.8,
        timestamp: new Date().toISOString(),
      };
      setSensorData(mockData);
      setLatestSensorData(mockData);

      const mockHistory = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        temperature: 25 + Math.random() * 8,
        humidity: 60 + Math.random() * 20,
        moisture: 35 + Math.random() * 20,
        ph: 6.2 + Math.random() * 1.2,
      }));
      setHistoryData(mockHistory);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time sensor monitoring</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium ${
            loading ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
            sensorData?.temperature && sensorData.temperature > 20 && sensorData.temperature < 35 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              loading ? 'bg-yellow-600' :
              sensorData?.temperature && sensorData.temperature > 20 && sensorData.temperature < 35 
                ? 'bg-green-600'
                : 'bg-blue-600'
            } animate-pulse`}></div>
            <span>{loading ? 'Connecting...' : 'Live Data'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Temperature"
          value={sensorData?.temperature.toFixed(1) || '0'}
          unit="°C"
          icon={<Thermometer className="w-6 h-6 text-green-600" />}
          trend={2.3}
        />
        <MetricCard
          title="Humidity"
          value={sensorData?.humidity.toFixed(0) || '0'}
          unit="%"
          icon={<Droplets className="w-6 h-6 text-green-600" />}
          trend={-1.5}
        />
        <MetricCard
          title="Soil Moisture"
          value={sensorData?.moisture.toFixed(0) || '0'}
          unit="%"
          icon={<Droplet className="w-6 h-6 text-green-600" />}
          trend={0.8}
        />
        <MetricCard
          title="pH Level"
          value={sensorData?.ph.toFixed(1) || '0'}
          unit="pH"
          icon={<FlaskConical className="w-6 h-6 text-green-600" />}
          trend={-0.2}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">24-Hour Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Temperature & Humidity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  labelFormatter={formatTime}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="temperature" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Moisture & pH</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  labelFormatter={formatTime}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="moisture" stroke="#a855f7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ph" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
