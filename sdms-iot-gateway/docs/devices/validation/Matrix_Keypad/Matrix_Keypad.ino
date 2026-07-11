/*
 * BÀI TEST 3: BÀN PHÍM MA TRẬN (KEYPAD 4x4)
 * Cập nhật: Trở về dùng chân D4 cho Cột 4 theo ý bạn & Thêm delay lúc khởi động
 * Thư viện: "Keypad" (Tác giả: Mark Stanley, Alexander Brevig)
 *
 * HƯỚNG DẪN NỐI DÂY (Lần lượt từ trái sang phải của cụm 8 chân Keypad):
 * - Dây 1 (Hàng 1) -> Cắm chân D13
 * - Dây 2 (Hàng 2) -> Cắm chân D14 
 * - Dây 3 (Hàng 3) -> Cắm chân D27
 * - Dây 4 (Hàng 4) -> Cắm chân D26
 * - Dây 5 (Cột 1)  -> Cắm chân D25
 * - Dây 6 (Cột 2)  -> Cắm chân D33
 * - Dây 7 (Cột 3)  -> Cắm chân D32
 * --- 
 * - Dây 8 (Cột 4)  -> Cắm chân D4 (Nằm ở hàng đối diện)
 */

#include <Keypad.h>

// --- CẤU HÌNH LOẠI BÀN PHÍM ---
const byte ROWS = 4; // Số hàng
const byte COLS = 4; // Số cột (4x4)

// Khai báo sơ đồ vị trí các nút bấm
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};

// Khai báo các chân ESP32 đã nối với bàn phím
byte rowPins[ROWS] = {13, 14, 27, 26}; // 4 chân nối với Hàng
byte colPins[COLS] = {25, 33, 32, 4};  // Cột 4 đã được đổi về chân D4

// Khởi tạo tính năng đọc bàn phím
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

void setup() {
  Serial.begin(115200);
  
  // Thêm độ trễ 1 giây để máy tính kịp kết nối Serial Monitor
  delay(1000); 
  
  Serial.println("--- KHOI DONG BAN PHIM MA TRAN 4x4 ---");
  Serial.println("Hay bam thu cac phim va nhin vao SERIAL MONITOR tren may tinh nhe!");
}

void loop() {
  // Liên tục quét xem có phím nào đang bị ấn xuống không
  char key = keypad.getKey();

  // Nếu phát hiện có người bấm phím (biến key có dữ liệu)
  if (key) {
    Serial.print("Ban vua bam phim: ");
    Serial.println(key); // In phím đó ra màn hình máy tính
  }
}