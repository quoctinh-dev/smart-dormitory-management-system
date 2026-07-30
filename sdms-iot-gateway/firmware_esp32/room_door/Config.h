#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// ==============================================================================
// 1. DEVICE IDENTITY
// ==============================================================================
// --- LỰA CHỌN MẠCH ESP32 SẼ NẠP CODE (Chỉ Uncomment 1 mạch duy nhất) ---

// [MẠCH 1] - PHÒNG A101 (Tòa A)
static const String DEVICE_ID = "ESP32_ROOM_101";
static const String GATE_ID = "a937509c-e2ae-4a2c-a74e-fd30d2318b2b"; 
static const String FIRMWARE_VERSION = "1.0.0-RoomA";

// [MẠCH 2] - PHÒNG B101 (Tòa B - Dùng test rào cản truy cập chéo)
// static const String DEVICE_ID = "ESP32_ROOM_B101";
// static const String GATE_ID = "c827509c-e2ae-4a2c-a74e-fd30d2318b2c"; 
// static const String FIRMWARE_VERSION = "1.0.0-RoomB";

// ====================================================================== ========
// ==============================================================================
// 2. CẤU HÌNH MẠNG & MÁY CHỦ (NETWORK CONFIGURATION)
// ==============================================================================
static const char* WIFI_SSID = "LVTT";
static const char* WIFI_PASSWORD = "12345678";

// ⚠️ CHÚ Ý: Đổi IP này thành IP của máy tính đang chạy Backend Spring Boot (VD: WiFi Mobile Hotspot)
// Tuyệt đối không dùng localhost (127.0.0.1) vì ESP32 là thiết bị ngoại vi.
static const String BACKEND_BASE_URL = "http://192.168.137.1:8080/api/v1/smartaccess";

// Mã PIN dự phòng khi mất kết nối mạng (Offline Fallback)
static const String OFFLINE_MASTER_PIN = "999999";

// MQTT Broker — cùng máy với Backend
static const char* MQTT_SERVER = "192.168.137.1"; // IP of Windows Mobile Hotspot
static const int MQTT_PORT = 1883;

// ==============================================================================
// 3. SYSTEM TIMEOUT & INTERVALS
// ==============================================================================
static const unsigned long RECONNECT_INTERVAL = 5000;
static const unsigned long HTTP_TIMEOUT = 10000;
static const unsigned long RELAY_OPEN_DURATION = 5000; // Mở cửa phòng 5s

// ==============================================================================
// 4. GPIO PINOUT (Dành cho ESP32 DevKit V1 30-Pin)
// ==============================================================================
// Keypad Matrix 4x4
#define ROW_1_PIN 14
#define ROW_2_PIN 27
#define ROW_3_PIN 26
#define ROW_4_PIN 25
#define COL_1_PIN 33
#define COL_2_PIN 32
#define COL_3_PIN 4
#define COL_4_PIN 16

// LCD I2C
#define I2C_SDA_PIN 21
#define I2C_SCL_PIN 22

// Servo
#define SERVO_PIN 13

#endif // CONFIG_H
