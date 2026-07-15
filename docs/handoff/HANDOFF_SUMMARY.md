# BÀN GIAO TIẾN ĐỘ LÀM VIỆC (HANDOFF SUMMARY)

**Thời điểm bàn giao:** 15/07/2026 (Đang bảo trì lỗi máy tính)

## 1. Tình trạng hiện tại (Current State)
- **Hệ thống Web (Backend & Frontend):** Đã gần như hoàn thiện 100%. Mọi lỗi Build Frontend đã được giải quyết triệt để.
- **Tính năng Thanh toán Online (Auto-banking Webhook):** 
  - Đã được nâng cấp để tích hợp thực tế với hệ thống **SePay** thay vì Mock ảo.
  - Logic tạo mã QR thanh toán trong `PaymentService.java` đã được chuyển sang định dạng VietQR chuẩn, được gán cứng tài khoản **MBBank (0819281512)** của User.
  - Cài đặt và bật thành công Tunnel qua **Ngrok** (Port 8080) để nhận Webhook.
  - **Cập nhật quan trọng trong phiên:** Đã sửa mã nguồn `SepayService.java` để **vô hiệu hóa việc kiểm tra chữ ký (HMAC Signature)**. Hiện tại Backend chỉ kiểm tra `API Key`. Đã chạy lệnh `mvn compile` thành công và không có lỗi (Build Success).
- **Tình trạng User hiện tại:** Máy tính của User đang gặp sự cố bộ nhớ tạm (Clipboard bị treo, không thể Ctrl+C / Ctrl+V), User đang khởi động lại máy tính (Restart) và tạm dừng công việc.

## 2. Công việc đã thực hiện trong phiên này (Accomplished)
- Xem lại tài liệu Handoff và phân tích quy trình tích hợp SePay Webhook.
- Sửa file `SepayService.java` để Bypass Signature validation (giúp User dễ dàng test bằng API Access Token mà không cần cài đặt Secret Key phức tạp).
- Compile lại dự án Backend thành công (`mvn compile`).
- Hướng dẫn User cách khắc phục lỗi kẹt Clipboard trên Windows (Dùng Windows + V hoặc Restart máy).

## 3. Bước tiếp theo cần làm (Next Tasks)
Ngay khi bắt đầu phiên làm việc mới, Agent tiếp theo CẦN PHẢI:
1. **Chờ User quay lại sau khi Restart máy tính:** Hỏi xem máy tính đã cho phép copy-paste (Ctrl C, Ctrl V) lại bình thường chưa.
2. **Cấu hình API Key (sau khi máy tính bình thường):** Nhắc User dán **API Access Token** (tạo trên SePay) vào biến `SEPAY_API_KEY` trong file `application.yml` (hoặc `.env`) và khởi động lại Backend Spring Boot.
3. **Cấu hình trên SePay:** Yêu cầu User chọn loại "API Key" ở phần Authorization trong màn hình cài đặt Webhook trên SePay và dán mã đó vào.
4. **Kiểm thử Webhook (E2E Test):** Yêu cầu User nhấn nút "Gửi test Webhook" trên SePay và kiểm tra cửa sổ Log của Backend xem có in ra dòng chữ `[SepayWebhookController] Received webhook` hay không.
5. **Chốt hạ phần Web & Chuyển sang Mobile App:** 
   - Khi việc test thanh toán thành công, sẽ chính thức chuyển trọng tâm sang thảo luận kiến trúc, công nghệ (Flutter/React Native) và bắt đầu tạo cấu trúc thư mục cho **Phần mềm Mobile App (Student App)**.
   - Khi tạo Mobile App, bắt buộc phải tuân thủ chuẩn tạo thư mục `sdms-mobile-app` và khởi tạo file `.agents/AGENTS.md` tương ứng.
