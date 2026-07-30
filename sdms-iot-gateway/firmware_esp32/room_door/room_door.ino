/**
 * ==============================================================================
 * DỰ ÁN: HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ THÔNG MINH (SDMS)
 * CỤM IOT: ROOM DOOR (CỬA PHÒNG KTX)
 * NỀN TẢNG: ESP32 (Standard)
 * 
 * CHỨC NĂNG CỐT LÕI:
 * 1. Bàn phím mã PIN (Keypad 4x4) & Màn hình LCD I2C.
 * 2. Xác thực mã PIN trực tuyến qua HTTP POST (REST API).
 * 3. Điều khiển Servo 360 độ (Đã tối ưu ngắt xung PWM chống nóng motor).
 * 4. Nhận lệnh Mở Cửa Từ Xa (Remote Unlock) qua giao thức MQTT.
 * 5. Cơ chế Fallback Offline: Mở bằng Master PIN và ghi Log vào bộ nhớ nội, 
 *    tự động đồng bộ lên Server khi có mạng trở lại.
 * 
 * LƯU Ý KỸ THUẬT: Code thiết kế hoàn toàn Non-blocking trong hàm loop().
 * ==============================================================================
 */
#include <Arduino.h>
#include <Wire.h>
#include "Config.h"
#include "NetworkManager.h"
#include "LcdManager.h"
#include "KeypadManager.h"
#include "ServoManager.h"

void setup() {
    Serial.begin(115200);
    Serial.println("\n=======================================");
    Serial.println("  SDMS ROOM DOOR ACCESS");
    Serial.println("  Device : " + DEVICE_ID);
    Serial.println("  Version: " + FIRMWARE_VERSION);
    Serial.println("=======================================\n");

    // 1. Khởi tạo ngoại vi
    initLcd();
    initServo();
    initKeypad();
    OfflineAccessLog::begin(); // Khởi tạo bộ nhớ lưu log NVS

    // 2. Kết nối WiFi
    initWiFi();

    lcdPrintMessage("READY!", "Enter PIN...");
}

void loop() {
    // Giữ kết nối WiFi luôn ổn định
    ensureWiFiConnection();

    // Xử lý logic nhập phím
    processKeypadInput();
    
    // Duy trì các tác vụ Non-blocking
    maintainLcd();
    maintainServo();
}
