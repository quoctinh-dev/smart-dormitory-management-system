# Quy chế Vận hành Tin cậy & Xử lý Tình huống Bất ngờ
**Phiên bản:** 1.0 · **Ngày:** 2026-06-26

Tài liệu này không mô tả luồng nghiệp vụ thông thường, mà tập trung vào các giải pháp được thiết kế để đảm bảo hệ thống hoạt động một cách đáng tin cậy, nhất quán và có khả năng tự phục hồi khi đối mặt với các sự cố và tình huống bất ngờ trong thực tế.

---

## 1. Đảm bảo Tính nhất quán Dữ liệu

### 1.1. Tình huống: Webhook Thanh toán bị "Thất lạc"

*   **Vấn đề:** Do lỗi mạng, cổng thanh toán đã xử lý giao dịch thành công nhưng không thể gọi về webhook của SDMS, hoặc SDMS bị lỗi ngay lúc xử lý webhook. Hậu quả: Sinh viên đã trả tiền nhưng hóa đơn trong hệ thống vẫn là `UNPAID`.
*   **Giải pháp: Job Đối soát Thanh toán (`PaymentReconciliationJob`)**
    1.  **Thiết kế:** Một `Job` chạy định kỳ mỗi giờ.
    2.  **Hành động:**
        *   Job sẽ gọi đến API của cổng thanh toán để lấy danh sách tất cả các giao dịch đã thành công trong 2 giờ gần nhất.
        *   Với mỗi giao dịch thành công lấy về, Job sẽ kiểm tra trong CSDL của SDMS xem `Payment` tương ứng đã ở trạng thái `SUCCESS` chưa.
        *   Nếu `Payment` vẫn đang `PENDING`, Job sẽ tự động cập nhật trạng thái của `Payment` thành `SUCCESS`, `Bill` thành `PAID`, và quan trọng nhất là **phát lại sự kiện `PaymentSuccessEvent`**.
    3.  **Luận cứ:** Cơ chế này hoạt động như một "lưới bảo vệ cuối cùng", đảm bảo không một giao dịch thành công nào bị bỏ sót, giúp dữ liệu tài chính luôn chính xác và luồng nghiệp vụ của sinh viên được tiếp tục.

### 1.2. Tình huống: Xung đột Thao tác (Race Condition)

*   **Vấn đề:** Sinh viên A thanh toán hóa đơn gần như cùng một lúc khi `BillOverdueJob` chạy và chuyển hóa đơn đó sang `OVERDUE`. Cả hai tiến trình cùng cố gắng cập nhật một bản ghi `Bill`.
*   **Giải pháp: Khóa Phiên bản Lạc quan (Optimistic Locking)**
    1.  **Thiết kế:** Thực thể `Bill` (và các thực thể quan trọng khác) sẽ có một trường `@Version` (ví dụ: `long version`).
    2.  **Hành động:**
        *   Khi một tiến trình (ví dụ: xử lý webhook) đọc một hóa đơn, nó sẽ ghi nhớ `version` hiện tại (ví dụ: version 5).
        *   Khi nó cập nhật hóa đơn, câu lệnh `UPDATE` sẽ có thêm điều kiện `WHERE version = 5`.
        *   Nếu một tiến trình khác (ví dụ: `BillOverdueJob`) đã kịp cập nhật hóa đơn đó trước, `version` trong CSDL sẽ tăng lên 6. Câu lệnh `UPDATE` của tiến trình đầu tiên sẽ thất bại vì không tìm thấy `version = 5`.
        *   Khi thất bại, hệ thống có thể thử lại thao tác hoặc báo lỗi một cách tường minh.
    3.  **Luận cứ:** Đây là một kỹ thuật tiêu chuẩn trong các hệ thống giao dịch cao, giúp đảm bảo tính toàn vẹn dữ liệu mà không cần dùng đến các cơ chế khóa nặng nề, tối ưu hiệu năng.

## 2. Đảm bảo Tính sẵn sàng của Dịch vụ

### 2.1. Tình huống: Mất kết nối Internet tại Cổng Ra vào

*   **Vấn đề:** Toàn bộ hệ thống ra vào thông minh sẽ tê liệt nếu phụ thuộc 100% vào kết nối mạng đến backend. Sinh viên không thể ra vào KTX.
*   **Giải pháp: Cơ chế Vận hành Offline cho Thiết bị IoT**
    1.  **Thiết kế:**
        *   **Chế độ Online (Mặc định):** Thiết bị ESP32 tại cổng luôn gửi yêu cầu xác thực (ảnh khuôn mặt, mã RFID) lên backend để xử lý.
        *   **Chế độ Offline (Dự phòng):** Thiết bị ESP32 có một bộ nhớ cache (ví dụ: trên thẻ SD) để lưu một danh sách "trắng" (whitelist) các mã thẻ RFID của những sinh viên hợp lệ được phép ra vào cổng đó.
    2.  **Hành động:**
        *   **Đồng bộ Cache:** Mỗi giờ, backend sẽ gửi một danh sách mã RFID cập nhật xuống cho từng thiết bị.
        *   **Phát hiện Mất kết nối:** Khi ESP32 không thể kết nối đến server backend sau vài lần thử, nó sẽ tự động chuyển sang chế độ Offline.
        *   **Xử lý Offline:** Ở chế độ này, nó sẽ chỉ chấp nhận xác thực bằng thẻ RFID. Nếu mã thẻ nằm trong whitelist đã cache, cửa sẽ mở. Mọi giao dịch offline sẽ được lưu vào bộ nhớ và gửi đồng bộ lên backend ngay khi có kết nối trở lại.
    3.  **Luận cứ:** Giải pháp này cho thấy sự tính toán kỹ lưỡng cho các kịch bản vận hành trong thế giới thực. Nó cân bằng giữa việc xác thực realtime (khi online) và tính sẵn sàng của dịch vụ (khi offline), đảm bảo nghiệp vụ cốt lõi (ra vào) không bị gián đoạn hoàn toàn.

### 2.2. Tình huống: Dịch vụ Gửi Email bị lỗi

*   **Vấn đề:** Dịch vụ của bên thứ ba (Brevo) bị lỗi, các email quan trọng (kích hoạt tài khoản, thông báo duyệt đơn) không được gửi đi.
*   **Giải pháp: Hàng đợi và Thử lại (Queue & Retry Mechanism)**
    1.  **Thiết kế:** Thay vì gọi `EmailService` trực tiếp, `NotificationEventListener` sẽ gửi một "yêu cầu gửi email" vào một hàng đợi (có thể dùng RabbitMQ hoặc một bảng trong CSDL làm hàng đợi đơn giản).
    2.  **Hành động:**
        *   Một tiến trình riêng (`EmailSenderJob`) sẽ đọc các yêu cầu từ hàng đợi và thực hiện việc gửi.
        *   Nếu việc gửi bị lỗi, thay vì xóa, job sẽ cập nhật số lần thử lại (`retry_count`) và để yêu cầu đó lại trong hàng đợi.
        *   Job sẽ thử gửi lại các yêu cầu bị lỗi sau một khoảng thời gian tăng dần (ví dụ: 1 phút, 5 phút, 15 phút). Nếu quá số lần thử lại tối đa, yêu cầu sẽ được chuyển sang một bảng "lỗi" để Admin kiểm tra thủ công.
    3.  **Luận cứ:** Tách biệt việc gửi email ra khỏi luồng nghiệp vụ chính giúp ứng dụng phản hồi nhanh hơn và tăng khả năng chịu lỗi. Hệ thống sẽ tự động cố gắng gửi lại khi có sự cố tạm thời, đảm bảo thông tin quan trọng đến được với người dùng.
