# Admin Account Management API Specification

**Vị trí lưu trữ:** `docs/api/admin_account_management_api.md`
**Lý do lưu trữ:** Tập trung toàn bộ tài liệu đặc tả API liên quan đến Module Quản lý Tài khoản (Account) dành cho Admin/Staff vào thư mục `docs/api/` theo chuẩn Single Source of Truth của dự án. Không để rác tài liệu API rải rác trong Backend.

## 1. Tìm kiếm và Danh sách Tài khoản
- **Endpoint:** `GET /api/v1/admin/accounts`
- **Mục đích:** Lấy danh sách tài khoản, hỗ trợ tìm kiếm theo từ khóa (username, email) và lọc theo Role/Status. Hỗ trợ phân trang.
- **Quyền yêu cầu:** `ROLE_ADMIN` hoặc `ROLE_STAFF`
- **Request Parameters:**
  - `keyword` (String, optional): Từ khóa tìm kiếm.
  - `role` (String, optional): `ADMIN`, `STAFF`, hoặc `STUDENT`.
  - `status` (String, optional): `ACTIVE`, `LOCKED`, hoặc `PENDING_ACTIVATION`.
  - `page` (Integer, mặc định 0).
  - `size` (Integer, mặc định 10).
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Lấy danh sách tài khoản thành công",
    "data": {
      "content": [
        {
          "accountId": "uuid",
          "username": "admin",
          "email": "admin@dorm.edu.vn",
          "role": "ADMIN",
          "status": "ACTIVE",
          "lastLogin": "2026-07-08T10:00:00"
        }
      ],
      "pageNumber": 0,
      "pageSize": 10,
      "totalElements": 1,
      "totalPages": 1,
      "last": true
    }
  }
  ```

## 2. Thêm Nhân viên (Create Staff)
- **Endpoint:** `POST /api/v1/admin/accounts/staff`
- **Mục đích:** Tạo một tài khoản nhân viên (Staff) mới. Không tạo Profile phức tạp, chỉ tạo Account.
- **Quyền yêu cầu:** `ROLE_ADMIN`
- **Request Body:**
  ```json
  {
    "username": "staff1",
    "email": "staff1@dorm.edu.vn",
    "password": "securepassword123"
  }
  ```
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Tạo tài khoản Staff thành công",
    "data": null
  }
  ```

## 3. Khóa / Mở khóa Tài khoản (Toggle Lock)
- **Endpoint:** `PUT /api/v1/admin/accounts/{id}/toggle-lock`
- **Mục đích:** Khóa tài khoản đang hoạt động (Soft Delete / Block) hoặc mở khóa tài khoản đang bị khóa. Nếu khóa, `refreshToken` sẽ bị xóa để ép đăng xuất. Nếu mở khóa, số lần đăng nhập sai (`failedLoginAttempts`) sẽ được reset.
- **Quyền yêu cầu:** `ROLE_ADMIN`
- **Path Variable:**
  - `id` (UUID): ID của tài khoản.
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Cập nhật trạng thái thành công",
    "data": null
  }
  ```

## Architectural Notes
- **Không có API Cập nhật (Update Profile):** Hệ thống không cho phép Admin tự ý sửa chữa thông tin Username hay Profile của Sinh viên (đảm bảo tính Data Integrity).
- **Không có API Xóa cứng (Hard Delete):** Sử dụng Toggle Lock thay cho Delete để giữ lại Audit Log lịch sử truy cập.
