# BUSINESS ASSUMPTIONS

## Purpose
Ghi nhận các giả định về môi trường vận hành thực tế mà mã nguồn SDMS đang dựa vào. Mỗi giả định phải có bằng chứng từ source code.

## Scope
Giới hạn môi trường vật lý, số lượng thiết bị, và quy mô tổ chức KTX được phản ánh qua code.

## Source of Truth
Cấu trúc Database Schema, hardcode logic, cấu trúc module.

## Contents

### BA-001: Điểm Truy cập (Access Point) không có bảng riêng
*   **Assumption:** `gate_id` được lưu trong `access_history` dạng chuỗi/UUID do ESP32 truyền lên. Không có bảng `gates` riêng trong DB.
*   **Impact:** Không thể query danh sách cổng từ DB. Quản trị cổng phụ thuộc vào cấu hình phần cứng.
*   **Evidence:** Bảng `access_history` có cột `gate_id` nhưng không có Foreign Key đến bảng `gates`.

### BA-002: ESP32 là Thin Client
*   **Assumption:** Mọi logic xác thực (kiểm tra giới nghiêm, kiểm tra khuôn mặt, đánh giá chính sách) được thực hiện hoàn toàn trên Server. ESP32 chỉ đóng vai trò đầu đọc và chấp hành lệnh.
*   **Impact:** Nếu mất kết nối mạng, cổng không hoạt động (không có offline mode).
*   **Evidence:** Toàn bộ logic trong `AccessEvaluationService` — nhận input, trả output `AccessDecision`. ESP32 không xử lý logic.

### BA-003: Quy mô triển khai: Một Tòa nhà
*   **Assumption:** Hệ thống hướng tới mô hình thu gọn: 1 Tòa nhà → nhiều Tầng → nhiều Phòng → nhiều Giường. Chính sách (`CurfewPolicy`, `TimeWindowPolicy`) được gắn với `building_id`, không phải từng cổng riêng lẻ.
*   **Impact:** Nếu cần triển khai nhiều tòa nhà với chính sách khác nhau, cần mở rộng schema.
*   **Evidence:** `CurfewPolicy.building_id`, `Building → Floor → Room → Bed` hierarchy trong migrations.

### BA-004: AI Server chạy độc lập (Python)
*   **Assumption:** Việc trích xuất Vector khuôn mặt được thực hiện bởi một Python Server riêng biệt. Spring Boot đóng vai Orchestrator, gọi AI Server qua REST khi Admin duyệt ảnh.
*   **Impact:** Hệ thống phụ thuộc tính sẵn sàng của AI Server. Nếu AI Server down, luồng WF-04 bị gián đoạn.
*   **Evidence:** `RestAiExtractionAdapter.java`, `AiExtractionPort.java` (module `face`).

### BA-005: Thanh toán qua SePay (Bank Transfer + QR)
*   **Assumption:** Hệ thống không xử lý thanh toán trực tiếp. Tất cả đều qua SePay Gateway bằng cơ chế Bank Transfer hoặc QR Code. Webhook SePay là nguồn duy nhất để xác nhận giao dịch.
*   **Impact:** Phụ thuộc dịch vụ bên thứ ba. Nếu SePay down, Bill không thể được đánh dấu `PAID` tự động.
*   **Evidence:** `SepayWebhookController`, `SepayService`, `SepayReconciliationJob`.

### BA-006: Lưu trữ file ảnh trên Cloudinary
*   **Assumption:** Mọi ảnh (khuôn mặt, bằng chứng thanh toán, báo cáo sự cố) được upload thẳng lên Cloudinary. Server không lưu file cục bộ.
*   **Impact:** Phụ thuộc Cloudinary API. URL ảnh có thể thay đổi nếu migrate sang service khác.
*   **Evidence:** `CloudinaryService.java` (module `upload`).

## Related Documents
- [BUSINESS_DECISIONS](./BUSINESS_DECISIONS.md)
