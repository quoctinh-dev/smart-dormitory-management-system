# CHIẾN LƯỢC KIỂM THỬ MODULE NOTIFICATION (THÔNG BÁO)

## 1. Mục tiêu kiểm thử (Testing Objectives)
Module Notification đóng vai trò là "Trung tâm phát thanh" của toàn bộ hệ thống SDMS. Do đó, việc kiểm thử phải đảm bảo 2 nguyên tắc:
1. **Tính độc lập (Isolation):** Việc gửi thông báo (đặc biệt là Email qua bên thứ 3) không được làm chậm hay gây lỗi cho các giao dịch nghiệp vụ chính (như đăng ký phòng, thanh toán).
2. **Tính chính xác (Accuracy):** Cần đảm bảo Template được render đúng, các cờ trạng thái (SENT, FAILED, READ, UNREAD) được cập nhật chuẩn xác.

## 2. Đối tượng kiểm thử chính
Chúng ta sẽ tập trung viết Unit Test cho 2 Service cốt lõi:
- `NotificationServiceImpl`: Quản lý việc gửi Email thông qua Template Engine (Thymeleaf) và EmailService.
- `InAppNotificationServiceImpl`: Quản lý việc tạo thông báo trong ứng dụng, đánh dấu đọc/chưa đọc.

## 3. Các kịch bản kiểm thử (Test Cases)

### 3.1. NotificationServiceImpl Test (Email)
- **Kịch bản 1 (Success):** Khi gọi `sendHtmlEmail`, hệ thống sẽ render Template thành công, gọi `emailService.sendNotificationEmail` và lưu trạng thái lịch sử là `SENT`.
- **Kịch bản 2 (Failure - Template Lỗi / Email Service Sập):** Giả lập `emailService` ném ra ngoại lệ. Hệ thống phải bắt được lỗi, không để Exception làm sập ứng dụng và lưu trạng thái lịch sử là `FAILED` kèm `errorMessage`.

### 3.2. InAppNotificationServiceImpl Test (In-App)
- **Kịch bản 1 (Đánh dấu đã đọc):** Gọi API đánh dấu đọc 1 thông báo -> Cập nhật cờ `isRead = true`, `readAt = NOW`.
- **Kịch bản 2 (Đánh dấu tất cả đã đọc):** Gọi API mark all as read -> Sử dụng Custom Query Update (tránh N+1) để cập nhật toàn bộ thông báo chưa đọc của user.

## 4. Phương pháp thực hiện (Mocking Strategy)
Để không phụ thuộc vào hạ tầng (không gửi email rác, không cần DB thật), chúng ta sẽ sử dụng `@ExtendWith(MockitoExtension.class)`:
- Mock `EmailService`
- Mock `TemplateEngine`
- Mock `NotificationRepository`
- Mock `SecurityContext` (đối với In-App notification)

*Tài liệu này được lập ra để đối chiếu và đảm bảo Unit Test bám sát yêu cầu, không phải sửa đổi hay thay đổi cấu trúc nhiều lần.*
