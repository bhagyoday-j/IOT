import { useState } from 'react';
import { Leaf, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingSpinner';
import { suggestCrop } from '../../services/api';
import { useStore } from '../../store/useStore';

interface CropSuggestion {
  crop: string;
  suitability: number;
  reason: string;
}

export default function CropRecommendation() {
  const { latestSensorData } = useStore();
  const [formData, setFormData] = useState({
    temperature: latestSensorData?.temperature.toFixed(1) || '',
    humidity: latestSensorData?.humidity.toFixed(0) || '',
    moisture: latestSensorData?.moisture.toFixed(0) || '',
    ph: latestSensorData?.ph.toFixed(1) || '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CropSuggestion[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location) {
      toast.error('Please enter location');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        moisture: parseFloat(formData.moisture),
        ph: parseFloat(formData.ph),
        location: formData.location,
      };

      const res = await suggestCrop(payload);
      setResults(res.data.data.recommendations || []);
      toast.success('Crop recommendations generated');
    } catch (error) {
      console.error('Failed to get crop suggestions:', error);

      // Mock results for demo
      const mockResults = [
        {
          crop: 'Rice',
          suitability: 92,
          reason: 'Optimal conditions for rice cultivation. High moisture and temperature levels are ideal.',
        },
        {
          crop: 'Wheat',
          suitability: 78,
          reason: 'Suitable conditions. May require additional irrigation during dry periods.',
        },
        {
          crop: 'Corn',
          suitability: 85,
          reason: 'Good temperature and pH levels. Ensure consistent moisture for best yield.',
        },
      ];
      setResults(mockResults);
      toast.success('Crop recommendations generated (demo mode)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Crop Recommendation</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Get AI-powered crop suggestions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Environmental Parameters</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  step="0.1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Humidity (%)
                </label>
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Moisture (%)
                </label>
                <input
                  type="number"
                  name="moisture"
                  value={formData.moisture}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  pH Level
                </label>
                <input
                  type="number"
                  name="ph"
                  value={formData.ph}
                  onChange={handleInputChange}
                  step="0.1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Punjab, India"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing...' : 'Suggest Crop'}
            </button>
          </form>
        </div>

        <div>
          {loading && <LoadingSpinner />}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Recommended Crops</h2>
              {results.map((crop, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-50 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{crop.crop}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Suitability Score</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {crop.suitability}%
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                        style={{ width: `${crop.suitability}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{crop.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
