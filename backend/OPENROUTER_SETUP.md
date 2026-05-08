# OpenRouter API Integration Guide

## Overview

This project now uses **OpenRouter API** for AI-powered predictions instead of mock data. OpenRouter provides access to multiple AI models through a unified interface, including:

- OpenAI (GPT-3.5 Turbo, GPT-4)
- Anthropic (Claude)
- Google (PaLM)
- Meta (Llama)
- And many others

---

## Step 1: Get Your OpenRouter API Key

### 1.1 Create Account
1. Go to **https://openrouter.ai**
2. Click **"Sign In"** → **"Create Account"**
3. Use email/password or OAuth (Google, GitHub)
4. Verify your email

### 1.2 Generate API Key
1. Go to **https://openrouter.ai/keys**
2. Click **"Create Key"** button
3. Choose a name: `Smart Agriculture IoT`
4. Set rate limit (recommended: 100-1000 requests/day)
5. Click **"Create"**
6. **Copy the key immediately** (starts with `sk-or-v1-`)
7. Save in a safe place (you won't be able to see it again)

---

## Step 2: Configure Environment Variables

### 2.1 Create `.env` File
1. In `backend/` folder, create a file named `.env`
2. Copy content from `.env.example`
3. Replace `OPENROUTER_API_KEY` with your actual key:

```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2.2 Complete `.env` Configuration

```env
# ============================================
# OPENROUTER API
# ============================================
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SITE_URL=http://localhost:5000
SITE_NAME=Smart Agriculture IoT

# ============================================
# DATABASE
# ============================================
MONGODB_URI=mongodb://localhost:27017/smart-agriculture
NODE_ENV=development

# ============================================
# SERVER
# ============================================
PORT=5000
CORS_ORIGIN=http://localhost:3000

# ============================================
# API
# ============================================
API_KEY=your-secret-api-key-for-esp32
LOG_LEVEL=debug
```

### ⚠️ Security Note
- **NEVER commit `.env` to Git**
- `.env` is already in `.gitignore`
- Only share `.env.example` (without actual keys)

---

## Step 3: Install Dependencies

```bash
cd backend
npm install
```

This will install the new `axios` package needed for OpenRouter API calls.

---

## Step 4: Verify Installation

### 4.1 Start Backend Server
```bash
npm run dev
```

### 4.2 Check Console Output
Look for one of these messages:

**Success:**
```
✅ OpenRouter API initialized
✅ Health check passed - API is ready
```

**Warning (API not configured):**
```
⚠️  OPENROUTER_API_KEY not set in environment variables
```

---

## Step 5: Test API Endpoints

### 5.1 Disease Prediction
**POST** `/api/v1/predictions/disease`

```json
{
  "deviceId": "DEVICE_001",
  "sensorData": {
    "temperature": 28,
    "humidity": 75,
    "moisture": 60,
    "ph": 6.5
  },
  "plantDescription": "Leaves have white powdery spots, wilting observed"
}
```

**Response:**
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

### 5.2 Crop Recommendation
**POST** `/api/v1/predictions/crop`

```json
{
  "deviceId": "DEVICE_001",
  "conditions": {
    "temperature": 25,
    "humidity": 65,
    "moisture": 50,
    "ph": 6.8,
    "location": "North India"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "name": "Tomato",
        "suitability": "High",
        "confidence": 90,
        "reason": "Optimal temperature and pH range",
        "growthPeriod": "60-85 days",
        "waterNeeds": "Medium"
      }
    ],
    "topCrop": "Tomato",
    "generalAdvice": "Current conditions are excellent for growing tomatoes...",
    "predictionId": "507f1f77bcf86cd799439012"
  }
}
```

### 5.3 Farming Advice
**POST** `/api/v1/predictions/advice`

```json
{
  "deviceId": "DEVICE_001",
  "sensorData": {
    "temperature": 28,
    "humidity": 70,
    "moisture": 55,
    "ph": 6.5
  },
  "cropType": "Tomato"
}
```

---

## Available AI Models

The code uses `openai/gpt-3.5-turbo` by default. You can change the model by editing `openrouter.client.js`:

### Popular Models

| Model | Provider | Pricing | Speed | Quality |
|-------|----------|---------|-------|---------|
| gpt-3.5-turbo | OpenAI | $ | Fast | Good |
| gpt-4 | OpenAI | $$$$ | Slower | Excellent |
| claude-2 | Anthropic | $$ | Fast | Excellent |
| llama-2-70b | Meta | $ | Fast | Good |

### Change Model
Edit this line in `src/services/openrouter.client.js`:

```javascript
await this.callModel(
  'openai/gpt-3.5-turbo',  // ← Change here
  messages,
  options
);
```

Other options:
- `'openai/gpt-4'`
- `'anthropic/claude-2'`
- `'meta-llama/llama-2-70b-chat'`

---

## API Pricing

### OpenRouter Pricing Model

1. **Free Tier** (Limited)
   - 10 requests/day
   - Only certain models available

2. **Pay-as-you-go**
   - No monthly fee
   - $0.001 - $0.03 per 1K tokens
   - Autopay via credit card

3. **Monthly Pass**
   - Fixed credits per month
   - Good for predictable usage

### Cost Estimation
- **Disease Prediction**: ~0.5 cents per prediction
- **Crop Recommendation**: ~1 cent per recommendation
- **Farming Advice**: ~1 cent per advice

For 1000 daily predictions:
- ~$5-10 per day
- ~$150-300 per month

---

## Troubleshooting

### Issue: "OPENROUTER_API_KEY not set"

**Solution 1: Check .env file**
```bash
# Windows
type backend\.env | findstr OPENROUTER

# Linux/Mac
cat backend/.env | grep OPENROUTER
```

**Solution 2: Verify API Key**
- Go to https://openrouter.ai/keys
- Check if key is active (not revoked)
- Copy key again if needed

### Issue: "Invalid API Key"

**Solution:**
1. Delete `.env` file
2. Create new one from `.env.example`
3. Copy fresh API key from OpenRouter
4. Restart server: `npm run dev`

### Issue: Slow Responses

**Possible causes:**
- Network latency
- OpenRouter server load
- Model is processing large request

**Solutions:**
1. Check internet connection
2. Wait a few seconds and retry
3. Try different model (faster options: llama-2-70b)
4. Check OpenRouter status: https://status.openrouter.ai

### Issue: "Quota Exceeded"

**Solution:**
1. Check usage at: https://openrouter.ai/account/usage
2. Upgrade plan or wait for reset
3. Or use different API provider

---

## Using Different AI Providers

The OpenRouter client can be adapted for other providers:

### Example: Using Anthropic Claude Directly
```javascript
// Alternative implementation would go here
const Anthropic = require('@anthropic-ai/sdk');
```

### Example: Using OpenAI Direct
```javascript
// Alternative implementation would go here
const OpenAI = require('openai');
```

---

## Production Deployment

### 1. Set Environment Variables

**Heroku:**
```bash
heroku config:set OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

**AWS Lambda:**
```bash
aws lambda update-function-configuration \
  --function-name my-function \
  --environment Variables={OPENROUTER_API_KEY=sk-or-v1-xxxxx}
```

**Docker:**
```dockerfile
ENV OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
```

### 2. Rate Limiting
Set appropriate limits in `.env`:
```env
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW=15
```

### 3. Error Handling
The API handles errors gracefully:
- Invalid keys → 401 Unauthorized
- Quota exceeded → 429 Too Many Requests
- Server error → 503 Service Unavailable

### 4. Monitoring
Monitor API usage:
- Check OpenRouter dashboard: https://openrouter.ai/account/usage
- Monitor backend logs for errors
- Set up alerts for quota warnings

---

## API Documentation

### Endpoints

#### Disease Prediction
```
POST /api/v1/predictions/disease
Content-Type: application/json

{
  "deviceId": "DEVICE_001",
  "sensorData": {
    "temperature": number,
    "humidity": number,
    "moisture": number,
    "ph": number
  },
  "plantDescription": "optional description"
}
```

#### Crop Recommendation
```
POST /api/v1/predictions/crop
Content-Type: application/json

{
  "deviceId": "DEVICE_001",
  "conditions": {
    "temperature": number,
    "humidity": number,
    "moisture": number,
    "ph": number,
    "location": "string"
  }
}
```

#### Farming Advice
```
POST /api/v1/predictions/advice
Content-Type: application/json

{
  "deviceId": "DEVICE_001",
  "sensorData": {
    "temperature": number,
    "humidity": number,
    "moisture": number,
    "ph": number
  },
  "cropType": "Tomato"
}
```

---

## Next Steps

1. ✅ Get OpenRouter API key
2. ✅ Configure `.env` file
3. ✅ Install dependencies: `npm install`
4. ✅ Start server: `npm run dev`
5. ✅ Test endpoints with Postman/cURL
6. ✅ Integrate with ESP32 sensor data
7. ✅ Monitor API usage and costs

---

## Support & Resources

- **OpenRouter Docs**: https://openrouter.ai/docs
- **GitHub Issues**: Check project repository
- **Community**: OpenRouter Discord/Forum

---

## FAQ

**Q: Can I use multiple API keys?**
A: Yes, rotate keys for security. Update `OPENROUTER_API_KEY` in `.env`.

**Q: What if API goes down?**
A: Error handling will return errors. Consider adding fallback mock data.

**Q: Can I cache responses?**
A: Yes, implement Redis caching for similar requests.

**Q: Is it GDPR compliant?**
A: Check OpenRouter privacy policy. Sensor data may require encryption in EU.

**Q: Can I use for free?**
A: Limited free tier available. Check OpenRouter pricing page.

