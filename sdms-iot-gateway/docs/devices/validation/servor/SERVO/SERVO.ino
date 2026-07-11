/*
 * BÀI TEST 1 (BẢN CẬP NHẬT): ĐIỀU KHIỂN ĐỘNG CƠ SERVO 360 ĐỘ
 * Bo mạch: ESP32 DevKit V1
 * * Hướng dẫn nối dây: VIN (Đỏ), GND (Nâu/Đen), D13 (Vàng/Cam)
 */

#include <ESP32Servo.h>

Servo chotCua;
const int servoPin = 13;

void setup() {
  Serial.begin(115200); 
  Serial.println("Bat dau kiem tra Servo 360 do...");
  
  chotCua.attach(servoPin, 500, 2400); 

  chotCua.write(94); // Số 94 : điểm dừng của con servo
}

void loop() {
  // --- KỊCH BẢN 1: MỞ CỬA ---
  Serial.println("--> MO CUA (Keo chot vao)");  chotCua.write(180);  // Cho quay một chiều
  delay(150);          /// Cho quay 130 mili-giây để vừa đủ thụt chốt vào
  chotCua.write(94);   // BẮT BUỘC DỪNG LẠI (Khóa trạng thái mở)

  Serial.println("Cua dang mo. Giu trong 5 giay...");
  delay(5000);         // Đứng im cho người ta đi qua trong 5 giây

  // --- KỊCH BẢN 2: ĐÓNG CỬA ---
  Serial.println("--> DONG CUA (Day chot ra)");
  chotCua.write(0);    // Cho quay chiều ngược lại
  delay(150);         // Quay 130 mili-giây để đẩy chốt ra
  chotCua.write(94);   // BẮT BUỘC DỪNG LẠI (Khóa trạng thái đóng)

  Serial.println("Cua da dong. Doi 3 giay de thu lai...");
  delay(3000);         
}