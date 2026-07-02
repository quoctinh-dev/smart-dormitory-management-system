# SSR - Module Quản lý Sinh viên (Student)
**Phiên bản:** 1.0 | **Ngày:** 2026-06-26

Tài liệu này định nghĩa các Yêu cầu Chức năng (Functional Requirements - FR) chi tiết cho Module Quản lý Sinh viên.

---

## 1. Tổng quan Chức năng

Module này chịu trách nhiệm quản lý "nguồn thông tin chính" (source of truth) về hồ sơ và vòng đời của một sinh viên sau khi họ đã được chấp nhận vào KTX.

## 2. Các Yêu cầu Chức năng (Functional Requirements)

### Nhóm [FR-STUD-PROV]: Khởi tạo Hồ sơ Sinh viên
- **[FR-STUD-001] Tự động Tạo Hồ sơ Sinh viên:**
    - **Mô tả:** Hệ thống **Phải** tự động tạo một bản ghi `Student` mới khi một giao dịch thanh toán phí KTX lần đầu được xác nhận thành công.
    - **Tiền điều kiện:** Một sự kiện `PaymentSuccessEvent` được phát ra cho một hóa đơn phí KTX.
    - **Hậu điều kiện:**
        1. Một bản ghi `Student` được tạo ra từ dữ liệu của `DormitoryApplication` tương ứng.
        2. Trạng thái ban đầu của `Student` là `PROVISIONING`.
        3. Hệ thống **Phải** phát ra sự kiện `StudentCreatedEvent`. (Tuân thủ [NFR-ARC-01])
- **[FR-STUD-002] Tự động Kích hoạt Hồ sơ Sinh viên:**
    - **Mô tả:** Hệ thống **Phải** chuyển trạng thái của sinh viên thành `ACTIVE` sau khi các tài nguyên phụ thuộc (như `UserAccount`) đã được tạo xong.
    - **Tiền điều kiện:** Một sự kiện `StudentCreatedEvent` được phát ra.
    - **Hậu điều kiện:** Trạng thái của `Student` được cập nhật từ `PROVISIONING` thành `ACTIVE`.

### Nhóm [FR-STUD-PROFILE]: Quản lý Hồ sơ Cá nhân
- **[FR-STUD-010] Truy vấn Hồ sơ Cá nhân:**
    - **Mô tả:** Hệ thống **Phải** cho phép sinh viên đã đăng nhập xem thông tin hồ sơ chi tiết của chính mình.
    - **Tiền điều kiện:** Người dùng đã xác thực với vai trò `STUDENT`.
    - **Hậu điều kiện:** Thông tin chi tiết của sinh viên (họ tên, MSSV, phòng ở hiện tại...) được trả về.
- **[FR-STUD-011] Cập nhật Hồ sơ Cá nhân:**
    - **Mô tả:** Hệ thống **Phải** cho phép sinh viên cập nhật một số thông tin cá nhân có thể thay đổi (ví dụ: số điện thoại, địa chỉ liên hệ).
    - **Tiền điều kiện:** Người dùng đã xác thực với vai trò `STUDENT`.
    - **Hậu điều kiện:** Các trường thông tin tương ứng trong bản ghi `Student` được cập nhật.

### Nhóm [FR-STUD-FACE]: Đăng ký Khuôn mặt
- **[FR-STUD-020] Tự động Tạo Hồ sơ Khuôn mặt:**
    - **Mô tả:** Hệ thống **Nên** tự động tạo một bản ghi `FaceProfile` mới khi một sinh viên được tạo.
    - **Tiền điều kiện:** Một sự kiện `StudentCreatedEvent` được phát ra.
    - **Hậu điều kiện:** Một bản ghi `FaceProfile` được tạo với trạng thái `PENDING_REGISTRATION` và liên kết với `studentId`.
- **[FR-STUD-021] Đăng ký Ảnh Khuôn mặt:**
    - **Mô tả:** Hệ thống **Phải** cho phép sinh viên tải lên ảnh chân dung để đăng ký nhận dạng khuôn mặt.
    - **Tiền điều kiện:** Sinh viên đã đăng nhập. Hồ sơ khuôn mặt của họ đang ở trạng thái `PENDING_REGISTRATION` hoặc `REJECTED`.
    - **Hậu điều kiện:**
        1. Ảnh được tải lên và lưu trữ.
        2. Trạng thái của `FaceProfile` được chuyển thành `PENDING_APPROVAL`.
- **[FR-STUD-022] Yêu cầu Thay đổi Ảnh:**
    - **Mô tả:** Hệ thống **Phải** cho phép sinh viên gửi yêu cầu được thay đổi ảnh khuôn mặt đã được duyệt.
    - **Tiền điều kiện:** Sinh viên đã đăng nhập và có một hồ sơ khuôn mặt đang `ACTIVE`.
    - **Hậu điều kiện:** Trạng thái của `FaceProfile` được chuyển thành `PENDING_REPLACEMENT`. Admin sẽ nhận được thông báo để duyệt yêu cầu này.
