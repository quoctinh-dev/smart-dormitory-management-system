# Hướng dẫn Nối Mạch (Wiring Guide) - Cửa Phòng (Room Door)

**Board:** ESP32 DevKit V1 (30-Pin)
**Dự án:** Smart Dormitory Management System (SDMS)

Tài liệu này hướng dẫn chi tiết từng bước (step-by-step) cách nối dây cho thiết bị điều khiển cửa phòng sử dụng bàn phím ma trận, màn hình LCD và động cơ Servo.

---

## 🛠 Chuẩn bị linh kiện
- 1 x ESP32 DevKit V1 (30-Pin Type-C)
- 1 x Màn hình LCD 1602 kèm module I2C (PCF8574)
- 1 x Động cơ Servo SG90
- 1 x Bàn phím ma trận (Matrix Keypad 4x4)
- Nguồn cấp ngoài 5V (Khuyên dùng để cấp nguồn cho Servo tránh làm sụt áp ESP32)
- Dây cắm test board (Jumper wires)

---

## ⚡ Bước 1: Thiết lập Nguồn (Power Distribution)
Để hệ thống hoạt động ổn định, bạn cần tuân thủ quy tắc nối nguồn và **GND chung (Common Ground)**.

- [ ] Cấp nguồn 5V (từ cáp USB kết nối máy tính hoặc nguồn ngoài) vào chân ESP32.
- [ ] Nối chân `GND` của ESP32 với cực âm (GND) của module nguồn ngoài (nếu có dùng).
- [ ] Dùng nguồn 5V riêng (adapter/pin) để cấp cho động cơ Servo SG90 (chân màu Đỏ). **Không** lấy 5V hoặc 3.3V từ ESP32 cấp trực tiếp cho Servo để tránh tình trạng sụt áp gây reset tự động bo mạch.

---

## 📺 Bước 2: Nối màn hình LCD 1602 (I2C)
Module I2C đằng sau LCD giúp giảm số lượng dây tín hiệu xuống chỉ còn 2 dây (tổng cộng 4 dây kể cả nguồn).

| Chân trên LCD (I2C) | Chân trên ESP32 | Ghi chú |
|:---:|:---:|---|
| **VCC** | **VIN (5V)** | LCD cần 5V để đèn nền sáng rõ. |
| **GND** | **GND** | Nối chung mass. |
| **SDA** | **GPIO21** | Đường truyền dữ liệu I2C. |
| **SCL** | **GPIO22** | Đường truyền xung nhịp I2C. |

- [ ] Hoàn thành cắm 4 dây cho LCD.

---

## ⚙️ Bước 3: Nối động cơ Servo SG90 (Chốt cửa)

| Chân trên Servo | Kết nối tới |
|:---:|---|
| **Signal** (Cam/Vàng) | **GPIO13** (ESP32) |
| **VCC** (Đỏ) | **5V (Nguồn ngoài riêng)** |
| **GND** (Nâu/Đen) | **GND (Chung với ESP32)** |

- [ ] Hoàn thành nối dây cho Servo SG90.

---

## 🔢 Bước 4: Nối Bàn phím Ma trận (Matrix Keypad 4x4)
Bàn phím 4x4 có 8 chân ra (từ trái qua phải, được chia làm 4 hàng Row và 4 cột Col).

| Chân Keypad | Chân ESP32 | Chức năng |
|:---:|:---:|---|
| **Row 1** (Dây 1) | **GPIO14** | Hàng 1 |
| **Row 2** (Dây 2) | **GPIO27** | Hàng 2 |
| **Row 3** (Dây 3) | **GPIO26** | Hàng 3 |
| **Row 4** (Dây 4) | **GPIO25** | Hàng 4 |
| **Col 1** (Dây 5) | **GPIO33** | Cột 1 |
| **Col 2** (Dây 6) | **GPIO32** | Cột 2 |
| **Col 3** (Dây 7) | **GPIO4**  | Cột 3 |
| **Col 4** (Dây 8) | **GPIO16** | Cột 4 |

- [ ] Hoàn thành nối dây cho Keypad.
> *Mẹo nhỏ:* Tránh nhầm lẫn thứ tự cắm từ trái qua phải. Nếu sau khi nối xong bấm phím bị sai số, bạn hãy thử lật ngược cụm đầu cắm dây 8-pin của Keypad trên test board lại.

---

## ✅ Bước 5: Kiểm tra an toàn trước khi cắm điện
- [ ] Đảm bảo **GND** của tất cả thiết bị (ESP32, LCD, Servo, Nguồn ngoài) đã được nối chung với nhau thành 1 khối hở.
- [ ] Tuyệt đối **không** có bất kỳ dây 5V nào cắm nhầm vào các chân GPIO tín hiệu từ 0 đến 39 (GPIO của ESP32 chỉ chịu được mức điện áp logic 3.3V).
- [ ] Không sử dụng các chân Input-only (GPIO34, 35, 36, 39) để xuất tín hiệu cho Keypad (Col). Sơ đồ bảng mạch ở Bước 4 đã thiết kế chuẩn để né các chân này ra.

---
🎉 **Hoàn tất nối mạch!** Sau khi bạn check toàn bộ 5 bước đã đúng, bạn có thể cắm cáp USB vào máy tính để tiến hành sang Bước tiếp theo: Cấp điện và Nạp Code.
