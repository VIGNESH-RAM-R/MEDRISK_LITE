#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

#define DHT_PIN 4
#define DHT_TYPE DHT11

#define MOISTURE_PIN 34
#define LED_PIN 26

const float TEMP_THRESHOLD = 34.0;
const int MOISTURE_THRESHOLD = 2500;

// ---- Fill these in before flashing (do not commit real values here) ----
const char *WIFI_SSID = "YOUR_WIFI_SSID";
const char *WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Your PC's LAN IP (run `ipconfig` on the PC running the MedRisk Lite server —
// look for "IPv4 Address" under the Wi-Fi adapter) and the server's port.
// The ESP32 and the PC must be on the same Wi-Fi network. Note: the ESP32's
// WiFi radio is 2.4GHz-only — if you're on a phone hotspot, make sure it's
// broadcasting on 2.4GHz (not 5GHz-only), or the ESP32 won't see it at all.
const char *SERVER_HOST = "YOUR_PC_LAN_IP";
const int SERVER_PORT = 4000;

// Must match HARDWARE_DEVICE_KEY in server/.env exactly (ask whoever has that
// file for the value — do not commit the real key here).
const char *DEVICE_KEY = "YOUR_HARDWARE_DEVICE_KEY";
// --------------------------------------------------------------------------

const unsigned long READING_INTERVAL_MS = 5000;

DHT dht(DHT_PIN, DHT_TYPE);

void blinkAlert() {
    for (int i = 0; i < 3; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(300);
        digitalWrite(LED_PIN, LOW);
        delay(300);
    }
}

void connectWiFi() {
    if (WiFi.status() == WL_CONNECTED) return;

    Serial.print("Connecting to WiFi");
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
        delay(400);
        Serial.print(".");
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
        Serial.print("WiFi connected. IP: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("WiFi connection failed — will retry next cycle.");
    }
}

// POST { sensorType, value, thresholdBreached } to /api/hardware/reading.
// Device-authenticated via the x-device-key header (no Clerk session needed).
bool sendReading(const char *sensorType, float value, bool thresholdBreached) {
    if (WiFi.status() != WL_CONNECTED) return false;

    HTTPClient http;
    String url = String("http://") + SERVER_HOST + ":" + SERVER_PORT + "/api/hardware/reading";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", DEVICE_KEY);

    String body = String("{\"sensorType\":\"") + sensorType +
                  "\",\"value\":" + String(value, 2) +
                  ",\"thresholdBreached\":" + (thresholdBreached ? "true" : "false") + "}";

    int statusCode = http.POST(body);
    if (statusCode > 0) {
        Serial.print(sensorType);
        Serial.print(" reading POSTed, server responded: ");
        Serial.println(statusCode);
    } else {
        Serial.print("POST failed for ");
        Serial.print(sensorType);
        Serial.print(": ");
        Serial.println(http.errorToString(statusCode));
    }
    http.end();
    return statusCode == 201;
}

void setup() {
    Serial.begin(115200);
    delay(1000);

    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, LOW);

    dht.begin();

    Serial.println("================================");
    Serial.println("       MEDRISK LITE");
    Serial.println("   Combined Risk Monitor");
    Serial.println("================================");

    connectWiFi();
}

void loop() {
    connectWiFi();

    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    int moistureValue = analogRead(MOISTURE_PIN);

    if (isnan(temperature) || isnan(humidity)) {
        Serial.println("DHT11 reading failed!");
        digitalWrite(LED_PIN, LOW);
        delay(2000);
        return;
    }

    Serial.print("Temperature : ");
    Serial.print(temperature);
    Serial.println(" °C");

    Serial.print("Humidity    : ");
    Serial.print(humidity);
    Serial.println(" %");

    Serial.print("Moisture ADC: ");
    Serial.println(moistureValue);

    bool overheating = temperature >= TEMP_THRESHOLD;
    bool sealBreach = moistureValue < MOISTURE_THRESHOLD;

    if (overheating && sealBreach) {

        Serial.println("WARNING: BATTERY OVERHEATING");
        Serial.println("WARNING: SEAL BREACH DETECTED");
        Serial.println("ALERT: MULTIPLE RISKS");
        blinkAlert();

    }
    else if (overheating) {

        Serial.println("WARNING: BATTERY OVERHEATING");
        Serial.println("ALERT: TEMPERATURE RISK");
        blinkAlert();

    }
    else if (sealBreach) {

        Serial.println("WARNING: SEAL BREACH DETECTED");
        Serial.println("ALERT: MOISTURE RISK");
        blinkAlert();

    }
    else {

        digitalWrite(LED_PIN, LOW);
        Serial.println("STATUS: NORMAL");
        Serial.println("LED: OFF");
    }

    // Report both sensors to the dashboard (Home screen "Hardware" card, polls
    // every 15s) — moisture maps to the housing/seal-breach FailureMode,
    // temperature to the battery-overheating one (see server/src/routes/hardware.js).
    sendReading("temperature", temperature, overheating);
    sendReading("moisture", (float)moistureValue, sealBreach);

    Serial.println("--------------------------------");

    delay(READING_INTERVAL_MS);
}
