# PHÂN TÍCH MODULE HỒ SƠ & ĐĂNG KÝ (APPLICATION & REGISTRATION) – LUẬN VĂN SDMS
> Cập nhật: 09/07/2026 | Đã quét code thực tế | Phù hợp THESIS_DEPTH_RULE

---

## Chương 1: Giới thiệu

### 1.1. Đặt vấn đề, mục tiêu
- **Đặt vấn đề:** Quá trình tuyển sinh và xét duyệt nội trú truyền thống tốn nhiều giấy tờ, dễ xảy ra thất lạc hồ sơ và khó theo dõi lịch sử trạng thái của từng sinh viên (đang chờ duyệt, đã duyệt, đã hủy).
- **Mục tiêu:** Số hóa toàn bộ quy trình từ khâu mở đợt đăng ký, nộp hồ sơ online đến khâu xét duyệt, lưu vết (Audit Trail) chặt chẽ từng thay đổi của hồ sơ.

### 1.2. Thách thức kỹ thuật và nghiệp vụ
| Thách thức | Giải pháp áp dụng (Đã triển khai) |
|---|---|
| Lưu vết lịch sử xét duyệt | Entity `DormitoryApplicationStatusHistory` tự động ghi lại mọi thay đổi trạng thái (từ trạng thái nào -> sang trạng thái nào, ai đổi, ghi chú gì). |
| Tránh lỗi xóa nhầm/thất thoát dữ liệu | Tích hợp **Soft Delete** (`@SQLDelete`) bắt buộc cùng với tính năng Optimistic Locking (`@Version`) cho Hồ sơ và Đợt đăng ký. |
| Bảo mật danh tính khi nộp hồ sơ | Người dùng công cộng (Public) chỉ có thể nộp và tra cứu hồ sơ qua CCCD/Application ID mà không cần tài khoản, các hành động phá hoại được ngăn chặn bằng UUID khó đoán. |

---

## Chương 2: Thiết kế hệ thống và Kiến trúc

### 2.1. Đợt đăng ký (Registration Period)
- Đóng vai trò là Aggregate Root quản lý thời gian diễn ra đợt nộp hồ sơ.
- Có các trường `startDate`, `endDate`, `stayStartDate`, `stayEndDate` để rào lại mốc thời gian.
- **Admin** có quyền Kích hoạt/Tắt các đợt đăng ký (`activate`/`deactivate`) thông qua `RegistrationAdminController`.

### 2.2. Hồ sơ nội trú (Dormitory Application)
- Chứa toàn bộ thông tin cá nhân (CCCD, địa chỉ, người thân, học vấn). Dữ liệu này là Snapshot thô, sau khi thanh toán thành công sẽ được đồng bộ sang `Student` Profile chính thức.
- **Optimistic Locking:** Sử dụng annotation `@Version private Long version;` để tránh xung đột dữ liệu (Concurrency/Race Condition) khi 2 Admin cùng lúc xét duyệt 1 hồ sơ.

### 2.3. Lịch sử trạng thái (Audit Trail)
Mỗi lần chuyển trạng thái (Draft -> Submitted -> Under_Review -> Approved), hệ thống ghi log vào bảng `dormitory_application_status_history`:
- `from_status`
- `to_status`
- `changed_by_user_id`
- `changed_at`
*(Đây là minh chứng rõ rệt cho việc tuân thủ THESIS_DEPTH_RULE - Bắt buộc có Audit Trail).*

---

## Chương 3: API Permission Matrix (Bảo mật truy cập)

### 3.1. ApplicationController (Public / Sinh viên)
| Method | Endpoint | PreAuthorize / Security | Mô tả |
|--------|----------|-----------------------|-------|
| POST | `/` | **Public** | Tạo đơn nháp (Lưu CCCD, TT cá nhân) |
| POST | `/{id}/submit` | **Public** | Chốt đơn chính thức |
| GET | `/{id}` | **Public** | Xem trạng thái đơn (UUID khó đoán) |
| GET | `/status` | **Public** | Tra cứu bằng CCCD |
| GET | `/` | `hasAnyRole('ADMIN', 'STAFF')` | Lấy danh sách toàn bộ hồ sơ |

### 3.2. ApplicationReviewController (Quản lý)
| Method | Endpoint | PreAuthorize / Security | Mô tả |
|--------|----------|-----------------------|-------|
| PATCH | `/{id}/start-review`| `hasAnyRole('ADMIN', 'STAFF')`| Bắt đầu duyệt |
| PATCH | `/{id}/approve` | `hasAnyRole('ADMIN', 'STAFF')`| Phê duyệt đơn |
| PATCH | `/{id}/reject` | `hasAnyRole('ADMIN', 'STAFF')`| Từ chối đơn |
| PATCH | `/{id}/request-revision`| `hasAnyRole('ADMIN', 'STAFF')`| Yêu cầu SV bổ sung/sửa đổi |

---

## Chương 4: Nợ kỹ thuật (Technical Debt) & Cải tiến

### 4.1. Khắc phục Technical Debt trong phiên làm việc
- Đã khắc phục việc thiếu hụt cơ chế **Soft Delete** ở `RegistrationPeriod` và `DormitoryApplication`. Trước đây nếu gọi hàm `.delete()`, dữ liệu sẽ bị bay màu hoàn toàn (Hard Delete). Đã bổ sung `@SQLDelete(sql = "UPDATE dormitory_applications SET is_deleted = true WHERE application_id=? AND version=?")` kết hợp cùng Optimistic Locking.

### 4.2. Roadmap tương lai
- Hoàn thiện UI Admin Dashboard để hiển thị bảng Lịch sử trạng thái (Audit Trail) giúp Ban quản lý truy vết ai duyệt/hủy hồ sơ.
