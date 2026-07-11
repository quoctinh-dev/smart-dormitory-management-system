/*
 * BÀI TEST 2: HIỂN THỊ MÀN HÌNH LCD I2C (16x2) - CODE CHUẨN ĐỂ LƯU TRỮ
 * Bo mạch: ESP32 DevKit V1
 * * HƯỚNG DẪN NỐI DÂY (TỪ BO MẠCH I2C MÀU ĐEN SANG ESP32):
 * 1. Dây GND -> Cắm vào chân GND của ESP32 (Chân âm)
 * 2. Dây VCC -> Cắm vào chân VIN (hoặc 5V) của ESP32 (Chân dương)
 * 3. Dây SDA -> Cắm vào chân D21 của ESP32 (Chân dữ liệu)
 * 4. Dây SCL -> Cắm vào chân D22 của ESP32 (Chân xung nhịp)
 * * MẸO: Nếu chữ bị mờ hoặc hiện toàn ô vuông đen, hãy lấy tua vít vặn 
 * con ốc nhỏ màu trắng đằng sau module I2C để chỉnh lại độ tương phản!
 */

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Khởi tạo màn hình LCD với địa chỉ 0x27, 16 cột, 2 hàng
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  Serial.begin(115200);
  Serial.println("Khoi dong LCD...");

  // Kích hoạt màn hình và bật đèn nền
  lcd.init();
  lcd.backlight();
}

void loop() {
  // --- BƯỚC 1: Xóa sạch màn hình ---
  lcd.clear();             
  
  // --- BƯỚC 2: In dòng 1 (Hàng trên) ---
  lcd.setCursor(0, 0);     
  lcd.print("Test LCD I2C...");
  
  // --- BƯỚC 3: In dòng 2 (Hàng dưới) ---
  lcd.setCursor(0, 1);     
  lcd.print("Day:GND-VIN-21-22"); // Ghi chú luôn chân cắm lên màn hình cho dễ nhớ
  
  delay(3000); // Giữ chữ trong 3 giây
  
  // --- BƯỚC 4: Hiển thị trạng thái ---
  lcd.clear();
  delay(500); // Chớp màn hình nửa giây cho mượt
  
  lcd.setCursor(0, 0);
  lcd.print("He thong SDMS"); 
  lcd.setCursor(0, 1);
  lcd.print("San sang!"); 
  
  delay(3000); 
  
  // Xóa màn hình trước khi lặp lại vòng mới
  lcd.clear();
  delay(500);
}