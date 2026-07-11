# HƯỚNG DẪN ĐỌC TÀI LIỆU (DOCS ORIENTATION)

Thư mục `docs/` này chứa toàn bộ các đặc tả kỹ thuật, kịch bản kiểm thử, và cấu hình mạng (Network) cho phân hệ Smart Access IoT.

Vì tính chất phức tạp của việc tích hợp phần cứng và phần mềm, vui lòng đọc các tài liệu theo trình tự BẮT BUỘC sau đây:

## 1. Bản Đồ Trọng Tâm (Entry Points)
- **[Tài liệu Tham chiếu Chéo (Mapping)](references/SMART_ACCESS_REFERENCE.md):** Đọc file này đầu tiên để biết cách ánh xạ sang Backend. Nó giúp bạn hiểu "Tại sao" hệ thống lại quyết định mở cửa hay từ chối mở cửa dựa trên Business Rule của Backend.
- **[Đặc tả Tích hợp ESP32 (Integration Contract)](ESP32_INTEGRATION_SPECIFICATION.md):** Hợp đồng giao tiếp (JSON, MQTT, HTTP) mà code C++ bắt buộc phải tuân theo để nói chuyện được với Backend.
- **[Kịch bản Kiểm thử Tích hợp (Test Guide)](SDMS_INTEGRATION_TEST_GUIDE.md):** Sách giáo khoa hướng dẫn giả lập hệ thống (Broker, AI, Backend) để debug và nghiệm thu mạch ESP32.

## 2. Các Thư Mục Con Khác
- **`hardware/`**: Chứa sơ đồ chân (Pinout) vật lý thực tế của ESP32 để cắm dây Relay, Camera, và Nút bấm đúng chuẩn, chống cháy nổ.
- **`network/`**: (Dành cho Network Engineer) Chứa các file thiết kế Packet Tracer giả lập kiến trúc mạng VLAN, Firewall, và ACL của KTX để đảm bảo an ninh bảo mật mạng IoT.
- **`images/`**: Nơi lưu trữ các hình ảnh minh họa cho tài liệu.
- **`references/`**: Chứa file định tuyến mapping về SSOT của Backend.
