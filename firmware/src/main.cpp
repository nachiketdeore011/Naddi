/*
 * Nadi Diagnosis System - ESP32 Firmware (WebSocket Mode)
 *
 * Captures PPG pulse signals from MAX30102 sensor
 * and streams them in real-time via WebSocket.
 *
 * Data flow:
 *   MAX30102 -> ESP32 -> WebSocket -> Backend -> Frontend
 *
 * Wiring:
 *   MAX30102 SDA  -> GPIO 21
 *   MAX30102 SCL  -> GPIO 22
 *   MAX30102 VCC  -> 3.3V
 *   MAX30102 GND  -> GND
 */

#include <Arduino.h>
#include <WiFi.h>
#include <Wire.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include "MAX3015.h"

// --- Configuration ---
#define SAMPLE_RATE_HZ      100
#define BATCH_SIZE          10     // samples per WS message (100ms batch)
#define SERIAL_BAUD         115200
#define RECONNECT_DELAY_MS  5000

// MAX30102 I2C pins
#define SDA_PIN             21
#define SCL_PIN             22

// WiFi credentials (set in platformio.ini build_flags)
#ifndef WIFI_SSID
#define WIFI_SSID "YOUR_WIFI_SSID"
#endif
#ifndef WIFI_PASS
#define WIFI_PASS "YOUR_WIFI_PASSWORD"
#endif

// Backend WebSocket endpoint (ws://host:port)
#ifndef API_HOST
#define API_HOST "192.168.1.100"
#endif

#define WS_PORT 8000
#define WS_PATH "/api/pulse/ws/device/"

// --- Globals ---
MAX3015 particleSensor;
WebSocketsClient webSocket;
float sampleBuffer[BATCH_SIZE];
int sampleIndex = 0;
unsigned long lastSampleTime = 0;
unsigned long lastReconnectAttempt = 0;
bool wsConnected = false;
String deviceId = "";
String patientId = "default";

// --- WebSocket Event Handler ---

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch (type) {
        case WStype_DISCONNECTED:
            wsConnected = false;
            Serial.println("[WS] Disconnected from server");
            break;

        case WStype_CONNECTED:
            wsConnected = true;
            Serial.println("[WS] Connected to server");
            // Send registration message
            {
                JsonDocument doc;
                doc["type"] = "register";
                doc["device_id"] = deviceId;
                doc["patient_id"] = patientId;
                doc["sample_rate"] = SAMPLE_RATE_HZ;
                String msg;
                serializeJson(doc, msg);
                webSocket.sendTXT(msg);
            }
            break;

        case WStype_TEXT: {
            // Handle server messages (acks, config updates)
            JsonDocument doc;
            DeserializationError err = deserializeJson(doc, payload, length);
            if (!err) {
                const char* msgType = doc["type"] | "";
                if (strcmp(msgType, "ack") == 0) {
                    int received = doc["samples_received"] | 0;
                    // Silent ack - optional logging
                } else if (strcmp(msgType, "config") == 0) {
                    // Server can update patient_id remotely
                    if (doc.containsKey("patient_id")) {
                        patientId = doc["patient_id"].as<String>();
                        Serial.printf("[WS] Patient ID updated: %s\n", patientId.c_str());
                    }
                } else if (strcmp(msgType, "pong") == 0) {
                    // Keepalive response
                }
            }
            break;
        }

        case WStype_ERROR:
            Serial.printf("[WS] Error: %s\n", payload);
            break;

        default:
            break;
    }
}

// --- WiFi ---

void connectWiFi() {
    Serial.print("Connecting to WiFi");
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 40) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected: " + WiFi.localIP().toString());
        Serial.printf("MAC: %s\n", WiFi.macAddress().c_str());
    } else {
        Serial.println("\nWiFi connection failed!");
    }
}

// --- WebSocket Connection ---

void connectWebSocket() {
    Serial.printf("Connecting to ws://%s:%d%s%s\n", API_HOST, WS_PORT, WS_PATH, deviceId.c_str());
    webSocket.begin(API_HOST, WS_PORT, (String(WS_PATH) + deviceId).c_str());
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(RECONNECT_DELAY_MS);
    webSocket.enableHeartbeat(15000, 10000, 3);  // ping every 15s, pong timeout 10s, 3 retries
}

// --- Send Samples ---

void sendSamples(float* samples, int count) {
    if (!wsConnected || count == 0) return;

    JsonDocument doc;
    doc["patient_id"] = patientId;
    doc["sample_rate"] = SAMPLE_RATE_HZ;

    JsonArray arr = doc["samples"].to<JsonArray>();
    for (int i = 0; i < count; i++) {
        arr.add(samples[i]);
    }

    String payload;
    serializeJson(doc, payload);
    webSocket.sendTXT(payload);
}

// --- Setup ---

void setup() {
    Serial.begin(SERIAL_BAUD);
    Serial.println("\n========================================");
    Serial.println("  Nadi Diagnosis System - WebSocket Mode");
    Serial.println("========================================\n");

    // Generate device ID from MAC address (last 6 chars)
    WiFi.mode(WIFI_STA);
    deviceId = WiFi.macAddress();
    deviceId.replace(":", "");
    deviceId = deviceId.substring(deviceId.length() - 12);
    Serial.printf("Device ID: %s\n", deviceId.c_str());

    // Initialize I2C
    Wire.begin(SDA_PIN, SCL_PIN);

    // Initialize MAX30102 sensor
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        Serial.println("ERROR: MAX30102 not found. Check wiring.");
        Serial.println("  SDA -> GPIO 21, SCL -> GPIO 22");
        while (1) {
            delay(1000);
        }
    }
    Serial.println("MAX30102 sensor initialized");

    // Configure sensor
    particleSensor.setPulseWidth(411);
    particleSensor.setSampleRate(SAMPLE_RATE_HZ);
    particleSensor.setLEDCurrent(12.5, 12.5);
    Serial.printf("Sensor: %d Hz sample rate\n", SAMPLE_RATE_HZ);

    // Connect to WiFi
    connectWiFi();

    // Connect to WebSocket server
    connectWebSocket();

    lastSampleTime = millis();
    Serial.println("\nStreaming started...\n");
}

// --- Main Loop ---

void loop() {
    unsigned long now = millis();

    //维持 WebSocket 连接
    webSocket.loop();

    // Reconnect WiFi if dropped
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi lost, reconnecting...");
        connectWiFi();
        if (WiFi.status() == WL_CONNECTED) {
            connectWebSocket();
        }
    }

    // Sample at configured rate
    if (now - lastSampleTime >= (1000 / SAMPLE_RATE_HZ)) {
        lastSampleTime = now;

        long irValue = particleSensor.getIR();

        // Check if finger/pulse is detected (IR threshold)
        if (irValue > 50000) {
            sampleBuffer[sampleIndex] = (float)irValue;
            sampleIndex++;

            // Send batch when buffer is full
            if (sampleIndex >= BATCH_SIZE) {
                sendSamples(sampleBuffer, sampleIndex);
                sampleIndex = 0;
            }
        } else {
            // No finger detected - reset buffer to avoid stale data
            if (sampleIndex > 0) {
                sampleIndex = 0;
            }
        }
    }
}
