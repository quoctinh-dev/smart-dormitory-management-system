# TÍCH HỢP HỆ THỐNG KIỂM TOÁN DỮ LIỆU (AUDIT TRAIL) VÀ NHẬT KÝ HÀNH ĐỘNG (ACTION LOG)

## 1. Vision (Tầm nhìn)
Trong các hệ thống Enterprise, đặc biệt là hệ thống quản lý có sự tham gia của nhiều Role (Admin, Staff, Manager), việc truy vết xem "Ai đã làm gì, lúc nào, thay đổi dữ liệu từ A thành B" là bắt buộc để đảm bảo an ninh (Security) và trách nhiệm giải trình (Accountability).
Tính năng này sẽ ghi điểm rất cao trong đồ án vì nó thể hiện độ chín chắn về mặt thiết kế hệ thống và đáp ứng yêu cầu khắt khe của hội đồng.

## 2. Các Mức độ (Levels) của Hệ thống Audit

### Mức độ 1: Database Auditing cơ bản (JPA Auditing)
Sử dụng **Spring Data JPA Auditing** để tự động gán thông tin Người tạo và Người sửa vào mọi bảng trong cơ sở dữ liệu.
- Bổ sung trường `@CreatedBy` (`created_by`) và `@LastModifiedBy` (`updated_by`) vào class `BaseEntity`.
- **Cơ chế:** Khi có request API thêm/sửa, Spring Security Context sẽ tự động inject ID hoặc Username của người dùng hiện tại (lấy từ JWT Token) vào các trường này.
- **Mục tiêu:** Giúp dễ dàng truy vấn một bản ghi được tạo bởi ai.

### Mức độ 2: Action Log nâng cao bằng Spring AOP
Viết riêng một bảng `audit_logs` (hoặc cấu hình ElasticSearch/MongoDB nếu cần mở rộng) để lưu từng vết (Trail).
- **Trường dữ liệu:** `id`, `actor_id` (người thực hiện), `actor_ip` (IP), `action_type` (VD: `DELETE_ROOM`, `APPROVE_APPLICATION`), `entity_name`, `entity_id`, `old_value` (dữ liệu trước khi sửa), `new_value` (dữ liệu sau khi sửa), `created_at`.
- **Triển khai bằng Aspect-Oriented Programming (AOP):**
  - Tạo custom annotation `@AuditLog(action = "DELETE_ROOM")`.
  - Dán annotation này lên các method trong Controller.
  - Spring AOP sẽ tự động đánh chặn (intercept) request, lấy ID người dùng từ Security Context, lấy dữ liệu request, và ghi log ngầm mà không làm ảnh hưởng (hoặc làm rối) luồng code Business Logic chính (Clean Code).

## 3. Lộ trình triển khai (Roadmap)

### Bước 1: Kích hoạt JPA Auditing
1. Tạo một bean `AuditorAwareImpl` implements `AuditorAware<String>`. Nó sẽ trích xuất tên tài khoản từ `SecurityContextHolder`.
2. Gắn `@EnableJpaAuditing(auditorAwareRef = "auditorAwareImpl")` vào file config chung.
3. Thêm `@CreatedBy`, `@LastModifiedBy` vào `BaseEntity` và tiến hành migration DB.

### Bước 2: Viết Aspect cho Action Log
1. Thêm bảng `action_audit_logs` vào DB.
2. Viết class `@Aspect` và `@Around` để bao bọc (wrap) các API nhạy cảm.
3. Cập nhật Frontend UI để có thêm một tab "Lịch sử Hệ thống" (Audit Logs Viewer) dành riêng cho Super Admin.

## 4. Lời nhắc gọi (Trigger Prompt) cho Agent
Khi bạn muốn bắt đầu làm, hãy copy prompt này đưa cho Agent:

```text
Xin chào Agent, hãy triển khai Hệ thống Audit (Mức 1 và Mức 2) dựa theo tài liệu `docs/roadmap/features/013_SYSTEM_AUDIT_LOG_AND_JPA_AUDITING.md`. Đầu tiên, hãy set up JPA Auditing vào BaseEntity. Tiếp theo, viết một AOP Aspect để lưu Audit Log.
```
