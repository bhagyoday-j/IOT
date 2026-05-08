# ESP32 Backend Configuration Guide

## How to Get Backend Server IP & URL

### Method 1: Local Development (Same Network)

#### Step 1: Find Your Computer's IP Address

**Windows:**
```bash
# Open Command Prompt
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter. Example: `192.168.1.100`

**Mac/Linux:**
```bash
# Terminal
ifconfig
# or
hostname -I
```

#### Step 2: Start Backend Server
```bash
cd backend
npm run dev
```

**Console Output:**
```
✅ Server running on port 5000
```

#### Step 3: Configure ESP32

Replace in ESP32.cpp:
```cpp
// OLD (change this)
const char* backend_url = "http://YOUR_SERVER_IP:5000/api/v1/sensors/data";

// NEW (use your actual IP)
const char* backend_url = "http://192.168.1.100:5000/api/v1/sensors/data";
```

**Example IPs:**
- `192.168.1.100` (Common home network)
- `192.168.0.50` (Alternative home network)
- `10.0.0.15` (Corporate network)

---

### Method 2: Test Connection

#### From ESP32 Serial Monitor

After uploading, check Serial Monitor (115200 baud):
```
=== Smart Agriculture IoT System Starting ===
✓ DHT11 initialized
✓ Analog pins configured
Connecting to WiFi: ....
✓ WiFi Connected!
IP Address: 192.168.1.150

=== SENSOR READINGS ===
...
📤 Sending to backend: {...}
✅ Data sent successfully    ← SUCCESS!

or

❌ Error: HTTP -1            ← Connection failed
❌ Error: HTTP 0             ← Timeout
```

#### From Your PC (using curl)

```bash
# Test if backend is accessible
curl http://192.168.1.100:5000/health

# Or test the sensor endpoint
curl -X POST http://192.168.1.100:5000/api/v1/sensors/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-for-esp32" \
  -d '{
    "deviceId": "DEVICE_001",
    "temperature_lm35d": 25.5,
    "temperature_dht11": 26.0,
    "humidity": 60,
    "moisture": 45,
    "ph": 6.8,
    "current": 0.3
  }'
```

---

### Method 3: Different Deployment Scenarios

#### Scenario A: Local Network (Recommended for Testing)
```cpp
// Your computer's local IP
const char* backend_url = "http://192.168.1.100:5000/api/v1/sensors/data";
```

**Pros:** Fast, no internet required, easy debugging
**Cons:** Limited to your home/office network

#### Scenario B: Cloud Deployment (Production)
```cpp
// Example: AWS, Heroku, DigitalOcean, etc.
const char* backend_url = "http://api.yourapp.com/api/v1/sensors/data";
// or
const char* backend_url = "http://smart-agriculture-api.herokuapp.com/api/v1/sensors/data";
```

**Pros:** Accessible from anywhere
**Cons:** Requires public domain, API costs

#### Scenario C: Raspberry Pi on Same Network
```cpp
// Find Pi's IP with: hostname -I (on Pi)
const char* backend_url = "http://192.168.1.50:5000/api/v1/sensors/data";
```

---

## Step-by-Step Configuration

### 1. Find Your Backend Server IP

**On Windows:**
```
Windows Key → Search "cmd" → Type: ipconfig
Look for "IPv4 Address" - Usually starts with 192.168.x.x
```

**Example Output:**
```
Wireless LAN adapter WiFi:
   IPv4 Address . . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . : 255.255.255.0
```

### 2. Verify Server is Running

**Terminal:**
```bash
cd backend
npm run dev

# You should see:
# ✅ Server running on port 5000
# ✅ MongoDB Connected: localhost
```

### 3. Test Connectivity

**From another device on same network:**
```bash
# Windows: Open Command Prompt
ping 192.168.1.100

# Should show:
# Reply from 192.168.1.100: bytes=32 time=2ms
```

### 4. Update ESP32 Code

**Edit ESP32.cpp Line 70:**

Before:
```cpp
const char* backend_url = "http://YOUR_SERVER_IP:5000/api/v1/sensors/data";
```

After (example):
```cpp
const char* backend_url = "http://192.168.1.100:5000/api/v1/sensors/data";
```

### 5. Upload to ESP32

```
Arduino IDE → Sketch → Upload
```

### 6. Monitor Serial Output

```
Tools → Serial Monitor → Set Baud Rate: 115200

Expected Output:
...
✅ WiFi Connected!
IP Address: 192.168.1.150
📤 Sending to backend: {...}
✅ Data sent successfully
```

---

## Common IP Patterns

| Network Type | IP Range | Example |
|---|---|---|
| Home WiFi | 192.168.0.x - 192.168.1.x | 192.168.1.100 |
| Corporate | 10.0.0.x or 172.16.x.x | 10.0.0.50 |
| Mobile Hotspot | 192.168.43.x | 192.168.43.1 |
| Ethernet | Varies | Check ipconfig |

---

## Troubleshooting Connection Issues

### Problem: Can't find server IP

**Solution:**
```bash
# Get ALL network info
ipconfig /all

# Look for:
# - IPv4 Address
# - IPv6 Address
# - Default Gateway
```

### Problem: ESP32 connects to WiFi but can't reach backend

**Check:**
1. Backend server is running: `npm run dev`
2. IP address is correct: `ping 192.168.1.100`
3. Port is open: `netstat -an | find "5000"` (Windows)
4. Firewall not blocking: Disable Windows Defender Firewall temporarily
5. Same network: ESP32 and PC must be on same WiFi

### Problem: HTTP Connection Timeout

**Error:**
```
❌ Error: HTTP -1  (Connection timeout)
❌ Error: HTTP 0
```

**Solutions:**
- Check IP address is correct
- Verify backend is running
- Check WiFi strength on ESP32
- Look at serial output for connection attempts

### Problem: API Key Rejected

**Error:**
```
❌ Error: HTTP 401 (Unauthorized)
```

**Fix:**
Verify API key matches in:
- ESP32.cpp: `const char* api_key = "your-secret-api-key-for-esp32";`
- backend/.env: `API_KEY=your-secret-api-key-for-esp32`

---

## Complete Configuration Example

### Your Setup (Recommended for Testing)

**Step 1: Get IP**
- Open Command Prompt
- Type: `ipconfig`
- Find IPv4 Address: `192.168.1.100` (example)

**Step 2: Configure ESP32**

In ESP32.cpp around line 69-70:

```cpp
// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";                    // Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";            // Your WiFi password
const char* backend_url = "http://192.168.1.100:5000/api/v1/sensors/data";  // ← Change this
const char* api_key = "your-secret-api-key-for-esp32";  // From backend/.env
```

**Step 3: Start Backend**
```bash
cd backend
npm run dev
# Keep terminal open!
```

**Step 4: Upload to ESP32**
- Arduino IDE → Sketch → Upload

**Step 5: Monitor**
```
Tools → Serial Monitor
Baud: 115200
```

Expected output:
```
✓ WiFi Connected!
IP Address: 192.168.1.150
📤 Sending to backend: {...}
✅ Data sent successfully
```

---

## Quick Reference: Commands

```bash
# Find your IP (Windows)
ipconfig

# Find your IP (Mac/Linux)
hostname -I

# Test backend is running
curl http://192.168.1.100:5000/health

# Start backend
cd backend && npm run dev

# View backend logs
# (Check terminal window for output)

# Check if firewall blocks port
# Windows Defender → Firewall → Allow app through firewall
```

---

## Next Steps

1. ✅ Find your backend IP using `ipconfig`
2. ✅ Update ESP32.cpp with correct IP
3. ✅ Start backend: `npm run dev`
4. ✅ Upload ESP32 code
5. ✅ Check Serial Monitor for "✅ Data sent successfully"
6. ✅ Verify data in MongoDB or backend logs

---

## Support

If you still can't connect:
1. Check Serial Monitor output for exact error
2. Verify both devices are on same WiFi network
3. Make sure backend server is actually running
4. Check IP address is within same network range
5. Disable firewall temporarily to test

