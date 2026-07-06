# Hướng dẫn Đọc Tài liệu Phân hệ Smart Access (AI / IoT)

Chào mừng bạn đến với hệ thống tài liệu cốt lõi của phân hệ **Smart Access**. 
Phân hệ này đảm nhiệm vai trò cực kỳ quan trọng trong SDMS: Kiểm soát ra vào KTX bằng công nghệ Nhận diện khuôn mặt (AI) và Thẻ từ (RFID), kết hợp với phần cứng (IoT ESP32).

Để giúp việc tìm hiểu, phát triển và tích hợp diễn ra trơn tru nhất, các tài liệu đã được chuẩn hóa và đánh số thứ tự ưu tiên đọc từ trên xuống dưới.

---

## 📖 Trình tự Đọc Khuyến nghị

### 1️⃣ Giai đoạn Thiết kế & Nghiệp vụ (Dành cho mọi đối tượng)
*   [01_SYSTEM_REQUIREMENTS.md](./01_SYSTEM_REQUIREMENTS.md)
    *   **Nội dung:** Tài liệu đặc tả yêu cầu phần mềm (SSR). Liệt kê chi tiết các Use Case, Actor và các Ràng buộc phi chức năng (Thời gian phản hồi, độ trễ MQTT).
    *   **Mục đích:** Hiểu hệ thống cần PHẢI LÀM GÌ trước khi đi vào kỹ thuật.
*   [02_ARCHITECTURE_ROADMAP.md](./02_ARCHITECTURE_ROADMAP.md)
    *   **Nội dung:** Sơ đồ Kiến trúc tổng thể và Lộ trình phát triển.
    *   **Mục đích:** Hình dung bức tranh toàn cảnh về cách ESP32, Spring Boot, Python AI và PostgreSQL giao tiếp với nhau.

### 2️⃣ Giai đoạn Phân tích Luồng & Bảo mật (Dành cho Backend / Architect)
*   [03_ACCESS_CONTROL_FLOW.md](./03_ACCESS_CONTROL_FLOW.md)
    *   **Nội dung:** Tài liệu cực kỳ quan trọng mô tả Luồng Xử Lý (Sequence/Flow) từ lúc sinh viên quét thẻ cho đến khi mở cửa. 
    *   **Bao gồm:** Logic xử lý Idempotency, Kiểm tra giới nghiêm, và Phân quyền RBAC tĩnh (Sự khác biệt giữa ADMIN và STAFF).
*   [04_EVENT_AND_MQTT_INTEGRATION.md](./04_EVENT_AND_MQTT_INTEGRATION.md)
    *   **Nội dung:** Danh sách các Sự kiện (Domain Events) trong Spring Boot và các Topic MQTT được sử dụng để giao tiếp với thiết bị IoT.
    *   **Mục đích:** Dùng để ánh xạ Event -> Payload MQTT.

### 3️⃣ Giai đoạn Kiểm thử & Đánh giá (Dành cho QA / Giảng viên / Hội đồng)
*   [05_AUDIT_REPORT.md](./05_AUDIT_REPORT.md)
    *   **Nội dung:** Báo cáo kiểm toán mã nguồn. Xác nhận những nghiệp vụ đã được code thành công.
*   [06_INTEGRATION_TEST_PLAN.md](./06_INTEGRATION_TEST_PLAN.md)
    *   **Nội dung:** Hướng dẫn chi tiết cách chạy Test Tích Hợp (Integration Test) cho 5 kịch bản chính, bao gồm cả Prompt AI để hỗ trợ kiểm thử tự động. Rất hữu ích khi đem đi demo/bảo vệ đồ án.

### 4️⃣ Tài liệu Tích hợp Mở rộng
*   [07_PROMPT_KOTLIN_APP.md](./07_PROMPT_KOTLIN_APP.md)
    *   **Nội dung:** Prompt/Hướng dẫn tích hợp dành cho Mobile App (Kotlin).
*   Thư mục **`esp32_integration/`**
    *   Chứa các tài liệu, hướng dẫn và mã nguồn liên quan trực tiếp đến việc nạp Firmware và cấu hình C/C++ cho mạch ESP32.

---

## 📌 Nguyên tắc Bảo trì Tài liệu
Theo **PROJECT_RULE.md**, mọi sự thay đổi trong cấu trúc Database, phân quyền (Role/Capabilities) hoặc Logic tính toán của Smart Access đều phải được cập nhật đồng thời vào các file `01_` đến `04_` tương ứng trước khi tiến hành code.
