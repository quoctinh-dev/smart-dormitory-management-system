# SSR - Module Xác thực & Phân quyền (Auth)
**Phiên bản:** 1.0 | **Ngày:** 2026-06-26

Tài liệu này định nghĩa các Yêu cầu Chức năng (Functional Requirements - FR) chi tiết cho Module Xác thực & Phân quyền.

---

## 1. Tổng quan Chức năng

Module này chịu trách nhiệm cho các nghiệp vụ liên quan đến danh tính và quyền truy cập của người dùng, bao gồm đăng nhập, quản lý token, và vòng đời tài khoản.

## 2. Các Yêu cầu Chức năng (Functional Requirements)

### Nhóm [FR-AUTH-USER]: Quản lý Tài khoản Người dùng
- **[FR-AUTH-001] Tự động Tạo Tài khoản Người dùng:**
    - **Mô tả:** Hệ thống **Phải** tự động tạo một bản ghi `UserAccount` khi một hồ sơ `Student` mới được tạo.
    - **Tiền điều kiện:** Một sự kiện `StudentCreatedEvent` được phát ra.
    - **Hậu điều kiện:**
        1. Một bản ghi `UserAccount` được tạo và liên kết với `studentId`.
        2. Trạng thái ban đầu của tài khoản là `PENDING_ACTIVATION`.
        3. Mật khẩu tạm thời được thiết lập (ví dụ: mã hóa từ số CCCD của sinh viên).
- **[FR-AUTH-002] Kích hoạt Tài khoản:**
    - **Mô tả:** Hệ thống **Phải** cho phép sinh viên kích hoạt tài khoản lần đầu bằng mật khẩu tạm thời và đặt mật khẩu mới.
    - **Tiền điều kiện:** Tài khoản đang ở trạng thái `PENDING_ACTIVATION`.
    - **Hậu điều kiện:**
        1. Mật khẩu mới của người dùng được cập nhật.
        2. Trạng thái tài khoản được chuyển thành `ACTIVE`.
- **[FR-AUTH-003] Đổi Mật khẩu:**
    - **Mô tả:** Hệ thống **Phải** cho phép người dùng đã đăng nhập thay đổi mật khẩu hiện tại của họ.
    - **Tiền điều kiện:** Người dùng đã xác thực.
    - **Hậu điều kiện:** Mật khẩu của người dùng được cập nhật.
- **[FR-AUTH-004] Quên Mật khẩu:**
    - **Mô tả:** Hệ thống **Phải** cung cấp chức năng cho phép người dùng yêu cầu đặt lại mật khẩu thông qua email.
    - **Tiền điều kiện:** Người dùng cung cấp email đã đăng ký.
    - **Hậu điều kiện:** Một email chứa đường link hoặc mã token để đặt lại mật khẩu được gửi đến người dùng.

### Nhóm [FR-AUTH-SESSION]: Quản lý Phiên đăng nhập
- **[FR-AUTH-010] Đăng nhập bằng Email/Mật khẩu:**
    - **Mô tả:** Hệ thống **Phải** cho phép người dùng (Admin, Student) đăng nhập bằng email và mật khẩu.
    - **Tiền điều kiện:** Tài khoản người dùng đang ở trạng thái `ACTIVE`.
    - **Hậu điều kiện:** Hệ thống trả về một cặp Access Token và Refresh Token hợp lệ.
- **[FR-AUTH-011] Làm mới Token:**
    - **Mô tả:** Hệ thống **Phải** cho phép người dùng sử dụng một Refresh Token hợp lệ để nhận một Access Token mới.
    - **Tiền điều kiện:** Người dùng cung cấp một Refresh Token còn hạn và chưa bị thu hồi.
    - **Hậu điều kiện:** Hệ thống trả về một Access Token mới.
- **[FR-AUTH-012] Bảo vệ API:**
    - **Mô tả:** Mọi yêu cầu đến các API cần xác thực **Phải** chứa một Access Token hợp lệ trong header.
    - **Tiền điều kiện:** Không có.
    - **Hậu điều kiện:** Nếu token không hợp lệ hoặc hết hạn, hệ thống **Phải** trả về lỗi 401 Unauthorized.
- **[FR-AUTH-013] Phân quyền API:**
    - **Mô tả:** Hệ thống **Phải** kiểm tra vai trò và quyền hạn của người dùng (được mã hóa trong Access Token) trước khi cho phép thực thi một API.
    - **Tiền điều kiện:** Yêu cầu đã được xác thực ([FR-AUTH-012]).
    - **Hậu điều kiện:** Nếu người dùng không có quyền, hệ thống **Phải** trả về lỗi 403 Forbidden. (Tuân thủ [NFR-SEC-03])
