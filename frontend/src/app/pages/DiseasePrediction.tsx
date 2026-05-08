import { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingSpinner';
import { predictDisease, getLatestSensorData, deviceId } from '../../services/api';

interface PredictionResult {
  disease: string;
  confidence: number;
  solution: string;
}

export default function DiseasePrediction() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [sensorData, setSensorData] = useState<any>(null);
  const [sensorLoading, setSensorLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSensorData();
  }, []);

  const fetchSensorData = async () => {
    setSensorLoading(true);
    try {
      const res = await getLatestSensorData(deviceId);
      setSensorData(res.data.data);
    } catch (error) {
      console.error('Failed to fetch sensor data:', error);
      setSensorData(null);
      toast.error('Unable to load current sensor data from backend');
    } finally {
      setSensorLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handlePredict = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }
    if (!sensorData) {
      toast.error('Live sensor data is required before prediction');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('temperature', sensorData?.temperature.toString() || '0');
      formData.append('humidity', sensorData?.humidity.toString() || '0');
      formData.append('moisture', sensorData?.moisture.toString() || '0');
      formData.append('ph', sensorData?.ph.toString() || '0');
      formData.append('deviceId', deviceId);

      const res = await predictDisease(formData);
      setResult(res.data.data);
      toast.success('Disease prediction completed');
    } catch (error) {
      console.error('Prediction failed:', error);
      setResult(null);
      toast.error('Disease prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Disease Prediction</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Upload plant image for AI analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Upload Image</h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg object-cover"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedImage?.name}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Click to upload image</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Current Sensor Data</h2>
            {sensorLoading ? (
              <LoadingSpinner />
            ) : sensorData ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Temperature</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{sensorData.temperature.toFixed(1)}°C</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Humidity</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{sensorData.humidity.toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Moisture</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{sensorData.moisture.toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">pH Level</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{sensorData.ph.toFixed(1)}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                No live sensor data available from backend.
              </p>
            )}
          </div>

          <button
            onClick={handlePredict}
            disabled={!selectedImage || loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Analyzing...' : 'Predict Disease'}
          </button>
        </div>

        <div>
          {result && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Prediction Result</h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-300">{result.disease}</h3>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        Confidence: {result.confidence.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Recommended Solution</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{result.solution}</p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Analysis completed at {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
