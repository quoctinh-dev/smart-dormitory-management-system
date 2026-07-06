# Thiết Kế Phần Cứng & Firmware ESP32-CAM (Smart Access)

Tài liệu này cung cấp định hướng kỹ thuật cho việc lập trình mạch ESP32-CAM AI-Thinker tại các cổng KTX.

## 1. Thông số Kỹ thuật & Tối ưu (Diagnostic Report)
Dựa trên kiến trúc "Backend-Centric AI", mạch ESP32 đóng vai trò **Edge Device** (chỉ thu thập và đẩy dữ liệu, không xử lý AI).

- **Camera Resolution:** Khuyến nghị **VGA (640x480)**. Đây là điểm cân bằng lý tưởng giúp AI phát hiện khuôn mặt tốt mà dung lượng file vẫn đủ nhẹ (~40KB).
- **JPEG Quality:** Mức **12** (thang 0-63). Giữ chi tiết tốt, không bị artifact (vỡ hạt).
- **Frame Buffer (`fb_count`):** Cài đặt **1**. Do hệ thống dùng cơ chế "Bấm Nút Chụp", ta không cần buffer thứ 2 (chỉ dùng cho livestream), giúp tiết kiệm PSRAM.
- **Xử lý Frame Rác:** Trước khi chụp ảnh thật để gửi đi, Firmware phải gọi lệnh lấy khung hình và hủy ngay lập tức để "xả rác" (clear buffer), đảm bảo ảnh gửi đi luôn là ảnh real-time.

## 2. Sơ đồ Chân (GPIO Pinout)
Lưu ý: Mạch AI-Thinker rất thiếu GPIO do Camera và thẻ nhớ (SD Card) dùng chung bus. Tuyệt đối tuân thủ sơ đồ chân sau để tránh chập/treo mạch:

| Thiết Bị Ngoại Vi | Chân GPIO Đề Xuất | Ghi Chú Cảnh Báo |
| :--- | :--- | :--- |
| **Relay Khóa Cửa** | `GPIO 12` | Chân an toàn. Tuyệt đối **KHÔNG** cắm vào IO4 vì IO4 dính với đèn Flash siêu sáng trên board. |
| **Nút Bấm (Button)**| `GPIO 13` | Cấu hình `INPUT_PULLUP`. Kích hoạt chụp ảnh khi kéo xuống LOW. (Lưu ý: IO12 và IO13 yêu cầu không dùng thẻ SD ở chế độ 4-line SPI). |
| **Buzzer / Còi** | `GPIO 2` | Hoặc `GPIO 16`. Dùng để phát âm thanh tít tít khi mở cửa hoặc bị từ chối. |

## 3. Kiến Trúc Hoạt Động (Flow)
1. **Idle:** Mạch kết nối WiFi, chờ tín hiệu từ Button hoặc Cảm biến vật cản (PIR).
2. **Trigger:** Có tín hiệu -> Chụp 1 tấm ảnh JPEG.
3. **Upload:** Gửi HTTP POST (multipart/form-data) chứa ảnh và `gateId` lên Spring Boot (`/api/v1/smartaccess/verify/face`).
4. **Action:** Đọc JSON phản hồi (`GRANTED` / `DENIED`). Bật Relay mở cửa nếu GRANTED.
5. **Cooldown:** Chờ 3-5 giây để chống spam, sau đó lặp lại.

## 4. Source Code Mẫu
Xem toàn bộ source code Arduino C++ tại file: `esp32_firmware_template.ino` cùng thư mục này.
