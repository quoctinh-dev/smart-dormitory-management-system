# SSR - Module Thông báo (Notification)
**Phiên bản:** 1.0 | **Ngày:** 2026-06-26

Tài liệu này định nghĩa các Yêu cầu Chức năng (Functional Requirements - FR) chi tiết cho Module Thông báo.

---

## 1. Tổng quan Chức năng

Module này hoạt động như một trung tâm giao tiếp, có trách nhiệm gửi các thông báo đến người dùng một cách bất đồng bộ và đáng tin cậy.

## 2. Các Yêu cầu Chức năng (Functional Requirements)

### Nhóm [FR-NOTIF-CORE]: Gửi và Lắng nghe
- **[FR-NOTIF-001] Lắng nghe Sự kiện Nghiệp vụ:**
    - **Mô tả:** Hệ thống **Phải** triển khai một `EventListener` trung tâm để lắng nghe các sự kiện nghiệp vụ quan trọng từ các module khác (ví dụ: `ApplicationApprovedEvent`, `PaymentSuccessEvent`, `FaceRejectedEvent`).
    - **Tiền điều kiện:** Một sự kiện được phát ra từ một module khác.
    - **Hậu điều kiện:** Một yêu cầu gửi thông báo tương ứng được tạo ra. (Tuân thủ [NFR-ARC-01])
- **[FR-NOTIF-002] Gửi Thông báo Đa kênh:**
    - **Mô tả:** Dựa trên yêu cầu, hệ thống **Phải** có khả năng gửi thông báo qua ít nhất một kênh là Email.
    - **Tiền điều kiện:** Một yêu cầu gửi thông báo được tạo.
    - **Hậu điều kiện:** Thông báo được gửi đến người dùng thông qua dịch vụ của bên thứ ba (ví dụ: Brevo).
- **[FR-NOTIF-003] Sử dụng Mẫu (Templates):**
    - **Mô tả:** Nội dung của các thông báo (đặc biệt là email) **Phải** được tạo ra từ các file mẫu (template) để dễ dàng quản lý và thay đổi, thay vì hard-code trong mã nguồn.
    - **Tiền điều kiện:** Một loại thông báo cụ thể cần được gửi.
    - **Hậu điều kiện:** Nội dung cuối cùng được điền đầy đủ thông tin và gửi đi.

### Nhóm [FR-NOTIF-LOG]: Ghi nhận Lịch sử
- **[FR-NOTIF-010] Ghi Lịch sử Gửi:**
    - **Mô tả:** Hệ thống **Phải** ghi lại mọi thông báo đã được gửi (hoặc cố gắng gửi) vào bảng `notification_histories`.
    - **Tiền điều kiện:** Một tác vụ gửi thông báo được thực hiện.
    - **Hậu điều kiện:** Một bản ghi `NotificationHistory` được tạo, chứa thông tin về người nhận, kênh, loại, trạng thái (`SENT`/`FAILED`), và nội dung thông báo.
- **[FR-NOTIF-011] Xử lý Lỗi Gửi:**
    - **Mô tả:** Nếu việc gửi thông báo qua dịch vụ bên ngoài thất bại, hệ thống **Phải** ghi nhận trạng thái `FAILED` và lưu lại thông báo lỗi.
    - **Tiền điều kiện:** Dịch vụ gửi email trả về lỗi.
    - **Hậu điều kiện:** Trạng thái trong `NotificationHistory` được cập nhật là `FAILED`. (Tuân thủ [NFR-PER-02] bằng cách không làm ảnh hưởng luồng chính).
