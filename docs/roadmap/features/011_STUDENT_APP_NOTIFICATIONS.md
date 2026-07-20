# FEATURE: GIAO DIỆN THÔNG BÁO CHO MOBILE APP (STUDENT APP)

## 1. Vision (Tầm nhìn)
Tính năng này nhằm cung cấp cho sinh viên một Trung tâm thông báo (Notification Center) ngay trên Mobile App, giúp sinh viên có thể nhận, đọc, và lọc các thông báo In-App đã được Backend gửi xuống (qua kiến trúc Event-Driven của SDMS). Nó đóng vai trò thay thế cho chuông thông báo trên Web, mang lại trải nghiệm Native mượt mà hơn.

## 2. Business Flow (Luồng nghiệp vụ)
1. Sinh viên mở App và đăng nhập.
2. Ngay tại màn hình Home (hoặc có Tab riêng biệt "Thông báo" trên Bottom Navigation Bar), hiển thị số lượng thông báo chưa đọc (Badge).
3. Khi bấm vào xem danh sách thông báo:
   - Hệ thống tự động gọi API GET `/api/v1/notifications` để kéo dữ liệu mới nhất.
   - Hiển thị danh sách các thẻ thông báo (Title, Message, Thời gian, Trạng thái Chưa đọc/Đã đọc).
   - Hỗ trợ các Filter Chips (Tất cả, Thanh toán, Đăng ký, Cửa ra vào, Khuôn mặt,...) giống y hệt Web.
4. Khi sinh viên bấm vào 1 thông báo cụ thể:
   - Gọi API PUT `/api/v1/notifications/{id}/read` để đánh dấu đã đọc.
   - Hiện Dialog/BottomSheet hoặc chuyển trang để hiển thị nội dung chi tiết.

## 3. Implementation Roadmap (Lộ trình triển khai)

### 3.1. Frontend (Mobile App - Flutter/React Native)
- **Component 1**: Badge số lượng thông báo chưa đọc tích hợp vào Bottom Navigation hoặc AppBar.
- **Component 2**: Màn hình `NotificationScreen` liệt kê thông báo dưới dạng `ListView` hoặc `FlatList`.
- **Component 3**: Các Filter Chips trượt ngang để lọc theo Enum `NotificationType` (ANNOUNCEMENT, SYSTEM, PAYMENT, ROOM, SMART_ACCESS, FACE, APPLICATION, MAINTENANCE).
- **Service/API Layer**: Tạo file `notification_api.dart` (hoặc `.ts`) để bọc các API endpoints:
  - `GET /api/v1/notifications`
  - `GET /api/v1/notifications/unread-count`
  - `PUT /api/v1/notifications/{id}/read`
  - `PUT /api/v1/notifications/read-all`

### 3.2. Backend (Java Spring Boot)
- **Đã hoàn thiện 100%**: Backend đã xây dựng sẵn module Notification, hỗ trợ các API GET/PUT cho user, phân trang, và tối ưu hóa In-App event.
- **Không cần sửa đổi thêm** trừ khi phát sinh yêu cầu Push Notification qua Firebase Cloud Messaging (FCM).

---

## 4. BÀI TOÁN TƯƠNG LAI: Push Notifications (FCM)
Hiện tại hệ thống đang lấy thông báo theo dạng "Kéo" (Pull/Polling) khi mở App. Để thực sự Real-time và hiển thị thông báo màn hình khóa (Lock screen), hệ thống cần tích hợp Firebase Cloud Messaging (FCM). 
- Mobile App cần xin quyền Notification, sinh token FCM và gửi lên Backend.
- Backend lưu FCM Token của User.
- Khi có Event, `NotificationRouter` đẩy thêm 1 luồng gọi sang Firebase Server để búng Push Notification xuống máy điện thoại.

---

## 5. TRIGGER PROMPT (Dành cho Agent xử lý Mobile App)

Dưới đây là Prompt chuẩn để bạn copy và giao cho Agent lập trình Mobile App (như Flutter Agent hoặc React Native Agent):

> **Prompt:**
> "Chào bạn, hãy mở workspace ở thư mục `sdms-mobile-app` và đọc file luật `.agents/AGENTS.md` trước khi bắt đầu. Nhiệm vụ của bạn là xây dựng tính năng Trung tâm Thông báo (Notification Center) cho Sinh viên. 
> 
> 1. Hãy tạo API client để gọi các endpoint: 
>    - `GET /api/v1/notifications` (kèm query param filter nếu có)
>    - `GET /api/v1/notifications/unread-count`
>    - `PUT /api/v1/notifications/{id}/read`
>    - `PUT /api/v1/notifications/read-all`
> 2. Dựng giao diện `NotificationScreen` có thiết kế hiện đại (Glassmorphism, Gradient tinh tế).
> 3. Tích hợp một thanh cuộn ngang chứa các Filter Chips để sinh viên có thể lọc theo `NotificationType`: Chung, Báo hỏng, Đăng ký, Thanh toán, Cảnh báo, Hệ thống, Phòng ở, Tài khoản, Khuôn mặt, Cửa ra vào. 
> 4. Lưu ý: Backend đã làm xong API và phân luồng Event-Driven (Chỉ gửi In-App cho sinh viên đã có tài khoản). Việc của bạn chỉ là móc nối UI vào API sao cho thật mượt mà và có micro-animations (hiệu ứng vuốt, nhấn)."
