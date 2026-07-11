# Module Thanh toán (Payment) - Mục lục Tài liệu

Thư mục này chứa toàn bộ các tài liệu đặc tả nghiệp vụ, kiến trúc và vòng đời của module Thanh toán (Payment) trong Backend. Tất cả tài liệu ở đây đóng vai trò là SSOT (Single Source of Truth) cho tiến trình phát triển và kiểm thử liên quan đến Thanh toán.

## 📑 Danh sách tài liệu

| Tài liệu | Mô tả nội dung |
| :--- | :--- |
| [**SSR-PaymentModule.md**](./SSR-PaymentModule.md) | Đặc tả các Yêu cầu Chức năng (Functional Requirements) cốt lõi của module Thanh toán, bao gồm tạo hóa đơn, thanh toán online/tiền mặt, và xử lý tự động. |
| [**payment-lifecycle.md**](./payment-lifecycle.md) | Trình bày luồng trạng thái của `Bill` và `Payment`, các sự kiện Event-Driven (như `BedReservedEvent`, `PaymentSuccessEvent`), và đối chiếu với mã nguồn thực tế. |
| [**payment-gateway-integration.md**](./payment-gateway-integration.md) | Giải thích quy trình tích hợp với cổng thanh toán (Webhook), các biện pháp đảm bảo tính bất biến (Idempotency) và bảo mật (Xác thực chữ ký). |

## 🔗 Liên kết liên quan
- **Code Frontend:** `sdms-frontend/src/api/paymentApi.ts`, `sdms-frontend/src/pages/admin/PaymentManagement.tsx`
- **Code Backend:** `sdms-backend/src/main/java/com/sdms/backend/modules/payment/`
- **Tài liệu API:** Xem thư mục `sdms-backend/docs/api/` để biết thông số Request/Response chi tiết của các API thanh toán.
