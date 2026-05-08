# ESP32 Sensor Connections - Quick Reference

## Pin Mapping Table

| Component | Pin Type | ESP32 GPIO | Signal Type | Notes |
|-----------|----------|-----------|-------------|-------|
| **LM35D** | Vout | GPIO 34 | Analog Input | 10mV/°C |
| **DHT11** | Data | GPIO 4 | Digital Input | +10kΩ Pull-up |
| **HW-103** | AO | GPIO 35 | Analog Input | Moisture |
| **HW-103** | DO | GPIO 5 | Digital Input | Optional |
| **pH Sensor** | Out | GPIO 33 | Analog Input | Needs Calibration |
| **ACS712** | VOUT | GPIO 32 | Analog Input | Current Sensor |

---

## Power Distribution

```
        ┌─────────────────────┐
        │   USB 5V Power      │
        │   (500mA - 1A)      │
        └──────────┬──────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    ESP32 VCC            GND Bus ─────┐
         │                            │
    ┌────┴─────┐                      │
    │           │                      │
   [100µF]    [Sensors VCC]           │
    │           │                      │
    └─┬─────────┼──────────────────────┴─ All Sensors GND
      │         │                  │
      │    ┌────┼──┬──┬──┬──┐     │
      │    │    │  │  │  │  │     │
      │  LM35 DHT HW pH ACS │     │
      │    │   11 103  │  712     │
      │    └────┼──┴──┴──┴──┘     │
      │         │                  │
   ESP32       Sensors             GND
```

---

## Serial Monitor Output

### Upload & Boot
```
=== Smart Agriculture IoT System Starting ===

✓ DHT11 initialized
✓ Analog pins configured
✓ ADC configured (12-bit, 3.3V full scale)
Connecting to WiFi: ............
✓ WiFi Connected!
IP Address: 192.168.1.100
=== Setup Complete ===
```

### Sensor Readings (Every 60 seconds)
```
=== SENSOR READINGS ===
LM35D Temperature: 24.5°C
DHT11 Temperature: 25.2°C
DHT11 Humidity: 55.3%
Soil Moisture: 42.7%
pH Level: 6.8
Current Draw: 0.25A
=====================

📤 Sending to backend: {"deviceId":"DEVICE_001",...}
✅ Data sent successfully
```

---

## Configuration Steps

### 1. Setup Arduino IDE
```
File → Preferences → Additional Boards Manager URLs
https://dl.espressif.com/dl/package_esp32_index.json

Tools → Board Manager → Search "ESP32" → Install

Tools → Board → ESP32 Dev Module
Tools → Port → [Your COM Port]
Tools → Upload Speed → 921600
```

### 2. Install Libraries
```
Sketch → Include Library → Manage Libraries

Search and Install:
- DHT sensor library (Adafruit)
- ArduinoJson (Benoit Blanchon)
```

### 3. Edit Configuration
```cpp
// In ESP32.cpp, update these:
const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* backend_url = "http://192.168.X.X:5000/api/v1/sensors/data";
```

### 4. Upload & Verify
```
Sketch → Verify (Ctrl+R)
Sketch → Upload (Ctrl+U)
Tools → Serial Monitor (Ctrl+Shift+M)
Set Baud Rate: 115200
```

---

## Sensor Calibration Quick Guide

### DHT11
✓ Pre-calibrated  
✓ Just connect and read  
⚠ Warmup time: 1-2 seconds after power

### LM35D
✓ Pre-calibrated  
Formula: Temp(°C) = Voltage(mV) / 10  
⚠ Requires stable power supply

### Moisture (HW-103)
⚠ Requires calibration  
Steps:
1. Measure dry soil reading (air) → ADC ~4095
2. Measure wet soil reading (water) → ADC ~1500
3. Edit line in code: `map(raw, DRY_VALUE, WET_VALUE, 0, 100)`

### pH Sensor
⚠ CRITICAL - Must calibrate!  
Steps:
1. Immerse in pH 6.86 buffer → Note voltage
2. Immerse in pH 4.0 buffer → Note voltage
3. Calculate slope: m = ΔpH / ΔVoltage
4. Calculate intercept: b = pH - (m × Voltage)
5. Update code: `float ph = m * voltage + b;`

### ACS712 Current Sensor
⚠ Check variant (5A or 30A)  
Sensitivity:
- 5A model: 185mV/A
- 30A model: 66mV/A (currently in code)
- 5B model: 110mV/A

Update if different:
```cpp
const float ACS712_SENSITIVITY = 0.185;  // Change this
```

---

## Troubleshooting Checklist

- [ ] Serial Monitor shows: `✓ DHT11 initialized`
- [ ] Serial Monitor shows: `✓ WiFi Connected!`
- [ ] Sensor readings are updating every 60 seconds
- [ ] Backend receives data (check API logs)
- [ ] All sensor values in realistic range

### If DHT11 not reading:
- [ ] 10kΩ resistor connected between VCC and Data?
- [ ] GPIO 4 connected correctly?
- [ ] DHT library installed?

### If current sensor always 0:
- [ ] VOUT connected to GPIO 32?
- [ ] Load connected to current sensor?
- [ ] Sensitivity matches sensor variant?

### If pH reading wrong:
- [ ] Calibrated with buffer solutions?
- [ ] Coefficients (a, b) updated in code?
- [ ] Electrode not dry/broken?

---

## Data Format Sent to Backend

```json
{
  "deviceId": "DEVICE_001",
  "timestamp": 12345000,
  "temperature_lm35d": 24.5,
  "temperature_dht11": 25.2,
  "humidity": 55.3,
  "moisture": 42.7,
  "ph": 6.8,
  "current": 0.25
}
```

---

## Useful Commands

| Task | Command |
|------|---------|
| Verify Code | Ctrl+R or Sketch → Verify |
| Upload | Ctrl+U or Sketch → Upload |
| Open Serial Monitor | Ctrl+Shift+M |
| Select Board | Tools → Board → ESP32 Dev Module |
| Select Port | Tools → Port → [Your COM] |

---

## Hardware Checklist for First Time Setup

- [ ] ESP32 Dev Module
- [ ] USB Cable (USB-A to Micro-USB)
- [ ] LM35D Temperature Sensor
- [ ] DHT11 Humidity/Temp Sensor
- [ ] HW-103 Soil Moisture Sensor
- [ ] pH Electrode + Module
- [ ] ACS712 Current Sensor (±30A)
- [ ] 10kΩ Resistor (for DHT11)
- [ ] 100µF Capacitor (power stability)
- [ ] Breadboard + Jumper Wires
- [ ] 5V Power Supply (≥1A)
- [ ] Male-to-Female Jumper Wires

---

## Wiring Order Recommendation

1. **Power & Ground First**
   - Connect ESP32 VCC to 5V
   - Connect all GND together

2. **Analog Sensors**
   - LM35D to GPIO 34
   - HW-103 AO to GPIO 35
   - pH Sensor to GPIO 33
   - ACS712 to GPIO 32

3. **Digital Sensors**
   - DHT11 Data to GPIO 4 (with 10kΩ pull-up)
   - HW-103 DO to GPIO 5

4. **Final Checks**
   - Verify all connections
   - Check polarity on polarized components
   - Upload code and monitor Serial output

---

## Support

For detailed setup: See `ESP32_SETUP_GUIDE.md`  
For code documentation: Check comments in `ESP32.cpp`  
For troubleshooting: Review Serial Monitor output
