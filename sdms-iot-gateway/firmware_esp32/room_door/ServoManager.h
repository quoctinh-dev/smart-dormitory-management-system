#ifndef SERVO_MANAGER_H
#define SERVO_MANAGER_H

#include <ESP32Servo.h>
#include "Config.h"

Servo doorServo;
bool isDoorOpen = false;

void initServo() {
    ESP32PWM::allocateTimer(0);
    ESP32PWM::allocateTimer(1);
    ESP32PWM::allocateTimer(2);
    ESP32PWM::allocateTimer(3);
    
    doorServo.setPeriodHertz(50); // Servo chuẩn 50Hz
    doorServo.attach(SERVO_PIN, 500, 2400); 
    
    doorServo.write(94); // Khóa cửa mặc định (Điểm dừng của servo 360)
    Serial.println("[Servo] Initialized. Door locked.");
}

void openDoor() {
    Serial.println("[Servo] Opening door...");
    doorServo.write(180); // Cho quay một chiều để kéo chốt vào
    delay(150);           // Quay 150 mili-giây để vừa đủ thụt chốt vào
    doorServo.write(94);  // Dừng lại (Khóa trạng thái mở)
    isDoorOpen = true;
    
    // Đợi một khoảng thời gian rồi tự động đóng
    delay(RELAY_OPEN_DURATION);
    
    Serial.println("[Servo] Closing door...");
    doorServo.write(0);   // Cho quay chiều ngược lại để đẩy chốt ra
    delay(150);           // Quay 150 mili-giây để đẩy chốt ra
    doorServo.write(94);  // Dừng lại (Khóa trạng thái đóng)
    isDoorOpen = false;
}

#endif // SERVO_MANAGER_H
