# ESP32-CAM Hardware Testing

## 1. Giới thiệu

Tài liệu này mô tả quy trình kiểm thử phần cứng của cụm **ESP32-CAM** trong hệ thống **Smart Dormitory Management System (SDMS)**.

Mục tiêu của tài liệu là xác nhận toàn bộ phần cứng hoạt động ổn định trước khi phát triển Firmware hoàn chỉnh và tích hợp với hệ thống Backend.

Trong giai đoạn này, **chỉ kiểm thử phần cứng và chương trình độc lập**, không kiểm thử giao tiếp với Spring Boot, AI hoặc cơ sở dữ liệu.

---

# 2. Mục tiêu

Xác nhận các thành phần sau hoạt động chính xác:

- ESP32-CAM AI Thinker
- Expansion Board (16 chân mở rộng)
- Camera OV2640
- RC522 RFID Reader
- Servo Motor
- Web Camera Stream

---

# 3. Thành phần phần cứng

| Thiết bị | Model |
|----------|-------|
| ESP32-CAM | AI Thinker |
| Camera | OV2640 |
| RFID | RC522 |
| Servo | SG90 / MG90S |
| Expansion Board | Prototype PCB |
| FTDI | CP2102 |
| Adapter nguồn | 5V |

---

# 4. Sơ đồ GPIO

## Expansion Board

| Header | GPIO | Thiết bị |
|---------|------|----------|
| L1 | 5V | Nguồn |
| L2 | GND | Ground |
| L3 | GPIO12 | Servo |
| L4 | GPIO13 | Buzzer *(Dự phòng)* |
| L5 | GPIO15 | RC522 SCK *(Kiểm thử)* |
| L6 | GPIO14 | RC522 SDA *(Kiểm thử)* |
| L7 | GPIO2 | RC522 MOSI *(Kiểm thử)* |
| L8 | GPIO4 | RC522 RST *(Kiểm thử)* |
| R1 | 3V3 | RC522 VCC |
| R2 | GPIO16 | RC522 MISO |
| R3 | GPIO0 | Boot |
| R4 | GND | Ground |
| R5 | VCC | Nguồn |
| R6 | U0R | FTDI RX |
| R7 | U0T | FTDI TX |
| R8 | GND | Ground |

> Cấu hình GPIO trên là cấu hình dành cho phiên bản Prototype và sẽ được xác nhận thông qua quá trình kiểm thử.

---

# 5. Quy tắc đấu nối

## Servo

| Servo | ESP32-CAM |
|--------|-----------|
| Signal | GPIO12 |
| VCC | 5V |
| GND | GND |

---

## RC522

| RC522 | ESP32-CAM |
|--------|-----------|
| VCC | 3V3 |
| GND | GND |
| SDA | GPIO14 |
| SCK | GPIO15 |
| MOSI | GPIO2 |
| MISO | GPIO16 |
| RST | GPIO4 |

---

## FTDI

| FTDI | ESP32-CAM |
|------|-----------|
| TX | U0R |
| RX | U0T |
| 5V | 5V |
| GND | GND |

---

# 6. Điều kiện kiểm thử

Trước khi kiểm thử cần đảm bảo:

- ESP32-CAM đã nạp chương trình thành công.
- GPIO0 đã ngắt khỏi GND sau khi Upload.
- Servo sử dụng nguồn 5V riêng.
- RC522 sử dụng nguồn 3.3V.
- Toàn bộ thiết bị sử dụng chung GND.
- Expansion Board không bị chạm mạch.

---

# 7. Quy trình kiểm thử

## Test 1 - ESP32-CAM

Mục tiêu

- Kiểm tra Boot.
- Kiểm tra Serial Monitor.

Kết quả mong đợi

- Khởi động bình thường.
- Không Reset.

---

## Test 2 - Camera

Mục tiêu

- Khởi tạo Camera.

Kiểm tra

- Camera Init.
- Camera Capture.
- Camera Stream.

Kết quả mong đợi

- Camera hoạt động ổn định.

---

## Test 3 - RC522

Mục tiêu

Đọc UID của thẻ RFID.

Kiểm tra

- Khởi tạo RC522.
- Quét nhiều loại thẻ.
- Đọc đúng UID.

Ví dụ:

```
UID:

A4 23 7C 15
```

---

## Test 4 - Servo

Mục tiêu

Điều khiển Servo.

Kiểm tra

- Góc 0°
- Góc 45°
- Góc 90°
- Góc 135°
- Góc 180°

Kết quả mong đợi

Servo quay đúng góc.

---

## Test 5 - Camera + RC522

Kiểm tra

- Camera Stream liên tục.
- RC522 vẫn đọc được UID.

Không được xuất hiện:

- Camera treo.
- ESP32 Reset.
- Mất SPI.

---

## Test 6 - Camera + Servo

Kiểm tra

- Camera Stream.
- Servo quay.

Kết quả mong đợi

- Camera không giật.
- Servo hoạt động bình thường.

---

## Test 7 - RC522 + Servo

Kiểm tra

- Quét thẻ.
- Servo quay sau khi đọc UID.

Trong giai đoạn kiểm thử, UID được xử lý bằng chương trình mẫu (Hardcoded), chưa kết nối Backend.

---

## Test 8 - Toàn bộ cụm

Kiểm tra đồng thời:

- Camera
- RC522
- Servo

Thực hiện:

- Quét 20 lần.
- Servo đóng/mở 20 lần.
- Camera Stream liên tục.

Theo dõi:

- Không Reset.
- Không treo.
- Không mất kết nối.

---

# 8. Checklist kiểm thử

| Hạng mục | PASS | FAIL | Ghi chú |
|----------|------|------|----------|
| ESP32 Boot | ☐ | ☐ | |
| Camera Init | ☐ | ☐ | |
| Camera Stream | ☐ | ☐ | |
| RC522 Init | ☐ | ☐ | |
| Đọc UID | ☐ | ☐ | |
| Servo PWM | ☐ | ☐ | |
| Servo Rotation | ☐ | ☐ | |
| Camera + RC522 | ☐ | ☐ | |
| Camera + Servo | ☐ | ☐ | |
| RC522 + Servo | ☐ | ☐ | |
| Full Hardware Test | ☐ | ☐ | |

---

# 9. Các lỗi thường gặp

| Hiện tượng | Nguyên nhân | Hướng xử lý |
|------------|-------------|-------------|
| ESP32 không Boot | GPIO0 chưa ngắt GND | Tháo GPIO0 khỏi GND và nhấn Reset |
| Camera không khởi tạo | Thiếu nguồn hoặc lỗi PSRAM | Kiểm tra nguồn cấp và camera |
| RC522 không nhận thẻ | Sai chân SPI hoặc nguồn 3.3V | Kiểm tra lại sơ đồ đấu nối |
| Servo rung hoặc Reset ESP32 | Nguồn Servo không đủ | Dùng nguồn ngoài 5V và nối chung GND |
| Camera bị giật khi Servo quay | Sụt áp nguồn | Tách nguồn Servo khỏi ESP32 |

---

# 10. Kết luận

Cụm ESP32-CAM được xem là đạt yêu cầu khi:

- ESP32-CAM khởi động ổn định.
- Camera hoạt động bình thường.
- RC522 đọc chính xác UID.
- Servo điều khiển đúng góc.
- Các thiết bị hoạt động đồng thời mà không gây Reset hoặc treo hệ thống.

Sau khi hoàn thành toàn bộ các bài kiểm thử trên, cụm ESP32-CAM sẽ sẵn sàng chuyển sang giai đoạn phát triển Firmware nghiệp vụ và tích hợp với các thành phần khác của hệ thống SDMS.

---

# 11. Phiên bản tài liệu

| Thuộc tính | Giá trị |
|------------|----------|
| Document | ESP32-CAM Hardware Testing |
| Version | 1.0 |
| Status | Draft |
| Project | Smart Dormitory Management System |
| Hardware | ESP32-CAM AI Thinker |