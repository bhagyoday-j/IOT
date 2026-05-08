# ESP32 Smart Agriculture IoT Setup Guide

## Prerequisites

This guide covers setting up the ESP32 with multiple sensors for your Smart Agriculture project.

---

## 1. Arduino IDE Setup

### Install ESP32 Board Support
1. Open Arduino IDE
2. Go to **File** → **Preferences**
3. Add this URL to "Additional Boards Manager URLs":
   ```
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
4. Go to **Tools** → **Board Manager**
5. Search for "ESP32" and install "esp32 by Espressif Systems"
6. Select board: **Tools** → **Board** → **ESP32** → **ESP32 Dev Module**

### Set Serial Port & Upload Speed
- **Tools** → **Port**: Select your ESP32 COM port
- **Tools** → **Upload Speed**: 921600 or 115200

---

## 2. Required Arduino Libraries

Install these libraries using **Sketch** → **Include Library** → **Manage Libraries**:

### Library 1: DHT Sensor Library
- **Search for**: `DHT sensor library`
- **Author**: Adafruit
- **Version**: Latest (tested with v1.4.4)
- **Install**

### Library 2: ArduinoJson
- **Search for**: `ArduinoJson`
- **Author**: Benoit Blanchon
- **Version**: Latest (tested with v6.21.x)
- **Install**

### Built-in Libraries (No installation needed)
- WiFi.h (ESP32 built-in)
- HTTPClient.h (ESP32 built-in)

---

## 3. Hardware Connections - Detailed Wiring

### Connection Diagram Summary

```
ESP32 Dev Module
│
├─ USB Power (5V, GND)
│
├─ GPIO 34 (ADC1_CH6) ──→ LM35D Vout
├─ GPIO 35 (ADC1_CH7) ──→ HW-103 AO (Moisture Analog)
├─ GPIO 33 (ADC1_CH5) ──→ pH Sensor Output
├─ GPIO 32 (ADC1_CH4) ──→ ACS712 VOUT
├─ GPIO 4  (Digital)   ──→ DHT11 Data Pin
├─ GPIO 5  (Digital)   ──→ HW-103 DO (Optional)
│
├─ 3.3V/5V ──┬─→ LM35D VCC
│            ├─→ DHT11 VCC
│            ├─→ HW-103 VCC
│            ├─→ pH Sensor VCC
│            └─→ ACS712 VCC
│
└─ GND ──┬─→ LM35D GND
         ├─→ DHT11 GND
         ├─→ HW-103 GND
         ├─→ pH Sensor GND
         └─→ ACS712 GND
```

### Detailed Pin Assignments

| Sensor | VCC | GND | Signal Pin | Signal Type | ESP32 GPIO |
|--------|-----|-----|-----------|------------|-----------|
| **LM35D** | 5V | GND | Vout | Analog | 34 (ADC) |
| **DHT11** | 5V | GND | Data | Digital | 4 |
| **HW-103 (Moisture)** | 5V | GND | AO | Analog | 35 (ADC) |
| **HW-103 (Moisture)** | 5V | GND | DO | Digital | 5 (Optional) |
| **pH Electrode** | 5V | GND | Out | Analog | 33 (ADC) |
| **ACS712 (Current)** | 5V | GND | VOUT | Analog | 32 (ADC) |

---

## 4. Sensor-Specific Setup

### 4.1 LM35D Temperature Sensor
```
LM35D Pinout (Left to Right, flat side facing you):
┌─────────────┐
│ 1 - VCC     │
│ 2 - Vout    │
│ 3 - GND     │
└─────────────┘

Wire as:
- Pin 1 (VCC) → ESP32 5V
- Pin 2 (Vout) → ESP32 GPIO 34
- Pin 3 (GND) → ESP32 GND
```

**Calibration Notes:**
- Output: 10mV per °C
- 0°C = 0V, 25°C = 0.25V, 50°C = 0.5V
- Can measure -40°C to +125°C

---

### 4.2 DHT11 Humidity & Temperature Sensor
```
DHT11 Pinout (from left to right):
1 - VCC (5V)
2 - Data
3 - NC (No Connection)
4 - GND

Wiring:
- Pin 1 (VCC) → ESP32 5V
- Pin 2 (Data) → ESP32 GPIO 4 + 10kΩ Pull-up resistor to VCC
- Pin 3 (NC) → Leave empty
- Pin 4 (GND) → ESP32 GND

Pull-up Resistor:
  [10kΩ Resistor]
       │
  ┌────┴────┐
  │          │
GPIO 4   DHT11 Data (Pin 2)
```

**Calibration Notes:**
- Temperature range: 0-50°C (accuracy: ±2°C)
- Humidity range: 20-90% RH (accuracy: ±5%)
- Response time: ~1-2 seconds

---

### 4.3 HW-103 Soil Moisture Sensor
```
HW-103 Sensor Module has 4 pins:
┌──────────────────┐
│ VCC  GND  AO  DO │
└──────────────────┘

Wiring:
- VCC → ESP32 5V
- GND → ESP32 GND
- AO (Analog Output) → ESP32 GPIO 35 (ADC)
- DO (Digital Output) → ESP32 GPIO 5 (Optional, for threshold)

Calibration:
- Dry Soil: ~4095 ADC reading
- Wet Soil: ~1500 ADC reading (depends on moisture level)
- The code converts this to 0-100% automatically
```

**Adjustment in Code:**
Edit this line in `readMoistureSensor()` if readings are inverted:
```cpp
float moisture = map(raw, 4095, 1500, 0, 100);  // Adjust 4095 and 1500 based on calibration
```

---

### 4.4 pH Electrode Sensor
```
pH Electrode Analog Module:
┌──────────────┐
│ VCC GND OUT  │
└──────────────┘

Wiring:
- VCC → ESP32 5V or 3.3V
- GND → ESP32 GND
- OUT → ESP32 GPIO 33 (ADC)

IMPORTANT: pH probes require proper calibration!

Calibration Steps:
1. Use pH 6.86 buffer solution first
2. Use pH 4.0 buffer solution second
3. Measure voltages for each buffer
4. Calculate linear coefficients: pH = a*Voltage + b
5. Update these values in the code:

// Current calibration (ADJUST THESE):
pH = -1.14 * Voltage + 6.95

Example: If your sensor shows:
- At pH 6.86: Voltage = 0.5V
- At pH 4.0: Voltage = 2.5V
Then: a = (4.0 - 6.86) / (2.5 - 0.5) = -1.43
      b = 6.86 - (-1.43 * 0.5) = 7.595
```

---

### 4.5 ACS712 Current Sensor Module
```
ACS712 Module (5A, 30A, or 5B variants):
┌─────────────────────┐
│ GND  +5V  VOUT  GND │
└─────────────────────┘

Wiring:
- +5V → ESP32 5V
- GND → ESP32 GND (pins 1 & 4, connect both)
- VOUT → ESP32 GPIO 32 (ADC)

IMPORTANT: Check your ACS712 variant!
Current models:
- ACS712-5A: 185mV/A sensitivity
- ACS712-30A: 66mV/A sensitivity ← Used in code
- ACS712-5B: 110mV/A sensitivity

Update sensitivity if using different variant:
const float ACS712_SENSITIVITY = 0.066;  // Change this value
```

**Sensitivity Values:**
```
ACS712-5A:  0.185 (185mV/A)
ACS712-30A: 0.066 (66mV/A)
ACS712-5B:  0.110 (110mV/A)
```

---

## 5. Configuration in Arduino Code

Edit these constants in `ESP32.cpp`:

```cpp
// WiFi Settings
const char* ssid = "YOUR_WIFI_SSID";              // Your WiFi network name
const char* password = "YOUR_WIFI_PASSWORD";      // Your WiFi password
const char* backend_url = "http://YOUR_SERVER_IP:5000/api/v1/sensors/data";
const char* api_key = "your-secret-api-key-for-esp32";  // API key from backend

// Device ID (change if using multiple devices)
doc["deviceId"] = "DEVICE_001";  // In sendToBackend() function
```

---

## 6. Uploading Code to ESP32

1. Open `ESP32.cpp` in Arduino IDE
2. Click **Sketch** → **Verify** (to check for errors)
3. Click **Sketch** → **Upload** (or press Ctrl+U)
4. Wait for "Done uploading" message
5. Open **Tools** → **Serial Monitor** (Ctrl+Shift+M)
6. Set baud rate to **115200**
7. Watch sensor readings in the Serial Monitor

---

## 7. Testing

### Serial Monitor Output Example:
```
=== Smart Agriculture IoT System Starting ===

✓ DHT11 initialized
✓ Analog pins configured
✓ ADC configured (12-bit, 3.3V full scale)
Connecting to WiFi: ............
✓ WiFi Connected!
IP Address: 192.168.1.100
=== Setup Complete ===

=== SENSOR READINGS ===
LM35D Temperature: 24.5°C
DHT11 Temperature: 25.2°C
DHT11 Humidity: 55.3%
Soil Moisture: 42.7%
pH Level: 6.8
Current Draw: 0.25A
=====================

📤 Sending to backend: {"deviceId":"DEVICE_001","timestamp":12345,...}
✅ Data sent successfully
```

---

## 8. Troubleshooting

### DHT11 not reading
- Check 10kΩ pull-up resistor between VCC and Data pin
- Verify GPIO 4 connection
- Add delay between readings (minimum 2 seconds)

### pH readings unstable
- Ensure calibration values are correct
- Check electrode connection (shouldn't be loose)
- Add capacitor (0.1µF) near pH module output

### Current sensor reading 0A always
- Verify VOUT is connected to GPIO 32
- Check if ACS712 variant matches code (sensitivity)
- Measure voltage at VOUT pin directly (should be ~2.5V at 0A)

### WiFi won't connect
- Verify SSID and password
- Check if ESP32 is close enough to router
- Restart ESP32 (press reset button)

### No data on backend
- Check API key is correct
- Verify backend server is running
- Check firewall/network permissions
- Look at Serial Monitor for error messages

---

## 9. Power Supply Recommendations

**Total Current Draw:**
- ESP32: ~80-120mA
- DHT11: ~0.5mA
- Sensors (analog): ~5-10mA
- WiFi transmission: +100mA peaks
- **Total: ~200-300mA**

**Power Options:**
1. **USB Port** (5V, 500mA) - Suitable for development
2. **External 5V PSU** (≥1A) - Recommended for production
3. **Li-ion Battery** (5V boost converter) - For field deployment

**Stability Tips:**
- Add 100µF capacitor near ESP32 VCC
- Use separate GND between sensors and ESP32
- Keep power supply lines short

---

## 10. Next Steps

1. Upload the code and verify all sensors read correctly
2. Calibrate pH sensor with buffer solutions
3. Test WiFi connectivity and backend communication
4. Set up continuous logging in your backend
5. Deploy in the field and monitor readings

For issues, check the Serial Monitor output first!
