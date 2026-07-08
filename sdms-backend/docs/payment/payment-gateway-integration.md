# Tích hợp Cổng thanh toán qua Webhook
**Phiên bản:** 1.1 · **Ngày:** 2026-06-26

Tài liệu này mô tả quy trình kỹ thuật và các biện pháp đảm bảo an toàn khi tích hợp với cổng thanh toán của bên thứ ba (ví dụ: Sepay) thông qua cơ chế Webhook. Các giải pháp này được thiết kế dựa trên các nguyên tắc vận hành tin cậy của hệ thống.

---

## 1. Bối cảnh nghiệp vụ
*(Nội dung không đổi, giữ nguyên như phiên bản 1.0)*

## 2. Luồng Tương tác (Online Payment)

Quy trình thanh toán online được thiết kế theo kiến trúc Event-Driven kết hợp Webhook bất đồng bộ:

1. **Khởi tạo (Initiate):**
   - Frontend gửi yêu cầu thanh toán online.
   - Backend (`PaymentService`) tạo bản ghi `Payment` với trạng thái `PENDING` và sinh ra một `transactionCode` duy nhất.
   - Backend sinh URL chứa mã QR chuẩn VietQR/SePay (bao gồm số tài khoản, số tiền, và nội dung chuyển khoản là `transactionCode`).
   - Trả thông tin này về cho Frontend hiển thị.
2. **Chờ xác nhận (Polling/WebSocket):**
   - Frontend hiển thị mã QR và bắt đầu cơ chế Polling (gọi API kiểm tra liên tục) hoặc qua WebSocket để theo dõi trạng thái của `Payment`.
3. **Xử lý Webhook (Async):**
   - Sinh viên quét QR thanh toán thành công qua App Ngân hàng.
   - Cổng thanh toán (SePay) gửi Webhook về `SepayWebhookController`.
   - `SepayService` trích xuất `transactionCode` từ nội dung tin nhắn chuyển khoản, tìm giao dịch `PENDING` tương ứng.
4. **Hoàn tất (Completion):**
   - Nếu số tiền khớp và hợp lệ, hệ thống cập nhật `Payment` thành `SUCCESS`, `Bill` thành `PAID`.
   - Phát ra sự kiện `PaymentSuccessEvent` (để tự động cấp phát giường).
   - Frontend nhận được trạng thái `SUCCESS` và tự động chuyển hướng sinh viên sang trang báo hỷ.

## 3. Các Biện pháp Đảm bảo An toàn và Tin cậy

Việc xử lý webhook đòi hỏi các biện pháp nghiêm ngặt để đối phó với các rủi ro trong thực tế. Các biện pháp dưới đây được thiết kế tuân thủ chặt chẽ các nguyên tắc cốt lõi của hệ thống.

### A. Xác thực Chữ ký (Signature Verification)
*   **Mục đích:** Đảm bảo rằng yêu cầu webhook thực sự đến từ cổng thanh toán chứ không phải một kẻ tấn công.
*   **Cơ chế:**
    1.  Cổng thanh toán và SDMS sẽ chia sẻ một "khóa bí mật" (secret key).
    2.  Khi gửi webhook, cổng thanh toán sẽ tạo một chuỗi "chữ ký" bằng cách mã hóa (thường là HMAC-SHA256) toàn bộ nội dung (payload) của webhook cùng với khóa bí mật.
    3.  Khi nhận được webhook, SDMS sẽ thực hiện lại quy trình mã hóa tương tự và so sánh kết quả. Nếu không khớp, yêu cầu sẽ bị từ chối.
*   **Tham chiếu SSR:** Giải pháp này là một yêu cầu bắt buộc để đảm bảo an ninh, một phần của việc xây dựng một hệ thống đáng tin cậy.

### B. Tính bất biến (Idempotency)
*   **Mục đích:** Ngăn chặn việc xử lý cùng một thông báo webhook nhiều lần.
*   **Cơ chế:**
    1.  Hệ thống SDMS sẽ lưu lại mã định danh duy nhất (`transaction_id`) của mỗi webhook đã được xử lý thành công.
    2.  Khi một webhook mới đến, hệ thống sẽ kiểm tra xem mã này đã tồn tại hay chưa. Nếu đã có, yêu cầu sẽ được bỏ qua.
*   **Tham chiếu SSR:** Việc triển khai này tuân thủ nghiêm ngặt **[Nguyên tắc 2: Đảm bảo Tính Bất biến](./../overview/system-design-principles.md#nguyên-tắc-2-đảm-bảo-tính-bất-biến-idempotency)**. Nó đảm bảo rằng một giao dịch không bao giờ bị xử lý hai lần, ngay cả khi cổng thanh toán gửi lại webhook do lỗi mạng.

### C. Đối soát Giao dịch (Reconciliation)
*   **Mục đích:** Đảm bảo không có giao dịch nào bị "treo" hoặc sai lệch trạng thái do lỗi không lường trước (ví dụ: webhook bị thất lạc hoàn toàn).
*   **Cơ chế:**
    1.  Một `Job` định kỳ (`PaymentReconciliationJob`) sẽ chạy mỗi giờ.
    2.  Job này sẽ chủ động gọi API của cổng thanh toán để lấy trạng thái chính xác của các giao dịch đang `PENDING`.
    3.  Nếu phát hiện sai lệch, Job sẽ tự động cập nhật lại trạng thái trong CSDL của SDMS và kích hoạt các quy trình nghiệp vụ liên quan.
*   **Tham chiếu SSR:** Đây là sự hiện thực hóa của **[Nguyên tắc 3: Đối soát và Tự sửa lỗi](./../overview/system-design-principles.md#nguyên-tắc-3-đối-soát-và-tự-sửa-lỗi-reconciliation)**. Nó hoạt động như một lưới bảo vệ cuối cùng, đảm bảo tính toàn vẹn tài chính cho hệ thống.
