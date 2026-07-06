#include <Arduino.h>
#include "src/config/Config.h"
#include "src/config/Pins.h"
#include "src/drivers/RelayController.h"
#include "src/drivers/CameraDriver.h"
#include "src/network/WiFiManager.h"
#include "src/network/MqttManager.h"
#include "src/network/HttpManager.h"

// ==============================================================================
// SMART ACCESS FIRMWARE - SPRINT 2
// ==============================================================================
// Tính năng hiện tại:
// - Đã có Configuration và Device Identity (Config.h)
// - Khởi tạo phần cứng cơ bản (RelayController)
// - Khởi tạo Camera OV2640 tối ưu PSRAM (CameraDriver)
// - Kết nối mạng WiFi tự động phục hồi (WiFiManager)
// - Lắng nghe lệnh mở cửa và bắn Heartbeat qua MQTT (MqttManager)
// - Chụp ảnh và gửi HTTP Multipart Form-Data lên Backend AI (HttpManager)
// - Kiến trúc State Machine tuần tự, Non-blocking.
// ==============================================================================

unsigned long lastCaptureTime = 0; // Tránh spam nút bấm

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\n\n=======================================");
    Serial.println("  SDMS - SMART ACCESS (SPRINT 2)");
    Serial.println("  Device ID: " + DEVICE_ID);
    Serial.println("  Version:   " + FIRMWARE_VERSION);
    Serial.println("=======================================\n");

    // 1. Initialize Hardware
    RelayController::init();
    CameraDriver::init();
    
    // Nút bấm ảo để test chụp ảnh bằng tay (Do ta chưa có PIR Sensor)
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    
    if (!ENABLE_RFID) {
        Serial.println("[System] RFID module is DISABLED by configuration.");
    }

    // 2. Initialize Network Services
    WiFiManager::init();
    MqttManager::init();
    
    Serial.println("[System] Setup Complete. Entering Idle State...\n");
}

void loop() {
    // 1. Maintain Network Connections (Non-blocking Reconnect)
    WiFiManager::maintainConnection();
    
    if (WiFiManager::isConnected()) {
        MqttManager::maintainConnection();
    }

    // 2. Maintain Hardware States (Tự động đóng Relay sau 5s)
    RelayController::maintain();

    // 3. Xử lý Trigger (TỰ ĐỘNG CHỤP ẢNH TEST MỖI 15 GIÂY)
    // Dành cho kịch bản test không có nút bấm vật lý.
    if (millis() - lastCaptureTime > 15000) {
        lastCaptureTime = millis();
        Serial.println("\n[Trigger] Auto-capture timer reached! Capturing face...");
        
        camera_fb_t* fb = CameraDriver::capture();
        if (fb != nullptr) {
            // Gửi ảnh lên Spring Boot Backend
            HttpManager::uploadFace(fb);
            
            // Giải phóng bộ nhớ Frame Buffer cực kỳ quan trọng!
            CameraDriver::release(fb);
        }
    }
}
