# Hướng Dẫn Nối Mạch Smart Door (Room Door) - Step by Step

**Cập nhật:** 2026-07-15
**Thiết bị:** ESP32 DevKit V1 (30-pin), LCD 1602 (kèm module I2C), Servo SG90, Matrix Keypad 4x4.
**Phần mềm (Arduino IDE):** Chọn board **DOIT ESP32 DEVKIT V1**.

---

## ⚠️ TRẢ LỜI CÂU HỎI QUAN TRỌNG TỪ BẠN

### 1. Board trong Arduino IDE chọn loại nào?
Trong Arduino IDE (sau khi đã cài đặt gói thư viện ESP32 từ Espressif), bạn chọn Board có tên là:
👉 **"DOIT ESP32 DEVKIT V1"**

### 2. Servo và LCD cắm chung nguồn 5V được không?
**Câu trả lời là: VỪA ĐƯỢC VỪA KHÔNG, TÙY VÀO NGUỒN CẤP.**
- **KHÔNG ĐƯỢC (Nếu dùng chân VIN/5V của ESP32):** Khi bạn cắm cáp USB vào ESP32, cổng USB máy tính chỉ cấp khoảng 500mA. Con Servo khi khởi động (đề ba) hoặc bị ghì sẽ rút dòng rất lớn (có thể lên tới 1A). Nếu cắm chung cả LCD và Servo vào chân VIN (hoặc 5V) của ESP32, mạch sẽ bị sụt áp đột ngột (Brownout), làm ESP32 bị khởi động lại liên tục hoặc treo, nặng hơn là cháy diode bảo vệ trên board.
- **ĐƯỢC (Nếu dùng nguồn 5V bên ngoài):** Bạn HOÀN TOÀN CÓ THỂ cắm chung LCD và Servo vào một nguồn 5V bên ngoài (như Adapter 5V-2A, sạc điện thoại, hoặc module hạ áp LM2596 từ bình 12V xuống 5V). 
  - **LƯU Ý CỰC KỲ QUAN TRỌNG:** Khi dùng nguồn ngoài, bạn BẮT BUỘC phải nối chung chân âm (GND) của nguồn ngoài với chân GND của ESP32 để tín hiệu điều khiển có thể nhận diện đúng mức logic 0V.

---

## 🛠 HƯỚNG DẪN NỐI MẠCH STEP-BY-STEP

### BƯỚC 1: Chuẩn bị nguồn điện
Chúng ta sẽ sử dụng nguồn ngoài (5V - 2A) để cấp cho Servo và LCD, còn ESP32 có thể dùng cáp USB hoặc lấy nguồn 5V cấp vào chân VIN.
1. Nối cực Dương (+) của nguồn 5V ra một hàng trên Breadboard.
2. Nối cực Âm (-) của nguồn 5V ra một hàng khác trên Breadboard.
3. Lấy 1 dây nối từ cực Âm (-) của Breadboard vào chân **GND** của ESP32. *(Bắt buộc phải nối chung mass).*

### BƯỚC 2: Nối mạch cho Servo SG90
Động cơ Servo có 3 dây (thường là Nâu, Đỏ, Cam):
1. **Dây Nâu (GND):** Nối vào hàng Âm (-) của Breadboard.
2. **Dây Đỏ (VCC):** Nối vào hàng Dương (+) 5V của Breadboard.
3. **Dây Cam (Signal):** Nối vào chân **GPIO13** (thường in là D13) trên ESP32.

### BƯỚC 3: Nối mạch cho Màn hình LCD 1602 (kèm mạch I2C)
Module I2C sau lưng LCD có 4 chân:
1. **GND:** Nối vào hàng Âm (-) của Breadboard.
2. **VCC:** Nối vào hàng Dương (+) 5V của Breadboard.
3. **SDA:** Nối vào chân **GPIO21** (D21) trên ESP32.
4. **SCL:** Nối vào chân **GPIO22** (D22) trên ESP32.

### BƯỚC 4: Nối mạch cho Bàn phím Ma trận (Matrix Keypad 4x4)
Bàn phím 4x4 có 8 chân màng (film), tính từ trái sang phải khi lật ngửa bàn phím lên. 4 chân đầu là Row (Hàng 1-4), 4 chân sau là Col (Cột 1-4).
1. **Row 1:** Nối vào **GPIO14** (D14)
2. **Row 2:** Nối vào **GPIO27** (D27)
3. **Row 3:** Nối vào **GPIO26** (D26)
4. **Row 4:** Nối vào **GPIO25** (D25)
5. **Col 1:** Nối vào **GPIO33** (D33)
6. **Col 2:** Nối vào **GPIO32** (D32)
7. **Col 3:** Nối vào **GPIO4** (D4)
8. **Col 4:** Nối vào **GPIO16** (RX2 / D16)

*(Lưu ý: Không cắm các chân Cột vào GPIO 34, 35, 36, 39 vì các chân đó chỉ nhận tín hiệu vào (Input-only), không thể xuất tín hiệu để quét phím).*

### BƯỚC 5: Kiểm tra và Cấp nguồn
1. Kiểm tra lại một lần nữa xem có chạm chập giữa chân Dương (+) và Âm (-) không.
2. Kiểm tra dây tín hiệu (SDA, SCL, Signal Servo) xem đã cắm đúng số thứ tự chưa.
3. Cắm cáp USB vào ESP32 để nạp code, bật nguồn ngoài (nếu dùng) và kiểm tra màn hình LCD xem có sáng và hiển thị chữ hay không.
4. Thử bấm phím trên Keypad, xem ESP32 có in ra Serial Monitor hay không.

---
*Tài liệu này là Single Source of Truth cho việc triển khai phần cứng Cửa Phòng IoT.*
