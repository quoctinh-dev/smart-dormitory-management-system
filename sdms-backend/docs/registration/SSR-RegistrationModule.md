# SSR - Module Quản lý Đợt Đăng ký (Registration)
**Phiên bản:** 1.0 | **Ngày:** 2026-06-26

Tài liệu này định nghĩa các Yêu cầu Chức năng (Functional Requirements - FR) chi tiết cho Module Quản lý Đợt Đăng ký.

---

## 1. Tổng quan Chức năng

Module này chịu trách nhiệm cho việc thiết lập và quản lý các đợt đăng ký, cũng như kiểm tra tư cách hợp lệ của sinh viên muốn nộp đơn.

## 2. Các Yêu cầu Chức năng (Functional Requirements)

### Nhóm [FR-REG-MGMT]: Quản lý Đợt đăng ký
- **[FR-REG-001] Tạo Đợt đăng ký:**
    - **Mô tả:** Hệ thống **Phải** cho phép Admin tạo một đợt đăng ký mới với các thông tin: tên, ngày bắt đầu/kết thúc, và đối tượng áp dụng (`target`).
    - **Tiền điều kiện:** Người dùng có vai trò `ADMIN`.
    - **Hậu điều kiện:** Một bản ghi `RegistrationPeriod` được tạo trong CSDL.
- **[FR-REG-002] Nhập Danh sách Hợp lệ:**
    - **Mô tả:** Nếu một đợt đăng ký có giới hạn đối tượng, hệ thống **Phải** cho phép Admin tải lên một file Excel chứa danh sách sinh viên đủ điều kiện (bao gồm CCCD, họ tên, email...).
    - **Tiền điều kiện:** Một đợt đăng ký đã được tạo.
    - **Hậu điều kiện:** Dữ liệu từ file Excel được lưu vào bảng `registration_eligibilities` và liên kết với đợt đăng ký.

### Nhóm [FR-REG-CHECK]: Kiểm tra Tư cách
- **[FR-REG-010] Kiểm tra Tư cách Hợp lệ:**
    - **Mô tả:** Hệ thống **Phải** cung cấp một endpoint để sinh viên kiểm tra xem họ có đủ điều kiện nộp đơn hay không.
    - **Tiền điều kiện:** Sinh viên cung cấp số CCCD.
    - **Hậu điều kiện:** Hệ thống trả về kết quả `true` hoặc `false`.
        - Nếu có đợt đăng ký `active` với `target` là `ALL`, trả về `true`.
        - Nếu có đợt đăng ký `active` với `target` giới hạn, hệ thống **Phải** kiểm tra sự tồn tại của CCCD trong danh sách `registration_eligibilities` tương ứng.
