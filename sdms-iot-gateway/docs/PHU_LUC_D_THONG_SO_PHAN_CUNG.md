# PHỤ LỤC D – THÔNG SỐ KỸ THUẬT CÁC LINH KIỆN PHẦN CỨNG

> **Phạm vi áp dụng:** Phụ lục này mô tả chi tiết thông số kỹ thuật của toàn bộ các linh kiện phần cứng được sử dụng trong phân hệ IoT Gateway của hệ thống **Smart Dormitory Management System (SDMS)**. Các linh kiện được tổ chức theo vai trò trong kiến trúc hệ thống.

---

## D.1. Vi điều khiển chính – ESP32-CAM (AI Thinker)

**Vai trò trong hệ thống:** Thiết bị trung tâm của cụm kiểm soát cổng chính (Smart Access). Chịu trách nhiệm chụp ảnh khuôn mặt, giao tiếp với Backend qua REST HTTP và lắng nghe lệnh điều khiển từ MQTT Broker.

| Thông số | Giá trị |
|---|---|
| **Vi xử lý (SoC)** | ESP32-S (Tensilica LX6 Dual-Core 32-bit) |
| **Tốc độ xử lý** | Lên đến 240 MHz (600 DMIPS) |
| **SRAM nội** | 520 KB |
| **PSRAM ngoài** | 4 MB |
| **Flash SPI** | 32 Mbit (4 MB) |
| **Camera tích hợp** | OV2640 – 2 Megapixel |
| **Kết nối Wi-Fi** | 802.11 b/g/n/e/i (2.4 GHz) |
| **Kết nối Bluetooth** | Bluetooth 4.2 BR/EDR và BLE |
| **Điện áp hoạt động** | 3.3V (khuyến nghị cấp nguồn 5V 2A) |
| **Dòng tiêu thụ (Flash tắt)** | ~180 mA @ 5V |
| **Dòng tiêu thụ (Flash sáng max)** | ~310 mA @ 5V |
| **Dòng tiêu thụ (Deep Sleep)** | ~6 mA @ 5V |
| **Giao tiếp** | UART, SPI, I2C, PWM, ADC, DAC |
| **Khe cắm thẻ nhớ** | MicroSD (TF Card) – hỗ trợ đến 4 GB |
| **Anten** | PCB onboard (độ lợi 2 dBi) |
| **Kích thước** | 27 mm × 40.5 mm × 4.5 mm |
| **Đóng gói** | DIP-16 |

> **Lưu ý ứng dụng:** GPIO 0 được kết nối với XCLK của camera, cần để hở trong lúc hoạt động bình thường và kéo xuống GND khi nạp Firmware. GPIO 32 điều khiển nguồn camera, phải kéo xuống LOW để camera hoạt động.

---

## D.2. Module camera – OV2640

**Vai trò trong hệ thống:** Cảm biến hình ảnh được tích hợp sẵn trên board ESP32-CAM. Chụp ảnh JPEG khuôn mặt sinh viên và gửi lên Backend để AI nhận diện.

| Thông số | Giá trị |
|---|---|
| **Loại cảm biến** | CMOS 1/4 inch |
| **Độ phân giải tối đa** | 2 MP (UXGA – 1600 × 1200 pixel) |
| **Kích thước pixel** | 2.2 μm × 2.2 μm |
| **Điện áp hoạt động** | 3.3V (mức I/O: 1.7V – 3.3V) |
| **Giao tiếp điều khiển** | SCCB (tương thích I2C) |
| **Định dạng đầu ra** | JPEG (nén cứng), YUV 4:2:2, RGB565, RGB555, Raw RGB |
| **Nén ảnh** | Có bộ nén JPEG phần cứng tích hợp |
| **Các độ phân giải hỗ trợ** | UXGA (1600×1200), SXGA (1280×1024), SVGA (800×600), VGA (640×480), QVGA (320×240), CIF, QQVGA |
| **Tốc độ khung hình** | Lên đến 15 fps (UXGA), 30 fps (SVGA) |

> **Lưu ý ứng dụng:** Trong dự án SDMS, camera hoạt động ở chế độ JPEG (`PIXFORMAT_JPEG`) với độ phân giải VGA (640×480) để cân bằng giữa chất lượng ảnh và tốc độ truyền tải qua REST HTTP.

---

## D.3. Vi điều khiển phụ – ESP32 DevKit V1 (DOIT)

**Vai trò trong hệ thống:** Thiết bị trung tâm của cụm kiểm soát cửa phòng (Room Door). Xử lý đầu vào từ bàn phím ma trận, hiển thị thông tin lên màn hình LCD, và điều khiển servo mở chốt cửa.

| Thông số | Giá trị |
|---|---|
| **Vi xử lý** | Tensilica Xtensa® 32-bit LX6 Dual-Core |
| **Tốc độ xử lý** | 160 MHz hoặc 240 MHz (có thể điều chỉnh) |
| **SRAM** | 520 KB |
| **Flash** | 4 MB (thông thường) |
| **Điện áp hoạt động (GPIO)** | 3.3V |
| **Điện áp đầu vào (VIN)** | 7V – 12V (khuyến nghị) |
| **Nguồn USB** | Micro-USB 5V |
| **Wi-Fi** | 802.11 b/g/n (lên đến 150 Mbps) |
| **Bluetooth** | Bluetooth v4.2 BR/EDR và BLE |
| **Số chân Digital I/O (GPIO)** | 25 chân |
| **ADC** | Lên đến 18 kênh, 12-bit |
| **DAC** | 2 kênh, 8-bit |
| **Giao tiếp UART** | 3 cổng |
| **Giao tiếp SPI** | 2–4 cổng |
| **Giao tiếp I2C** | 2–3 cổng |
| **Tính năng khác** | Cảm biến chạm điện dung (10 kênh), PWM, Hall Sensor, tăng tốc mã hóa phần cứng |

> **Lưu ý ứng dụng:** GPIO 6–11 được hệ thống dùng nội bộ cho SPI Flash, tuyệt đối không sử dụng cho mục đích khác. Trong dự án, DevKit V1 đang dùng GPIO 14/27/26/25 cho hàng bàn phím và GPIO 33/32/4/16 cho cột bàn phím, GPIO 21/22 cho I2C (LCD), GPIO 13 cho servo.

---

## D.4. Module đọc thẻ từ – MFRC522 (RC522)

**Vai trò trong hệ thống:** Module đọc thẻ RFID tần số 13.56 MHz tích hợp trong cụm Smart Access. Nhận diện thẻ từ của sinh viên và gửi mã UID về ESP32 để xác thực với Backend.

| Thông số | Giá trị |
|---|---|
| **IC chính** | NXP MFRC522 |
| **Tần số hoạt động** | 13.56 MHz |
| **Điện áp hoạt động** | 2.5V – 3.3V DC |
| **Dòng tiêu thụ (hoạt động)** | 13 – 26 mA |
| **Dòng tiêu thụ (chờ)** | 10 – 13 mA |
| **Dòng tiêu thụ (sleep)** | < 80 µA |
| **Dòng tiêu thụ (đỉnh)** | < 30 mA |
| **Giao tiếp** | SPI (lên đến 10 Mbit/s), I2C, UART |
| **Khoảng cách đọc thẻ** | Lên đến 50 mm (điển hình) |
| **Chuẩn thẻ hỗ trợ** | ISO/IEC 14443A, MIFARE Classic, MIFARE Ultralight, MIFARE DESFire |
| **Nhiệt độ hoạt động** | -20°C đến +80°C |

> **Lưu ý ứng dụng:** Module hoạt động ở 3.3V; không cấp 5V trực tiếp vào VCC. Giao tiếp SPI được sử dụng trong dự án. Theo `iot_domain_master_data.md`, RFID đang bị tắt (`ENABLE_RFID false`) trong phiên bản hiện tại và sẽ được kích hoạt tại GPIO 2 và GPIO 15 trong phiên bản tiếp theo.

---

## D.5. Bàn phím ma trận – Matrix Keypad 4×4

**Vai trò trong hệ thống:** Thiết bị nhập liệu của cụm cửa phòng (Room Door). Sinh viên nhập mã PIN để xác thực và mở khóa phòng khi mạng không khả dụng (Offline PIN Fallback).

| Thông số | Giá trị |
|---|---|
| **Loại** | Màng (Membrane) phẳng |
| **Số phím** | 16 phím (4 hàng × 4 cột) |
| **Điện áp hoạt động** | 3.3V – 5V DC |
| **Dòng tối đa mỗi phím** | 30 – 100 mA |
| **Điện trở tiếp xúc** | < 100 Ω |
| **Điện trở cách điện** | > 100 MΩ @ 100V |
| **Số chân giao tiếp** | 8 chân (4 hàng + 4 cột) |
| **Thời gian nảy (Bounce)** | ≤ 5 ms |
| **Tuổi thọ** | > 1.000.000 lần nhấn |
| **Nhiệt độ hoạt động** | -20°C đến +60°C |
| **Phương pháp quét** | Quét ma trận (Matrix Scanning) |

**Bố trí chân kết nối:**

| Chân | Chức năng | GPIO (ESP32 DevKit) |
|---|---|---|
| Pin 1 | Row 1 (R1) | GPIO 14 |
| Pin 2 | Row 2 (R2) | GPIO 27 |
| Pin 3 | Row 3 (R3) | GPIO 26 |
| Pin 4 | Row 4 (R4) | GPIO 25 |
| Pin 5 | Column 1 (C1) | GPIO 33 |
| Pin 6 | Column 2 (C2) | GPIO 32 |
| Pin 7 | Column 3 (C3) | GPIO 4 |
| Pin 8 | Column 4 (C4) | GPIO 16 |

> **Lưu ý ứng dụng:** Cần thêm xử lý chống nảy phím (debounce) trong phần mềm. Thư viện `Keypad.h` (Arduino) được dùng để quét ma trận theo từng chu kỳ.

---

## D.6. Động cơ servo – SG90 Micro Servo

**Vai trò trong hệ thống:** Cơ cấu chấp hành (Actuator) cơ học. Điều khiển chốt cửa phòng (Room Door Latch). Quay từ vị trí khóa sang mở khi ESP32 nhận lệnh xác thực thành công.

| Thông số | Giá trị |
|---|---|
| **Hãng sản xuất** | TowerPro (và các nhà sản xuất tương thích) |
| **Trọng lượng** | 9 g |
| **Kích thước** | 22.2 mm × 11.8 mm × 31 mm |
| **Điện áp hoạt động** | 4.8V – 6V DC |
| **Mô-men xoắn @ 4.8V** | ~1.8 kgf·cm |
| **Mô-men xoắn @ 6V** | ~2.2 – 2.4 kgf·cm |
| **Tốc độ quay @ 4.8V** | ~0.10 – 0.12 giây/60° |
| **Góc quay** | Khoảng 180° (±90° từ tâm) |
| **Phương pháp điều khiển** | PWM (Pulse Width Modulation) |
| **Tần số PWM** | 50 Hz (chu kỳ 20 ms) |
| **Độ rộng xung điều khiển** | 500 µs – 2400 µs |
| **Xung giữa (90°)** | ~1500 µs |
| **Xung min (0°)** | ~1000 µs |
| **Xung max (180°)** | ~2000 µs |
| **Loại động cơ** | 3-cực |
| **Loại bánh răng** | Nhựa (Plastic Gear) |
| **Nhiệt độ hoạt động** | 0°C – 55°C |
| **GPIO điều khiển** | GPIO 13 (ESP32 DevKit V1) |

> **Lưu ý ứng dụng:** Thời gian giữ chốt mở được cấu hình tại `RELAY_OPEN_DURATION = 5000ms` trong `Config.h`. Sau khoảng thời gian này, servo tự động quay về vị trí khóa.

---

## D.7. Module màn hình – LCD 16×2 với giao tiếp I2C (PCF8574)

**Vai trò trong hệ thống:** Hiển thị trạng thái hệ thống và hướng dẫn người dùng tại cụm cửa phòng. Ví dụ: "Nhập mã PIN:", "Xác thực thành công", "Sai mã, thử lại".

| Thông số | Giá trị |
|---|---|
| **Loại hiển thị** | LCD ký tự (Character LCD) |
| **Số ký tự** | 16 ký tự × 2 dòng |
| **Điện áp hoạt động** | 5V DC |
| **IC mở rộng I2C** | PCF8574 (hoặc PCF8574T) |
| **Điện áp IC mở rộng** | 2.5V – 6V |
| **Giao tiếp** | I2C (2 dây: SDA + SCL) |
| **Địa chỉ I2C mặc định** | 0x27 (PCF8574) hoặc 0x3F (PCF8574A) |
| **Số chân kết nối với MCU** | 4 chân (GND, VCC, SDA, SCL) |
| **Điều chỉnh độ tương phản** | Biến trở (potentiometer) trên module |
| **Đèn nền (Backlight)** | LED, điều khiển bằng jumper |

**Kết nối I2C với ESP32 DevKit V1:**

| Chân LCD Module | GPIO (ESP32 DevKit) |
|---|---|
| GND | GND |
| VCC | 5V |
| SDA | GPIO 21 |
| SCL | GPIO 22 |

> **Lưu ý ứng dụng:** Khi kết nối ESP32 (3.3V logic) với LCD I2C (5V), cần lưu ý rủi ro điện áp trên đường I2C. Trên thực tế, hầu hết các module PCF8574 đều hoạt động tốt với tín hiệu 3.3V từ ESP32 mà không cần mạch chuyển mức logic (logic level shifter) nhờ ngưỡng nhận của chip.

---

## D.8. Module rơ-le – Relay Module 1 Kênh 5V (Opto-Isolated)

**Vai trò trong hệ thống:** Cơ cấu chấp hành điện. Kích hoạt hoặc ngắt điện cho khóa từ (Electromagnetic Lock) tại cổng chính (Smart Access), thực hiện lệnh mở/đóng cửa.

| Thông số | Giá trị |
|---|---|
| **Điện áp điều khiển (VCC)** | 3.75V – 6V DC |
| **Dòng tiêu thụ cuộn dây** | ~70 mA (khi được kích hoạt) |
| **Dòng tiêu thụ chờ** | 2 – 5 mA |
| **Dòng kích (Trigger Current)** | 2 – 20 mA |
| **Tải tối đa (AC)** | 10A @ 250VAC |
| **Tải tối đa (DC)** | 10A @ 30VDC |
| **Thời gian đóng (Operate)** | < 10 ms |
| **Thời gian mở (Release)** | < 5 ms |
| **Mức kích (Trigger Logic)** | High hoặc Low (có thể chọn bằng jumper) |
| **Cách ly điện** | Opto-Isolated (dùng optocoupler EL817) |
| **Các đầu nối tải** | COM (Chung), NO (Thường Mở), NC (Thường Đóng) |
| **Chỉ thị LED** | LED nguồn (xanh) + LED trạng thái (đỏ) |

> **Lưu ý ứng dụng:** Module có bộ cách ly quang (opto-isolator) bảo vệ ESP32 khỏi nhiễu ngược từ cuộn dây khóa từ. Trong dự án, rơ-le được cấu hình kích hoạt HIGH và tự ngắt sau `RELAY_OPEN_DURATION` (5 giây) để tiết kiệm điện và bảo vệ khóa từ.

---

## D.9. Bảng tổng hợp linh kiện theo cụm thiết bị

| STT | Linh kiện | Cụm sử dụng | Giao tiếp | Vai trò |
|---|---|---|---|---|
| 1 | **ESP32-CAM (AI Thinker)** | Smart Access (Cổng chính) | WiFi, MQTT, HTTP | Vi điều khiển trung tâm, chụp ảnh |
| 2 | **OV2640** | Smart Access (Cổng chính) | SCCB/I2C | Camera nhận diện khuôn mặt |
| 3 | **MFRC522 RC522** | Smart Access (Cổng chính) | SPI | Đọc thẻ RFID |
| 4 | **Relay Module 5V** | Smart Access (Cổng chính) | GPIO (Digital Out) | Điều khiển khóa từ cổng |
| 5 | **ESP32 DevKit V1** | Room Door (Cửa phòng) | WiFi, MQTT, I2C, PWM | Vi điều khiển trung tâm cửa phòng |
| 6 | **Matrix Keypad 4×4** | Room Door (Cửa phòng) | GPIO (Ma trận 8 chân) | Nhập mã PIN |
| 7 | **SG90 Servo** | Room Door (Cửa phòng) | PWM | Điều khiển chốt cửa phòng |
| 8 | **LCD 16×2 (I2C)** | Room Door (Cửa phòng) | I2C (SDA/SCL) | Hiển thị trạng thái hệ thống |

---

## D.10. Sơ đồ nguyên lý kết nối (Pinout Summary)

### D.10.1. Cụm Smart Access – ESP32-CAM

| Linh kiện | Tín hiệu | GPIO ESP32-CAM |
|---|---|---|
| OV2640 | Tích hợp sẵn | Tích hợp sẵn |
| MFRC522 (RFID) | SDA (SS) | GPIO 2 (dự kiến) |
| MFRC522 (RFID) | SCK | GPIO 15 (dự kiến) |
| Relay Module | IN (Kích hoạt) | GPIO 12 |
| Serial Monitor | TX/RX | GPIO 1/3 |

### D.10.2. Cụm Room Door – ESP32 DevKit V1

| Linh kiện | Tín hiệu | GPIO ESP32 DevKit |
|---|---|---|
| Keypad 4×4 | Row 1 – Row 4 | GPIO 14, 27, 26, 25 |
| Keypad 4×4 | Col 1 – Col 4 | GPIO 33, 32, 4, 16 |
| LCD I2C | SDA | GPIO 21 |
| LCD I2C | SCL | GPIO 22 |
| SG90 Servo | PWM Signal | GPIO 13 |

---

*Tài liệu này là Phụ lục D của Luận văn tốt nghiệp. Thông số kỹ thuật được tổng hợp từ Datasheet chính hãng (NXP, AI-Thinker, OmniVision, TowerPro) và được đối chiếu với mã nguồn Firmware thực tế tại `sdms-iot-gateway/firmware_esp32/`.*

*Ngày tạo: 27/07/2026 – Phân hệ IoT Gateway SDMS*
