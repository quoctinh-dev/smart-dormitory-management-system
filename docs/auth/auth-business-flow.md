# Authentication Business Flows

Tài liệu này mô tả chi tiết các luồng nghiệp vụ (Business Flow) liên quan đến Module Authentication của hệ thống SDMS.

## 1. Student Login Flow

**Business Flow:**
Xác thực danh tính của sinh viên qua Username/Email và Password để cấp quyền truy cập hệ thống.

**Sequence:**
1. Client (Mobile App) gửi `POST /api/v1/auth/login` với `usernameOrEmail` và `password`.
2. Hệ thống Validate payload.
3. Tìm kiếm tài khoản trong Database theo Username hoặc Email.
4. Kiểm tra trạng thái tài khoản (ACTIVE, PENDING_ACTIVATION, LOCKED).
5. So khớp mật khẩu đã hash (BCrypt).
6. Tạo JWT Access Token và Refresh Token.
7. Lưu Refresh Token, thời gian hết hạn và `lastLogin` vào database.
8. Ghi log Audit (Login Success).
9. Trả về `AuthResponse` chứa Access Token và Refresh Token cho Client.

**Validation:**
- `usernameOrEmail`: Bắt buộc, không được để trống.
- `password`: Bắt buộc, không được để trống.

**Error Cases:**
- Payload rỗng/sai định dạng -> `400 BAD_REQUEST` (`VALIDATION_FAILED`)
- Tài khoản không tồn tại -> `401 UNAUTHORIZED` (`INVALID_CREDENTIALS`)
- Sai mật khẩu -> `401 UNAUTHORIZED` (`INVALID_CREDENTIALS`)
- Tài khoản chưa kích hoạt (`PENDING_ACTIVATION`) -> `403 FORBIDDEN` (`ACCOUNT_PENDING_ACTIVATION`)
- Tài khoản bị khóa (`LOCKED`) -> `403 FORBIDDEN` (`ACCOUNT_LOCKED`)

**Success Cases:**
- Xác thực thành công -> `200 OK` (Trả về Token Pair).

---

## 2. Refresh Token Flow

**Business Flow:**
Gia hạn phiên đăng nhập cho người dùng bằng cách cấp phát một Access Token mới mà không bắt người dùng nhập lại mật khẩu. Cấp phát lại cả Refresh Token để thực hiện cơ chế Token Rotation (xoay vòng).

**Sequence:**
1. Client gửi `POST /api/v1/auth/refresh-token` với `refreshToken`.
2. Hệ thống validate Refresh Token (định dạng, chữ ký, hết hạn).
3. Lấy `username` từ Refresh Token.
4. Truy vấn database lấy `UserAccount`.
5. So sánh Refresh Token gửi lên với Refresh Token lưu trong Database (phòng chống Replay Attack).
6. Nếu khớp: Xóa Token cũ, sinh cặp Token mới, lưu vào Database.
7. Ghi Audit (Refresh Token).
8. Trả về `AuthResponse`.

**Validation:**
- `refreshToken`: Bắt buộc.

**Error Cases:**
- Token rỗng/sai định dạng -> `400 BAD_REQUEST`
- Token hết hạn hoặc không hợp lệ -> `401 UNAUTHORIZED` (`TOKEN_EXPIRED` / `TOKEN_INVALID`)
- Token gửi lên không khớp với Database (Dấu hiệu bị đánh cắp) -> `401 UNAUTHORIZED` (`REFRESH_TOKEN_REVOKED`) + Thu hồi ngay lập tức token hiện tại.
- Tài khoản bị khóa -> `403 FORBIDDEN` (`ACCOUNT_LOCKED`)

**Success Cases:**
- Cấp lại token thành công -> `200 OK`.

---

## 3. Logout Flow

**Business Flow:**
Chấm dứt phiên đăng nhập hiện tại bằng cách xóa Refresh Token khỏi Database.

**Sequence:**
1. Client gửi `POST /api/v1/auth/logout` kèm Access Token trong Header.
2. Hệ thống xác thực Access Token.
3. Lấy `UserAccount` đang đăng nhập.
4. Xóa (set null) `refreshToken` và `refreshTokenExpiry` trong Database.
5. Ghi Audit (Logout).
6. Trả về thông báo thành công.

**Validation:**
- Bắt buộc phải có `Authorization: Bearer <token>` hợp lệ.

**Error Cases:**
- Không có Access Token hoặc Token hết hạn -> `401 UNAUTHORIZED`

**Success Cases:**
- Đăng xuất thành công -> `200 OK`.

---

## 4. Activate Account Flow (First Login)

**Business Flow:**
Sinh viên mới nhận được Email chứa thông tin tài khoản và mật khẩu tạm thời (thường là số CCCD). Họ phải kích hoạt tài khoản và đổi mật khẩu ở lần đăng nhập đầu.

**Sequence:**
1. Client gửi `POST /api/v1/auth/activate` với `email`, `tempPassword`, và `newPassword`.
2. Tìm tài khoản bằng Email (có lock dòng database tránh Double Request).
3. Kiểm tra trạng thái phải là `PENDING_ACTIVATION`.
4. So khớp `tempPassword`.
5. Đổi sang `newPassword` (đã mã hóa) và chuyển trạng thái thành `ACTIVE`.
6. Tự động sinh Token Pair trả về cho người dùng (để Login luôn).
7. Ghi Audit (Account Activated).

**Error Cases:**
- Sai mật khẩu tạm -> `401 UNAUTHORIZED`
- Tài khoản đã ACTIVE -> `400 BAD_REQUEST`
- Tài khoản bị khóa -> `400 BAD_REQUEST`

**Success Cases:**
- Kích hoạt thành công -> `200 OK` (Kèm Token Pair).

---

## 5. Change Password Flow

**Business Flow:**
Người dùng đang đăng nhập muốn đổi mật khẩu bảo mật.

**Sequence:**
1. Client gửi `POST /api/v1/auth/change-password` với `oldPassword`, `newPassword`.
2. Xác thực JWT. Lấy UserAccount.
3. So khớp `oldPassword` với DB.
4. Mã hóa `newPassword` và lưu.
5. Thu hồi tất cả Token (set Refresh Token = null) để ép đăng xuất trên các thiết bị khác.
6. Ghi Audit (Password Changed).

**Error Cases:**
- Sai mật khẩu cũ -> `400 BAD_REQUEST` (`INVALID_PASSWORD`)

**Success Cases:**
- Đổi mật khẩu thành công -> `200 OK` (Client tự động logout).

---

## 6. Forgot Password & Reset Password Flow

**Business Flow:**
Khôi phục mật khẩu qua Email.

**Phase 1: Forgot Password (Request)**
1. Gửi `POST /api/v1/auth/forgot-password` với `email`.
2. DB check Email tồn tại không. Nếu không, bỏ qua (chống scan email).
3. Sinh Token bảo mật (Random Secure), hash nó và lưu vào DB (kèm Expire time 15p).
4. Gửi HTML Email chứa link kèm Token thô.

**Phase 2: Reset Password (Confirm)**
1. Gửi `POST /api/v1/auth/reset-password` với `token`, `newPassword`.
2. Hash token gửi lên và dò trong DB.
3. Check Expire time.
4. Đổi mật khẩu, xóa Token trong DB, xóa luôn Refresh Token hiện tại.
5. Trả về thành công.
