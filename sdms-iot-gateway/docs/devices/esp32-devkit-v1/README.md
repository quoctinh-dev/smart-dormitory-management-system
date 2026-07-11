# ESP32 DevKit V1 (30-Pin) — Cửa Phòng (Room Door)

> **Nguồn tham khảo Pinout:** [iotlabs.vn – Sơ đồ chân ESP32 DevKit V1](https://iotlabs.vn/thu-vien-esp32-devkit-v1-so-do-chan-nguon-cac-giao-tiep-co-ban/)

---

## 1. Giới thiệu

ESP32 DevKit V1 là bo mạch phát triển 30-pin (Type-C) dựa trên vi điều khiển **ESP32-D0WDQ6** của Espressif Systems, tích hợp sẵn **Wi-Fi 2.4GHz** và **Bluetooth 4.2 (BLE + Classic)**.

Trong dự án **SDMS**, ESP32 DevKit V1 được sử dụng làm **thiết bị điều khiển Cửa Phòng** (`ROOM_DOOR`). Sinh viên nhập mã PIN trên bàn phím ma trận, thiết bị gửi lên Backend để xác thực, rồi điều khiển Servo mở cửa và hiển thị kết quả trên LCD.

---

## 2. Thông số phần cứng

| Thuộc tính | Giá trị |
|------------|---------|
| Board | ESP32 DevKit V1 (30-Pin, Type-C) |
| MCU | ESP32-D0WDQ6 |
| CPU | Dual-Core Xtensa LX6 @ 240 MHz |
| Flash | 4 MB |
| SRAM | 520 KB |
| Wi-Fi | IEEE 802.11 b/g/n (2.4 GHz) |
| Bluetooth | Classic BT 4.2 + BLE |
| Điện áp hoạt động | 3.3V (GPIO Logic Level) |
| Nguồn vào | 5V qua USB hoặc chân VIN |
| Số GPIO | 25 GPIO khả dụng (trong 30 pin) |

---

## 3. Sơ đồ chân (Pinout) — 30 Pin

> 📝 **Ghi chú tương thích:** Bo 30-pin (Type-C) và bo 38-pin sử dụng **cùng một sơ đồ GPIO mapping**. Toàn bộ code firmware và sơ đồ kết nối dây (wiring) đều **không cần thay đổi** khi chuyển đổi giữa hai phiên bản này. Bo 30-pin chỉ lược bỏ các chân GPIO6–GPIO11 (SPI Flash nội — vốn không dùng được), còn lại hoàn toàn tương đương.

Bo 30-pin có **15 chân mỗi bên** (30 chân tổng cộng). Các chân GPIO6–GPIO11 (SPI Flash nội) đã bị loại bỏ so với phiên bản 38-pin.

### Hàng chân TRÁI (từ trên xuống)

| Pin | Tên | Chức năng chính |
|-----|-----|----------------|
| 1 | 3V3 | Nguồn ra 3.3V |
| 2 | GND | Ground |
| 3 | GPIO15 | ADC2_CH3, Touch3, HSPI_CS0 |
| 4 | GPIO2 | ADC2_CH2, Touch2 — **Strapping pin** ⚠️ |
| 5 | GPIO4 | ADC2_CH0, Touch0 |
| 6 | GPIO16 | UART2_RX, U2RXD |
| 7 | GPIO17 | UART2_TX, U2TXD |
| 8 | GPIO5 | VSPI_CS0, HSPI_CS2 — **Strapping pin** ⚠️ |
| 9 | GPIO18 | VSPI_CLK, GPIO |
| 10 | GPIO19 | VSPI_MISO, GPIO |
| 11 | GPIO21 | I2C_SDA (mặc định) |
| 12 | RXD0 | UART0_RX (Nạp code / Serial Monitor) |
| 13 | TXD0 | UART0_TX (Nạp code / Serial Monitor) |
| 14 | GPIO22 | I2C_SCL (mặc định) |
| 15 | GPIO23 | VSPI_MOSI, GPIO |

### Hàng chân PHẢI (từ trên xuống)

| Pin | Tên | Chức năng chính |
|-----|-----|----------------|
| 1 | VIN | Nguồn vào 5V |
| 2 | GND | Ground |
| 3 | GPIO13 | ADC2_CH4, Touch4, HSPI_ID |
| 4 | GPIO12 | ADC2_CH5, Touch5 — **Strapping pin** ⚠️ BOOT |
| 5 | GPIO14 | ADC2_CH6, Touch6, HSPI_CLK — **Strapping pin** ⚠️ |
| 6 | GPIO27 | ADC2_CH7, Touch7 |
| 7 | GPIO26 | DAC2, ADC2_CH9 |
| 8 | GPIO25 | DAC1, ADC2_CH8 |
| 9 | GPIO33 | ADC1_CH5, Touch8 |
| 10 | GPIO32 | ADC1_CH4, Touch9 |
| 11 | GPIO35 | Input only, ADC1_CH7 |
| 12 | GPIO34 | Input only, ADC1_CH6 |
| 13 | GPIO39 (VN) | Input only, ADC1_CH3 |
| 14 | GPIO36 (VP) | Input only, ADC1_CH0 |
| 15 | EN | Enable (Reset) |

> ⚠️ **Strapping Pins:** GPIO0, GPIO2, GPIO5, GPIO12, GPIO15 có chức năng đặc biệt khi boot. Tránh kéo HIGH/LOW bất thường trong quá trình khởi động.

> ❌ **GPIO6–11** đã được loại bỏ khỏi bo 30-pin (chúng dùng riêng cho Flash SPI nội và **KHÔNG BAO GIỜ** được sử dụng cho mục đích khác).

> 📌 **GPIO34, 35, 36, 39** là **Input-only**, không có điện trở kéo (pull-up/pull-down) nội tại.

---

## 4. Phân bổ GPIO trong Dự án SDMS — Room Door

| GPIO | Thiết bị | Giao tiếp | Chức năng |
|------|----------|-----------|-----------|
| GPIO21 | LCD1602 — SDA | I2C | Đường dữ liệu I2C |
| GPIO22 | LCD1602 — SCL | I2C | Đường clock I2C |
| GPIO13 | Servo SG90 — Signal | PWM | Điều khiển servo mở/đóng cửa |
| GPIO14 | Keypad — Row 1 | Digital Input | Hàng 1 bàn phím |
| GPIO27 | Keypad — Row 2 | Digital Input | Hàng 2 bàn phím |
| GPIO26 | Keypad — Row 3 | Digital Input | Hàng 3 bàn phím |
| GPIO25 | Keypad — Row 4 | Digital Input | Hàng 4 bàn phím |
| GPIO33 | Keypad — Col 1 | Digital Output | Cột 1 bàn phím |
| GPIO32 | Keypad — Col 2 | Digital Output | Cột 2 bàn phím |
| GPIO4 | Keypad — Col 3 | Digital Output | Cột 3 bàn phím |
| GPIO16 | Keypad — Col 4 | Digital Output | Cột 4 bàn phím |
| RXD0 / TXD0 | USB-UART | UART0 | Nạp code, Serial Monitor |
| GPIO5, 18, 19, 23 | (Dự phòng SPI) | SPI | Chưa dùng — có thể mở rộng |

---

## 5. Sơ đồ kết nối (Wiring)

### 5.1 LCD1602 I2C (Module có PCF8574)

```
LCD1602 (I2C)         ESP32 DevKit V1
─────────────────     ──────────────────
VCC  ──────────────>  VIN (5V)
GND  ──────────────>  GND
SDA  ──────────────>  GPIO21
SCL  ──────────────>  GPIO22
```

> 💡 **Địa chỉ I2C:** Thường là `0x27`. Nếu không hiển thị, thử `0x3F` (dùng I2C Scanner để xác định).

---

### 5.2 Servo SG90

```
Servo SG90            ESP32 DevKit V1 / Nguồn ngoài
─────────────────     ──────────────────────────────
Signal (Cam/Vàng) ->  GPIO13
VCC (Đỏ)  ─────────>  5V (Nguồn ngoài khuyến nghị)
GND (Đen/Nâu)  ────>  GND chung
```

> ⚠️ **Khuyến nghị:** Cấp nguồn 5V riêng cho Servo (không lấy trực tiếp từ chân 3V3 của ESP32). Nối chung GND giữa ESP32 và nguồn ngoài.

---

### 5.3 Bàn phím Ma trận 4x4

```
Keypad 4x4      ESP32 DevKit V1
────────────    ──────────────────
Row 1  ──────>  GPIO14
Row 2  ──────>  GPIO27
Row 3  ──────>  GPIO26
Row 4  ──────>  GPIO25
Col 1  ──────>  GPIO33
Col 2  ──────>  GPIO32
Col 3  ──────>  GPIO4
Col 4  ──────>  GPIO16
```

> 💡 **Bố cục phím mặc định:**
> ```
> [ 1 ][ 2 ][ 3 ][ A ]
> [ 4 ][ 5 ][ 6 ][ B ]
> [ 7 ][ 8 ][ 9 ][ C ]
> [ * ][ 0 ][ # ][ D ]
> ```
> - Phím **`#`** = Enter/Gửi mã PIN
> - Phím **`*`** = Xóa/Reset mã PIN

---

### 5.4 Sơ đồ tổng thể

```
                    ┌─────────────────────────┐
   LCD1602 I2C ─────┤ GPIO21 (SDA)            │
   LCD1602 I2C ─────┤ GPIO22 (SCL)            │
                    │                         │
   Servo Signal ────┤ GPIO13 (PWM)            │
                    │                         │
   Keypad Row1 ─────┤ GPIO14                  │
   Keypad Row2 ─────┤ GPIO27                  │   ESP32
   Keypad Row3 ─────┤ GPIO26                  │   DevKit V1
   Keypad Row4 ─────┤ GPIO25                  │
                    │                         │
   Keypad Col1 ─────┤ GPIO33                  │
   Keypad Col2 ─────┤ GPIO32                  │
   Keypad Col3 ─────┤ GPIO4                   │
   Keypad Col4 ─────┤ GPIO16                  │
                    │                         │
   USB/PC   ────────┤ RXD0 / TXD0 (Serial)   │
                    └─────────────────────────┘
```

---

## 6. Phân phối nguồn điện

| Thiết bị | Điện áp | Lấy từ |
|----------|---------|--------|
| ESP32 DevKit V1 | 5V | Micro-USB hoặc VIN |
| LCD1602 I2C | 5V | VIN (5V) |
| Servo SG90 | 5V | **Nguồn ngoài** (Pin 18650 / Adapter 5V) |
| GND | Chung | Nối GND của tất cả thiết bị lại |

---

## 7. Luồng hoạt động (Business Flow)

```
[Sinh viên bấm PIN trên Keypad]
         │
         ▼
[ESP32 hiển thị dấu * trên LCD]
         │
         ▼ (bấm phím #)
[ESP32 gửi HTTP POST → /api/v1/smartaccess/verify/pin]
  Payload: { "pinCode": "123456", "gateId": "<UUID>" }
         │
         ▼
[Backend xác thực PIN + kiểm tra quyền truy cập phòng]
         │
    ┌────┴────┐
  GRANTED   DENIED
    │          │
    ▼          ▼
[Servo mở]  [LCD: "SAI MẬT KHẨU"]
[LCD: OK]   [Không làm gì]
    │
    ▼ (sau 5 giây)
[Servo đóng]
[LCD về trạng thái chờ]
```

---

## 8. Thư viện Arduino cần cài đặt

| Thư viện | Board Manager / Library Manager | Mục đích |
|----------|--------------------------------|----------|
| `esp32` by Espressif | Board Manager | Core ESP32 |
| `LiquidCrystal_I2C` by Frank de Brabander | Library Manager | Điều khiển LCD |
| `Keypad` by Mark Stanley | Library Manager | Đọc bàn phím |
| `ESP32Servo` by Kevin Harrington | Library Manager | Điều khiển Servo |
| `ArduinoJson` by Benoit Blanchon | Library Manager | Parse JSON từ Backend |

---

## 9. Lưu ý kỹ thuật

- **Không** cấp 5V vào GPIO (logic 3.3V, ngưỡng chịu đựng tối đa 3.6V).
- GPIO34, 35, 36, 39 chỉ là **Input-only** — không dùng cho Keypad Column (cần Output).
- GPIO6–11 là **SPI Flash nội** — tuyệt đối không chạm đến.
- GPIO12 là **Strapping pin** — mức điện ở boot ảnh hưởng tới FLASH voltage. Để trống (floating) hoặc kéo LOW.
- Nên dùng **nguồn 5V riêng cho Servo** để tránh sụt áp làm ESP32 reset.
- Toàn bộ GND phải nối chung (Common Ground).