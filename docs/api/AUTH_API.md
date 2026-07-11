# API TÀI LIỆU XÁC THỰC (AUTHENTICATION & AUTHORIZATION API)

**Phạm vi áp dụng:** Web (`sdms-frontend`) và Mobile App (`sdms-mobile-app`).
**Base URL:** `/api/v1/auth`
**Module Backend tương ứng:** `com.sdms.backend.modules.auth`

Tài liệu này được tạo dựa trên Source Code Backend thực tế (`AuthController`, `LoginRequest`, `AuthResponse`) để Agent Mobile App sử dụng làm cơ sở Audit và Implement luồng đăng nhập.

---

## 1. PHÂN TÍCH KIẾN TRÚC ĐĂNG NHẬP (SINGLE LOGIN PAGE)

> **Trả lời câu hỏi của bạn:** *"Hiện tại sẽ chỉ có 1 trang đăng nhập cho cả admin và student vậy có lỗi gì không?"*
> 
> **Trả lời: Hoàn toàn KHÔNG lỗi. Đây là chuẩn Best Practice của hệ thống hiện đại.**
> Cả Admin, Staff và Student đều truy cập qua **CÙNG 1 ĐƯỜNG DẪN API `POST /api/v1/auth/login`** và cùng 1 màn hình UI. Khi Login thành công, Backend sẽ trả về `accessToken` (dạng JWT). Bản thân bên trong JWT Token này đã chứa thông tin `ROLE` (Ví dụ: `ROLE_STUDENT`, `ROLE_ADMIN`, `ROLE_STAFF`).
> 
> **Bên phía Mobile App (Kotlin) chỉ cần:**
> 1. Giải mã JWT (hoặc gọi API `/me` nếu có) để lấy Role.
> 2. Dùng lệnh rẽ nhánh (`if/else` hoặc `when` trong Kotlin Router):
>    - Nếu `ROLE_STUDENT` -> Chuyển sang màn hình `StudentDashboardActivity`.
>    - Nếu `ROLE_ADMIN` hoặc `ROLE_STAFF` -> Chuyển sang màn hình `AdminDashboardActivity`.

---

## 2. CHI TIẾT API CONTRACT

### 2.1. Đăng nhập (Login)
*   **Endpoint:** `POST /api/v1/auth/login`
*   **Description:** Xác thực người dùng và trả về JWT Tokens. Dùng chung cho mọi Role.
*   **Request Body (`LoginRequest`):**
    ```json
    {
      "usernameOrEmail": "string (bắt buộc, ví dụ: mssv hoặc email)",
      "password": "string (bắt buộc)"
    }
    ```
*   **Response (`ApiResponse<AuthResponse>`):**
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI...",
        "refreshToken": "eyJhbGciOiJIUzI...",
        "tokenType": "Bearer"
      }
    }
    ```
*   **Xử lý trên Client (Mobile/Web):** Lưu Access Token vào Memory/Secure Storage, dùng để gắn vào Header `Authorization: Bearer <Token>` cho các request sau.

### 2.2. Kích hoạt tài khoản (Activate Account)
*   **Endpoint:** `POST /api/v1/auth/activate`
*   **Description:** Sinh viên mới kích hoạt tài khoản bằng mật khẩu tạm (CCCD) và đổi mật khẩu mới.
*   **Request Body (`ActivateAccountRequest`):**
    ```json
    {
      "email": "string",
      "temporaryPassword": "string (Thường là số CCCD)",
      "newPassword": "string",
      "confirmPassword": "string"
    }
    ```
*   **Response:** `ApiResponse<AuthResponse>` (Trả về token đăng nhập luôn sau khi kích hoạt).

### 2.3. Làm mới Token (Refresh Token)
*   **Endpoint:** `POST /api/v1/auth/refresh-token` (hoặc `/refresh`)
*   **Request Body (`RefreshTokenRequest`):**
    ```json
    {
      "refreshToken": "string"
    }
    ```
*   **Response:** Trả về cặp `accessToken` và `refreshToken` mới.

### 2.4. Đăng xuất (Logout)
*   **Endpoint:** `POST /api/v1/auth/logout`
*   **Header yêu cầu:** `Authorization: Bearer <AccessToken>`
*   **Response:** `success: true`. Client phải tự xóa token khỏi Local Storage.

### 2.5. Các API Quản lý Mật khẩu
*   **Đổi mật khẩu:** `POST /api/v1/auth/change-password` (Cần Token)
*   **Quên mật khẩu:** `POST /api/v1/auth/forgot-password` (Nhập Email lấy mã)
*   **Đặt lại mật khẩu:** `POST /api/v1/auth/reset-password` (Dùng mã để tạo Pass mới)

---
**Tài liệu này đóng vai trò Single Source of Truth cho phần Authentication của phía Client.** Agent phụ trách Mobile App sẽ sử dụng tài liệu này để kiểm tra (Audit) và viết code tích hợp Retrofit API.
