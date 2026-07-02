# TỔNG QUAN NGỮ CẢNH DỰ ÁN SDMS (HỆ THỐNG SMART ACCESS)
*Ngày tạo: 02/07/2026*

## 1. Bối cảnh dự án (SDMS)
- **Tên dự án:** Smart Dormitory Management System (SDMS).
- **Mục tiêu:** Hệ thống quản lý Ký túc xá, tích hợp phần cứng mở cửa bằng Face ID (ESP32-CAM) và App quản lý cho sinh viên (Mobile Kotlin).

## 2. Trạng thái mã nguồn hiện tại
Qua quá trình Audit toàn bộ mã nguồn, dự án đang ở giai đoạn **Tích hợp hệ thống (System Integration)** với tiến độ các khối như sau:
- **Mobile App (Kotlin):** Hoàn thiện 85%. Đã làm rất tốt luồng UI, Liveness Detection (nháy mắt, mỉm cười).
- **Backend (Spring Boot):** Hoàn thiện 80%. Đã có đầy đủ logic phân quyền (Smart Access, Curfew, Time Window), Database và API. Tuy nhiên, API trích xuất Face Vector đang bị "Mock" dữ liệu vì chưa có AI Engine thực tế.
- **Phần cứng IoT (ESP32-CAM):** 0%. Mới chỉ dừng lại ở code Camera Web Server thụ động, chưa có khả năng tự chụp ảnh gửi lên Server.
- **AI Engine:** Đang bị đứt gãy. Mobile App có nhúng TFLite sinh vector 192-d nhưng không gửi lên server. Backend thì cấu hình chờ gọi sang Python server.

## 3. Kiến trúc đã chốt (Backend-Centric AI)
Để khắc phục sự "lệch pha" giữa các khối và giải quyết điểm yếu phần cứng của ESP32, kiến trúc đã chốt là **Sử dụng Python AI Sidecar**:

1. **Phân hệ Mobile App:** Chỉ đóng vai trò kiểm tra Liveness. Sau khi xác nhận sinh viên là người thật, App upload thẳng ảnh (URL) lên Spring Boot. Bỏ qua bước trích xuất Vector tại App. Tính năng Offline TFLite sẽ được sửa thành "Face Login" cho app.
2. **Phân hệ Python AI (Microservice mới):** Chạy FastAPI. Dùng mô hình `mobile_face_net.tflite`. Có 1 API `POST /extract` nhận ảnh và trả về mảng Float 192 chiều.
3. **Phân hệ Spring Boot (Core):**
   - Sửa file `RestAiExtractionAdapter.java` để gọi thật sang API của Python.
   - Viết thêm 1 Controller `POST /api/v1/smart-access/door-capture` để nhận ảnh từ mạch ESP32.
   - Backend sẽ tự tính toán khoảng cách vector (Euclidean) tìm ra sinh viên và đánh giá quyền ra vào.
4. **Phân hệ ESP32-CAM:** Đóng vai trò Client. Dùng PIR/Nút nhấn để chụp ảnh, gửi HTTP POST lên Spring Boot, chờ kết quả `GRANTED` để bật Relay cửa.

## 4. Công việc tiếp theo (Cần làm ngay)
1. Viết mã nguồn cho **Python FastAPI Microservice** (Load TFLite, bóc tách Vector).
2. Viết thêm **Controller API cho Spring Boot** để nhận ảnh từ Cửa (ESP32) và thực hiện tính toán so khớp khuôn mặt.
3. Viết Firmware **C++ (Arduino)** cho ESP32-CAM.
