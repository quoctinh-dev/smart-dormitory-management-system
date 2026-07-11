# TÀI LIỆU ROADMAP: CHỨC NĂNG BÁO HỎNG CƠ SỞ VẬT CHẤT (MAINTENANCE REQUEST)

## 1. Vision (Tầm nhìn)
Giúp sinh viên có thể chủ động báo cáo các sự cố hỏng hóc cơ sở vật chất (điện, nước, giường, tủ...) trong phòng ký túc xá trực tiếp thông qua Mobile App. Admin có thể tiếp nhận, xem xét và phân công nhân viên kỹ thuật đến sửa chữa, theo dõi tiến độ từ lúc "Tiếp nhận" đến khi "Hoàn thành".

## 2. Business Flow (Luồng nghiệp vụ)
1. **Sinh viên:** Mở App -> Chọn "Báo hỏng" -> Chọn loại thiết bị hỏng -> Điền mô tả và tải ảnh đính kèm (tùy chọn) -> Gửi yêu cầu.
2. **Hệ thống Backend:** Lưu yêu cầu với trạng thái `PENDING` (Chờ xử lý). Có thể gửi thông báo (Notification) cho Ban quản lý (Admin).
3. **Admin (Web):** Xem danh sách yêu cầu -> Chuyển trạng thái sang `IN_PROGRESS` (Đang sửa chữa) và phân công thợ.
4. **Admin (Web):** Sau khi sửa xong, chuyển trạng thái sang `RESOLVED` (Đã khắc phục) hoặc `REJECTED` (Từ chối - nếu báo cáo ảo).
5. **Sinh viên:** Nhận được thông báo cập nhật trạng thái sửa chữa trên App.

## 3. Database Schema (Dự kiến)
- **Table `maintenance_requests`**: 
  - `id` (UUID, PK)
  - `student_id` (UUID, FK tới `student`)
  - `room_id` (UUID, FK tới `room`)
  - `issue_type` (Enum: ELECTRICITY, PLUMBING, FURNITURE, OTHER)
  - `description` (Text)
  - `image_url` (Varchar, optional)
  - `status` (Enum: PENDING, IN_PROGRESS, RESOLVED, REJECTED)
  - `admin_note` (Text)
  - `created_at`, `updated_at`

## 4. Implementation Roadmap (Kế hoạch triển khai)
- **Giai đoạn 1 (Backend):**
  - Tạo Enum `IssueType`, `MaintenanceRequestStatus`.
  - Tạo Entity `MaintenanceRequest` và Migration `V42__add_maintenance_requests.sql`.
  - Tạo Controller `MaintenanceRequestStudentController` (cho App).
  - Tạo Controller `MaintenanceRequestAdminController` (cho Web).
  - Viết Unit/Integration Test.
- **Giai đoạn 2 (Frontend - App):**
  - Tạo màn hình danh sách Yêu cầu sửa chữa.
  - Tạo Form gửi yêu cầu (hỗ trợ upload ảnh/text).
- **Giai đoạn 3 (Frontend - Web):**
  - Tạo màn hình Quản lý Yêu cầu sửa chữa cho Admin (Dạng bảng hoặc Kanban).
  - Tính năng cập nhật trạng thái và ghi chú.

## 5. Trigger Prompt (Dùng để kích hoạt Agent code Backend)
```text
Dựa vào roadmap FEAT_MAINTENANCE_REQUEST.md, hãy bắt đầu triển khai Giai đoạn 1 (Backend). Hãy tạo Entity MaintenanceRequest, file Migration Flyway, Repository và các DTO cần thiết. Nhớ tuân thủ các quy tắc trong AGENTS.md, đặc biệt là luật ApiResponse và LUẬT CHIỀU SÂU LUẬN VĂN (sử dụng Transactional và Log lại lịch sử chuyển trạng thái nếu cần). Làm từng bước và chờ tôi xác nhận.
```
