#include "RelayController.h"
#include "../config/Pins.h"
#include "../config/Config.h"
#include <ESP32Servo.h>

static Servo chotCua;
unsigned long RelayController::unlockStartTime = 0;
bool RelayController::isUnlocked = false;

void RelayController::init() {
    if (!ENABLE_SERVO) {
        Serial.println("[Servo] Disabled by config.");
        return;
    }
    // Drive pin LOW to ensure Flash LED (shared line) stays off at boot
    pinMode(SERVO_PIN, OUTPUT);
    digitalWrite(SERVO_PIN, LOW);
    Serial.println("[Servo] Initialized. Door latch in idle state.");
}

void RelayController::unlock() {
    if (!ENABLE_SERVO) return;

    Serial.println("[Servo] --> UNLOCK (Mở chốt - Xoay đến góc 90 độ)");
    chotCua.attach(SERVO_PIN, 500, 2400);
    chotCua.write(90);  // Xoay trục servo đến góc 90 độ
    delay(300);         // Chờ 0.3s để servo xoay tới đích
    chotCua.detach();   // Ngắt xung PWM để servo không bị rung gắt và tắt LED Flash
    digitalWrite(SERVO_PIN, LOW);

    isUnlocked = true;
    unlockStartTime = millis();
}

void RelayController::lock() {
    if (!ENABLE_SERVO) return;

    Serial.println("[Servo] --> LOCK (Đóng chốt - Xoay về góc 0 độ)");
    chotCua.attach(SERVO_PIN, 500, 2400);
    chotCua.write(0);   // Xoay trục servo trả về góc 0 độ
    delay(300);         // Chờ 0.3s để servo xoay tới đích
    chotCua.detach();   
    digitalWrite(SERVO_PIN, LOW);

    isUnlocked = false;
}

void RelayController::maintain() {
    if (!isUnlocked) return;
    if (millis() - unlockStartTime >= RELAY_OPEN_DURATION) {
        lock();
    }
}
