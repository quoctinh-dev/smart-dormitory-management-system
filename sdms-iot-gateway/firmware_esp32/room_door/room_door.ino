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

    // 2. Kết nối WiFi
    initWiFi();

    lcdPrintMessage("READY!", "Enter PIN...");
}

void loop() {
    // Giữ kết nối WiFi luôn ổn định
    ensureWiFiConnection();

    // Xử lý logic nhập phím
    processKeypadInput();
}
