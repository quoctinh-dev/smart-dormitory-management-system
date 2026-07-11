/*
 * BÀI TEST 4: ĐẦU ĐỌC THẺ TỪ RFID-RC522 (KIỂM SOÁT CỬA)
 * * * THƯ VIỆN CẦN CÀI ĐẶT:
 * Vào Arduino Library Manager, tìm và cài đặt: "MFRC522" (Tác giả: GithubCommunity)
 *
 * * HƯỚNG DẪN NỐI DÂY VỚI ESP32 (30 CHÂN):
 * - SDA (SS) : D5
 * - SCK      : D18
 * - MOSI     : D23
 * - MISO     : D19
 * - RST      : D22
 * - 3.3V     : 3V3
 * - GND      : GND
 *
 * * CẤU HÌNH THẺ:
 * - Thẻ hợp lệ (Mở cửa): 032F33FA
 * - Mọi thẻ khác: Báo lỗi "The khong hop le"
 */

#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN  5
#define RST_PIN 22

MFRC522 mfrc522(SS_PIN, RST_PIN);

// Danh sách thẻ hợp lệ
String theHopLe = "032F33FA";

void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();
  
  delay(1000);
  Serial.println("--- HE THONG KIEM SOAT CUA RFID ---");
  Serial.println("He thong da san sang. Vui long dua the vao...");
}

void loop() {
  // Tìm thẻ mới
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  // Đọc UID và chuyển thành chuỗi HEX
  String content = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    content.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : ""));
    content.concat(String(mfrc522.uid.uidByte[i], HEX));
  }
  content.toUpperCase();

  Serial.print("UID vua quet: ");
  Serial.println(content);

  // Logic kiểm tra thẻ
  if (content == theHopLe) {
    Serial.println(">> CHAO MUNG! Mo cua thanh cong.");
    // Sau này nối Servo vào đây để điều khiển
  } else {
    Serial.println(">> CANH BAO! The khong hop le (Access Denied).");
    // Có thể thêm còi báo động vào đây nếu muốn
  }
  
  delay(1000); 
  mfrc522.PICC_HaltA();
}