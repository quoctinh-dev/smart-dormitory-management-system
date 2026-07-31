#ifndef SERVO_MANAGER_H
#define SERVO_MANAGER_H

#include <ESP32Servo.h>
#include "Config.h"

Servo doorServo;
bool isDoorOpen = false;
bool emergencyMode = false;

void initServo() {
    ESP32PWM::allocateTimer(0);
    ESP32PWM::allocateTimer(1);
    ESP32PWM::allocateTimer(2);
    ESP32PWM::allocateTimer(3);
    
    doorServo.setPeriodHertz(50); // Servo chuẩn 50Hz
    
    // Khởi tạo không cần attach liên tục để tránh servo bị nóng / rít
    Serial.println("[Servo] Initialized. Door latched (360 mode).");
}

unsigned long servoOpenTime = 0;

void openDoor() {
    Serial.println("[Servo] Opening door (Quay 180 độ)...");
    
    doorServo.attach(SERVO_PIN, 500, 2400); 
    doorServo.write(180); // Cấp tốc độ tối đa theo một chiều để thu chốt
    delay(200);           // Xoay trong 0.2 giây
    
    doorServo.write(94);  // Lệnh dừng (Stop 360 servo)
    delay(50);
    doorServo.detach();   // Ngắt PWM hoàn toàn để motor không kêu rè rè và không bị nóng

    isDoorOpen = true;
    servoOpenTime = millis();
}

void closeDoor() {
    Serial.println("[Servo] Closing door (Quay 0 độ)...");
    
    doorServo.attach(SERVO_PIN, 500, 2400); 
    doorServo.write(0);   // Cấp tốc độ tối đa theo chiều ngược lại để đẩy chốt
    delay(200);           // Xoay trong 0.2 giây
    
    doorServo.write(94);  // Lệnh dừng (Stop 360 servo)
    delay(50);
    doorServo.detach();   // Ngắt PWM

    isDoorOpen = false;
}

void emergencyOpenDoor() {
    emergencyMode = true;
    openDoor();
    Serial.println("[Servo] 🚨 EMERGENCY MODE ACTIVATED: Door stays UNLOCKED");
}

void emergencyCloseDoor() {
    emergencyMode = false;
    closeDoor();
    Serial.println("[Servo] 🚨 EMERGENCY MODE DEACTIVATED: Door is LOCKED");
}

void maintainServo() {
    if (!isDoorOpen) return;
    if (emergencyMode) return; // Không tự động đóng cửa nếu đang bật khẩn cấp
    
    if (millis() - servoOpenTime >= RELAY_OPEN_DURATION) {
        closeDoor();
    }
}

#endif // SERVO_MANAGER_H
