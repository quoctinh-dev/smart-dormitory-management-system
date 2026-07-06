# Danh sách Error Codes (Auth Module)

Dưới đây là bảng chuẩn hóa các Error Codes mà Mobile App cần handle khi làm việc với module Auth.

| ErrorCode | HTTP Status | Message (Backend trả về) | Business Meaning | Client Action (App Android) |
| :--- | :--- | :--- | :--- | :--- |
| **VALIDATION_FAILED** | `400` | "Invalid input data" | Dữ liệu truyền lên bị thiếu hoặc sai định dạng (vd: password quá ngắn) | Highlight UI màu đỏ tại field bị sai, hiện text báo lỗi nhắc người dùng. |
| **INVALID_CREDENTIALS** | `401` | "Invalid username or password" / Mật khẩu không chính xác | User gõ sai tên đăng nhập hoặc mật khẩu | Hiển thị Toast/Snackbar báo sai thông tin. Xóa field password. |
| **TOKEN_EXPIRED** | `401` | "Token expired or invalid" | Access Token hết hạn | Ngầm gọi API Refresh Token. Nếu thành công -> Call lại API bị xịt. Nếu thất bại -> Đẩy về màn Login. |
| **TOKEN_INVALID** | `401` | "Token expired or invalid" | Access Token bị sai cấu trúc hoặc chữ ký không hợp lệ | Đẩy người dùng về màn hình Login ngay lập tức (Xóa Local Data). |
| **REFRESH_TOKEN_REVOKED** | `401` | "Invalid refresh token" | Refresh Token đã bị thu hồi (Do đổi mật khẩu, đăng xuất ở thiết bị khác, hoặc bị tấn công) | Force Logout. Hiện Dialog: "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại". |
| **ACCOUNT_PENDING_ACTIVATION**| `403` | "ACCOUNT_PENDING_ACTIVATION" | Tài khoản chưa được kích hoạt ở lần đầu | Chuyển hướng người dùng sang Màn hình Kích hoạt tài khoản (Activate Account Screen). |
| **ACCOUNT_LOCKED** | `403` | "Account is not active" / "Tài khoản đã bị khóa" | Tài khoản bị khóa do Admin thao tác hoặc nhập sai pass nhiều lần | Báo cho người dùng biết tài khoản đang bị khóa, yêu cầu liên hệ Ban quản lý. |
| **ACCOUNT_ALREADY_ACTIVE** | `400` | "Tài khoản đã được kích hoạt từ trước" | Cố tình gọi API `/activate` dù tài khoản đã active | Chuyển hướng người dùng về màn hình Login. |
| **INVALID_PASSWORD** | `400` | "Old password is incorrect" | Gõ sai mật khẩu cũ lúc gọi API Đổi mật khẩu | Báo lỗi field Mật khẩu cũ. |
| **TOKEN_INVALID_OR_EXPIRED**| `400` | "Invalid or expired password reset token" | Link Reset Password qua Email đã hết hạn (sau 15p) hoặc bị đổi | Thông báo link đã hết hạn, điều hướng user về luồng "Quên mật khẩu" lại từ đầu. |
| **UNAUTHORIZED** | `401` | "User is not authenticated" | Cố truy cập API cần Auth nhưng không có Header Authorization | Ngầm xử lý: Nếu có Refresh Token thì thử làm mới. Nếu không -> Force Logout. |

---

## Cấu trúc Error Response trả về từ Server

Khi bắt được Exception (nhờ `GlobalExceptionHandler`), backend sẽ trả về JSON như sau:

```json
{
  "success": false,
  "message": "Chi tiết lỗi (để debug hoặc show nếu không map ErrorCode)",
  "data": {
    "usernameOrEmail": "Must not be empty" // Khối data này thường có nếu là VALIDATION_FAILED
  }
}
```

*Đề xuất*: Backend hiện tại đang ném Message cứng thay vì ErrorCode enum ở một số chỗ. Backend Team cần tạo một class `ErrorCode` enum và ném `new AppException(ErrorCode.INVALID_CREDENTIALS)`. Tạm thời Mobile App có thể map logic dựa trên `HTTP Status` và logic luồng API.
