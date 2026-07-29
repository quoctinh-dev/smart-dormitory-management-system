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

    Serial.println("[Servo] --> UNLOCK (Quay Phải để Mở)");
    chotCua.attach(SERVO_PIN, 500, 2400);
    chotCua.write(0);   // Quay qua phải (0 độ)
    delay(150);         // Xoay trong 0.15 giây để kéo chốt
    chotCua.write(94);  // Lệnh dừng (Stop cho Servo 360)
    delay(50);
    chotCua.detach();
    digitalWrite(SERVO_PIN, LOW);

    isUnlocked = true;
    unlockStartTime = millis();
}

void RelayController::lock() {
    if (!ENABLE_SERVO) return;

    Serial.println("[Servo] --> LOCK (Quay Trái để Đóng)");
    chotCua.attach(SERVO_PIN, 500, 2400);
    chotCua.write(180); // Quay qua trái (180 độ)
    delay(150);         // Xoay trong 0.15 giây để đẩy chốt
    chotCua.write(94);  // Lệnh dừng (Stop cho Servo 360)
    delay(50);
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
