# FEATURE ROADMAP: Tích hợp Quản lý Vi phạm & Kỷ luật (Violation & Discipline Management)

## 1. VISION (Tầm nhìn)
Dựa trên **Bản cam kết Ký túc xá** thực tế của Trường Đại học Công nghệ Sài Gòn (STU), hệ thống cần một phân hệ (module) riêng biệt để Ban Quản lý KTX (BQL KTX) theo dõi, ghi nhận và xử lý các hành vi vi phạm nội quy của sinh viên (như hút thuốc, nấu ăn, về trễ, gây ồn ào,...). 
Thay vì quản lý trên sổ sách thủ công, toàn bộ lịch sử vi phạm sẽ được số hóa, liên kết trực tiếp với hồ sơ sinh viên, tự động bắn thông báo `WARNING` và có thể ảnh hưởng đến quyết định gia hạn lưu trú trong các học kỳ tiếp theo.

## 2. BUSINESS FLOW (Luồng nghiệp vụ)
1. **Khởi tạo dữ liệu nền (Legal Basis):** Khi sinh viên làm thủ tục Check-in, hệ thống đã tự động kết xuất (export) `commitment_form.html` thành file PDF có chứa 11 điều khoản nội quy nghiêm ngặt. Sinh viên mặc định đã ký xác nhận điện tử.
2. **Ghi nhận vi phạm:**
   - Khi phát hiện vi phạm, Admin truy cập chức năng **"Lập biên bản vi phạm"** trên Dashboard.
   - Admin chọn sinh viên, chọn lỗi vi phạm từ danh sách Enum (đã map với 11 điều khoản trong Bản cam kết).
   - Admin đính kèm minh chứng (ảnh chụp, camera an ninh nếu có).
3. **Cảnh báo tự động (Notification System):**
   - Sau khi lưu, hệ thống phát ra sự kiện `StudentViolatedEvent`.
   - Notification Router (đã xây dựng sẵn kiến trúc) sẽ "hứng" sự kiện, tự động cấu hình payload dạng `NotificationType.WARNING` và bắn Push Notification (In-App) + Email nhắc nhở/cảnh cáo tới sinh viên.
4. **Xử lý kỷ luật:** 
   - Tùy theo mức độ (Cảnh cáo, Ghi sổ hạnh kiểm, Buộc ra khỏi KTX), hệ thống có thể kích hoạt các luồng tiếp theo (ví dụ: tự động khóa thẻ Smart Access nếu bị buộc ra khỏi KTX).

## 3. IMPLEMENTATION ROADMAP (Lộ trình triển khai - Phase 2)

### Backend (`sdms-backend`)
- [ ] Thiết kế Bảng `student_violations` (`violation_id`, `student_id`, `rule_code`, `severity`, `description`, `reported_by`, `status`, `evidence_url`).
- [ ] Định nghĩa `ViolationRuleEnum` dựa sát 100% vào các khoản 1-11 của bản cam kết (Ví dụ: `CONTRABAND_DRUGS`, `COOKING_IN_ROOM`, `UNAUTHORIZED_GUEST`, v.v.).
- [ ] Xây dựng REST API: `POST /api/v1/admin/violations`, `GET /api/v1/admin/violations`, `PUT /api/v1/admin/violations/{id}/resolve`.
- [ ] Tạo Event `StudentViolatedEvent` và xử lý bắn `WARNING` Notification qua `NotificationEventListener`.

### Frontend (`sdms-frontend`)
- [ ] Xây dựng UI/UX trang **Discipline Management**.
- [ ] Thêm tab "Lịch sử vi phạm" vào component `StudentProfileDetail`.
- [ ] Render huy hiệu (badge) "Cảnh báo đỏ" trên Dashboard nếu sinh viên có vi phạm chưa xử lý.

## 4. TRIGGER PROMPT (Dành cho Agent ở Tương lai)
Khi cần triển khai tính năng này, hãy cung cấp cho Agent prompt sau:
> "Hãy thực hiện tính năng Quản lý Vi phạm dựa trên tài liệu docs/roadmap/features/012_VIOLATION_AND_DISCIPLINE_MANAGEMENT.md. Bắt đầu bằng việc tạo Entity và Enum ở Backend, nhớ kiểm tra lại HTML template commitment_form.html để map các điều luật cho chuẩn xác."
