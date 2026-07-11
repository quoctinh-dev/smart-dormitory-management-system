#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// ==============================================================================
// 1. DEVICE IDENTITY (Dịnh danh thiết bị)
// ==============================================================================
// Thiết bị tự định danh với hệ thống Backend thông qua các ID này.
static const String DEVICE_ID = "ESP32_CAM_001";
static const String GATE_ID = "123e4567-e89b-12d3-a456-426614174000"; // Thay bằng Gate UUID thật
static const String BUILDING_ID = "B1";
static const String FIRMWARE_VERSION = "1.0.0-Sprint1";
static const String HARDWARE_MODEL = "AI-Thinker ESP32-CAM";

// ==============================================================================
// 2. NETWORK CONFIGURATION (Cấu hình Mạng & Kết nối)
// ==============================================================================
static const char* WIFI_SSID = "TECNO POVA 6";
static const char* WIFI_PASSWORD = "12345678";

// API Backend (Spring Boot)
static const String BACKEND_BASE_URL = "http://10.152.127.74:8080/api/v1/smartaccess";

// MQTT Broker
static const char* MQTT_BROKER_HOST = "10.152.127.74"; // Đổi thành IP của Broker
static const int MQTT_BROKER_PORT = 1883;
static const char* MQTT_USERNAME = ""; // Điền nếu có
static const char* MQTT_PASSWORD = "";

// ==============================================================================
// 3. SYSTEM TIMEOUT & INTERVALS (Các khoảng thời gian - mili giây)
// ==============================================================================
static const unsigned long RECONNECT_INTERVAL = 5000;  // Chờ 5s trước khi kết nối lại WiFi/MQTT
static const unsigned long HEARTBEAT_INTERVAL = 30000; // Gửi tín hiệu sống mỗi 30s
static const unsigned long HTTP_TIMEOUT = 10000;       // Chờ HTTP Response tối đa 10s
static const unsigned long RELAY_OPEN_DURATION = 5000; // Mở cửa trong 5s rồi khóa lại

// ==============================================================================
// 4. HARDWARE OPTIMIZATION & DIAGNOSTIC FLAGS
// Dựa trên kết quả từ SDMS ESP32 DIAGNOSTIC TOOLKIT:
// - PSRAM: FOUND (4MB)
// - Sensor: OV2640 (VGA 640x480)
// - Tối ưu: JPEG Quality = 12, Tốc độ lấy mẫu 40ms, Size ảnh ~ 21KB.
// ==============================================================================
// Cờ bật/tắt module phần cứng (Đã có đủ thẻ từ, bật RFID và Servo)
#define ENABLE_CAMERA true // Bật lại Camera vì đang dùng ESP32-CAM
#define ENABLE_RFID   true  // Bật RFID
#define ENABLE_SERVO  true  // Đổi ENABLE_RELAY -> ENABLE_SERVO

// Tối ưu cấu hình Camera theo kết quả Diagnostic
#define CAMERA_FRAME_SIZE FRAMESIZE_VGA
#define CAMERA_JPEG_QUALITY 12
#define CAMERA_FB_COUNT 1 // Chỉ cần 1 buffer vì không livestream, chụp và gửi liền.

#endif // CONFIG_H
