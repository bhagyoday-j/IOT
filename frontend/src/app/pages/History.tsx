import { useState, useEffect } from 'react';
import { Filter, Calendar } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPredictionHistory, deviceId } from '../../services/api';

interface HistoryRecord {
  id: string;
  type: 'disease' | 'crop';
  result: string;
  confidence?: number;
  timestamp: string;
  details: string;
}

export default function History() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'disease' | 'crop'>('all');
  const [records, setRecords] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getPredictionHistory(deviceId);
      const predictions = res.data.data.predictions || [];
      
      // Transform predictions to match HistoryRecord interface
      const transformedRecords: HistoryRecord[] = predictions.map((pred: any) => ({
        id: pred._id || pred.id,
        type: pred.type,
        result: pred.result?.prediction || 'N/A',
        confidence: pred.result?.confidence,
        timestamp: pred.createdAt || pred.timestamp,
        details: pred.result?.solution || 'No details available',
      }));
      
      setRecords(transformedRecords);
    } catch (error) {
      console.error('Failed to fetch history:', error);

      // Mock data for demo
      const mockRecords: HistoryRecord[] = [
        {
          id: '1',
          type: 'disease',
          result: 'Leaf Blight',
          confidence: 87.5,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: 'Apply copper-based fungicide. Remove infected leaves.',
        },
        {
          id: '2',
          type: 'crop',
          result: 'Rice, Wheat, Corn',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          details: 'Top 3 recommended crops based on current conditions',
        },
        {
          id: '3',
          type: 'disease',
          result: 'Powdery Mildew',
          confidence: 92.3,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          details: 'Use sulfur-based spray. Improve air circulation.',
        },
        {
          id: '4',
          type: 'crop',
          result: 'Tomato, Potato, Cabbage',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          details: 'Suitable for current seasonal conditions',
        },
        {
          id: '5',
          type: 'disease',
          result: 'Bacterial Spot',
          confidence: 78.9,
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          details: 'Remove affected plants. Apply copper fungicide.',
        },
      ];
      setRecords(mockRecords);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(
    (record) => filter === 'all' || record.type === filter
  );

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Past predictions and recommendations</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            <div className="flex gap-2">
              {['all', 'disease', 'crop'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as any)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{filteredRecords.length} records</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.type === 'disease'
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                          : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                      }`}
                    >
                      {record.type === 'disease' ? 'Disease' : 'Crop'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{record.result}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.confidence ? (
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.confidence.toFixed(1)}%
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {formatDate(record.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 max-w-md truncate">
                      {record.details}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
