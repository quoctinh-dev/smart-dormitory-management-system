# ESP32-CAM AI Thinker

## 1. Giới thiệu

ESP32-CAM AI Thinker là bo mạch phát triển tích hợp vi điều khiển **ESP32**, kết nối **Wi-Fi**, **Bluetooth** và camera **OV2640** trên cùng một module.

Trong dự án **Smart Dormitory Management System (SDMS)**, ESP32-CAM được sử dụng làm **bộ điều khiển cục bộ (Edge Controller)** tại khu vực cổng Ký túc xá. Thiết bị chịu trách nhiệm thu thập hình ảnh, điều khiển các thiết bị ngoại vi và hỗ trợ mở rộng giao tiếp mạng trong các giai đoạn phát triển tiếp theo.

---

# 2. Vai trò trong SDMS

Trong phiên bản Prototype, ESP32-CAM đảm nhiệm các chức năng:

- Điều khiển Camera OV2640.
- Cung cấp Camera Live Stream phục vụ kiểm thử.
- Điều khiển Servo Motor đóng/mở cổng.
- Đọc dữ liệu từ đầu đọc RFID RC522 (sau khi hoàn thành kiểm thử phần cứng).
- Điều khiển Buzzer cảnh báo.
- Quản lý các GPIO và thiết bị ngoại vi.

Các chức năng như giao tiếp với Backend, xác thực khuôn mặt hoặc xử lý nghiệp vụ sẽ được bổ sung ở các giai đoạn phát triển tiếp theo.

---

# 3. Kiến trúc phần cứng

```text
                +-------------------------+
                |      ESP32-CAM          |
                +-----------+-------------+
                    |     |      |
                    |     |      |
                 Camera  RC522  Servo
                    |
                 Buzzer
```

ESP32-CAM đóng vai trò là **Edge Controller** của cụm cổng Ký túc xá.

---

# 4. Thông số phần cứng

| Thuộc tính | Giá trị |
|------------|----------|
| Board | ESP32-CAM AI Thinker |
| MCU | ESP32-D0WD-V3 |
| CPU | Dual-Core Xtensa LX6 |
| CPU Frequency | Up to 240 MHz |
| XTAL Frequency | 40 MHz |
| Flash Memory | 4 MB |
| PSRAM | 4 MB |
| SRAM | 520 KB |
| Camera | OV2640 |
| Wi-Fi | IEEE 802.11 b/g/n |
| Bluetooth | Classic BT + BLE |
| Operating Voltage | 5V / 3.3V |

---

# 5. Môi trường phát triển

| Thành phần | Giá trị |
|------------|----------|
| Framework | Arduino |
| IDE | Arduino IDE 2.x |
| Ngôn ngữ | C++ |

---

# 6. Pinout

## Hàng chân bên trái (Từ trên xuống)

| Pin | Chức năng |
|------|-----------|
| 5V | Nguồn cấp |
| GND | Ground |
| GPIO12 | GPIO đa năng |
| GPIO13 | GPIO đa năng |
| GPIO15 | GPIO đa năng |
| GPIO14 | GPIO đa năng |
| GPIO2 | GPIO đa năng |
| GPIO4 | Flash LED |

---

## Hàng chân bên phải (Từ trên xuống)

| Pin | Chức năng |
|------|-----------|
| 3V3 | Nguồn 3.3V |
| GPIO16 | GPIO đa năng |
| GPIO0 | Boot Mode |
| GND | Ground |
| VCC | Nguồn |
| U0R | UART RX |
| U0T | UART TX |
| GND | Ground |

---

# 7. GPIO Allocation (Prototype)

| GPIO | Thiết bị | Chức năng |
|-------|----------|-----------|
| GPIO12 | Servo Motor | PWM Output |
| GPIO13 | Buzzer | Digital Output |
| GPIO14 | RC522 SDA (SS) | SPI Chip Select *(Kiểm thử)* |
| GPIO15 | RC522 SCK | SPI Clock *(Kiểm thử)* |
| GPIO2 | RC522 MOSI | SPI MOSI *(Kiểm thử)* |
| GPIO16 | RC522 MISO | SPI MISO |
| GPIO4 | RC522 RST / Flash LED | Kiểm thử |

> Việc sử dụng GPIO14, GPIO15, GPIO2, GPIO4 và GPIO16 cho RC522 đang được xác nhận thông qua tài liệu **ESP32-CAM Hardware Testing**.

---

# 8. GPIO Reserved

Các GPIO sau đang được Camera OV2640 và PSRAM sử dụng nội bộ, không nên sử dụng cho thiết bị ngoại vi.

| GPIO |
|------|
| GPIO5 |
| GPIO18 |
| GPIO19 |
| GPIO21 |
| GPIO22 |
| GPIO23 |
| GPIO25 |
| GPIO26 |
| GPIO27 |
| GPIO32 |
| GPIO34 |
| GPIO35 |
| GPIO36 |
| GPIO39 |

---

# 9. Wiring

## 9.1 FTDI Programming

| FTDI | ESP32-CAM |
|-------|-----------|
| TX | U0R |
| RX | U0T |
| 5V | 5V |
| GND | GND |

### Flash Mode

```
GPIO0 → GND
```

Sau khi Upload:

```
Ngắt GPIO0 khỏi GND

Nhấn RESET
```

---

## 9.2 Servo Motor

| Servo | ESP32-CAM |
|--------|-----------|
| Signal | GPIO12 |
| VCC | Nguồn 5V ngoài (Khuyến nghị) |
| GND | GND |

---

## 9.3 RFID RC522 (Prototype)

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

## 9.4 Buzzer

| Buzzer | ESP32-CAM |
|---------|-----------|
| Signal | GPIO13 |
| VCC | 5V |
| GND | GND |

---

# 10. Power Distribution

## Đường nguồn 5V

Cấp nguồn cho:

- ESP32-CAM
- Servo Motor
- Buzzer

---

## Đường nguồn 3.3V

Cấp nguồn cho:

- RC522 RFID Reader

---

## Ground (GND)

Toàn bộ thiết bị phải sử dụng chung một đường GND.

---

# 11. Tài nguyên phần cứng sử dụng

| Tài nguyên | Trạng thái |
|------------|------------|
| Camera Interface | OV2640 |
| SPI | RC522 *(Prototype)* |
| PWM | Servo |
| GPIO Digital | Buzzer |
| UART0 | Nạp chương trình / Serial Monitor |
| Wi-Fi | Camera Stream (Prototype) |
| Bluetooth | Chưa sử dụng |

---

# 12. Lưu ý kỹ thuật

- GPIO0 phải nối GND khi nạp chương trình.
- GPIO4 đồng thời điều khiển Flash LED tích hợp, cần kiểm thử nếu sử dụng làm RST cho RC522.
- GPIO2 và GPIO15 là các chân Boot Strap, cần kiểm tra khả năng khởi động khi kết nối RC522.
- Servo nên sử dụng nguồn 5V riêng để tránh sụt áp.
- Không cấp điện áp 5V trực tiếp vào GPIO.
- Toàn bộ thiết bị phải nối chung GND.
- Kiểm tra kỹ Expansion Board trước khi cấp nguồn.

---

# 13. Khả năng mở rộng

ESP32-CAM có thể mở rộng thêm:

- HTTP Client
- MQTT Client
- REST API Client
- OTA Firmware Update
- Face Recognition (thông qua Backend)
- ESP32 DevKit V1 Communication

---

# 14. Hình ảnh

```text
images/
├── board-front.jpg
├── board-back.jpg
├── expansion-board.jpg
├── pinout.png
├── wiring-ftdi.png
├── wiring-rc522.png
├── wiring-servo.png
├── wiring-buzzer.png
└── wiring-system.png
```

---

# 15. Tài liệu liên quan

```text
devices/
├── rc522/
│   └── README.md
├── servo-sg90/
│   └── README.md

testing/
└── ESP32-CAM-Hardware-Testing.md
```