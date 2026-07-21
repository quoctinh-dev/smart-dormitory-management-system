# E2E TESTING GUIDE: OFFLINE SYNC & ACCESS LOGIC

Tài liệu này hướng dẫn chi tiết các kịch bản kiểm thử End-to-End (E2E) cho tính năng Smart Access, tập trung vào khả năng hoạt động độc lập (Offline) của mạch ESP32 khi mất kết nối mạng, cũng như cơ chế đồng bộ danh sách Whitelist từ Backend.

## 1. Môi trường chuẩn bị
1. **Thiết bị IoT:** Mạch ESP32-CAM đã được nạp Firmware mới nhất (bao gồm NVS Storage cho Whitelist).
2. **Hệ thống Backend:** Chạy ở port `8080`.
3. **Mạng WiFi:** Dùng Mobile Hotspot để có thể dễ dàng Bật/Tắt mạng.

## 2. Kịch bản 1: Đồng bộ Whitelist lần đầu (First-time Sync)
- **Hành động:** 
  1. Bật nguồn mạch ESP32.
  2. Bật Mobile Hotspot, đảm bảo Backend đang chạy.
- **Quan sát Serial Monitor:**
  - ESP32 báo kết nối WiFi thành công.
  - ESP32 gọi `HttpManager::fetchAndSaveWhitelist()`.
  - Serial log in ra: `✅ Whitelist sync complete` và hiển thị tổng số UID đã lưu vào NVS.
- **Đánh giá:** ESP32 đã nắm trong tay danh sách sinh viên hợp lệ của tòa nhà.

## 3. Kịch bản 2: Đồng bộ Whitelist qua MQTT (Real-time Push)
- **Hành động:**
  1. Lên trang Web Admin (Frontend).
  2. Xếp phòng cho một sinh viên mới hoặc thay đổi thẻ từ (Gắn RFID card mới).
- **Quan sát Serial Monitor:**
  - ESP32 nhận được MQTT payload trên topic `sdms/gates/building/<UUID>/whitelist`.
  - Serial log in ra: `[MQTT] SYNC_WHITELIST command received` hoặc `[MQTT] Whitelist push received`.
  - ESP32 lưu đè danh sách thẻ mới vào NVS.
- **Đánh giá:** Danh sách thẻ Offline trên thiết bị được cập nhật tức thì (Real-time) mà không cần chờ 6 tiếng.

## 4. Kịch bản 3: Phạt Nguội - Vượt rào cúp mạng (Offline Access)
- **Hành động:**
  1. Tắt Mobile Hotspot (Giả lập cúp điện router mạng).
  2. Đợi ESP32 báo mất kết nối WiFi (`WiFi Disconnected`).
  3. Quét thẻ RFID của sinh viên (đã nằm trong danh sách Whitelist).
- **Quan sát thiết bị:**
  - Rơ le (Relay) cửa mở (Khoá điện từ nhả chốt).
  - Loa Buzzer kêu 1 tiếng bíp dài báo hiệu hợp lệ.
  - Serial Monitor in ra: `[RFID] [OFFLINE] ✅ UID found in whitelist`.
- **Đánh giá phần Cứng:** Thiết bị vẫn phục vụ sinh viên ra/vào bình thường dù hệ thống sập mạng.
- *(Lưu ý Roadmap)*: Web Admin hiện tại đã được cấu hình frontend để sẵn sàng tô màu đỏ cảnh báo (Vượt rào cúp điện) khi API push dữ liệu log offline lên server.

## 5. Kịch bản 4: Chặn truy cập trái phép khi Offline
- **Hành động:**
  1. Đảm bảo ESP32 đang trong trạng thái Offline (tắt Hotspot).
  2. Quét thẻ RFID lạ (chưa đăng ký) hoặc thẻ của sinh viên tòa nhà khác.
- **Quan sát thiết bị:**
  - Rơ le đóng chặt, cửa không mở.
  - Loa Buzzer kêu 3 tiếng bíp ngắn liên tục báo hiệu từ chối.
  - Serial Monitor in ra: `[RFID] [OFFLINE] ❌ UID not in whitelist`.
- **Đánh giá:** Bảo mật vật lý được đảm bảo tuyệt đối kể cả khi mất kết nối máy chủ.
