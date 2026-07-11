# Hướng Dẫn Nối Dây (Wiring Guide) — Cụm Cổng Chính KTX

**Thiết bị:** ESP32-CAM AI Thinker (4MB Flash + 4MB PSRAM)  
**Module:** RFID RC522 + Servo 360°  
**Cập nhật:** 2026-07-11 — Hardware Validation Pass v3 (Final)

---

## ⚠️ Cảnh Báo GPIO Đặc Biệt — ĐỌC TRƯỚC KHI NỐI DÂY

| GPIO | Trạng thái | Lý do kỹ thuật (Bằng chứng phần cứng) |
| :---: | :---: | :--- |
| **GPIO 16** | 🔴 **CẤM TUYỆT ĐỐI** | Hard-wired với PSRAM Chip Select trên PCB. Cấu hình lại → PSRAM chết → `assert failed: block_locate_free` → vòng lặp khởi động lại mãi mãi. |
| **GPIO 0**  | 🟡 **Chỉ nạp code** | Strapping pin: LOW = Flash mode, HIGH = Normal boot. Không cắm thiết bị ngoại vi. |
| **GPIO 4**  | 🟡 **Để trống** | Nối cứng với đèn Flash LED qua transistor Q1. Kéo HIGH → đèn sáng chói liên tục. Không dùng cho RC522 RST. |
| **GPIO 12** | 🟡 **Dùng được sau boot** | Strapping pin: HIGH lúc boot → chọn 1.8V flash supply → boot fail. Servo idle ở LOW → AN TOÀN vì không kéo HIGH lúc khởi động. |

---

## 1. Sơ Đồ Tổng Quan

```
                  ┌─────────────────────┐
                  │    ESP32-CAM        │
                  │   AI Thinker        │
        GND  ─────┤ GND           5V   ├──── VCC Servo (nguồn 5V ngoài)
        3V3  ─────┤ 3V3          IO16  ├──── ⛔ PSRAM CS — KHÔNG CHẠM
RFID VCC ─────────┤ 3V3          IO14  ├──── RFID SDA/SS
RFID RST ─────────┤ 3V3          IO15  ├──── RFID SCK
Servo Signal ─────┤ IO12         IO13  ├──── RFID MISO
                  │              IO2   ├──── RFID MOSI
                  │              IO4   ├──── (Flash LED — ĐỂ TRỐNG)
                  │   (Camera pins)    │
                  └─────────────────────┘
```

> **Chú ý quan trọng:** RST của RC522 được nối thẳng vào chân **3V3**, **KHÔNG** qua GPIO nào của ESP32-CAM. Xem giải thích kỹ thuật ở Mục 4.

---

## 2. Nối Dây RFID RC522 — Bus HSPI

> RC522 hoạt động ở điện áp **3.3V**. Tuyệt đối **không** cắm 5V → cháy module ngay lập tức.

| Chân RC522 | Nối vào | Ghi chú |
| :---: | :---: | :--- |
| **3.3V** | 3V3 của ESP32-CAM | Nguồn cấp |
| **GND**  | GND (chung hệ thống) | Nối đất |
| **SDA / SS** | **GPIO 14** | Chip Select |
| **SCK**  | **GPIO 15** | SPI Clock |
| **MOSI** | **GPIO 2**  | Data ESP32 → RC522 |
| **MISO** | **GPIO 13** | Data RC522 → ESP32 |
| **RST**  | **3V3 trực tiếp** | Xem Mục 4 |
| **IRQ**  | Không nối | Không sử dụng |

---

## 3. Nối Dây Servo 360° — Chốt Cửa

> Cấp nguồn **5V ngoài** cho Servo. Không lấy 5V từ chân ESP32-CAM — dễ gây sụt áp và reset MCU.  
> Nối GND của nguồn 5V chung với GND của ESP32-CAM.

| Dây Servo | Màu thường gặp | Nối vào |
| :--- | :---: | :--- |
| **VCC**    | Đỏ             | 5V (nguồn ngoài) |
| **GND**    | Đen / Nâu      | GND (chung toàn hệ thống) |
| **Signal** | Vàng / Cam     | **GPIO 12** |

---

## 4. Tại Sao RST Nối Vào 3V3 Thay Vì GPIO?

### Vấn đề nếu dùng GPIO 4 cho RST:
- GPIO 4 trên ESP32-CAM AI Thinker được nối cứng (hardwired) qua transistor Q1 đến đèn **Flash LED trắng công suất cao**.
- MFRC522 yêu cầu RST phải ở mức **HIGH (3.3V)** liên tục để module hoạt động.
- Kết quả: GPIO 4 luôn HIGH → transistor Q1 dẫn điện → **đèn Flash sáng chói 24/7**, nóng mạch và mù mắt.

### Căn cứ từ MFRC522 Datasheet (rev 3.9):
- MFRC522 có mạch **Power-On Reset (POR)** tích hợp sẵn bên trong chip.
- Khi cấp nguồn, POR tự động reset toàn bộ thanh ghi về giá trị mặc định.
- Điều kiện để module hoạt động bình thường: RST = HIGH (≥ 2.0V).
- **Kết luận:** Với prototype luận văn, tying RST vào 3V3 là chấp nhận được. Nếu SPI treo, `mfrc522.PCD_Init()` trong firmware sẽ tự re-init phần mềm.

### Ưu điểm của RST → 3V3:
- ✅ Giải phóng GPIO 4 hoàn toàn (đèn Flash không sáng).
- ✅ Không tốn thêm chân GPIO (ESP32-CAM vốn rất ít chân rảnh).
- ✅ Module RC522 vẫn reset sạch khi mất nguồn (Power-On Reset).

### Nhược điểm (chấp nhận được cho prototype):
- ❌ Không thể reset RC522 bằng phần mềm khi SPI treo (phải reset toàn bộ ESP32).

---

## 5. Bảng GPIO — Toàn Bộ Trạng Thái Sử Dụng

| GPIO | Chức năng nội bộ | Dùng trong SDMS | Trạng thái |
| :---: | :--- | :--- | :---: |
| 0 | Boot / XCLK Camera | Nạp code | Cố định |
| 2 | SD_DATA0 / Strapping | **RFID MOSI** | ✅ An toàn |
| 4 | **Flash LED (Q1)** | Để trống | ⚠️ Trống |
| 5 | Camera Y2 | Camera | Cố định |
| 12 | **Strapping (MTDI)** | **Servo Signal** | ✅ An toàn* |
| 13 | SD_DATA2 / HSPI_MISO | **RFID MISO** | ✅ An toàn |
| 14 | SD_CLK / HSPI_CLK | **RFID SDA/SS** | ✅ An toàn |
| 15 | SD_CMD / HSPI_CS | **RFID SCK** | ✅ An toàn |
| **16** | **PSRAM CS** | **KHÔNG DÙNG** | 🔴 **CẤM** |
| 18 | Camera Y3 | Camera | Cố định |
| 19 | Camera Y4 | Camera | Cố định |
| 21 | Camera Y5 | Camera | Cố định |
| 22 | Camera PCLK | Camera | Cố định |
| 23 | Camera HREF | Camera | Cố định |
| 25 | Camera VSYNC | Camera | Cố định |
| 26 | Camera SIOD | Camera | Cố định |
| 27 | Camera SIOC | Camera | Cố định |
| 32 | Camera PWDN | Camera | Cố định |
| 34 | Camera Y8 (Input only) | Camera | Cố định |
| 35 | Camera Y9 (Input only) | Camera | Cố định |
| 36 | Camera Y6 (Input only) | Camera | Cố định |
| 39 | Camera Y7 (Input only) | Camera | Cố định |

> *GPIO 12: An toàn vì Servo signal idle ở LOW (không kéo HIGH lúc boot). Strapping chỉ được đọc tại thời điểm power-on/reset.

---

## 6. Các Bước Nối Dây Thực Tế

1. **Tắt nguồn** hoàn toàn — rút USB ra khỏi ESP32-CAM.
2. **Nối RC522:** Nối theo bảng Mục 2. Đặc biệt: dây RST nối thẳng vào lỗ **3V3**, không qua GPIO nào.
3. **Nối Servo:** Signal → GPIO 12. GND chung với ESP32-CAM.
4. **Kiểm tra chéo:**
   - Xác nhận **không có dây nào** trên GPIO 16.
   - Xác nhận **không có thẻ MicroSD** trong khe cắm.
   - Xác nhận RC522 dùng 3V3 (không phải 5V).
5. **Nạp code** (kết nối USB, Arduino IDE → Upload). Sau khi xong: rút USB.
6. **Cắm lại USB**, mở **Serial Monitor @ 115200 baud**. Log thành công:

```
[Servo] Initialized.
[MEM] After Servo | Heap=... PSRAM=...
[Camera] Initialized Successfully!
[RFID] RC522 Firmware Version: 0x92 --> OK
[WiFi] Connected successfully!
```

> Nếu RFID Version = `0x00` hoặc `0xFF` → kiểm tra lại dây SPI (MOSI/MISO/SCK/SS).
