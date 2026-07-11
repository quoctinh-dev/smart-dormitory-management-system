# ESP32 DevKit V1 Hardware Testing

## 1. Giới thiệu

Tài liệu này mô tả quy trình kiểm thử phần cứng của cụm **ESP32 DevKit V1** trong hệ thống **Smart Dormitory Management System (SDMS)**.

ESP32 DevKit V1 đóng vai trò là bộ điều khiển cục bộ tại cửa phòng, chịu trách nhiệm quản lý các thiết bị nhập liệu và hiển thị, bao gồm:

- LCD1602 I2C
- Keypad Matrix 4x4
- Servo Motor

Trong giai đoạn này chỉ kiểm thử phần cứng và chương trình độc lập, không kiểm thử kết nối với Backend hoặc các giao thức mạng.

---

# 2. Mục tiêu

Xác nhận các thành phần sau hoạt động chính xác:

- ESP32 DevKit V1
- LCD1602 I2C
- Keypad Matrix 4x4
- Servo Motor

---

# 3. Thành phần phần cứng

| Thiết bị | Model |
|----------|-------|
| ESP32 DevKit V1 | 30 Pin |
| LCD | LCD1602 + I2C |
| Keypad | Matrix 4x4 |
| Servo | SG90 / MG90S |
| USB | Type-C / Micro USB |

---

# 4. GPIO Mapping

## Servo

| GPIO | Thiết bị |
|------|----------|
| GPIO13 | Servo Signal |

---

## LCD I2C

| GPIO | Thiết bị |
|------|----------|
| GPIO21 | SDA |
| GPIO22 | SCL |

---

## Keypad

### Rows

| GPIO | Row |
|------|-----|
| GPIO14 | R1 |
| GPIO27 | R2 |
| GPIO26 | R3 |
| GPIO25 | R4 |

### Columns

| GPIO | Column |
|------|--------|
| GPIO33 | C1 |
| GPIO32 | C2 |
| GPIO4 | C3 |
| GPIO16 | C4 |

---

# 5. Quy tắc đấu nối

## LCD1602

| LCD | ESP32 |
|------|--------|
| VCC | VIN (5V) |
| GND | GND |
| SDA | GPIO21 |
| SCL | GPIO22 |

---

## Servo

| Servo | ESP32 |
|--------|--------|
| Signal | GPIO13 |
| VCC | 5V |
| GND | GND |

---

## Keypad

| Keypad | ESP32 |
|---------|--------|
| Row1 | GPIO14 |
| Row2 | GPIO27 |
| Row3 | GPIO26 |
| Row4 | GPIO25 |
| Col1 | GPIO33 |
| Col2 | GPIO32 |
| Col3 | GPIO4 |
| Col4 | GPIO16 |

---

# 6. Điều kiện kiểm thử

Trước khi kiểm thử cần đảm bảo:

- ESP32 DevKit V1 đã nạp chương trình thành công.
- LCD được cấp nguồn ổn định.
- Servo sử dụng nguồn 5V.
- Toàn bộ thiết bị dùng chung GND.
- Các dây Dupont được cắm đúng sơ đồ.

---

# 7. Quy trình kiểm thử

## Test 1 - ESP32

Mục tiêu

- Boot thành công.
- Serial Monitor hoạt động.

---

## Test 2 - LCD1602

Kiểm tra

- Hiển thị chữ.
- Xóa màn hình.
- Hiển thị nhiều dòng.

Kết quả mong đợi

```
SMART DORM

READY
```

---

## Test 3 - Keypad

Kiểm tra

- Nhấn từng phím.
- Hiển thị phím trên Serial.

Ví dụ

```
1
2
3
A
```

---

## Test 4 - Servo

Kiểm tra

Servo quay:

- 0°
- 45°
- 90°
- 135°
- 180°

---

## Test 5 - LCD + Keypad

Kiểm tra

- Nhấn phím.
- LCD hiển thị ký tự tương ứng.

Ví dụ

```
Password:

1234
```

---

## Test 6 - Keypad + Servo

Giả lập

```
Nhập:

1234
```

Servo mở.

Nhập

```
0000
```

Servo không mở.

Trong giai đoạn này mật khẩu được khai báo trực tiếp trong chương trình.

---

## Test 7 - LCD + Servo

Khi Servo mở

LCD hiển thị

```
Door Open
```

Sau 5 giây

```
Door Closed
```

---

## Test 8 - Toàn bộ cụm

Hoạt động đồng thời:

- LCD
- Keypad
- Servo

Lặp lại:

- Nhập đúng mật khẩu 20 lần.
- Servo đóng mở 20 lần.
- LCD cập nhật trạng thái liên tục.

---

# 8. Checklist kiểm thử

| Hạng mục | PASS | FAIL | Ghi chú |
|----------|------|------|----------|
| ESP32 Boot | ☐ | ☐ | |
| LCD Init | ☐ | ☐ | |
| LCD Display | ☐ | ☐ | |
| Keypad Init | ☐ | ☐ | |
| Keypad Read | ☐ | ☐ | |
| Servo PWM | ☐ | ☐ | |
| Servo Rotation | ☐ | ☐ | |
| LCD + Keypad | ☐ | ☐ | |
| Keypad + Servo | ☐ | ☐ | |
| Full Hardware Test | ☐ | ☐ | |

---

# 9. Các lỗi thường gặp

| Hiện tượng | Nguyên nhân | Hướng xử lý |
|------------|-------------|-------------|
| LCD sáng nhưng không có chữ | Sai địa chỉ I2C hoặc biến trở | Quét I2C và chỉnh biến trở |
| LCD không hoạt động | Sai SDA/SCL | Kiểm tra GPIO21, GPIO22 |
| Keypad không nhận phím | Sai thứ tự dây | Kiểm tra lại Row và Column |
| Servo rung | Nguồn yếu | Dùng nguồn 5V riêng |
| ESP32 Reset | Servo gây sụt áp | Nối chung GND và tách nguồn Servo |

---

# 10. Kết luận

Cụm ESP32 DevKit V1 được xem là đạt yêu cầu khi:

- ESP32 Boot ổn định.
- LCD hiển thị chính xác.
- Keypad đọc đúng tất cả các phím.
- Servo điều khiển đúng góc.
- Ba thiết bị hoạt động đồng thời mà không xảy ra lỗi hoặc Reset.

Sau khi hoàn thành kiểm thử, cụm ESP32 DevKit V1 sẵn sàng cho giai đoạn phát triển Firmware nghiệp vụ và tích hợp với hệ thống SDMS.

---

# 11. Phiên bản tài liệu

| Thuộc tính | Giá trị |
|------------|----------|
| Document | ESP32 DevKit V1 Hardware Testing |
| Version | 1.0 |
| Status | Draft |
| Project | Smart Dormitory Management System |
| Hardware | ESP32 DevKit V1 |