# PHÂN TÍCH MODULE THANH TOÁN (PAYMENT MODULE) – LUẬN VĂN SDMS
> Cập nhật: 09/07/2026 | Đã quét code thực tế | Phù hợp THESIS_DEPTH_RULE

---

## Chương 1: Giới thiệu

### 1.1. Đặt vấn đề, mục tiêu
- **Đặt vấn đề:** Hệ thống Ký túc xá có lượng giao dịch lớn vào đầu mỗi học kỳ (phí lưu trú, tiền cọc) và hàng tháng (tiền điện, nước). Việc đối soát thủ công qua sao kê ngân hàng tốn rất nhiều thời gian và dễ sai sót. Nếu sinh viên không thanh toán giữ chỗ kịp thời, giường sẽ bị "treo" không thể cấp cho sinh viên khác.
- **Mục tiêu:** Xây dựng module thanh toán tự động đối soát qua Webhook, áp dụng kiến trúc Event-Driven để kết nối với các module khác (Room, Application) một cách lỏng lẻo (decoupled).

### 1.2. Thách thức kỹ thuật và nghiệp vụ
| Thách thức | Giải pháp áp dụng (Đã triển khai) |
|---|---|
| Distributed Transaction (Giao dịch phân tán) | **Saga Choreography Pattern:** Bắn event `PaymentSuccessEvent` để các module khác tự xử lý (không update chéo bảng). |
| Đối soát ngân hàng chậm trễ | Tích hợp **SePay Webhook** tự động quét mã giao dịch trong nội dung chuyển khoản. |
| Giả mạo Webhook | Xác thực bằng **HMAC SHA256** (`X-SePay-Signature`) và **API Key**. |
| Overbooking khi giữ chỗ quá hạn | Lập lịch (Cron Job) quét mỗi 5 phút, bắn `ReservationPaymentExpiredEvent` để giải phóng giường. |

---

## Chương 2: Thiết kế hệ thống và Kiến trúc

### 2.1. Kiến trúc Event-Driven (Sự kiện)
Mô hình phân tán logic thanh toán giúp Backend dễ dàng mở rộng và không bị nghẽn (bottleneck).

**Flow 1: Thanh toán thành công (PaymentSuccessEvent)**
```
[VNPay/SePay] --(Webhook)--> SepayWebhookController
       ↓
(Xác thực HMAC SHA256)
       ↓
PaymentService.completeOnlinePayment()
       ↓
EventPublisher.publishEvent(PaymentSuccessEvent)
       ↓
[Listener 1] Room: Cập nhật Assignment -> PENDING_CHECKIN
[Listener 2] Application: Tự động Approve hồ sơ (nếu cần)
[Listener 3] Notification: Gửi email biên lai cho SV
[Listener 4] Student: Khởi tạo hồ sơ Student Profile + UserAccount
```

**Flow 2: Hủy giữ chỗ do quá hạn (ReservationPaymentExpiredEvent)**
```
ReservationExpiryJob (@Scheduled cron="0 */5 * * * *")
       ↓
Tìm Bill status = UNPAID & quá hạn
       ↓
EventPublisher.publishEvent(ReservationPaymentExpiredEvent)
       ↓
[Listener 1] Room: Hủy Assignment -> CANCELLED, Bed -> AVAILABLE
[Listener 2] Application: Hủy Application
[Listener 3] Notification: Gửi email báo hết hạn
```

### 2.2. Biện pháp bảo vệ Webhook
Endpoint `/api/webhooks/sepay` là cửa ngõ giao tiếp duy nhất từ Internet vào Module Payment để báo cáo tiền về.
- **Idempotency (Tính lũy đẳng):** Kiểm tra trùng lặp `gateway_transaction_id` để chống lỗi Replay Attack (gọi webhook 2 lần).
- **Validation:** Bắt buộc phải có `authorization` (API Key) và `signature` (HMAC).

### 2.3. Kỹ thuật sinh Hóa đơn Flexible Pro-rata (Tự động chia đợt và gom ngày lẻ)
Hệ thống sử dụng cấu hình động thay vì hardcode, tính toán linh hoạt (Pro-rata) dựa vào số lượng ngày ở thực tế của sinh viên, độc lập hoàn toàn với khái niệm "Học kỳ" hay "Kỳ Hè":
- **Chunking (Chia đợt thu):** Dựa vào cấu hình Admin `PAYMENT_CHUNK_MONTHS` (Mặc định 3 tháng/đợt), hệ thống lặp qua tổng thời gian đăng ký (Ví dụ: 4 tháng) để cắt thành các đoạn nhỏ (Ví dụ: Đợt 1 thu 3 tháng, Đợt 2 thu nốt 1 tháng). Nếu sinh viên đăng ký Hè (1 tháng), hệ thống chỉ sinh ra đúng 1 hóa đơn 1 tháng.
- **Xử lý ngày lẻ (Extra Days):** Tính số tháng chẵn (`fullMonths`) và số ngày lẻ dư ra (`extraDays`). Nếu có ngày lẻ (ví dụ: ở 2 tháng 15 ngày), hệ thống tự động gom toàn bộ số tiền của ngày lẻ đó `+` thẳng vào Hóa đơn (Chunk) cuối cùng để sinh viên không phải thanh toán lắt nhắt nhiều lần.
- **Tính toán Hạn chót thanh toán (Due Date clamp):**
  - Đợt 1: Hạn chót bằng `Current Date + PAYMENT_DEADLINE_DAYS` (Yêu cầu đóng ngay để giữ chỗ).
  - Đợt 2 trở đi: Hạn chót bằng `Ngày bắt đầu của đợt đó + PAYMENT_DEADLINE_DAYS` (Chưa tới đợt thì chưa bị ép đóng).
  
Nhờ kiến trúc này, toàn bộ module Payment có khả năng tương thích tuyệt đối 100% với bất kỳ chính sách thu tiền dài ngắn nào của nhà trường, đảm bảo tiêu chuẩn luận văn.

---

## Chương 3: API Permission Matrix (Bảo mật truy cập)

### 3.1. PaymentController (`/api/v1/payments`)
| Method | Endpoint | PreAuthorize / Security | Mô tả |
|--------|----------|-----------------------|-------|
| POST | `/online` | `hasRole('STUDENT')` | Sinh viên tạo giao dịch online |
| POST | `/cash/approve` | `hasRole('ADMIN')` | Admin xác nhận thu tiền mặt |
| POST | `/mock-success/{id}`| `hasRole('ADMIN')` | Giả lập thanh toán (Đã Fix bảo mật) |

### 3.2. BillController (`/api/v1/bills`)
| Method | Endpoint | PreAuthorize / Security | Mô tả |
|--------|----------|-----------------------|-------|
| GET | `/application/{id}` | `hasAnyRole('ADMIN', 'STAFF', 'STUDENT')` | Xem hóa đơn của một hồ sơ |
| GET | `/` | `hasAnyRole('ADMIN', 'STAFF')` | Lấy toàn bộ danh sách hóa đơn |

### 3.3. SepayWebhookController (`/api/webhooks/sepay`)
| Method | Endpoint | PreAuthorize / Security | Mô tả |
|--------|----------|-----------------------|-------|
| POST | `/` | **Public** (Bảo vệ bằng HMAC) | Cổng nhận webhook từ SePay |

---

## Chương 4: Đánh giá chất lượng và Nợ kỹ thuật (Technical Debt)

### 4.1. Điểm mạnh đáp ứng luận văn
- Áp dụng thành công **Saga Choreography Pattern**, điều mà rất ít hệ thống quản lý KTX truyền thống làm được. Module Payment không "biết" gì về Module Room hay Application.
- Cơ chế quét quá hạn giữ chỗ cực kỳ chặt chẽ (5 phút/lần).

### 4.2. Lỗi bảo mật đã khắc phục
- `[BUG-SECURITY-04]`: Đã bổ sung `@PreAuthorize` cho `BillController`, ngăn chặn kẻ gian đọc lén hóa đơn của toàn bộ sinh viên.
- `[BUG-SECURITY-05]`: Đã bổ sung `@PreAuthorize` cho tính năng `mock-success`, ngăn chặn khai thác lố bịch để qua mặt hệ thống thanh toán.

### 4.3. Roadmap phát triển tương lai
- Hoàn thiện UI thống kê dòng tiền chi tiết trên Frontend (Doanh thu theo tòa nhà).
- Tích hợp thêm các cổng thanh toán ví điện tử khác.
