# SDMS IoT Implementation Plan

## 1. Giới thiệu

Tài liệu này mô tả kế hoạch triển khai hoàn chỉnh hệ thống IoT của dự án **Smart Dormitory Management System (SDMS)**, từ giai đoạn kiểm thử phần cứng đến khi tích hợp với Backend và vận hành toàn hệ thống.

Mục tiêu là đảm bảo các thành phần phần cứng, firmware và phần mềm được triển khai theo đúng trình tự, giảm thiểu rủi ro trong quá trình phát triển.

---

# 2. Kiến trúc tổng thể

```text
                    +----------------------+
                    | Spring Boot Backend  |
                    +----------+-----------+
                               |
                     HTTP REST API / Wi-Fi
                               |
               +---------------+---------------+
               |                               |
      +--------+--------+             +--------+--------+
      |   ESP32-CAM     |             | ESP32 DevKit V1 |
      +--------+--------+             +--------+--------+
               |                               |
      Camera / RFID / Servo            LCD / Keypad / Servo
```

---

# 3. Giai đoạn 1 - Chuẩn bị phần cứng

## Mục tiêu

Hoàn thiện toàn bộ hệ thống phần cứng trước khi lập trình nghiệp vụ.

### ESP32-CAM

- Lắp Expansion Board.
- Kiểm tra nguồn.
- Nạp Firmware.
- Kiểm tra Camera.
- Kiểm tra RC522.
- Kiểm tra Servo.
- Kiểm tra Buzzer.

### ESP32 DevKit V1

- Kiểm tra nguồn.
- Kiểm tra LCD1602.
- Kiểm tra Keypad 4x4.
- Kiểm tra Servo.

---

# 4. Giai đoạn 2 - Phát triển Firmware

## ESP32-CAM

Triển khai các chức năng:

- Camera Stream.
- Chụp ảnh.
- Đọc UID từ RC522.
- Điều khiển Servo.
- Điều khiển Buzzer.

## ESP32 DevKit V1

Triển khai các chức năng:

- Đọc Keypad.
- Hiển thị LCD.
- Điều khiển Servo.
- Đọc RFID (nếu sử dụng).

---

# 5. Giai đoạn 3 - Kiểm thử Firmware

## ESP32-CAM

Kiểm tra:

- Camera hoạt động ổn định.
- RC522 đọc đúng UID.
- Servo đóng/mở chính xác.
- Buzzer hoạt động.
- Các thiết bị hoạt động đồng thời.

## ESP32 DevKit V1

Kiểm tra:

- LCD hiển thị.
- Keypad nhận đúng phím.
- Servo hoạt động.
- Các thiết bị hoạt động đồng thời.

---

# 6. Giai đoạn 4 - Kết nối Backend

Sau khi phần cứng và Firmware hoạt động ổn định, tiến hành tích hợp với Backend.

## ESP32-CAM

- Kết nối Wi-Fi.
- Gửi UID RFID.
- Gửi ảnh Camera.
- Nhận phản hồi từ Backend.
- Điều khiển Servo theo kết quả xác thực.

## ESP32 DevKit V1

- Kết nối Wi-Fi.
- Gửi mã PIN hoặc UID (nếu có).
- Nhận lệnh điều khiển.
- Đồng bộ trạng thái cửa.

---

# 7. Giai đoạn 5 - Tích hợp hệ thống

Kiểm thử toàn bộ luồng hoạt động.

```text
Sinh viên

↓

Quẹt thẻ RFID

↓

ESP32-CAM đọc UID

↓

ESP32-CAM chụp ảnh

↓

Gửi UID + Ảnh

↓

Spring Boot Backend

↓

Xác thực

↓

Trả kết quả

↓

ESP32-CAM mở Servo

↓

Ghi nhận lịch sử truy cập
```

Đối với cửa phòng:

```text
Sinh viên

↓

Nhập mã PIN trên Keypad

↓

ESP32 DevKit V1

↓

Kiểm tra hợp lệ

↓

Servo mở cửa

↓

LCD hiển thị trạng thái
```

---

# 8. Kiểm thử cuối cùng

Hoàn thành các bài kiểm thử:

- Hardware Testing.
- Firmware Testing.
- Backend Integration Testing.
- End-to-End Testing.

Đảm bảo:

- Không Reset.
- Không mất kết nối.
- Thiết bị hoạt động ổn định trong thời gian dài.

---

# 9. Tiêu chí hoàn thành

Hệ thống được xem là hoàn thành khi:

- ESP32-CAM hoạt động ổn định.
- ESP32 DevKit V1 hoạt động ổn định.
- Camera, RFID, LCD, Keypad và Servo hoạt động đúng chức năng.
- Backend giao tiếp thành công với các thiết bị.
- Luồng kiểm soát ra vào hoàn chỉnh.
- Dữ liệu được đồng bộ và lưu trữ chính xác.

---

# 10. Tài liệu liên quan

```text
devices/
├── esp32-cam/
├── esp32-devkit-v1/
├── rc522/
├── lcd1602/
├── keypad-4x4/
└── servo-sg90/

testing/
├── ESP32-CAM-Hardware-Testing.md
└── ESP32-DevKit-V1-Hardware-Testing.md
```

---

# 11. Lộ trình triển khai

| Giai đoạn | Trạng thái |
|-----------|------------|
| Thiết kế phần cứng | ✅ |
| Hoàn thiện tài liệu thiết bị | ✅ |
| Kiểm thử phần cứng | ☐ |
| Phát triển Firmware | ☐ |
| Kiểm thử Firmware | ☐ |
| Kết nối Backend | ☐ |
| Kiểm thử tích hợp | ☐ |
| Demo hệ thống | ☐ |
| Hoàn thiện đồ án | ☐ |