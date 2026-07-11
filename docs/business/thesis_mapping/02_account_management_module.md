# CHƯƠNG X: PHÂN HỆ QUẢN LÝ TÀI KHOẢN VÀ PHÂN QUYỀN (ACCOUNT MANAGEMENT MODULE)

*Tài liệu này được định dạng sẵn để copy-paste trực tiếp vào quyển Luận văn Tốt nghiệp.*

## 1. Đặt vấn đề và Bài toán nghiệp vụ
Trong hệ thống quản lý Ký túc xá (KTX) thông minh, việc quản lý danh tính (Identity Management) không chỉ đơn thuần là CRUD (Thêm/Xóa/Sửa/Đọc) người dùng. Bài toán đặt ra bao gồm:
- **Tính toàn vẹn dữ liệu (Data Integrity):** Làm sao để đảm bảo dữ liệu hồ sơ cá nhân của Sinh viên không bị thao túng hoặc nhập liệu sai lệch bởi Admin?
- **Phân tách thực thể (Entity Segregation):** Sự khác biệt giữa một "Tài khoản đăng nhập" (Dành cho Admin, Staff, Student) và một "Hồ sơ cư dân" (Chỉ dành cho Student).
- **Lưu vết và Audit (Audit Trail):** Khi một nhân viên nghỉ việc hoặc một sinh viên vi phạm kỷ luật, làm sao để vô hiệu hóa tài khoản mà vẫn giữ được lịch sử thao tác của họ trong hệ thống?

## 2. Giải pháp Kiến trúc (Architectural Solutions)

### 2.1. Phân tách bảng `user_accounts` và `students`
Thay vì gộp chung toàn bộ dữ liệu vào một bảng `Users` khổng lồ, hệ thống áp dụng thiết kế cơ sở dữ liệu hướng Domain-Driven Design (DDD):
- **Bảng `user_accounts`:** Chỉ đóng vai trò là "Chìa khóa" (Credentials). Chứa `username`, `email`, `password` (đã băm BCrypt), `role` (Quyền hạn), và `status`. Áp dụng cho mọi đối tượng truy cập hệ thống.
- **Bảng `students`:** Đóng vai trò là "Hồ sơ lưu trú" (Resident Profile). Chứa thông tin nhân khẩu học (CCCD, Họ tên, Quê quán) và các dữ liệu nghiệp vụ (Khuôn mặt, RFID). Bảng này được liên kết 1-1 với `user_accounts`.

### 2.2. Triết lý "Không nhập liệu thủ công" cho Sinh viên
Để bảo vệ Data Integrity, Quản trị viên (Admin) **không được cấp quyền** tạo thủ công hay chỉnh sửa thông tin cá nhân của Sinh viên trong hệ thống quản lý tài khoản. Dữ liệu của bảng `students` và tài khoản `STUDENT` chỉ được hệ thống **tự động sinh ra** thông qua quy trình: Sinh viên tự nộp "Đơn đăng ký KTX" -> Admin duyệt đơn -> Hệ thống cấp tài khoản. Điều này giúp loại bỏ hoàn toàn sai sót do con người (Human Error) trong khâu nhập liệu.

### 2.3. Áp dụng Xóa mềm (Soft Delete) và Khóa tài khoản (Account Lock)
Thay vì sử dụng lệnh `DELETE` vật lý (Hard Delete), hệ thống xây dựng cơ chế `Toggle Lock` (Khóa/Mở khóa):
- Chuyển `status` của tài khoản sang `LOCKED`.
- Tự động thu hồi chuỗi `refreshToken` ngay lập tức, ép buộc người dùng phải văng khỏi hệ thống (Force Logout) ngay cả khi `accessToken` của họ còn hạn.
- Cơ chế này giúp toàn bộ các dữ liệu liên đới (Hóa đơn người đó đã lập, Lịch sử ra vào của người đó) không bị mất hoặc báo lỗi Khóa ngoại (Foreign Key Constraint).

## 3. Cấu trúc Dữ liệu và Truy vấn Tối ưu
Khi Admin thực hiện tìm kiếm hàng chục ngàn tài khoản sinh viên/nhân viên, hệ thống áp dụng giải pháp truy vấn động (Dynamic Query) bằng JPQL thay vì dùng Native SQL thô. 
```java
@Query("SELECT u FROM UserAccount u WHERE " +
       "(LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
       "AND (:role IS NULL OR CAST(:role AS string) = '' OR u.role = :role) " +
       "AND (:status IS NULL OR CAST(:status AS string) = '' OR u.status = :status)")
Page<UserAccount> searchAccounts(...);
```
**Ưu điểm của giải pháp:**
- Tránh được lỗi `LOWER(bytea)` đặc thù của PostgreSQL khi truyền tham số `null`.
- Xử lý mượt mà việc phân trang (Pagination) ở tầng Database, giúp Frontend không bị quá tải khi hiển thị danh sách dài.

## 4. Phân cấp Giao diện hiển thị (Role-Based UI Rendering)
Ở phía Frontend (ReactJS), hệ thống không chỉ chặn quyền truy cập API ở Backend mà còn ẩn hoàn toàn các Menu không thuộc thẩm quyền của người dùng (Conditional Rendering dựa trên Token):
- **Role `ADMIN`:** Có toàn quyền truy cập Quản lý tài khoản, Thống kê doanh thu, Thiết lập hệ thống.
- **Role `STAFF`:** (Bảo vệ, Lễ tân) Chỉ được cấp quyền truy cập các màn hình thực thi nghiệp vụ như: Quản lý nhận/trả phòng, Duyệt đơn, Kiểm soát ra vào. Các nút "Thêm Staff", "Phân quyền" hoàn toàn tàng hình đối với Role này.
