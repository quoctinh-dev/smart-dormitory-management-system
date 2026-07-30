#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// ==============================================================================
// 1. ĐỊNH DANH THIẾT BỊ (DEVICE IDENTITY)
// ==============================================================================
static const String DEVICE_ID = "ESP32_CAM_001";
static const String GATE_ID = "1fe2de28-3fbe-46c4-b2fb-335aba513f26";
static const String BUILDING_ID = "dd979326-9196-497f-b35e-068b99f6e3ff";
static const String FIRMWARE_VERSION = "1.0.0-Sprint1";
static const String HARDWARE_MODEL = "AI-Thinker ESP32-CAM";

// ==============================================================================
// 2. CẤU HÌNH MẠNG & MÁY CHỦ (NETWORK CONFIGURATION)
// ==============================================================================
static const char* WIFI_SSID     = "LVTT";
static const char* WIFI_PASSWORD = "12345678";


static const char* BACKEND_MDNS_HOST = "192.168.137.1";
static const int   BACKEND_PORT      = 8080;

static const String BACKEND_BASE_URL = "http://192.168.137.1:8080/api/v1/smartaccess";

static const char* MQTT_BROKER_HOST = "192.168.137.1";
static const int   MQTT_BROKER_PORT = 1883;
static const char* MQTT_USERNAME    = "";
static const char* MQTT_PASSWORD    = "";

// ==============================================================================
// 3. THỜI GIAN & CHU KỲ (SYSTEM TIMEOUT & INTERVALS - ms)
// ==============================================================================
static const unsigned long RECONNECT_INTERVAL      = 5000;   // Chờ 5s trước khi kết nối lại WiFi/MQTT
static const unsigned long HEARTBEAT_INTERVAL       = 30000;  // Gửi tín hiệu sống mỗi 30s
static const unsigned long HTTP_TIMEOUT             = 10000;  // Chờ HTTP Response tối đa 10s
static const unsigned long RELAY_OPEN_DURATION      = 5000;   // Mở chốt cửa trong 5s rồi khóa lại
static const unsigned long WHITELIST_SYNC_INTERVAL  = 21600000UL; // Đồng bộ thẻ Offline mỗi 6 giờ

// ==============================================================================
// 4. CỜ TỐI ƯU PHẦN CỨNG (HARDWARE OPTIMIZATION & DIAGNOSTIC FLAGS)
// ==============================================================================
#define ENABLE_CAMERA true
#define ENABLE_RFID   true
#define ENABLE_SERVO  true

#define CAMERA_FRAME_SIZE FRAMESIZE_VGA
#define CAMERA_JPEG_QUALITY 10
#define CAMERA_FB_COUNT 1
#endif
