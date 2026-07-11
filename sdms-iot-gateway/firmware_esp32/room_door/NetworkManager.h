#ifndef NETWORK_MANAGER_H
#define NETWORK_MANAGER_H

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "Config.h"
#include "LcdManager.h"
#include "ServoManager.h"

unsigned long lastReconnectAttempt = 0;

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
    }
}

void verifyPinWithBackend(String pinCode) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[HTTP] Error: WiFi not connected");
        lcdPrintMessage("NETWORK ERROR", "TRY AGAIN");
        delay(2000);
        lcdPrintMessage("READY!", "Enter PIN...");
        return;
    }

    HTTPClient http;
    String url = BACKEND_BASE_URL + "/verify/pin";
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(HTTP_TIMEOUT);

    // Xây dựng JSON payload
    StaticJsonDocument<200> doc;
    doc["pinCode"] = pinCode;
    doc["gateId"] = GATE_ID;
    
    String payload;
    serializeJson(doc, payload);

    Serial.println("[HTTP] Sending POST: " + url);
    Serial.println("[HTTP] Payload: " + payload);

    lcdPrintMessage("VERIFYING...", "PLEASE WAIT");

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("[HTTP] Response: " + response);

        StaticJsonDocument<512> responseDoc;
        DeserializationError error = deserializeJson(responseDoc, response);

        if (!error && responseDoc["success"] == true) {
            String status = responseDoc["data"]["status"];
            if (status == "GRANTED") {
                lcdPrintMessage("ACCESS GRANTED", "WELCOME!");
                openDoor();
            } else {
                lcdPrintMessage("ACCESS DENIED", "INVALID PIN");
                delay(3000);
            }
        } else {
            // Hiển thị lỗi từ Backend (nếu có)
            String message = responseDoc["message"] | "SERVER ERROR";
            lcdPrintMessage("DENIED", "INCORRECT PIN");
            delay(3000);
        }
    } else {
        Serial.print("[HTTP] POST failed, Error: ");
        Serial.println(http.errorToString(httpResponseCode).c_str());
        lcdPrintMessage("SERVER ERROR", "TRY AGAIN");
        delay(3000);
    }
    
    http.end();
    lcdPrintMessage("READY!", "Enter PIN...");
}

#endif // NETWORK_MANAGER_H
