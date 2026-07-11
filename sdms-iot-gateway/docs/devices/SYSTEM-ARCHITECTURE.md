# SDMS IoT System Architecture

## 1. Giới thiệu

Tài liệu này mô tả kiến trúc tổng thể của phân hệ **IoT** trong dự án **Smart Dormitory Management System (SDMS)**.

Mục tiêu là cung cấp cái nhìn tổng quan về cấu trúc phần cứng, vai trò của từng thiết bị, phương thức giao tiếp và luồng dữ liệu giữa các thành phần trong hệ thống.

Tài liệu này đóng vai trò là tài liệu kiến trúc (Architecture Document) và là cơ sở cho việc phát triển Firmware, Backend và triển khai thực tế.

---

# 2. Mục tiêu hệ thống

Hệ thống IoT của SDMS được xây dựng nhằm:

- Kiểm soát việc ra vào Ký túc xá.
- Kiểm soát việc ra vào từng phòng.
- Hỗ trợ xác thực bằng nhiều phương thức.
- Điều khiển khóa cửa tự động.
- Đồng bộ dữ liệu với hệ thống quản lý tập trung.
- Hỗ trợ mở rộng các thiết bị IoT trong tương lai.

---

# 3. Kiến trúc tổng thể

```text
                         +--------------------------------+
                         |      Spring Boot Backend       |
                         +---------------+----------------+
                                         |
                                  HTTP REST API
                                         |
                          Wi-Fi (IEEE 802.11 b/g/n)
                                         |
                +------------------------+------------------------+
                |                                                 |
        +-------+--------+                               +--------+-------+
        |  ESP32-CAM     |                               | ESP32 DevKit V1|
        +-------+--------+                               +--------+-------+
                |                                                  |
      ---------------------                          ----------------------------
      |         |         |                          |        |         |
    Camera    RC522     Servo                      LCD     Keypad    Servo
    OV2640              Motor                     1602      4x4      Motor
                |
             Buzzer
```

---

# 4. Thành phần hệ thống

## 4.1 Spring Boot Backend

Backend là trung tâm xử lý của toàn bộ hệ thống.

Chức năng:

- Quản lý sinh viên.
- Quản lý tài khoản.
- Quản lý quyền truy cập.
- Lưu lịch sử ra vào.
- Tiếp nhận dữ liệu từ ESP32.
- Xử lý nghiệp vụ.
- Điều phối các thiết bị IoT.

---

## 4.2 ESP32-CAM

ESP32-CAM được triển khai tại cổng Ký túc xá.

Chức năng:

- Điều khiển Camera OV2640.
- Camera Live Stream.
- Chụp ảnh.
- Đọc RFID RC522.
- Điều khiển Servo mở cổng.
- Điều khiển Buzzer.
- Giao tiếp với Backend.

---

## 4.3 ESP32 DevKit V1

ESP32 DevKit V1 được triển khai tại cửa phòng.

Chức năng:

- Điều khiển LCD1602.
- Đọc Keypad Matrix.
- Điều khiển Servo khóa cửa.
- Hỗ trợ mở rộng RFID hoặc cảm biến khác.
- Giao tiếp với Backend.

---

# 5. Kiến trúc phần cứng

## Cụm cổng KTX

```text
ESP32-CAM
    │
    ├── Camera OV2640
    ├── RC522 RFID
    ├── Servo Motor
    └── Buzzer
```

---

## Cụm cửa phòng

```text
ESP32 DevKit V1
    │
    ├── LCD1602 I2C
    ├── Keypad 4x4
    └── Servo Motor
```

---

# 6. Giao thức truyền thông

| Giao thức | Thiết bị |
|------------|----------|
| SPI | ESP32 ↔ RC522 |
| I2C | ESP32 ↔ LCD1602 |
| PWM | ESP32 ↔ Servo |
| UART | ESP32 ↔ FTDI |
| Wi-Fi | ESP32 ↔ Backend |
| HTTP REST API | ESP32 ↔ Spring Boot |

---

# 7. Luồng dữ liệu

## 7.1 Cổng Ký túc xá

```text
Sinh viên

↓

Quẹt thẻ RFID

↓

ESP32-CAM đọc UID

↓

Camera chụp ảnh

↓

Gửi dữ liệu đến Backend

↓

Backend xác thực

↓

ESP32-CAM nhận kết quả

↓

Servo mở cổng

↓

Ghi nhận lịch sử truy cập
```

---

## 7.2 Cửa phòng

```text
Sinh viên

↓

Nhập mã PIN

↓

ESP32 DevKit V1

↓

Kiểm tra dữ liệu

↓

Servo mở cửa

↓

LCD hiển thị trạng thái
```

Trong giai đoạn Prototype, việc kiểm tra dữ liệu có thể thực hiện trực tiếp trên firmware. Khi tích hợp hoàn chỉnh, ESP32 DevKit V1 sẽ gửi yêu cầu đến Backend để xác thực.

---

# 8. Phân bố chức năng

| Thành phần | Chức năng |
|------------|-----------|
| Backend | Xử lý nghiệp vụ |
| ESP32-CAM | Camera, RFID, Servo |
| ESP32 DevKit V1 | LCD, Keypad, Servo |
| Camera | Thu thập hình ảnh |
| RC522 | Đọc UID thẻ RFID |
| LCD1602 | Hiển thị thông báo |
| Keypad | Nhập mã PIN |
| Servo | Điều khiển khóa cửa |
| Buzzer | Cảnh báo âm thanh |

---

# 9. Giai đoạn triển khai

## Giai đoạn 1

Hoàn thiện phần cứng.

- ESP32-CAM
- ESP32 DevKit V1
- RC522
- LCD
- Keypad
- Servo

---

## Giai đoạn 2

Hoàn thiện Firmware.

- Camera
- RFID
- LCD
- Keypad
- Servo

---

## Giai đoạn 3

Kiểm thử phần cứng.

- ESP32-CAM Hardware Testing
- ESP32 DevKit Hardware Testing

---

## Giai đoạn 4

Tích hợp Backend.

- HTTP Client
- REST API
- Đồng bộ dữ liệu

---

## Giai đoạn 5

Kiểm thử toàn hệ thống.

- End-to-End Testing
- Performance Testing
- Stability Testing

---

# 10. Khả năng mở rộng

Hệ thống được thiết kế theo hướng module hóa và có thể mở rộng thêm:

- Face Recognition.
- MQTT Broker.
- Cảm biến PIR.
- Cảm biến cửa.
- Cảm biến khói.
- Cảm biến nhiệt độ, độ ẩm.
- OTA Firmware Update.
- Mobile Application.
- Dashboard quản trị.

---

# 11. Cấu trúc tài liệu

```text
iot/
│
├── devices/
│   ├── esp32-cam/
│   ├── esp32-devkit-v1/
│   ├── rc522/
│   ├── servo-sg90/
│   ├── keypad-4x4/
│   └── lcd1602/
│
├── testing/
│   ├── ESP32-CAM-Hardware-Testing.md
│   └── ESP32-DevKit-V1-Hardware-Testing.md
│
├── SYSTEM-ARCHITECTURE.md
└── IMPLEMENTATION-PLAN.md
```

---

# 12. Kết luận

Kiến trúc IoT của SDMS được chia thành hai cụm điều khiển độc lập:

- **ESP32-CAM** phụ trách khu vực cổng Ký túc xá với các chức năng thu thập hình ảnh, đọc RFID và điều khiển cổng.
- **ESP32 DevKit V1** phụ trách khu vực cửa phòng với giao diện người dùng (LCD, Keypad) và điều khiển khóa cửa.

Hai cụm thiết bị giao tiếp với hệ thống Backend thông qua mạng Wi-Fi và HTTP REST API, giúp tách biệt giữa lớp điều khiển phần cứng và lớp xử lý nghiệp vụ. Kiến trúc này thuận lợi cho việc mở rộng, bảo trì và triển khai thêm các thiết bị IoT trong tương lai.