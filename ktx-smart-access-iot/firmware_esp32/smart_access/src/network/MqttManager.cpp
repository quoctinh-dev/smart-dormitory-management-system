#include "MqttManager.h"
#include <WiFi.h>
#include <ArduinoJson.h>
#include "../config/Config.h"
#include "../drivers/RelayController.h"

WiFiClient espClient;
PubSubClient mqttClient(espClient);

unsigned long MqttManager::lastReconnectAttempt = 0;
unsigned long MqttManager::lastHeartbeatTime = 0;

void MqttManager::init() {
    mqttClient.setServer(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
    mqttClient.setCallback(MqttManager::callback);
    Serial.println("[MQTT] Initialized. Waiting for WiFi to connect...");
}

void MqttManager::subscribeTopics() {
    String gateCommandTopic = "sdms/gates/" + GATE_ID + "/command";
    String buildingCommandTopic = "sdms/gates/building/" + BUILDING_ID + "/command";
    String broadcastTopic = "sdms/gates/system/broadcast";

    mqttClient.subscribe(gateCommandTopic.c_str());
    mqttClient.subscribe(buildingCommandTopic.c_str());
    mqttClient.subscribe(broadcastTopic.c_str());
    
    Serial.println("[MQTT] Subscribed to Gate, Building, and Broadcast Command topics.");
}

void MqttManager::maintainConnection() {
    if (!mqttClient.connected()) {
        unsigned long currentMillis = millis();
        // Cố gắng kết nối lại (Auto Reconnect) mà không block mạch
        if (currentMillis - lastReconnectAttempt >= RECONNECT_INTERVAL) {
            lastReconnectAttempt = currentMillis;
            Serial.println("[MQTT] Attempting MQTT connection...");
            
            // Connect with Device ID as Client ID
            if (mqttClient.connect(DEVICE_ID.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
                Serial.println("[MQTT] Connected to Broker!");
                subscribeTopics();
                // Send an initial heartbeat immediately upon connection
                sendHeartbeat(); 
            } else {
                Serial.print("[MQTT] Failed, rc=");
                Serial.print(mqttClient.state());
                Serial.println(" - Will try again later.");
            }
        }
    } else {
        // Duy trì kết nối MQTT (Nhận tin nhắn)
        mqttClient.loop();
        
        // Xử lý gửi Heartbeat định kỳ
        unsigned long currentMillis = millis();
        if (currentMillis - lastHeartbeatTime >= HEARTBEAT_INTERVAL) {
            lastHeartbeatTime = currentMillis;
            sendHeartbeat();
        }
    }
}

void MqttManager::sendHeartbeat() {
    if (!mqttClient.connected()) return;

    String statusTopic = "sdms/gates/" + GATE_ID + "/status";
    
    // Xây dựng JSON Payload nhỏ gọn cho Heartbeat
    StaticJsonDocument<200> doc;
    doc["deviceId"] = DEVICE_ID;
    doc["status"] = "ONLINE";
    doc["version"] = FIRMWARE_VERSION;
    doc["timestamp"] = millis(); // Tạm dùng millis() nếu không có RTC
    
    char buffer[200];
    serializeJson(doc, buffer);
    
    mqttClient.publish(statusTopic.c_str(), buffer);
    Serial.println("[MQTT] Sent Heartbeat: " + String(buffer));
}

void MqttManager::callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("[MQTT] Message arrived on topic: ");
    Serial.println(topic);
    
    // Parse Payload to String
    String message = "";
    for (int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.println("[MQTT] Payload: " + message);

    // Xử lý JSON
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, message);

    if (error) {
        Serial.println("[MQTT] JSON Parse failed!");
        return;
    }

    String command = doc["command"];
    
    // Nếu Backend ra lệnh UNLOCK hoặc OPEN_ALL (Khẩn cấp)
    if (command == "UNLOCK" || command == "OPEN_ALL") {
        Serial.println("[MQTT] Valid UNLOCK command received. Triggering Relay...");
        RelayController::unlock();
    } else {
        Serial.println("[MQTT] Unknown command.");
    }
}
