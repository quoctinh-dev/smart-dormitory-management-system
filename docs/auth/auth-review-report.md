# Báo cáo đánh giá (Review Report) Module Auth - Enterprise Standard

**Người thực hiện**: Solution Architect / Senior Backend Engineer
**Mục tiêu**: Chuẩn hóa Module Auth chuẩn bị cho Release Version 1.0 (Integration với Mobile App).

---

## 1. Đánh giá Kiến trúc (Architecture Review)

### 1.1. Cấu trúc Package (Clean Architecture & Feature Module)
**Tình trạng hiện tại:** Tốt. Các class được nhóm theo Feature Module (`modules/auth`, `modules/user`). Phân chia thành các sub-package: `controller`, `dto/request`, `dto/response`, `service` rất rõ ràng.
**Nhận xét**: Tuân thủ chuẩn "Package by Feature" trong Spring Boot, giúp dễ dàng chia tách Microservices sau này nếu cần.

### 1.2. Controller Layer (`AuthController`)
**Tình trạng hiện tại:** Tốt. Mọi API trả về chuẩn `ResponseEntity<ApiResponse<T>>`. Có tích hợp Swagger annotations (`@Operation`, `@Tag`). Sử dụng `@Valid` để kích hoạt Hibernate Validator.
**Khuyết điểm nhỏ**: Việc fix cứng chuỗi message (VD: `"Login successful"`) ở tầng Controller làm hệ thống khó triển khai đa ngôn ngữ (i18n). 

### 1.3. Service Layer (`AuthService`, `JwtService`)
**Tình trạng hiện tại:** Logic khá đầy đủ cho một flow Auth cơ bản (Kích hoạt, Login, Đổi mật khẩu, Refresh, Forgot Password).
- Có sử dụng khóa Pessimistic (`findByEmailForUpdate`) để tránh race condition khi kích hoạt tài khoản. Rất chuẩn Enterprise.
- Password mã hóa BCrypt an toàn. Reset Password dùng SHA-256 Hashed Token chuẩn.
**Điểm trừ**:
- `AuthService` đang có dấu hiệu "Fat Service" (hơn 300 dòng code xử lý nhiều logic sinh Token, gửi Email, hash bytes). Nên tách phần quản lý Token sang `TokenManagerService` riêng.
- Hardcode quá nhiều lỗi (Vd: `throw new AppException("Invalid username...", HttpStatus.UNAUTHORIZED)`). Chưa áp dụng chuẩn `ErrorCode`.
- Cấu trúc hiện tại của `AuthService` khá coupling với `EmailService`.

### 1.4. Security Layer & Exception Handling
**Tình trạng hiện tại:** Hệ thống đã có `GlobalExceptionHandler` bắt chính xác các lỗi từ Filter như `JwtException`, `AccessDeniedException` và trả về `ApiResponse` đồng nhất.
**Điểm trừ**: Chưa có một Enum `ErrorCode` chung cho toàn dự án. Error messages trả về cho client không dựa vào code mà dựa vào text, khó cho Mobile xử lý đa ngôn ngữ.

---

## 2. Checklist dành cho Mobile Team (Android/Kotlin)

Đội ngũ Mobile App cần đối chiếu các công việc sau để đảm bảo tích hợp Auth an toàn:

- [ ] **Lưu trữ Token an toàn**: Tích hợp thư viện `androidx.security:security-crypto` để lưu AT và RT bằng `EncryptedSharedPreferences`.
- [ ] **Auth Interceptor**: Tạo OkHttp Interceptor tự động đính kèm header `Authorization: Bearer <AT>` vào mọi API (trừ whitelist).
- [ ] **Authenticator (Refresh Token Strategy)**: Kế thừa `Authenticator` của OkHttp để xử lý mã lỗi HTTP `401`. Phải đảm bảo chặn song song các request khác trong khi đang gọi API Refresh Token, cấp mới AT/RT thành công thì retry.
- [ ] **Error Mapping**: Map các Http Status và Message từ Backend trả về thành các thông báo tiếng Việt có nghĩa trên UI.
- [ ] **Force Logout**: Xử lý logic xóa toàn bộ Token, User Data (Room/DataStore) và đẩy về `LoginScreen` khi RT bị thu hồi (Lỗi `401` từ request refresh).
- [ ] **First Login Flow**: Xử lý màn hình "Kích hoạt" (Gọi `/activate`) thay vì Login nếu nhận được HTTP Status 403 / Pending Activation.
- [ ] **Offline Handling**: Không gọi API Đăng nhập / Forgot Password nếu check Network Info là ngắt kết nối.
- [ ] **Empty State & Loading**: Áp dụng Skeleton / CircularProgressIndicator trong khi chờ API phản hồi.

---

## 3. Đề xuất cải tiến (Proposals & Open Questions)

Với tư cách là Solution Architect, tôi đề xuất Backend Team xem xét các vấn đề sau trước khi release V1.0:

### 3.1. Áp dụng chuẩn ErrorCode
**Vấn đề**: Hiện tại `GlobalExceptionHandler` và `AuthService` ném `AppException` kèm String text (VD: `"Account is not active"`). Mobile app không thể dựa vào text này để render giao diện tiếng Việt hay tiếng Anh, cũng như text có thể bị Backend đổi trong tương lai làm chết logic App.
**Đề xuất**:
- Bổ sung `enum ErrorCode { INVALID_CREDENTIALS, ACCOUNT_LOCKED, ... }`
- Sửa `AppException` để nhận tham số là `ErrorCode`.
- Bổ sung trường `errorCode` vào `ApiResponse`.

### 3.2. Quản lý Đa Thiết Bị (Device Management / Sessions)
**Vấn đề**: Backend đang thiết kế mỗi `UserAccount` chỉ có 1 cột `refreshToken` trong database. Nghĩa là 1 sinh viên đăng nhập trên App, sau đó đăng nhập trên Web -> Token trên App sẽ bị ghi đè, App sẽ bị Force Logout.
**Đề xuất**:
- Nếu SDMS cho phép đăng nhập đa thiết bị (Cả Web và App đồng thời): Cần tạo bảng `UserSessions` (hoặc `UserDeviceTokens`) (1 User - Nhiều Tokens).
- Tạm thời Mobile App cần xử lý thật kỹ luồng Force Logout nếu người dùng lỡ đăng nhập ở nơi khác.

### 3.3. Audit Logging 
**Vấn đề**: `AuthService` đang ghi log ra console (`log.info(...)`) thay vì lưu vết DB. Trong hệ thống tài chính / quản lý KTX, bảo mật là ưu tiên.
**Đề xuất**:
- Tạo bảng `AuditLog` hoặc `LoginHistory`.
- Sử dụng `@EventListener` hoặc AOP (`@Aspect`) để lưu DB bất đồng bộ mỗi khi đăng nhập thành công / thất bại (Không chặn luồng chính của user).

### 3.4. Chống Brute-force Login
**Vấn đề**: Không thấy logic đếm số lần đăng nhập sai (Failed Attempts). Kẻ gian có thể dùng Tool dò mật khẩu của sinh viên liên tục.
**Đề xuất**:
- Thêm trường `failed_attempt_count` và `lock_time` vào bảng `UserAccount`.
- Khóa tài khoản 30 phút nếu sai 5 lần.

### Open Questions (Cần thảo luận với PM / Backend Team):
1. *Sinh viên có được phép đổi email không? (Vì email đang dùng để check identifier).*
2. *Refresh Token lưu ở DB dạng Text rõ (plain-text). Nếu Hacker dump được database, chúng sẽ chiếm được toàn bộ phiên của sinh viên. Có nên mã hóa Refresh Token trước khi lưu DB không?*
