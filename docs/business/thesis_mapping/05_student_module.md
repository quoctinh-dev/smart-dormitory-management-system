# PHÂN TÍCH MODULE SINH VIÊN & TÀI KHOẢN (STUDENT & ACCOUNT) – LUẬN VĂN SDMS
> Cập nhật: 09/07/2026 | Đã quét code thực tế | Phù hợp THESIS_DEPTH_RULE

---

## Chương 1: Giới thiệu

### 1.1. Đặt vấn đề, mục tiêu
- **Đặt vấn đề:** Hệ thống KTX cần quản lý thông tin lưu trú của sinh viên độc lập với định danh đăng nhập. Nếu sinh viên vi phạm kỷ luật hoặc tạm nghỉ học, hệ thống cần chặn quyền truy cập (khóa tài khoản) mà không làm mất hồ sơ và lịch sử cư trú.
- **Mục tiêu:** Tách biệt rõ ràng giữa "Hồ sơ cư trú" (`Student`) và "Định danh xác thực" (`UserAccount`). Áp dụng cơ chế vô hiệu hóa (Deactivate) thay vì xóa cứng dữ liệu.

### 1.2. Thách thức kỹ thuật và nghiệp vụ
| Thách thức | Giải pháp áp dụng (Đã triển khai) |
|---|---|
| Chống lộ lọt thông tin (IDOR) | API cập nhật profile không nhận `studentId`, lấy từ Token (`SecurityContextHolder`). |
| Chống mất mát dữ liệu kế toán/lịch sử | 100% sử dụng **Soft Delete** (`is_deleted`) qua `@SQLDelete` của Hibernate. |
| Xử lý kỷ luật/tạm ngưng | Sử dụng trạng thái `LOCKED` trên `UserAccount`, không xóa profile. |

---

## Chương 2: Thiết kế hệ thống (Kiến trúc dữ liệu)

### 2.1. Quan hệ Student - UserAccount
- `Student`: Chứa thông tin nghiệp vụ (Họ tên, CCCD, Ngành học, Mã RFID, Người thân). Liên kết 1-1 không thay đổi (updatable = false) với `DormitoryApplication`.
- `UserAccount`: Xử lý đăng nhập, cấp quyền (Role), token JWT. 
- **Thiết kế phân rã (Decoupling):** `UserAccount` có liên kết 1-1 với `Student`. Nhờ đó, Admin có thể tạo tài khoản `STAFF` mà không cần sinh ra `Student` ảo.

### 2.2. Cơ chế xóa an toàn (Soft Delete & Deactivation)
Hệ thống **không sử dụng lệnh DELETE cứng**. Mọi thao tác xóa được chuyển hướng:
```java
@Entity
@Table(name = "user_accounts")
@org.hibernate.annotations.SQLDelete(sql = "UPDATE user_accounts SET is_deleted = true WHERE account_id=?")
@org.hibernate.annotations.SQLRestriction("is_deleted = false")
public class UserAccount extends BaseEntity { ... }
```
- Khi khóa tài khoản, Admin chuyển `status = LOCKED`. Spring Security sẽ kiểm tra thông qua hàm `isAccountNonLocked()` và từ chối cấp Token lập tức.

---

## Chương 3: API Permission Matrix (Bảo mật truy cập)

### 3.1. StudentController (`/api/v1/students`)
| Method | Endpoint | PreAuthorize / Security | Mô tả |
|--------|----------|-----------------------|-------|
| GET | `/me` | `hasRole('STUDENT')` | Xem profile cá nhân (Dựa trên JWT) |
| PATCH | `/me` | `hasRole('STUDENT')` | Cập nhật profile (Email, Phone, Phụ huynh) |
| POST | `/{studentId}/rfid`| `hasAnyRole('ADMIN', 'MANAGER')` | Gán thẻ từ IoT cho sinh viên |

### 3.2. AccountAdminController (`/api/v1/admin/accounts`) 
*(Ánh xạ từ Frontend: `AccountManagementPage.tsx`)*
| Method | Endpoint | PreAuthorize / Security | Mô tả |
|--------|----------|-----------------------|-------|
| GET | `/` | `hasRole('ADMIN')` | Lấy danh sách tài khoản (phân trang, lọc) |
| POST | `/staff` | `hasRole('ADMIN')` | Tạo tài khoản nhân viên (Staff) |
| PUT | `/{id}/toggle-lock`| `hasRole('ADMIN')` | Khóa / Mở khóa tài khoản |
| GET | `/{id}/student-profile`| `hasRole('ADMIN')` | Xem hồ sơ SV đính kèm với tài khoản |

---

## Chương 4: Định hướng Tương lai (Roadmap)

Dựa trên yêu cầu tối ưu chiều sâu luận văn, một số tính năng sẽ được bảo lưu để phát triển trong giai đoạn sau:

1. **Hệ thống Nhật ký Kiểm toán (Audit Log Tracking):**
   - *Hiện trạng:* Entity đã có `created_at`, `updated_at`, `is_deleted`.
   - *Tương lai:* Sẽ bổ sung `created_by` và `updated_by` vào `BaseEntity` kết hợp với tính năng ghi Log đa lớp (Lưu chi tiết ai đã đổi trạng thái phòng/ai duyệt đơn) khi tiến hành tối ưu hóa sau cùng.
2. **Kiểm soát mật khẩu và Brute-force:**
   - Hoàn thiện luồng khóa tài khoản tự động (auto-lock) khi nhập sai mật khẩu quá 5 lần (Trường `failedLoginAttempts` đã có sẵn trong DB).
