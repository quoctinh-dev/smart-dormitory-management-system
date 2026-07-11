#include "WiFiManager.h"
#include <WiFi.h>
#include "../config/Config.h"

unsigned long WiFiManager::lastReconnectAttempt = 0;

void WiFiManager::init() {
    Serial.println();
    Serial.print("[WiFi] Connecting to ");
    Serial.println(WIFI_SSID);

    WiFi.mode(WIFI_STA); // Station mode
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    // Initial connection wait
    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 20) { // Wait max 10s
        delay(500);
        Serial.print(".");
        retries++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n[WiFi] Connected successfully!");
        Serial.print("[WiFi] IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\n[WiFi] Connection failed. Will retry in loop.");
    }
}

void WiFiManager::maintainConnection() {
    if (WiFi.status() != WL_CONNECTED) {
        unsigned long currentMillis = millis();
        // Cố gắng kết nối lại (Auto Reconnect) mà không dùng delay block mạch
        if (currentMillis - lastReconnectAttempt >= RECONNECT_INTERVAL) {
            lastReconnectAttempt = currentMillis;
            Serial.println("[WiFi] Reconnecting...");
            WiFi.disconnect();
            WiFi.reconnect();
        }
    }
}

bool WiFiManager::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}
