import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DiseasePrediction from './pages/DiseasePrediction';
import CropRecommendation from './pages/CropRecommendation';
import History from './pages/History';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'disease', Component: DiseasePrediction },
      { path: 'crop', Component: CropRecommendation },
      { path: 'history', Component: History },
    ],
  },
]);
