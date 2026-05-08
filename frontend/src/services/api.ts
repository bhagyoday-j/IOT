import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY || 'your-secret-api-key-for-esp32',
  },
});

export const deviceId = import.meta.env.VITE_DEVICE_ID || 'DEVICE_001';

// Sensor endpoints
export const getLatestSensorData = (deviceId: string) =>
  api.get(`/sensors/latest/${deviceId}`);

export const getSensorHistory = (deviceId: string, hours = 24) =>
  api.get(`/sensors/history/${deviceId}?hours=${hours}`);

// AI endpoints
export const predictDisease = (formData: FormData) =>
  api.post('/ai/predict-disease', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const suggestCrop = (data: {
  temperature: number;
  humidity: number;
  moisture: number;
  ph: number;
  location: string;
  deviceId: string;
}) => api.post('/ai/suggest-crop', data);

// History endpoints
export const getPredictionHistory = (deviceId: string) =>
  api.get(`/history/predictions/${deviceId}`);

export default api;
