# 06. MỞ RỘNG MÔ HÌNH PHẦN CỨNG IOT (CÒI CHIP & NÚT BẤM VẬT LÝ)

## 1. Tầm nhìn và Mục tiêu
Tính năng này giải quyết nhu cầu **demo mô hình thực tế** của hệ thống Smart Access. Hiện tại dự án mới chỉ có 1 mạch ESP32-CAM trơ trọi (điều khiển mở cửa bằng Web UI ảo và hiển thị kết quả qua Serial Monitor). 

Mục tiêu trong tương lai (khi có đủ kinh phí/thiết bị) là xây dựng một sa bàn vật lý thực thụ:
- **Nút bấm vật lý (Push Button):** Dành cho sinh viên thao tác vật lý để ra lệnh chụp ảnh, tăng tính chân thực thay vì bấm nút ảo trên Web.
- **Còi chip (Buzzer):** Phát tiếng "Bíp" báo hiệu đã bấm nút, báo hiệu mở cửa thành công, hoặc kêu "Tít tít tít" cảnh báo xâm nhập trái phép nếu AI từ chối (ACCESS DENIED).
- **Đèn LED chỉ thị:** LED Xanh (Mở cửa) và LED Đỏ (Cấm vào).

Việc có mô hình trực quan giúp cho đồ án/bài thuyết trình sinh động, thuyết phục người dùng và hội đồng chấm thi hơn gấp nhiều lần.

## 2. Luồng nghiệp vụ mới (Vật lý hóa)
1. User đứng trước cửa, nhấn **Nút vật lý** (nối với chân GPIO của ESP32).
2. ESP32 nhận tín hiệu, ra lệnh Buzzer kêu "Bíp" 1 tiếng.
3. Camera ESP32 tự động chụp ảnh, gửi lên Backend -> Backend gọi AI Python -> Trả về Kết quả.
4. **Nếu GRANTED (Mở cửa):**
   - Kích hoạt Relay mở khoá điện từ.
   - Bật LED Xanh lá.
   - Buzzer phát 2 tiếng bíp dài vui tai: "Bíp... Bíp...".
5. **Nếu DENIED (Cấm vào):**
   - LED Đỏ nhấp nháy liên tục.
   - Buzzer kêu còi báo động "Tít tít tít tít" để đuổi kẻ lạ mặt.

## 3. Lộ trình triển khai (Roadmap)
### Giai đoạn 1: Mua sắm & Quy hoạch Phần cứng
- **Vật tư:** 1x Còi chíp (Active Buzzer), 1x Nút bấm nhấn nhả, 2x Đèn LED, 1x Khoá cửa điện từ 12V.
- **IoT Firmware (C++):** Phân tích và cập nhật file `src/config/Pins.h`. Quy hoạch các chân GPIO còn trống của ESP32-CAM (Lưu ý ESP32-CAM rất thiếu chân, phải chọn kỹ chân không trùng với thẻ nhớ SD).

### Giai đoạn 2: Lập trình Firmware (Driver Mới)
- **Module `ButtonDriver`:** Viết code xử lý chống dội phím (Debounce) bằng timer hoặc ngắt cứng để đảm bảo bấm 1 lần chụp 1 lần.
- **Module `BuzzerDriver`:** Viết các hàm tạo âm thanh phi đồng bộ (Non-blocking beep) để không làm treo Camera.
- **Cập nhật `smart_access.ino`:** Tích hợp việc đọc nút bấm phần cứng song song với Web UI hiện có.

### Giai đoạn 3: Lắp ráp Sa bàn
- Lắp đặt mô hình cửa mini bằng format/mika. Đi dây Relay an toàn chống nhiễu.

---

## 4. Prompt Kích hoạt
*(Khi bạn đã có đủ linh kiện trên bàn và muốn bắt tay vào code, hãy copy/paste nguyên đoạn text dưới đây gửi cho Agent)*

> Chào IoT Agent, tôi đã mua đủ linh kiện (Buzzer, Nút bấm vật lý, LED) để nâng cấp mô hình ESP32-CAM thực tế.
> Hãy đọc lại bản kế hoạch trong file `docs/roadmap/features/06_IOT_HARDWARE_MODEL_EXTENSION.md`. 
> 
> Dựa vào đó, nhiệm vụ của bạn hôm nay là:
> 1. Quy hoạch lại chân tín hiệu trong `Pins.h` (Lưu ý tránh các chân của thẻ nhớ/camera).
> 2. Viết 2 module C++ mới là `BuzzerDriver` và `ButtonDriver` chuẩn Clean Architecture.
> 3. Sửa hàm `loop()` trong `smart_access.ino` để đọc nút bấm vật lý và nháy tiếng còi bíp bíp theo trạng thái GRANTED/DENIED.
> Nhớ tuân thủ Đạo luật Tự kiểm chứng (MANDATORY SELF-VERIFICATION) - hãy gọi `pio run` hoặc biên dịch thử trước khi báo cáo hoàn thành!
