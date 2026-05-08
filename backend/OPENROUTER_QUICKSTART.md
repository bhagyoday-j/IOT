# OpenRouter API - Quick Start

## 3-Minute Setup

### Step 1: Get API Key (1 minute)
1. Visit https://openrouter.ai/auth/login
2. Sign up (free account)
3. Go to https://openrouter.ai/keys
4. Click "Create Key"
5. Copy the key: `sk-or-v1-xxxxx...`

### Step 2: Configure Backend (1 minute)
```bash
cd backend

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env and paste your API key:
# OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
```

### Step 3: Install & Run (1 minute)
```bash
npm install
npm run dev
```

✅ Done! Server is running with OpenRouter AI

---

## Test the API

### Test 1: Disease Detection
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

### Test 2: Crop Recommendation
```bash
curl -X POST http://localhost:5000/api/v1/predictions/crop \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-for-esp32" \
  -d '{
    "deviceId": "DEVICE_001",
    "conditions": {
      "temperature": 25,
      "humidity": 65,
      "moisture": 50,
      "ph": 6.8,
      "location": "India"
    }
  }'
```

---

## What Changed?

### Before (Mock Data)
```javascript
// Mock disease detection logic
if (humidity > 85 && moisture > 75) {
  disease = 'Powdery Mildew';
  // ...
}
```

### After (Real AI)
```javascript
// Use OpenRouter API for AI analysis
const diseaseAnalysis = await openRouterClient.analyzePlantDisease(
  sensorData,
  deviceId,
  plantDescription
);
```

---

## File Structure

```
backend/
├── .env                           ← Add your API key here!
├── .env.example                   ← Template
├── OPENROUTER_SETUP.md           ← Full setup guide
├── src/
│   ├── services/
│   │   ├── ai.service.js         ← Updated with OpenRouter
│   │   └── openrouter.client.js  ← NEW OpenRouter client
│   └── ...
└── package.json                  ← Added axios dependency
```

---

## Features

✅ **Disease Prediction** - AI analyzes sensor data + plant description  
✅ **Crop Recommendation** - AI suggests best crops for conditions  
✅ **Farming Advice** - AI provides personalized farming guidance  
✅ **Multiple Models** - Can switch between OpenAI, Claude, Llama, etc.  
✅ **Error Handling** - Graceful fallback on API errors  
✅ **Production Ready** - Rate limiting, logging, caching support  

---

## Switching Models

Edit `src/services/openrouter.client.js`:

```javascript
// Line: await this.callModel('openai/gpt-3.5-turbo', ...)

// Options:
'openai/gpt-3.5-turbo'        // Fast, cheap
'openai/gpt-4'                // Slow, expensive, best quality
'anthropic/claude-2'          // Fast, good quality
'meta-llama/llama-2-70b'      // Free/cheap, decent quality
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `OPENROUTER_API_KEY not set` | Add key to `.env` file |
| `Invalid API Key` | Check key is copied correctly from openrouter.ai/keys |
| `Request timeout` | Check internet, try again |
| `Quota exceeded` | Upgrade plan on openrouter.ai |

---

## Cost Tracking

Check usage at: **https://openrouter.ai/account/usage**

Typical costs:
- Disease prediction: $0.005 per request
- Crop recommendation: $0.01 per request
- 1000 daily predictions: ~$5-10/day

---

## Next: Integrate with ESP32

The backend now sends real AI predictions to your frontend/mobile app when ESP32 sensors send data.

See [ESP32_SETUP_GUIDE.md](../ESP32_SETUP_GUIDE.md) for sensor integration.

---

## Resources

- Docs: https://openrouter.ai/docs
- Pricing: https://openrouter.ai/pricing
- Status: https://status.openrouter.ai
- Models: https://openrouter.ai/models

