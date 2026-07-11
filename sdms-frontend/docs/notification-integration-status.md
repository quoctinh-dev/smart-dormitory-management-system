# BÁO CÁO KIỂM TOÁN MODULE THÔNG BÁO (NOTIFICATION) & ĐÁNH GIÁ TÍCH HỢP FRONTEND

Tài liệu này cung cấp cái nhìn tổng quan về Module Thông báo ở Backend, kiến trúc xử lý sự kiện, luồng dữ liệu đến các nền tảng (App Student, Web Admin, Public Web Student) và đưa ra đánh giá thực tế về mức độ tích hợp của Frontend hiện tại.

---

## 1. BACKEND ARCHITECTURE & WORKFLOW (KIỂM TOÁN MODULE)

Module `notification` ở Backend được xây dựng theo mô hình **Event-Driven (Hướng sự kiện)** kết hợp **Strategy Pattern (Mẫu chiến lược)**.

### a. Cơ chế hoạt động (Event-Driven)
Tất cả các hành động nghiệp vụ quan trọng đều bắn ra các sự kiện (Spring Events). Lớp `NotificationWorkflowListener` sẽ đóng vai trò lắng nghe và chuyển đổi các sự kiện này thành các payload thông báo (`NotificationPayload`).
- **Sự kiện Hủy chỗ do hết hạn (`ReservationPaymentExpiredEvent`)** $\rightarrow$ Gửi cảnh báo hủy qua Email.
- **Sự kiện Yêu cầu bảo trì (`RoomMaintenanceRequiredEvent`)** $\rightarrow$ Gửi cảnh báo khẩn cấp In-App + Email.
- **Sự kiện Đơn được duyệt (`ApplicationApprovedEvent`)** $\rightarrow$ Gửi yêu cầu nộp tiền qua In-App + Email.
- **Sự kiện Thanh toán thành công (`PaymentSuccessEvent`)** $\rightarrow$ Gửi biên lai qua In-App + Email.
- **Sự kiện Nhận phòng thành công (`CheckInCompletedEvent`)** $\rightarrow$ Gửi tin nhắn chào mừng In-App.

### b. Chiến lược phân phối (Strategy Pattern)
Lớp `NotificationRouter` sẽ tiếp nhận `NotificationPayload` và điều phối cho các chiến lược tương ứng:
- **`EmailNotificationStrategy`**: Xử lý việc map data vào file HTML mẫu (`generic-notification.html`) và gọi JavaMailSender để gửi đi.
- **`InAppNotificationStrategy`**: Lưu nội dung thông báo vào Database (bảng `notification_messages` và `notification_recipients`) để quản lý trạng thái Đã đọc / Chưa đọc.

### c. Hệ thống REST API (Giao tiếp với Frontend)
Backend đã cung cấp đầy đủ các API REST (GET, PATCH) để làm việc với Thông báo. 
👉 **Vui lòng xem đặc tả chi tiết tại: `docs/api/notification-api.md`**

*(Lưu ý: Hiện tại Backend đang dùng REST Polling truyền thống, chưa tích hợp WebSocket/SSE để đẩy Real-time).*

---

## 2. HƯỚNG DẪN TÍCH HỢP CHO CÁC NỀN TẢNG (CLIENTS)

### a. App Student (Mobile App)
- **Chu kỳ**: Sử dụng cơ chế kéo (Pull) - Gọi API `GET /unread-count` mỗi khi mở app hoặc định kỳ 30s.
- **Giao diện**: Cần một tab "Thông báo" chuyên dụng hiển thị danh sách (`GET /api/v1/notifications`). Khi sinh viên bấm vào thông báo, gọi API `PATCH /{id}/read` và điều hướng theo `actionUrl` đính kèm trong payload.
- **Push Notifications (FCM)**: Hiện tại Backend chưa có `PushNotificationStrategy`. Cần bổ sung Firebase Cloud Messaging (FCM) ở Backend nếu muốn đẩy Notification thẳng xuống điện thoại ngay cả khi tắt App.

### b. Web Admin (Dành cho Quản lý)
- Admin cần xem lịch sử thông báo hệ thống (Các thông báo gửi tự động hoặc gửi bằng tay từ Admin).
- **Giao diện**: Cần một trang Dashboard "Lịch sử thông báo" cho phép Admin soạn thông báo mới đẩy xuống App sinh viên (sử dụng `NotificationAdminController`). 

### c. Public Web Student (Dành cho Sinh viên đang đăng ký)
- Vì sinh viên chưa có tài khoản đăng nhập khi đang ở trạng thái `PENDING` hoặc `WAITING_PAYMENT`, việc xem In-App Notification là **không khả thi**.
- Nền tảng này chỉ phụ thuộc hoàn toàn vào **Email Notification**. Web cần nhắc nhở sinh viên kiểm tra Hộp thư Email để theo dõi tiến trình.

---

## 3. ĐÁNH GIÁ TÍNH TRẠNG TÍCH HỢP Ở WEB FRONTEND (UI)

Dựa trên việc kiểm tra mã nguồn React của thư mục `sdms-frontend`, tôi đưa ra đánh giá: **GIAO DIỆN FRONTEND ĐÃ TÍCH HỢP HOÀN THIỆN MODULE THÔNG BÁO!**

### Các bằng chứng cụ thể:
1. **Component Cài đặt chuông (`NotificationBell.tsx`)**:
   - File `src/components/common/NotificationBell.tsx` đã tích hợp đầy đủ UI và logic. Có xử lý Popover Menu xổ xuống danh sách thông báo.
   - Sử dụng Polling định kỳ 60s để gọi API `/unread-count`.

2. **Hook Quản lý (Context/State/API)**:
   - File `src/api/notificationApi.ts` đã được viết hoàn chỉnh để bọc các API (Lấy danh sách, Lấy số đếm, Đọc 1, Đọc tất cả).
   - Component gọi và xử lý state rất mượt mà.

### KẾT LUẬN:
Cả Backend và Frontend đều đã hoàn thành xuất sắc việc tích hợp tính năng In-App Notification. Không còn Technical Debt nào tồn đọng cho phần này trên Web Admin. Tương lai chỉ cần bổ sung Push Notification (FCM) cho Mobile App.
