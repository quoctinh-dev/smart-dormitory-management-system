# BẢN GIAO VIỆC (HANDOFF SUMMARY)

**Cập nhật lần cuối:** 2026-07-11

## 1. Hiện Trạng Hệ Thống (Current State)
* **Smart Access (IoT) & AI:** Đã hoàn thiện và test chéo 100% giữa Backend, Frontend, và Firmware (ESP32). AI đã nâng cấp lên 512-dimension vector nhúng (pgvector).
* **Quản lý Phòng (Room Management):** Đã phân tách thiết kế Domain-Driven: Thực thể `Room` sở hữu `PIN`, Admin dùng Frontend quản lý PIN (Tạo tự động, Cấu hình ẩn/hiện chống nhìn trộm). Hệ thống đã có luồng Gửi Thông Báo (Email & In-App) tự động khi mã PIN phòng thay đổi.
* **Database & Kiến trúc:** 
  - Đang ở Version `V44__add_room_pin_code_to_rooms.sql`.
  - Đã vạch ra chiến lược Tối ưu hóa CSDL (giảm từ 25 bảng xuống còn ~17 bảng thông qua các kỹ thuật Single Table Inheritance, Redis migration, Entity Normalization).
* **Tài liệu Báo cáo:** Các luồng nghiệp vụ IoT và Quản lý phòng đã được chốt và viết chuẩn vào `docs/business/thesis_mapping/room_module_thesis.md` và `sdms-iot-gateway/docs/devices/esp32-devkit-v1/README.md`.

## 2. Các Nhiệm Vụ Tiếp Theo (Next Tasks)
Agent tiếp theo vui lòng khởi động bằng cách lựa chọn 1 trong 3 công việc sau cùng với User:
1. **Module Hóa đơn & Điện nước (Payment & Utility):** Bắt đầu xây dựng/tinh chỉnh luồng thanh toán hóa đơn giữ chỗ, thanh toán điện nước hàng tháng.
2. **Module Đăng ký (Registration):** Hoàn thiện quy trình xét duyệt đơn xin vào KTX của sinh viên.
3. **Database Refactoring:** Thực hiện viết migration SQL để áp dụng chiến lược Tối ưu hóa Database đã đề xuất ở trên (Gộp các bảng Đơn từ thành 1 bảng `student_requests` sử dụng Single Table Inheritance, gộp `bills` và `payments`, v.v.).

> **Lưu ý cho Agent tiếp theo:** 
> Hãy tuân thủ nghiêm ngặt **LUẬT LƯU LỊCH SỬ (SESSION HISTORY RULE)** và đọc thật kỹ **GLOBAL AI WORKFLOW** trong `AGENTS.md` trước khi thao tác vào bất kỳ thư mục con nào. Mọi tài liệu thiết kế đều được coi là nguồn chân lý duy nhất (Single Source of Truth).
