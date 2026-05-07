import { create } from 'zustand';

interface SensorData {
  temperature: number;
  humidity: number;
  moisture: number;
  ph: number;
  timestamp: string;
}

interface StoreState {
  darkMode: boolean;
  deviceOnline: boolean;
  latestSensorData: SensorData | null;
  toggleDarkMode: () => void;
  setDeviceOnline: (status: boolean) => void;
  setLatestSensorData: (data: SensorData | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  darkMode: false,
  deviceOnline: true,
  latestSensorData: null,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setDeviceOnline: (status) => set({ deviceOnline: status }),
  setLatestSensorData: (data) => set({ latestSensorData: data }),
}));
