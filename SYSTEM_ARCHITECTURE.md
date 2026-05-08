# System Architecture & Data Flow

## Complete System Overview

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              SMART AGRICULTURE IoT SYSTEM - COMPLETE FLOW                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

LAYER 1: HARDWARE SENSORS (ESP32 Microcontroller)
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   LM35D      │  │   DHT11      │  │   HW-103     │  │   pH Sensor  │ │
│  │Temperature   │  │Humidity/Temp │  │   Moisture   │  │   (0-14 pH)  │ │
│  │ 10mV/°C      │  │   0-50°C     │  │   0-100%     │  │              │ │
│  │ GPIO 34      │  │ GPIO 4       │  │ GPIO 35      │  │ GPIO 33      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │                 │          │
│         ├─────────────────┼─────────────────┼─────────────────┤          │
│         │                                                     │          │
│         └─────────────────────────────────┬───────────────────┘          │
│                                          │                               │
│                                    ┌─────▼─────┐                         │
│                                    │   ESP32    │                         │
│                                    │ WiFi Module│                         │
│                                    │ (GPIO 32)  │  ◄── ACS712 Current    │
│                                    └─────┬─────┘                         │
│                                          │                               │
└──────────────────────────────────────────┼───────────────────────────────┘
                                           │
                   ┌───────────────────────▼────────────────────────┐
                   │ JSON Payload (Every 60 seconds)               │
                   │ {                                             │
                   │   "deviceId": "DEVICE_001",                  │
                   │   "temperature_lm35d": 24.5,                │
                   │   "temperature_dht11": 25.2,                │
                   │   "humidity": 55.3,                          │
                   │   "moisture": 42.7,                          │
                   │   "ph": 6.8,                                 │
                   │   "current": 0.25                            │
                   │ }                                             │
                   └────────────┬─────────────────────────────────┘
                                │
                                │ WiFi/HTTP POST
                                │ (5G/4G Network)
                                │
LAYER 2: BACKEND API (Node.js/Express)
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                  REST API Endpoints                                │ │
│  │                                                                   │ │
│  │  POST /api/v1/predictions/disease                                │ │
│  │  POST /api/v1/predictions/crop                                   │ │
│  │  POST /api/v1/predictions/advice                                 │ │
│  │  GET  /api/v1/predictions/history                                │ │
│  │                                                                   │ │
│  └────────────────────────┬────────────────────────────────────────┘ │
│                           │                                           │
│  ┌────────────────────────▼────────────────────────────────────────┐ │
│  │              AIService (ai.service.js)                          │ │
│  │                                                                 │ │
│  │  ✅ predictDisease()                                            │ │
│  │  ✅ suggestCrop()                                               │ │
│  │  ✅ getFarmingAdvice()                                          │ │
│  │  ✅ getPredictionHistory()                                      │ │
│  │  ✅ healthCheck()                                               │ │
│  │                                                                 │ │
│  │  ▼ All methods use OpenRouter API                              │ │
│  │                                                                 │ │
│  └────────┬───────────────────────────────────────────────────────┘ │
│           │                                                           │
│  ┌────────▼────────────────────────────────────────────────────────┐ │
│  │        OpenRouter Client (openrouter.client.js)                 │ │
│  │                                                                 │ │
│  │  • callModel()           - Generic model calling              │ │
│  │  • analyzePlantDisease() - Disease detection AI               │ │
│  │  • recommendCrops()      - Crop recommendation AI             │ │
│  │  • getFarmingAdvice()    - Farming guidance AI                │ │
│  │  • healthCheck()         - API availability check             │ │
│  │                                                                 │ │
│  │  Uses: axios (HTTP client)                                     │ │
│  │  Config: OPENROUTER_API_KEY from .env                          │ │
│  │                                                                 │ │
│  └────────┬────────────────────────────────────────────────────────┘ │
│           │                                                           │
└───────────┼───────────────────────────────────────────────────────────┘
            │
            │ HTTPS/REST API Call
            │ Headers: {
            │   "Authorization": "Bearer sk-or-v1-xxxxx",
            │   "X-Title": "Smart Agriculture IoT"
            │ }
            │
LAYER 3: AI MODELS (OpenRouter Cloud)
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│              ┌─ OpenRouter Platform ──────────────────┐                 │
│              │                                        │                 │
│  ┌───────────┴──────────────────────────────────────┐│                 │
│  │    Available AI Models:                          ││                 │
│  │                                                  ││                 │
│  │  ✓ OpenAI                                        ││                 │
│  │    • GPT-3.5 Turbo (Fast, Cheap)                ││                 │
│  │    • GPT-4 (Slow, Expensive, Best)              ││                 │
│  │                                                  ││                 │
│  │  ✓ Anthropic                                     ││                 │
│  │    • Claude 2 (Good Balance)                    ││                 │
│  │                                                  ││                 │
│  │  ✓ Meta                                          ││                 │
│  │    • Llama 2 70B (Fast, Cheap)                  ││                 │
│  │                                                  ││                 │
│  │  ✓ Google, Cohere, Mistral, Jina, more...      ││                 │
│  │                                                  ││                 │
│  └──────────────────────────────────────────────────┘│                 │
│                                                        │                 │
│      Currently Using: GPT-3.5 Turbo                   │                 │
│      (Can be changed in openrouter.client.js)        │                 │
│                                                        │                 │
│              └────────────────────────────────────────┘                 │
└───────────────────────────────────────────────────────────────────────────┘
            ▲
            │ AI Analysis & Response
            │
            │ Returns: {
            │   "disease": "Powdery Mildew",
            │   "confidence": 87,
            │   "solution": "Apply fungicide...",
            │   "recommendations": [...]
            │ }
            │
LAYER 4: DATABASE (MongoDB)
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                      Collections                                  │ │
│  │                                                                   │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │ │
│  │  │ predictions  │  │  sensors     │  │  users       │           │ │
│  │  │              │  │              │  │              │           │ │
│  │  │ • deviceId   │  │ • deviceId   │  │ • username   │           │ │
│  │  │ • type       │  │ • timestamp  │  │ • email      │           │ │
│  │  │ • inputData  │  │ • readings   │  │ • apiKey     │           │ │
│  │  │ • result     │  │ • location   │  │              │           │ │
│  │  │ • createdAt  │  │ • status     │  │              │           │ │
│  │  │              │  │              │  │              │           │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │ │
│  │                                                                   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  Storage: All AI predictions permanently saved                          │ │
│  Retention: Historical data for analytics                               │ │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
            ▲
            │ Store predictions
            │ Query history
            │
LAYER 5: FRONTEND (React)
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │               User Interface                                       │ │
│  │                                                                   │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │ │
│  │  │  Dashboard       │  │ Predictions      │  │  History      │  │ │
│  │  │                  │  │                  │  │               │  │ │
│  │  │ • Live sensors   │  │ • Disease found  │  │ • Past 30 days│  │ │
│  │  │ • Temperature    │  │ • Confidence %   │  │ • Trends      │  │ │
│  │  │ • Humidity       │  │ • Treatment      │  │ • Statistics  │  │ │
│  │  │ • Moisture       │  │ • Recommendations│  │               │  │ │
│  │  │ • pH             │  │                  │  │               │  │ │
│  │  │ • Current        │  │ • Crops to plant │  │               │  │ │
│  │  │                  │  │ • Growing tips   │  │               │  │ │
│  │  │                  │  │                  │  │               │  │ │
│  │  └──────────────────┘  └──────────────────┘  └───────────────┘  │ │
│  │                                                                   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  Updates: Real-time via WebSocket or polling                            │ │
│  Mobile: Responsive design works on all devices                         │ │
│                                                                           │ │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequence

```
TIME: Every 60 Seconds

1. SENSOR READING (ESP32)
   └─► Read 6 sensor values
       • LM35D: Temperature (°C)
       • DHT11: Humidity (%), Temperature (°C)
       • HW-103: Moisture (%)
       • pH: pH Level (0-14)
       • ACS712: Current (A)

2. DATA TRANSMISSION
   └─► ESP32 connects to WiFi
       └─► HTTP POST to Backend
           └─► JSON payload with all readings

3. BACKEND RECEPTION
   └─► Express API receives data
       └─► Validation middleware
           └─► Passes to AIService

4. AI ANALYSIS (OpenRouter)
   └─► AIService processes request
       └─► Sends to OpenRouter API
           └─► AI model analyzes
               └─► Returns intelligent prediction

5. DATABASE STORAGE
   └─► Prediction saved to MongoDB
       └─► Indexed by deviceId & timestamp
           └─► Available for history/analytics

6. RESPONSE TO FRONTEND
   └─► Backend returns AI prediction
       └─► Frontend displays results
           └─► User sees real-time AI analysis

7. REPEAT
   └─► Next reading in 60 seconds
       └─► Continuous monitoring
```

---

## Request/Response Example

### Disease Prediction Flow

```
REQUEST (ESP32 to Backend)
├─ Method: POST
├─ URL: http://backend-ip:5000/api/v1/predictions/disease
├─ Headers:
│  ├─ Content-Type: application/json
│  └─ x-api-key: your-secret-key
└─ Body:
   {
     "deviceId": "DEVICE_001",
     "sensorData": {
       "temperature": 28.5,
       "humidity": 85.0,
       "moisture": 75.0,
       "ph": 6.5
     },
     "plantDescription": "Leaves have white powdery spots"
   }

BACKEND PROCESSING
├─ Receive and validate
├─ Call: openRouterClient.analyzePlantDisease()
├─ Send to OpenRouter API:
│  └─ Prompt: "Analyze: Temp 28.5°C, Humidity 85%, Moisture 75%, pH 6.5..."
├─ Receive AI response:
│  └─ "Powdery Mildew with 87% confidence"
├─ Save to MongoDB
└─ Return response

RESPONSE (Backend to Frontend)
├─ Status: 201 Created
└─ Body:
   {
     "success": true,
     "data": {
       "disease": "Powdery Mildew",
       "confidence": 87,
       "solution": "Apply sulfur-based fungicide and improve air circulation",
       "recommendations": [
         "Improve air circulation",
         "Reduce watering frequency",
         "Apply sulfur-based fungicide"
       ],
       "predictionId": "507f1f77bcf86cd799439011",
       "timestamp": "2026-05-07T10:30:00Z"
     }
   }

FRONTEND DISPLAY
└─ User sees:
   ├─ 🔴 DISEASE DETECTED
   ├─ Name: Powdery Mildew
   ├─ Confidence: 87% ◀ AI confidence level
   ├─ Action Required: Apply fungicide
   └─ Tips:
      • Improve air circulation
      • Reduce watering
      • Apply sulfur fungicide
```

---

## Cost & Performance Metrics

```
PERFORMANCE
├─ Disease Prediction:    1-3 seconds ⚡
├─ Crop Recommendation:   2-3 seconds ⚡
├─ Farming Advice:        2-3 seconds ⚡
├─ Database Query:        <100ms ⚡
└─ Total Latency:         2-4 seconds ✓

COSTS (Monthly Estimate)
├─ 100 daily predictions:
│  ├─ Tokens: ~20,000 tokens/day
│  ├─ Cost: $0.50-1.00/day
│  └─ Monthly: $15-30
│
├─ 1,000 daily predictions:
│  ├─ Tokens: ~200,000 tokens/day
│  ├─ Cost: $5-10/day
│  └─ Monthly: $150-300
│
└─ 10,000 daily predictions:
   ├─ Tokens: ~2,000,000 tokens/day
   ├─ Cost: $50-100/day
   └─ Monthly: $1,500-3,000

SCALABILITY
├─ API Rate Limit: Depends on plan
├─ Concurrent Users: Unlimited
├─ Storage: MongoDB (elastic)
└─ Max Throughput: 1000s req/sec via OpenRouter
```

---

## Configuration Map

```
APPLICATION SETTINGS

Frontend (React)
├─ API_URL: http://localhost:5000
├─ Polling Interval: 60 seconds
└─ WebSocket: (optional)

Backend (Node.js)
├─ PORT: 5000
├─ NODE_ENV: development
├─ MONGODB_URI: mongodb://localhost:27017
├─ CORS_ORIGIN: http://localhost:3000
└─ API_KEY: secret-key-for-auth

AI Configuration
├─ OPENROUTER_API_KEY: sk-or-v1-xxxxx (REQUIRED)
├─ SITE_URL: http://localhost:5000
├─ SITE_NAME: Smart Agriculture IoT
└─ AI_MODEL: openai/gpt-3.5-turbo (configurable)

Sensors (ESP32)
├─ WiFi SSID: YOUR_NETWORK
├─ WiFi Password: PASSWORD
├─ Backend URL: http://192.168.x.x:5000
├─ API Key: secret-key-for-esp32
├─ Polling Interval: 60 seconds
└─ Timeout: 10 seconds
```

---

This architecture provides:
✅ Real-time sensor data collection
✅ AI-powered analysis
✅ Scalable cloud infrastructure
✅ Historical data storage
✅ User-friendly interface
✅ Cost-effective operation

