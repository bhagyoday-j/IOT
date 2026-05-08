/*
================================================================================
                    ESP32 SMART AGRICULTURE SENSOR MODULE
================================================================================

SENSOR CONNECTIONS GUIDE:
================================================================================

1. LM35D ANALOG TEMPERATURE SENSOR:
   - VCC → ESP32 3.3V or 5V
   - GND → ESP32 GND
   - Vout → GPIO 34 (ADC1_CH6) - Analog Input
   - Output: 10mV/°C (10°C = 0.1V, 25°C = 0.25V)
   - Range: -40°C to 125°C

2. DHT11 HUMIDITY & TEMPERATURE SENSOR:
   - VCC → ESP32 5V
   - GND → ESP32 GND
   - DATA → GPIO 4 (Digital Input)
   - Add 10kΩ pull-up resistor between VCC and DATA
   - Range: Temperature 0-50°C, Humidity 20-90%

3. SOIL MOISTURE SENSOR (HW-103):
   - VCC → ESP32 5V
   - GND → ESP32 GND
   - AO (Analog) → GPIO 35 (ADC1_CH7) - Analog Input
   - DO (Digital) → GPIO 5 (Digital Input) - Threshold
   - Output: 0-4095 (dry to wet)

4. pH ELECTRODE SENSOR:
   - VCC → ESP32 5V or 3.3V
   - GND → ESP32 GND
   - Out → GPIO 33 (ADC1_CH5) - Analog Input
   - Calibration: 6.86pH at 0.5V, 4.0pH at 2.5V (approx)
   - Requires 1MΩ input impedance amplifier (optional for better readings)
   - Range: 0-14 pH

5. ACS712 CURRENT SENSOR MODULE (±30A variant):
   - VCC → ESP32 5V
   - GND → ESP32 GND
   - VOUT → GPIO 32 (ADC1_CH4) - Analog Input
   - Sensitivity: 66mV/A (30A model) or 185mV/A (5A model)
   - Center voltage: 2.5V (no current), adjust based on model

POWER SUPPLY NOTES:
   - Total current draw: ~200-300mA (all sensors active)
   - Use USB 5V supply or external 5V PSU
   - Add 100µF capacitor near ESP32 VCC for stability
   - Use separate GND between sensors and ESP32

ESP32 ADC PINS USED:
   GPIO 34 (ADC1_CH6) → LM35D Temperature
   GPIO 35 (ADC1_CH7) → HW-103 Moisture (Analog)
   GPIO 33 (ADC1_CH5) → pH Sensor
   GPIO 32 (ADC1_CH4) → ACS712 Current Sensor
   GPIO 4 → DHT11 Data (Digital)
   GPIO 5 → HW-103 Digital (Optional threshold)

================================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"

// WiFi credentials
const char* ssid = "Dokhale Home";
const char* password = "0777";
const char* backend_url = "http://172.30.64.1:5000/api/v1/sensors/data";
//const char* backend_url = "http://YOUR_SERVER_IP:5000/api/v1/sensors/data";
const char* api_key = "your-secret-api-key-for-esp32";

// ============== SENSOR PIN DEFINITIONS ==============
// LM35D Temperature Sensor (Analog)
const int LM35D_PIN = 34;  // ADC1_CH6

// DHT11 Humidity & Temperature Sensor (Digital)
const int DHT11_PIN = 4;   // Digital GPIO
const int DHT_TYPE = DHT11;

// HW-103 Soil Moisture Sensor
const int MOISTURE_ANALOG_PIN = 35;  // ADC1_CH7 (Analog Output)
const int MOISTURE_DIGITAL_PIN = 5;  // Digital Output (Threshold)

// pH Electrode Sensor (Analog)
const int PH_SENSOR_PIN = 33;  // ADC1_CH5

// ACS712 Current Sensor (Analog)
const int ACS712_PIN = 32;  // ADC1_CH4
const float ACS712_SENSITIVITY = 0.066;  // 66mV/A for ±30A model (adjust based on your variant)
const float ACS712_CENTER_VOLTAGE = 2.5;  // Center at 2.5V (no current)

// ============== DHT SENSOR OBJECT ==============
DHT dht(DHT11_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  delay(100);
  
  Serial.println("\n\n=== Smart Agriculture IoT System Starting ===\n");
  
  // Initialize DHT11 sensor
  dht.begin();
  Serial.println("✓ DHT11 initialized");
  
  // Configure analog pins
  pinMode(LM35D_PIN, INPUT);
  pinMode(MOISTURE_ANALOG_PIN, INPUT);
  pinMode(PH_SENSOR_PIN, INPUT);
  pinMode(ACS712_PIN, INPUT);
  pinMode(MOISTURE_DIGITAL_PIN, INPUT);  // Digital threshold pin
  Serial.println("✓ Analog pins configured");
  
  // ADC Configuration
  analogReadResolution(12);  // 12-bit resolution (0-4095)
  analogSetAttenuation(ADC_11db);  // Full scale voltage: 3.3V
  Serial.println("✓ ADC configured (12-bit, 3.3V full scale)");
  
  // Connect to WiFi
  Serial.print("Connecting to WiFi: ");
  WiFi.begin(ssid, password);
  
  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 20) {
    delay(500);
    Serial.print(".");
    wifiAttempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ WiFi Connection Failed!");
  }
  
  Serial.println("=== Setup Complete ===\n");
}

void loop() {
  // Read all sensors
  float lm35_temp = readLM35DTemperature();
  float dht_temp = readDHT11Temperature();
  float dht_humidity = readDHT11Humidity();
  float moisture = readMoistureSensor();
  float ph = readPHSensor();
  float current = readCurrentSensor();
  
  // Display readings on serial
  Serial.println("\n=== SENSOR READINGS ===");
  Serial.print("LM35D Temperature: "); Serial.print(lm35_temp); Serial.println("°C");
  Serial.print("DHT11 Temperature: "); Serial.print(dht_temp); Serial.println("°C");
  Serial.print("DHT11 Humidity: "); Serial.print(dht_humidity); Serial.println("%");
  Serial.print("Soil Moisture: "); Serial.print(moisture); Serial.println("%");
  Serial.print("pH Level: "); Serial.print(ph); Serial.println("");
  Serial.print("Current Draw: "); Serial.print(current); Serial.println("A");
  Serial.println("=====================\n");
  
  // Send to backend
  sendToBackend(lm35_temp, dht_temp, dht_humidity, moisture, ph, current);
  
  delay(60000); // Send every minute
}

void sendToBackend(float lm35_temp, float dht_temp, float dht_humidity, float moisture, float ph_val, float current) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin(backend_url);
    http.addHeader("x-api-key", api_key);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON with all sensor data
    StaticJsonDocument<512> doc;
    doc["deviceId"] = "DEVICE_001";
    doc["timestamp"] = millis();
    
    // Temperature readings
    doc["temperature_lm35d"] = lm35_temp;
    doc["temperature_dht11"] = dht_temp;
    
    // Humidity from DHT11
    doc["humidity"] = dht_humidity;
    
    // Soil Moisture
    doc["moisture"] = moisture;
    
    // pH Level
    doc["ph"] = ph_val;
    
    // Current Draw
    doc["current"] = current;
    
    String payload;
    serializeJson(doc, payload);
    
    Serial.print("📤 Sending to backend: ");
    Serial.println(payload);
    
    int httpCode = http.POST(payload);
    
    if (httpCode == 201 || httpCode == 200) {
      Serial.println("✅ Data sent successfully");
    } else {
      Serial.print("❌ Error: HTTP ");
      Serial.println(httpCode);
    }
    
    http.end();
  } else {
    Serial.println("⚠ WiFi not connected");
  }
}

// ============== SENSOR READING FUNCTIONS ==============

/**
 * LM35D Analog Temperature Sensor
 * Output: 10mV per °C
 * Conversion: Voltage(V) = ADC_value * 3.3 / 4095
 * Temperature = Voltage * 100
 */
float readLM35DTemperature() {
  int raw = analogRead(LM35D_PIN);
  float voltage = (raw / 4095.0) * 3.3;  // Convert to voltage
  float temperature = voltage * 100.0;    // 10mV/°C = 100 readings per volt
  return temperature;
}

/**
 * DHT11 Temperature Reading
 * Range: 0-50°C, Accuracy: ±2°C
 */
float readDHT11Temperature() {
  float temp = dht.readTemperature();
  
  if (isnan(temp)) {
    Serial.println("⚠ DHT11 Temperature read failed!");
    return -999.0;  // Error indicator
  }
  
  return temp;
}

/**
 * DHT11 Humidity Reading
 * Range: 20-90% RH, Accuracy: ±5%
 */
float readDHT11Humidity() {
  float humidity = dht.readHumidity();
  
  if (isnan(humidity)) {
    Serial.println("⚠ DHT11 Humidity read failed!");
    return -999.0;  // Error indicator
  }
  
  return humidity;
}

/**
 * HW-103 Soil Moisture Sensor
 * Analog Output: 0-4095 (dry to wet)
 * Calibration: Usually dry=4095, wet=0 (depends on sensor polarity)
 * Returns: 0-100% (0=dry, 100=wet)
 */
float readMoistureSensor() {
  int raw = analogRead(MOISTURE_ANALOG_PIN);
  
  // Convert to percentage (adjust threshold values based on your calibration)
  // Typical: raw value 4095 = dry (0%), raw value 1500 = wet (100%)
  float moisture = map(raw, 4095, 1500, 0, 100);
  
  // Constrain to 0-100%
  moisture = constrain(moisture, 0, 100);
  
  return moisture;
}

/**
 * pH Electrode Sensor
 * Typical calibration: 6.86pH ≈ 0.5V, 4.0pH ≈ 2.5V
 * Linear approximation: pH = -1.14 * Voltage + 6.95
 * Adjust these values based on your sensor calibration
 */
float readPHSensor() {
  int raw = analogRead(PH_SENSOR_PIN);
  float voltage = (raw / 4095.0) * 3.3;  // Convert to voltage
  
  // Linear conversion (adjust coefficients based on your calibration)
  // Formula: pH = a * Voltage + b
  float ph = -1.14 * voltage + 6.95;  // Example coefficients
  
  // Constrain to realistic pH range
  ph = constrain(ph, 0, 14);
  
  return ph;
}

/**
 * ACS712 Current Sensor
 * Sensitivity: 66mV/A (for ±30A model)
 * Center voltage: 2.5V at 0A
 * Current = (Voltage - CenterVoltage) / Sensitivity
 * NOTE: Adjust sensitivity and center voltage based on your ACS712 variant
 */
float readCurrentSensor() {
  int raw = analogRead(ACS712_PIN);
  float voltage = (raw / 4095.0) * 3.3;  // Convert to voltage
  
  // Calculate current: offset voltage divided by sensitivity
  float current = (voltage - ACS712_CENTER_VOLTAGE) / ACS712_SENSITIVITY;
  
  return current;
}