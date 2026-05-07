# Smart Agriculture System - REST API Backend

Production-ready REST API for Smart Agriculture IoT System with AI-powered disease prediction and crop recommendations.

## 🚀 Features

### Sensor Management (IoT Integration)
- Store real-time sensor data from agricultural IoT devices
- Get latest sensor readings
- View historical sensor data with date range filtering
- Calculate statistics and analytics

### AI Predictions
- **Disease Prediction**: Analyze sensor data + plant images
- **Crop Recommendations**: Suggest optimal crops based on soil/climate conditions
- Full prediction history and tracking

### Advanced Features
- Rate limiting (protect against abuse)
- File upload handling (multer)
- Request validation (Joi)
- Global error handling
- Logging middleware
- Security headers (Helmet)
- CORS enabled
- API key authentication for IoT devices

## 📋 Prerequisites

- Node.js >= 16.0.0
- MongoDB (local or Atlas)
- npm or yarn

## ⚙️ Installation

### 1. Clone/Setup
```bash
cd d:\MIF\coding\PROJECTS\AI-IOT-FARMER\backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy .env.example to .env and update values
copy .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-agriculture
API_KEY=your-secret-api-key-for-esp32
```

### 4. Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

## 🏃 Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server will start on: **http://localhost:5000**

Health check: **http://localhost:5000/health**

API docs: **http://localhost:5000/api**

## 📖 API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All endpoints require API key in header:
```
Headers:
  x-api-key: your-secret-api-key-for-esp32
```

### 1. Sensor Data APIs

#### Submit Sensor Data
```
POST /sensors/data
Content-Type: application/json
x-api-key: your-secret-api-key-for-esp32

{
  "deviceId": "DEVICE-001",
  "temperature": 28.5,
  "humidity": 65,
  "moisture": 45,
  "ph": 6.8,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Get Latest Sensor Data
```
GET /sensors/latest/DEVICE-001
x-api-key: your-secret-api-key-for-esp32
```

#### Get Sensor History
```
GET /sensors/history/DEVICE-001?from=2024-01-01&to=2024-01-31&limit=50&skip=0
x-api-key: your-secret-api-key-for-esp32
```

#### Get Sensor Statistics
```
GET /sensors/statistics/DEVICE-001?from=2024-01-01&to=2024-01-31
x-api-key: your-secret-api-key-for-esp32
```

### 2. AI Prediction APIs

#### Predict Disease
```
POST /ai/predict-disease
Content-Type: multipart/form-data
x-api-key: your-secret-api-key-for-esp32

Form Data:
  - deviceId: DEVICE-001
  - temperature: 28.5
  - humidity: 85
  - moisture: 75
  - ph: 6.8
  - image: <file> (optional)
```

#### Suggest Crop
```
POST /ai/suggest-crop
Content-Type: application/json
x-api-key: your-secret-api-key-for-esp32

{
  "temperature": 25,
  "humidity": 70,
  "moisture": 55,
  "ph": 6.5,
  "location": "Region A",
  "deviceId": "DEVICE-001"
}
```

#### Get Prediction History
```
GET /ai/predictions/DEVICE-001?type=disease&limit=20
x-api-key: your-secret-api-key-for-esp32
```

### 3. History & Analytics APIs

#### Get All Predictions
```
GET /history/predictions/DEVICE-001?type=disease&limit=50&skip=0
x-api-key: your-secret-api-key-for-esp32
```

#### Get Prediction Details
```
GET /history/predictions/DEVICE-001/PREDICTION-ID
x-api-key: your-secret-api-key-for-esp32
```

#### Get Prediction Summary
```
GET /history/summary/DEVICE-001?days=30
x-api-key: your-secret-api-key-for-esp32
```

#### Delete Prediction
```
DELETE /history/predictions/DEVICE-001/PREDICTION-ID
x-api-key: your-secret-api-key-for-esp32
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # MongoDB connection
│   │   └── constants.js     # Constants & enums
│   ├── models/              # Database schemas
│   │   ├── Sensor.js
│   │   └── Prediction.js
│   ├── controllers/         # Request handlers
│   │   ├── sensor.controller.js
│   │   ├── ai.controller.js
│   │   └── history.controller.js
│   ├── services/            # Business logic
│   │   ├── sensor.service.js
│   │   └── ai.service.js
│   ├── routes/              # API routes
│   │   ├── sensor.routes.js
│   │   ├── ai.routes.js
│   │   └── history.routes.js
│   ├── middleware/          # Express middleware
│   │   ├── errorHandler.js  # Global error handling
│   │   ├── validation.js    # Request validation
│   │   ├── apiKeyAuth.js    # API key authentication
│   │   ├── logging.js       # Request/response logging
│   │   ├── rateLimiter.js   # Rate limiting
│   │   └── multerConfig.js  # File upload setup
│   └── app.js              # Express app setup
├── uploads/                 # Uploaded files directory
├── server.js               # Server entry point
├── package.json            # Dependencies
├── .env                    # Environment variables
├── .env.example           # Example environment
└── .gitignore             # Git ignore rules
```

## 🗄️ Database Models

### Sensor Model
```javascript
{
  deviceId: String,          // IoT device identifier
  temperature: Number,        // °C
  humidity: Number,          // 0-100%
  moisture: Number,          // 0-100%
  ph: Number,               // 0-14
  timestamp: Date,          // Reading time
  createdAt: Date,          // Record creation time
  updatedAt: Date           // Last update time
}
```

### Prediction Model
```javascript
{
  deviceId: String,         // Associated device
  type: String,            // 'disease' | 'crop'
  inputData: {             // Input parameters
    temperature: Number,
    humidity: Number,
    moisture: Number,
    ph: Number,
    location: String,
    imageUrl: String       // If image submitted
  },
  result: {                // Prediction output
    prediction: String,    // Disease/crop name
    confidence: Number,    // 0-100
    solution: String,      // Recommendation
    recommendations: [String], // Action items
    metadata: Object       // Additional data
  },
  status: String,          // 'pending' | 'completed' | 'failed'
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

✅ **API Key Authentication** - Device validation
✅ **Rate Limiting** - Abuse prevention
✅ **Input Validation** - Joi schema validation
✅ **Error Handling** - Centralized error management
✅ **CORS** - Cross-origin enabled
✅ **Helmet** - Security headers
✅ **Multer** - Safe file uploads

## 📊 Example Requests

### Using cURL

```bash
# Submit sensor data
curl -X POST http://localhost:5000/api/v1/sensors/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-for-esp32" \
  -d '{
    "deviceId": "DEVICE-001",
    "temperature": 28.5,
    "humidity": 65,
    "moisture": 45,
    "ph": 6.8
  }'

# Get latest sensor data
curl http://localhost:5000/api/v1/sensors/latest/DEVICE-001 \
  -H "x-api-key: your-secret-api-key-for-esp32"

# Predict disease
curl -X POST http://localhost:5000/api/v1/ai/predict-disease \
  -H "x-api-key: your-secret-api-key-for-esp32" \
  -F "deviceId=DEVICE-001" \
  -F "temperature=28.5" \
  -F "humidity=85" \
  -F "moisture=75" \
  -F "ph=6.8" \
  -F "image=@path/to/leaf.jpg"

# Suggest crop
curl -X POST http://localhost:5000/api/v1/ai/suggest-crop \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-for-esp32" \
  -d '{
    "temperature": 25,
    "humidity": 70,
    "moisture": 55,
    "ph": 6.5,
    "location": "Region A",
    "deviceId": "DEVICE-001"
  }'
```

### Using Postman

1. Import collection from API documentation endpoint: `/api`
2. Set environment variables:
   - `baseUrl`: http://localhost:5000
   - `apiKey`: your-secret-api-key-for-esp32
3. Use `{{baseUrl}}` and `{{apiKey}}` in requests

## 🧪 Testing

```bash
# Run tests (Jest configured)
npm test
```

## 📈 Performance & Scalability

- **Database Indexing**: Optimized queries with indexes on deviceId and timestamps
- **Rate Limiting**: Configurable per endpoint type
- **File Uploads**: 5MB limit with image validation
- **Pagination**: Supports limit/skip for large datasets
- **Connection Pooling**: Mongoose handles MongoDB connections

## 🔧 Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | development | Environment mode |
| PORT | 5000 | Server port |
| MONGODB_URI | mongodb://localhost:27017/ | DB connection |
| API_KEY | secret-key | Device auth key |
| RATE_LIMIT_WINDOW | 15 | Rate limit window (minutes) |
| RATE_LIMIT_MAX_REQUESTS | 100 | Requests per window |
| MAX_FILE_SIZE | 5242880 | Max upload (5MB) |
| CORS_ORIGIN | * | CORS whitelist |

## 💡 Usage Tips

1. **Device Registration**: Use unique deviceId for each IoT device
2. **Timestamp**: Send ISO 8601 format (2024-01-15T10:30:00Z)
3. **Validation**: Check API response status and messages
4. **Rate Limiting**: Monitor rate limit headers in response
5. **Error Handling**: Implement retry logic with exponential backoff

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running
- Local: mongod
- Atlas: Check connection string and IP whitelist
```

### API Key Rejected
```
Solution: Verify x-api-key header
- Check .env API_KEY value
- Include header in all requests except /health
```

### File Upload Error
```
Solution: Check file size and format
- Max size: 5MB
- Allowed: JPEG, PNG, WebP
```

### Port Already in Use
```
Solution: Change PORT in .env or kill process
- Windows: netstat -ano | findstr :5000
- Linux/Mac: lsof -i :5000
```

## 🚀 Production Deployment

### Before Deployment:
1. Set `NODE_ENV=production`
2. Use MongoDB Atlas (not local)
3. Set strong `API_KEY`
4. Enable HTTPS
5. Set `CORS_ORIGIN` to specific domain
6. Use environment-specific .env files
7. Set up logging service (CloudWatch, DataDog, etc.)
8. Enable database backups
9. Configure monitoring and alerts

### Deployment Options:
- **Heroku**: Add Procfile
- **AWS**: Lambda + RDS
- **DigitalOcean**: App Platform
- **Railway**: Simple Git deploy
- **Render**: Free tier available

## 📞 Support & Contribution

For issues or improvements, follow the standard git workflow:
```bash
git checkout -b feature/your-feature
git commit -m "Add your changes"
git push origin feature/your-feature
```

## 📄 License

ISC License - See package.json

---

**Built for Smart Agriculture Systems** 🌾🚀
