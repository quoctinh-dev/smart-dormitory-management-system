# NOTIFICATION MODULE (HỆ THỐNG THÔNG BÁO)

## 1. Mục đích
Thư mục này chứa tài liệu thiết kế nghiệp vụ của Module **Notification**. Module này vận hành theo cơ chế Hướng sự kiện (Event-Driven), hoàn toàn độc lập và không bị coupling với các module khác. Nó đóng vai trò "người đưa tin" (gửi Email, In-App notification) khi có sự kiện quan trọng xảy ra trong hệ thống.

## 2. Danh sách Tài liệu Cốt lõi
- `SSR-NotificationModule.md`: Yêu cầu chức năng hệ thống (Functional Requirements) cho việc gửi Email, gửi In-app, và lưu vết lịch sử (`NotificationHistory`).
- `event-driven-architecture.md`: Giải thích chi tiết kiến trúc Event-Driven, danh sách các Sự kiện đang được lắng nghe (`ApplicationApprovedEvent`, `PaymentSuccessEvent`, v.v), và các kênh gửi.

## 3. Nhật ký Quy hoạch (Quy tắc Code is Truth & UI Separation)
- **Code is Truth**: Đã cập nhật lại file `event-driven-architecture.md` để xác nhận rằng tính năng **In-App Notification** và `NotificationEventListener` ĐÃ ĐƯỢC CODE HOÀN THIỆN, trái với tài liệu nháp trước đó nói rằng đây là "lỗ hổng".
- **Strict UI Separation**: File `architecture-and-ui-status.md` mô tả về Component React `NotificationBell.tsx`, Polling 60s, và hướng dẫn Frontend **ĐÃ ĐƯỢC DỜI SANG** `sdms-frontend/docs/notification-integration-status.md`.
- Các API REST liên quan đến Notification (Lấy danh sách, đánh dấu đã đọc) đều đã được lưu tại `docs/api/`.
