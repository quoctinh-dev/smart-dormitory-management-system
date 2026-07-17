#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// ==============================================================================
// 1. DEVICE IDENTITY
// ==============================================================================
static const String DEVICE_ID = "ESP32_ROOM_101";
static const String GATE_ID = "a937509c-e2ae-4a2c-a74e-fd30d2318b2b"; 
static const String FIRMWARE_VERSION = "1.0.0-Room";

// ====================================================================== ========
// 2. NETWORK CONFIGURATION
// ==============================================================================
static const char* WIFI_SSID = "TECNO POVA 6";
static const char* WIFI_PASSWORD = "12345678";

// API Backend
static const String BACKEND_BASE_URL = "http://10.152.127.74:8080/api/v1/smartaccess";

// MQTT Broker
static const char* MQTT_SERVER = "10.152.127.74";
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
