# Smart Agriculture System - Frontend

A modern, responsive React.js frontend for a Smart Agriculture System powered by IoT sensors and AI, featuring real-time monitoring, disease prediction, and crop recommendation capabilities.

## Tech Stack

- **React.js** (with Vite)
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Zustand** for state management
- **Axios** for API calls
- **Lucide React** for icons
- **Sonner** for toast notifications

## Features

### 1. Dashboard
- Real-time sensor data display (Temperature, Humidity, Moisture, pH)
- 24-hour historical data trends with interactive charts
- Auto-refresh every 10 seconds
- Metric cards with trend indicators

### 2. Disease Prediction
- Plant image upload with preview
- AI-powered disease detection
- Automatic sensor data integration
- Detailed prediction results with confidence scores
- Treatment recommendations

### 3. Crop Recommendation
- Environmental parameter input form
- AI-based crop suggestions
- Suitability scores for each recommended crop
- Location-based recommendations

### 4. History
- Complete prediction and recommendation history
- Filter by type (disease/crop)
- Detailed records with timestamps
- Searchable table view

### 5. Additional Features
- Dark mode toggle
- Device online/offline status indicator
- Responsive design (mobile & desktop)
- Clean, modern Figma-inspired UI
- Loading states and error handling

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   ├── MetricCard.tsx
│   │   └── LoadingSpinner.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── DiseasePrediction.tsx
│   │   ├── CropRecommendation.tsx
│   │   └── History.tsx
│   ├── routes.tsx
│   └── App.tsx
├── services/
│   └── api.ts
├── store/
│   └── useStore.ts
└── styles/
    └── theme.css
```

## API Integration

The application integrates with the following API endpoints:

- `GET /api/v1/sensors/latest/:deviceId` - Latest sensor readings
- `GET /api/v1/sensors/history/:deviceId` - Historical sensor data
- `POST /api/v1/ai/predict-disease` - Disease prediction from image
- `POST /api/v1/ai/suggest-crop` - Crop recommendations
- `GET /api/v1/history/predictions/:deviceId` - Prediction history

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_DEVICE_ID=DEVICE_001
```

## Installation & Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   - Update `.env` file with your API base URL and device ID

3. **Start the preview:**
   The Vite dev server is already running. Use the preview surface to view the application.

## Usage

1. **Dashboard**: Monitor real-time sensor data and view 24-hour trends
2. **Disease Prediction**: Upload plant images to detect diseases
3. **Crop Recommendation**: Enter environmental parameters to get crop suggestions
4. **History**: Review past predictions and recommendations

## Demo Mode

If the backend API is unavailable, the application falls back to mock data, allowing you to explore all features without a live backend connection.

## Design System

- **Primary Color**: Green (#22c55e)
- **Background**: White/Gray-50 (Light), Gray-900 (Dark)
- **Cards**: White with subtle shadows and rounded corners
- **Typography**: Clean, modern font hierarchy
- **Spacing**: Consistent padding and margins
- **Responsive**: Mobile-first design

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
