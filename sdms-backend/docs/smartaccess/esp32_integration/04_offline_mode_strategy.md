# Hướng dẫn Xử lý Sự cố & Vận hành Offline (ESP32 - Spring Boot)

Tài liệu này định hướng cách hệ thống Smart Access xử lý khi gặp các sự cố thực tế như mất mạng wifi, mất điện hoặc hỏng hóc thiết bị, đảm bảo hệ thống không bị tê liệt hoàn toàn.

---

## 1. Kịch bản 1: Mất kết nối Internet / Rớt Wifi tại Cổng
Thiết bị phần cứng (ESP32) tại cửa phụ thuộc vào Spring Boot và Python AI để mở cửa. Nếu mất mạng, hệ thống phải có cơ chế **Fallback (Dự phòng)**.

### Giải pháp: Chế độ Offline với thẻ RFID
Thay vì bắt sinh viên đứng chờ ngoài cửa, thiết bị sẽ chuyển sang trạng thái "Offline Mode" và sử dụng thẻ từ (RFID) thay cho Face ID.

**Cách hoạt động:**
1. **Đồng bộ dữ liệu (Khi có mạng):**
   - **Cơ chế PULL:** ESP32 gọi API `GET /api/v1/smartaccess/rfid-whitelist` khi khởi động để lấy toàn bộ danh sách thẻ.
   - **Cơ chế PUSH (MQTT):** Khi có sự kiện (Trả phòng, cấp thẻ mới), Backend (Spring Boot) sẽ tự động đẩy danh sách thẻ mới nhất dạng JSON xuống qua MQTT (`sdms/gates/system/whitelist`). ESP32 lắng nghe và lưu mảng `data` này vào bộ nhớ Flash/SD Card.
2. **Khi rớt mạng:** ESP32 tự động ngắt tính năng Face ID (vì không gửi ảnh lên server được). Khi sinh viên quẹt thẻ RFID, ESP32 sẽ dò trong danh sách đã lưu offline. Nếu khớp mã thẻ -> Mở cửa.
3. **Lưu lịch sử Offline:** ESP32 ghi nhận lại thời gian và mã thẻ vừa mở cửa vào thẻ nhớ.
4. **Khi có mạng trở lại:** ESP32 tự động gọi API đẩy toàn bộ lịch sử quẹt thẻ lúc mất mạng lên Spring Boot để đồng bộ dữ liệu vào `AccessHistory`.

---

## 2. Kịch bản 2: Microservice Python AI bị sập
Mạng vẫn có, ESP32 vẫn gửi ảnh lên Spring Boot được, nhưng con server Python đang bị sập (lỗi code, đầy RAM...).

### Giải pháp: Fallback & Thông báo lỗi rõ ràng
1. **Phía Spring Boot:** Khi `RestAiExtractionAdapter` gọi sang Python bị lỗi (Timeout, 500...), Spring Boot phải bắt lỗi (catch exception) thay vì crash toàn bộ hệ thống.
2. **Phản hồi cho ESP32:** Spring Boot trả về mã lỗi chuẩn cho mạch (VD: `{"status": "ERROR", "message": "AI Engine Down"}`).
3. **Xử lý tại cửa:** Mạch ESP32 khi nhận mã lỗi này có thể nháy đèn Đỏ 3 lần, phát loa "Hệ thống nhận diện đang bảo trì, vui lòng dùng thẻ từ".

---

## 3. Lộ trình Triển khai (Roadmap)
- **Giai đoạn 1 (Đã xong):** Xây dựng luồng Online 100% bằng Face ID.
- **Giai đoạn 2 (Đã xong Backend):** Viết thêm API đồng bộ mã RFID từ Spring Boot xuống ESP32.
- **Giai đoạn 3 (Chờ):** Viết API nhận gói dữ liệu "Offline Sync" từ ESP32 khi có mạng lại.
