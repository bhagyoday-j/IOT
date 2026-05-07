/*
Sensor Connections (Example)

Temperature Sensor → GPIO 34 (ADC)
Humidity Sensor → GPIO 35 (ADC)
Soil Moisture → GPIO 32 (ADC)
pH Sensor → GPIO 33 (ADC)
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* backend_url = "http://YOUR_SERVER_IP:5000/api/v1/sensors/data";
const char* api_key = "your-secret-api-key-for-esp32";

// Sensor pins (example)
const int tempSensor = 34;
const int humiditySensor = 35;
const int moistureSensor = 32;
const int phSensor = 33;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void loop() {
  // Read sensors
  float temperature = readTemperature();
  float humidity = readHumidity();
  float moisture = readMoisture();
  float ph = readPH();
  
  // Send to backend
  sendToBackend(temperature, humidity, moisture, ph);
  
  delay(60000); // Send every minute
}

void sendToBackend(float temp, float hum, float moist, float ph_val) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin(backend_url);
    http.addHeader("x-api-key", api_key);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON
    StaticJsonDocument<256> doc;
    doc["deviceId"] = "DEVICE_001";
    doc["temperature"] = temp;
    doc["humidity"] = hum;
    doc["moisture"] = moist;
    doc["ph"] = ph_val;
    
    String payload;
    serializeJson(doc, payload);
    
    int httpCode = http.POST(payload);
    
    if (httpCode == 201) {
      Serial.println("✅ Data sent successfully");
    } else {
      Serial.print("❌ Error: ");
      Serial.println(httpCode);
    }
    
    http.end();
  }
}

// Read sensor values (implement based on your sensors)
float readTemperature() {
  int raw = analogRead(tempSensor);
  return 20 + (raw / 4095.0) * 20; // Example: 20-40°C range
}

float readHumidity() {
  int raw = analogRead(humiditySensor);
  return (raw / 4095.0) * 100;
}

float readMoisture() {
  int raw = analogRead(moistureSensor);
  return (raw / 4095.0) * 100;
}

float readPH() {
  int raw = analogRead(phSensor);
  return 5.0 + (raw / 4095.0) * 3; // Example: 5.0-8.0 pH range
}