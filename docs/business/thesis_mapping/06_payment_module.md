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
