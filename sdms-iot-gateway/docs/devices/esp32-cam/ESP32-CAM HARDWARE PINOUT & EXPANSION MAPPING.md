# ESP32-CAM HARDWARE PINOUT & EXPANSION MAPPING

## 1. Giới thiệu

Tài liệu này mô tả sơ đồ chân (Pinout) của bo mạch **ESP32-CAM AI Thinker** đang được sử dụng trong dự án **Smart Dormitory Management System (SDMS)**.

Ngoài sơ đồ chân gốc của nhà sản xuất, nhóm còn thiết kế **Expansion Board** nhằm đưa toàn bộ chân của ESP32-CAM ra ngoài thông qua hai hàng Header Female, giúp thuận tiện cho việc đấu nối và mở rộng phần cứng.

---

# 2. Mục đích của Expansion Board

Do ESP32-CAM không được trang bị đầy đủ Header Pin như các dòng ESP32 DevKit, nhóm đã hàn mở rộng toàn bộ chân GPIO và chân nguồn lên bo Prototype.

Expansion Board giúp:

- Dễ dàng đấu nối linh kiện bằng dây Dupont.
- Không phải hàn trực tiếp lên ESP32-CAM mỗi lần thử nghiệm.
- Thuận tiện đo tín hiệu bằng đồng hồ.
- Dễ thay thế ESP32-CAM khi cần bảo trì.
- Hạn chế hỏng chân module trong quá trình phát triển.

---

# 3. Pinout gốc của ESP32-CAM

## Hàng chân bên trái (Từ trên xuống)

| Tên chân | Chức năng |
|----------|-----------|
| 5V | Nguồn cấp 5V |
| GND | Ground |
| GPIO12 | GPIO đa năng |
| GPIO13 | GPIO đa năng |
| GPIO15 | GPIO đa năng |
| GPIO14 | GPIO đa năng |
| GPIO2 | GPIO đa năng |
| GPIO4 | Flash LED tích hợp |

---

## Hàng chân bên phải (Từ trên xuống)

| Tên chân | Chức năng |
|----------|-----------|
| 3V3 | Nguồn 3.3V |
| GPIO16 | **PSRAM CS — CẤM DÙNG** |
| GPIO0 | Boot Mode |
| GND | Ground |
| VCC | Chân nguồn |
| U0R | UART RX |
| U0T | UART TX |
| GND | Ground |

---

# 4. Expansion Board Mapping

Sau khi hàn mở rộng, toàn bộ chân được đưa ra ngoài thành hai hàng Header Female.

## Header bên trái

| Header | ESP32-CAM |
|---------|-----------|
| L1 | 5V |
| L2 | GND |
| L3 | GPIO12 |
| L4 | GPIO13 |
| L5 | GPIO15 |
| L6 | GPIO14 |
| L7 | GPIO2 |
| L8 | GPIO4 |

---

## Header bên phải

| Header | ESP32-CAM |
|---------|-----------|
| R1 | 3V3 |
| R2 | GPIO16 |
| R3 | GPIO0 |
| R4 | GND |
| R5 | VCC |
| R6 | U0R |
| R7 | U0T |
| R8 | GND |

---

# 5. Quy hoạch GPIO trong SDMS

> ⚠️ **CẢNH BÁO — CẬP NHẬT SAU HARDWARE VALIDATION 2026-07-11:**  
> Bảng cũ (draft) có lỗi nghiêm trọng: ghi `GPIO16 → RC522 MISO`. Đây là LỖI CHẾT NGƯỜI.  
> GPIO16 được hàn cứng vào PSRAM Chip Select. Sử dụng nó gây `assert failed: block_locate_free` và vòng lặp reset vô tận.  
> Bảng dưới đây là mapping CHÍNH THỨC đã được xác nhận phần cứng.

| GPIO | Thiết bị | Trạng thái | Ghi chú |
|-------|----------|------------|---------|
| GPIO2  | RC522 MOSI | ✅ Đang dùng | Strapping: LOW lúc boot = an toàn |
| GPIO4  | Flash LED (tích hợp) | ⚠️ Để trống | Không dùng cho ngoại vi — LED sẽ sáng khi HIGH |
| GPIO12 | Servo (Signal) | ✅ Đang dùng | Strapping: an toàn khi servo idle = LOW |
| GPIO13 | RC522 MISO | ✅ Đang dùng | — |
| GPIO14 | RC522 SDA/SS | ✅ Đang dùng | — |
| GPIO15 | RC522 SCK | ✅ Đang dùng | — |
| **GPIO16** | **PSRAM CS (hardware)** | 🔴 **CẤM TUYỆT ĐỐI** | Hard-wired trên PCB, không thể dùng |

> **RC522 RST:** Nối thẳng vào chân 3V3 (không qua GPIO). MFRC522 có Power-On Reset nội bộ.  
> **Firmware:** `RFID_RST_PIN = -1` (thư viện MFRC522 hỗ trợ giá trị -1).

---

# 6. Chức năng các chân đặc biệt

| Chân | Chức năng | Lưu ý |
|------|-----------|--------|
| GPIO0 | Boot Mode | Nối GND khi nạp firmware |
| GPIO4 | Flash LED | Không nên dùng nếu cần Flash |
| U0R | UART RX | Kết nối FTDI TX |
| U0T | UART TX | Kết nối FTDI RX |
| 5V | Nguồn chính | Cấp nguồn cho ESP32-CAM |
| 3V3 | Nguồn 3.3V | Cấp nguồn cho module 3.3V |
| GND | Ground | Phải nối chung toàn hệ thống |

---

# 7. FTDI Programming

| FTDI | ESP32-CAM |
|-------|-----------|
| TX | U0R |
| RX | U0T |
| 5V | 5V |
| GND | GND |

Để nạp firmware:

```
GPIO0 → GND
```

Sau khi nạp:

```
Ngắt GPIO0 khỏi GND

Nhấn nút RESET
```

---

# 8. Quy tắc đấu nối

Trong toàn bộ hệ thống SDMS, việc đấu nối phải tuân thủ các nguyên tắc sau:

- Toàn bộ thiết bị phải sử dụng chung một đường GND.
- Module RFID RC522 sử dụng nguồn 3.3V.
- Servo sử dụng nguồn 5V riêng để tránh sụt áp.
- Không cấp điện áp 5V trực tiếp vào GPIO.
- Kiểm tra thông mạch sau khi hàn Expansion Board.
- Kiểm tra không có hiện tượng chạm giữa các Header trước khi cấp nguồn.

---

# 9. Khả năng mở rộng

Expansion Board cho phép kết nối nhanh các thiết bị ngoại vi như:

- RC522 RFID Reader
- Servo Motor
- Relay Module
- Buzzer
- Cảm biến mở rộng

Trong phiên bản Prototype của SDMS, các thiết bị được ưu tiên sử dụng gồm:

- Camera OV2640
- RC522
- Servo Door
- Buzzer

Nút nhấn vật lý được thay thế bằng nút điều khiển trên giao diện Web nhằm tiết kiệm GPIO và thuận tiện cho quá trình kiểm thử.

---

# 10. Hình ảnh minh họa

```text
images/
├── esp32-cam-front.jpg
├── esp32-cam-back.jpg
├── expansion-board.jpg
├── expansion-pinout.png
├── pinout.png
└── wiring-example.png
```