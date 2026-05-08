# OpenRouter API Integration - Summary

## What Was Done

Your Smart Agriculture IoT project has been successfully updated to use **OpenRouter API** for real AI-powered predictions instead of mock data.

---

## Files Created/Modified

### New Files Created:
1. **`backend/src/services/openrouter.client.js`** - OpenRouter API client
2. **`backend/OPENROUTER_SETUP.md`** - Comprehensive setup guide
3. **`backend/OPENROUTER_QUICKSTART.md`** - Quick start guide

### Files Modified:
1. **`backend/src/services/ai.service.js`** - Updated to use OpenRouter
2. **`backend/package.json`** - Added `axios` dependency
3. **`backend/.env.example`** - Added OpenRouter configuration

---

## Quick Start (3 Steps)

### 1️⃣ Get OpenRouter API Key (1 minute)
- Visit: https://openrouter.ai/auth/login
- Sign up (free)
- Go to: https://openrouter.ai/keys
- Create key → Copy it

### 2️⃣ Configure Backend (1 minute)
```bash
cd backend
cp .env.example .env
# Edit .env and add: OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

### 3️⃣ Install & Run (1 minute)
```bash
npm install
npm run dev
```

✅ **Done!** Server is now using real AI

---

## What Changed in Code

### Before (Mock Data)
```javascript
// ai.service.js - Old approach
static async predictDisease(sensorData, deviceId, imageUrl = null) {
  // Hardcoded mock logic
  if (humidity > 85 && moisture > 75) {
    disease = 'Powdery Mildew';  // Fixed response
  }
}
```

### After (Real AI)
```javascript
// ai.service.js - New approach
static async predictDisease(sensorData, deviceId, imageUrl = null, plantDescription = null) {
  // Use AI to analyze
  const diseaseAnalysis = await openRouterClient.analyzePlantDisease(
    sensorData,
    deviceId,
    plantDescription
  );
  // AI returns: disease, confidence, solution, recommendations
}
```

---

## New AI Features

### 1. Disease Prediction ✅
- **Input**: Temperature, humidity, moisture, pH, plant description
- **Output**: Disease name, confidence %, treatment, recommendations
- **Example**: 
  - Detects: Powdery Mildew, Spider Mites, Root Rot, etc.
  - Provides: Treatment steps and prevention tips

### 2. Crop Recommendation ✅
- **Input**: Temp, humidity, moisture, pH, location
- **Output**: Top 5 crops with suitability scores
- **Example**:
  - "Tomato (High) - Confidence 90%"
  - "Includes growth period and water needs"

### 3. Farming Advice ✅
- **Input**: Current conditions + crop type
- **Output**: Immediate actions, watering schedule, pest prevention
- **Example**:
  - "Reduce watering today"
  - "Apply organic fertilizer next week"

---

## Architecture

```
┌─────────────────────────────────────────────┐
│         IoT Devices (ESP32 Sensors)         │
└────────────────┬────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  Backend API Node  │
        │   (Express.js)     │
        └────────┬───────────┘
                 │
    ┌────────────┼─────────────┐
    │            │             │
    ▼            ▼             ▼
┌────────┐ ┌──────────┐ ┌──────────┐
│MongoDB │ │ AI       │ │Frontend  │
│Database│ │Service   │ │(React)   │
└────────┘ └────┬─────┘ └──────────┘
               │
               ▼
      ┌────────────────────┐
      │  OpenRouter API    │
      │  (Multiple Models) │
      │  - GPT-3.5 Turbo   │
      │  - GPT-4           │
      │  - Claude          │
      │  - Llama           │
      └────────────────────┘
```

---

## API Endpoints

All endpoints now use OpenRouter AI:

### 1. Disease Prediction
```
POST /api/v1/predictions/disease
Headers: x-api-key: your-secret-key
Body: {
  "deviceId": "DEVICE_001",
  "sensorData": { temperature, humidity, moisture, ph },
  "plantDescription": "optional"
}
```

### 2. Crop Recommendation
```
POST /api/v1/predictions/crop
Headers: x-api-key: your-secret-key
Body: {
  "deviceId": "DEVICE_001",
  "conditions": { temperature, humidity, moisture, ph, location }
}
```

### 3. Farming Advice
```
POST /api/v1/predictions/advice
Headers: x-api-key: your-secret-key
Body: {
  "deviceId": "DEVICE_001",
  "sensorData": { temperature, humidity, moisture, ph },
  "cropType": "Tomato"
}
```

---

## Environment Configuration

Create `.env` in `backend/` folder:

```env
# Required
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx

# Optional but recommended
SITE_URL=http://localhost:5000
SITE_NAME=Smart Agriculture IoT

# Database
MONGODB_URI=mongodb://localhost:27017/smart-agriculture

# Server
PORT=5000
NODE_ENV=development

# Security
API_KEY=your-secret-api-key-for-esp32

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## Cost Analysis

### OpenRouter Pricing
- **Free Tier**: 10 requests/day
- **Pay-as-you-go**: $0.001 - $0.03 per 1K tokens

### Typical Costs
| Prediction Type | Tokens | Cost |
|---|---|---|
| Disease Detection | ~200 | $0.005 |
| Crop Recommendation | ~300 | $0.010 |
| Farming Advice | ~250 | $0.008 |

### Monthly Estimate
- 1000 daily predictions: ~$5-10/day (~$150-300/month)
- 100 daily predictions: $0.50-1/day (~$15-30/month)

Track usage at: https://openrouter.ai/account/usage

---

## Switching AI Models

Edit `src/services/openrouter.client.js`:

```javascript
// Line: await this.callModel('openai/gpt-3.5-turbo', ...)

// Available options:
'openai/gpt-3.5-turbo'       // Fast ⚡, cheap $, good ✓
'openai/gpt-4'               // Slow 🐢, expensive $$, best ★★★
'anthropic/claude-2'         // Fast ⚡, good ✓, excellent ★★★
'meta-llama/llama-2-70b'     // Fast ⚡, cheap/free, decent ✓
```

---

## Testing

### Using Postman/cURL

**Test Disease Prediction:**
```bash
curl -X POST http://localhost:5000/api/v1/predictions/disease \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-for-esp32" \
  -d '{
    "deviceId": "DEVICE_001",
    "sensorData": {
      "temperature": 28,
      "humidity": 85,
      "moisture": 75,
      "ph": 6.5
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "disease": "Powdery Mildew",
    "confidence": 87,
    "solution": "Apply sulfur-based fungicide and improve air circulation",
    "recommendations": ["Reduce watering", "Improve ventilation", "Apply fungicide"],
    "predictionId": "507f1f77bcf86cd799439011"
  }
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `OPENROUTER_API_KEY not set` | Add key to `.env` file and restart |
| `Invalid API Key` | Check key at https://openrouter.ai/keys |
| `Request timeout` | Check internet, OpenRouter status page |
| `Quota exceeded` | Upgrade plan or wait for daily reset |
| `Model not available` | Check model name at openrouter.ai/models |

---

## What's Next?

1. ✅ **Test locally** with `npm run dev`
2. ✅ **Test endpoints** with curl/Postman
3. ✅ **Deploy backend** to cloud (AWS, Heroku, etc.)
4. ✅ **Connect frontend** to new endpoints
5. ✅ **Configure ESP32** to send sensor data
6. ✅ **Monitor usage** at OpenRouter dashboard
7. ✅ **Set up alerts** for quota warnings

---

## Documentation

- 📖 **Full Setup**: [OPENROUTER_SETUP.md](OPENROUTER_SETUP.md)
- ⚡ **Quick Start**: [OPENROUTER_QUICKSTART.md](OPENROUTER_QUICKSTART.md)
- 📡 **ESP32 Setup**: [ESP32_SETUP_GUIDE.md](../ESP32_SETUP_GUIDE.md)

---

## Support

- **OpenRouter Docs**: https://openrouter.ai/docs
- **GitHub Issues**: Check project repository
- **OpenRouter Status**: https://status.openrouter.ai

---

## Key Benefits ✨

✅ **Real AI Predictions** - Not hardcoded rules  
✅ **Multiple Models** - Can switch anytime  
✅ **Cost Effective** - Pay only for what you use  
✅ **Scalable** - OpenRouter handles load  
✅ **Production Ready** - Error handling included  
✅ **Easy Integration** - Works with existing API  

---

**Your Smart Agriculture IoT project is now powered by real AI! 🚀**

