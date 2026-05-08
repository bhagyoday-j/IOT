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

// ================= WIFI CONFIG =================
const char* ssid = "NORD CE3";
const char* password = "123456789";

// CHANGE THIS TO YOUR PC IP
const char* backend_url = "http://10.255.140.144:5000/api/v1/sensors/data";

const char* api_key = "your-secret-api-key-for-esp32";

// ================= SENSOR PINS =================

// LM35
const int LM35D_PIN = 34;

// DHT11
const int DHT11_PIN = 4;
#define DHT_TYPE DHT11

// Soil Moisture
const int MOISTURE_ANALOG_PIN = 35;

// pH Sensor
const int PH_SENSOR_PIN = 33;

// ACS712 Current Sensor
const int ACS712_PIN = 32;

// ACS712 Config
const float ACS712_SENSITIVITY = 0.066;
const float ACS712_CENTER_VOLTAGE = 2.5;

// ================= DHT OBJECT =================
DHT dht(DHT11_PIN, DHT_TYPE);

// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=================================");
  Serial.println("SMART AGRICULTURE SYSTEM STARTED");
  Serial.println("=================================\n");

  // DHT Init
  dht.begin();

  // ADC Config
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  // WiFi Connect
  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n");
  Serial.println("WiFi Connected!");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());

  Serial.println("\nSetup Complete\n");
}

// =====================================================
// LOOP
// =====================================================

void loop() {

  float lm35_temp = readLM35Temperature();
  float dht_temp = readDHTTemperature();
  float humidity = readDHTHumidity();
  float moisture = readMoisture();
  float ph = readPH();
  float current = readCurrent();

  // SERIAL OUTPUT

  Serial.println("========== SENSOR DATA ==========");

  Serial.print("LM35 Temp: ");
  Serial.print(lm35_temp);
  Serial.println(" °C");

  Serial.print("DHT Temp: ");
  Serial.print(dht_temp);
  Serial.println(" °C");

  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");

  Serial.print("Soil Moisture: ");
  Serial.print(moisture);
  Serial.println(" %");

  Serial.print("pH Value: ");
  Serial.println(ph);

  Serial.print("Current: ");
  Serial.print(current);
  Serial.println(" A");

  Serial.println("=================================\n");

  // SEND TO BACKEND
  sendToBackend(
    dht_temp,
    humidity,
    moisture,
    ph,
    current
  );

  delay(60000);
}

// =====================================================
// SEND DATA TO BACKEND
// =====================================================

void sendToBackend(
  float temperature,
  float humidity,
  float moisture,
  float ph,
  float current
) {

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println("WiFi Disconnected!");
    return;
  }

  HTTPClient http;

  http.begin(backend_url);

  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", api_key);

  // ================= JSON PAYLOAD =================

  StaticJsonDocument<256> doc;

  // REQUIRED FIELDS FOR BACKEND
  doc["deviceId"] = "DEVICE_001";
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["moisture"] = moisture;
  doc["ph"] = ph;

  // DO NOT SEND current
  // Backend schema doesn't support it

  String payload;

  serializeJson(doc, payload);

  Serial.println("\n========== JSON SENT ==========");
  Serial.println(payload);
  Serial.println("================================");

  // SEND REQUEST
  int httpCode = http.POST(payload);

  // GET RESPONSE
  String response = http.getString();

  Serial.print("HTTP Code: ");
  Serial.println(httpCode);

  Serial.print("Server Response: ");
  Serial.println(response);

  // SUCCESS
  if (httpCode == 200 || httpCode == 201) {

    Serial.println("✅ Data Sent Successfully!\n");

  } else {

    Serial.println("❌ Failed To Send Data!\n");
  }

  http.end();
}

// =====================================================
// SENSOR FUNCTIONS
// =====================================================

// LM35
float readLM35Temperature() {

  int raw = analogRead(LM35D_PIN);

  float voltage = (raw / 4095.0) * 3.3;

  float temperature = voltage * 100.0;

  return temperature;
}

// DHT TEMP
float readDHTTemperature() {

  float temp = dht.readTemperature();

  if (isnan(temp)) {
    return 0;
  }

  return temp;
}

// DHT HUMIDITY
float readDHTHumidity() {

  float humidity = dht.readHumidity();

  if (isnan(humidity)) {
    return 0;
  }

  return humidity;
}

// SOIL MOISTURE
float readMoisture() {

  int raw = analogRead(MOISTURE_ANALOG_PIN);

  float moisture = map(raw, 4095, 1500, 0, 100);

  moisture = constrain(moisture, 0, 100);

  return moisture;
}

// pH SENSOR
float readPH() {

  int raw = analogRead(PH_SENSOR_PIN);

  float voltage = (raw / 4095.0) * 3.3;

  float ph = -1.14 * voltage + 6.95;

  ph = constrain(ph, 0, 14);

  return ph;
}

// ACS712 CURRENT
float readCurrent() {

  int raw = analogRead(ACS712_PIN);

  float voltage = (raw / 4095.0) * 3.3;

  float current =
    (voltage - ACS712_CENTER_VOLTAGE) /
    ACS712_SENSITIVITY;

  return current;
}