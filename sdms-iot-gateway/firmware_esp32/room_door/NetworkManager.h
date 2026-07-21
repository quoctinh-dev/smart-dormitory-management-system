#ifndef NETWORK_MANAGER_H
#define NETWORK_MANAGER_H

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include "Config.h"
#include "LcdManager.h"
#include "ServoManager.h"
#include "OfflineAccessLog.h"

WiFiClient espClient;
PubSubClient mqttClient(espClient);

unsigned long lastReconnectAttempt = 0;
unsigned long lastMqttReconnectAttempt = 0;

void mqttCallback(char* topic, byte* payload, unsigned int length) {
    Serial.print("[MQTT] Message arrived [");
    Serial.print(topic);
    Serial.print("] ");
    String message = "";
    for (int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.println(message);

    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, message);

    if (!error) {
        String command = doc["command"];
        if (command == "UNLOCK") {
            Serial.println("[MQTT] Received UNLOCK command from Admin");
            lcdPrintMessage("REMOTE UNLOCK", "DOOR OPEN");
            openDoor();
            lcdPrintMessage("READY!", "Enter PIN...");
        }
    }
}

void initWiFi() {
    Serial.println();
    Serial.print("[WiFi] Connecting to ");
    Serial.println(WIFI_SSID);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    lcdPrintMessage("CONNECTING...", "WIFI");

    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 20) {
        delay(500);
        Serial.print(".");
        retries++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("");
        Serial.println("[WiFi] Connected!");
        Serial.print("[WiFi] IP address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\n[WiFi] Connection Failed!");
        lcdPrintMessage("WIFI ERROR", "CHECK ROUTER");
    }

    mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);
}

void reconnectMQTT() {
    if (WiFi.status() != WL_CONNECTED) return;
    
    unsigned long currentMillis = millis();
    if (currentMillis - lastMqttReconnectAttempt > RECONNECT_INTERVAL) {
        Serial.print("[MQTT] Attempting connection...");
        String clientId = "ESP32_Room_";
        clientId += String(random(0xffff), HEX);
        
        if (mqttClient.connect(clientId.c_str())) {
            Serial.println("connected");
            String topic = "sdms/gates/" + GATE_ID + "/command";
            mqttClient.subscribe(topic.c_str());
            Serial.println("[MQTT] Subscribed to " + topic);
        } else {
            Serial.print("failed, rc=");
            Serial.println(mqttClient.state());
        }
        lastMqttReconnectAttempt = currentMillis;
    }
}

void ensureWiFiConnection() {
    if (WiFi.status() != WL_CONNECTED) {
        unsigned long currentMillis = millis();
        if (currentMillis - lastReconnectAttempt > RECONNECT_INTERVAL) {
            Serial.println("[WiFi] Reconnecting...");
            WiFi.disconnect();
            WiFi.reconnect();
            lastReconnectAttempt = currentMillis;
        }
    } else {
        if (!mqttClient.connected()) {
            reconnectMQTT();
        } else {
            mqttClient.loop();
        }

        // Tự động đồng bộ log offline nếu có
        static unsigned long lastSyncAttempt = 0;
        if (OfflineAccessLog::hasPending() && (millis() - lastSyncAttempt > 10000)) {
            syncOfflineLogs();
            lastSyncAttempt = millis();
        }
    }
}

void syncOfflineLogs() {
    if (WiFi.status() != WL_CONNECTED) return;
    if (!OfflineAccessLog::hasPending()) return;

    Serial.println("[HTTP] Synchronizing offline logs to Backend...");
    
    String logsJson = OfflineAccessLog::getBatchJson();
    String payload = "{\"gateId\":\"" + GATE_ID + "\",\"currentMillis\":" + String(millis()) + ",\"logs\":" + logsJson + "}";

    HTTPClient http;
    http.begin(BACKEND_BASE_URL + "/offline-log-batch");
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(HTTP_TIMEOUT);

    int httpCode = http.POST(payload);

    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
        Serial.println("[HTTP] ✅ Offline logs synced successfully.");
        OfflineAccessLog::clear();
    } else {
        Serial.printf("[HTTP] ❌ Failed to sync offline logs. HTTP Code: %d\n", httpCode);
    }
    http.end();
}

void verifyPinWithBackend(String pinCode) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[HTTP] Error: WiFi not connected");
        if (pinCode == OFFLINE_MASTER_PIN) {
            lcdPrintTempMessage("OFFLINE GRANTED", "MASTER PIN OK", 3000);
            OfflineAccessLog::push("MASTER_PIN", millis(), "OFFLINE_MASTER_PIN_GRANT");
            openDoor();
        } else {
            lcdPrintTempMessage("NETWORK ERROR", "TRY MASTER PIN", 3000);
        }
        return;
    }

    HTTPClient http;
    String url = BACKEND_BASE_URL + "/verify/pin";
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(HTTP_TIMEOUT);

    StaticJsonDocument<200> doc;
    doc["pinCode"] = pinCode;
    doc["gateId"] = GATE_ID;
    
    String payload;
    serializeJson(doc, payload);

    Serial.println("[HTTP] Sending POST: " + url);
    lcdPrintTempMessage("VERIFYING...", "PLEASE WAIT", 5000);

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("[HTTP] Response: " + response);

        StaticJsonDocument<512> responseDoc;
        DeserializationError error = deserializeJson(responseDoc, response);

        if (!error && responseDoc["success"] == true) {
            String status = responseDoc["data"]["status"];
            if (status == "GRANTED") {
                lcdPrintTempMessage("ACCESS GRANTED", "WELCOME!", 3000);
                openDoor();
            } else {
                lcdPrintTempMessage("ACCESS DENIED", "INVALID PIN", 3000);
            }
        } else {
            lcdPrintTempMessage("DENIED", "INCORRECT PIN", 3000);
        }
    } else {
        Serial.print("[HTTP] POST failed, Error: ");
        Serial.println(http.errorToString(httpResponseCode).c_str());
        
        // Offline Fallback
        if (pinCode == OFFLINE_MASTER_PIN) {
            lcdPrintTempMessage("OFFLINE GRANTED", "MASTER PIN OK", 3000);
            OfflineAccessLog::push("MASTER_PIN", millis(), "OFFLINE_MASTER_PIN_GRANT");
            openDoor();
        } else {
            lcdPrintTempMessage("SERVER ERROR", "TRY MASTER PIN", 3000);
        }
    }
    
    http.end();
}

#endif // NETWORK_MANAGER_H
