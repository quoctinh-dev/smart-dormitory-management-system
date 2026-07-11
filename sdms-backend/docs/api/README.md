# BACKEND API CONTRACTS & SPECIFICATIONS

## 1. Mục đích (Purpose)
Thư mục này là **Single Source of Truth (SSOT)** cho các giao thức giao tiếp (API Contracts) giữa Backend (Spring Boot) và các client khác (Frontend Web, Mobile App, IoT Device, Python AI).
Dù dự án có nhiều module (Monorepo), nhưng **toàn bộ tài liệu đặc tả API phải nằm ở đây**, sát với mã nguồn Backend thực thi chúng, giúp Dev Backend dễ dàng cập nhật ngay khi sửa code.

## 2. Danh sách Tài liệu API (API Documents)

| File | Đối tượng Client | Mô tả nội dung |
|---|---|---|
| `auth-api.md` | Mobile App & Web Admin | Đặc tả API Xác thực (Login, Logout, Refresh Token, Forgot Password) và Bảng mã lỗi (Error Codes). |
| `notification-api.md` | Mobile App & Web Admin | Đặc tả API Thông báo In-App (Đọc danh sách, số lượng chưa đọc, đánh dấu đã đọc). |
| `v2-admin-web-api.md` | Web Admin (React) | API phục vụ BQL duyệt đơn Gia hạn, Trả phòng sớm. |
| `v2-student-app-api.md` | Mobile App (Flutter/React Native) | API cho sinh viên xem tiến độ lưu trú, xin gia hạn, nộp đơn trả phòng. |
| `face_registration_api.md` | Mobile App | Hướng dẫn tích hợp luồng upload ảnh khuôn mặt, lấy trạng thái duyệt. |
| `smart-access-api.md` | IoT (ESP32), Web Admin | Đặc tả giao tiếp MQTT/HTTP cho cổng kiểm soát, luồng nhận diện khuôn mặt, mở cửa từ xa. |
| `checkout-business-rules.md` | Mobile App & Web Admin | Bổ sung quy định về UI/UX và xử lý lỗi (400 Bad Request) khi xin trả phòng. |

## 3. Quy tắc cập nhật (Governance)
- Lập trình viên Backend có trách nhiệm **BẮT BUỘC** cập nhật các file markdown trong thư mục này ngay khi có sự thay đổi về Response Body, Request Body, hoặc mã lỗi HTTP trong Controller.
- Không được phép thay đổi Payload của API mà không cập nhật tài liệu ở đây, tránh làm crash ứng dụng Mobile/Frontend.
- Nếu tạo một module chức năng mới (VD: Báo cáo hỏng hóc), hãy tạo thêm một file `feature-name-api.md` vào thư mục này.
