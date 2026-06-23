# SDMS PAYMENT-09: THIẾT KẾ KIẾN TRÚC CỔNG THANH TOÁN VÀ WEBHOOK (PAYMENT GATEWAY & WEBHOOK ARCHITECTURE DESIGN)

**Tác giả**: Senior Java Architect | Spring Boot Architect | PostgreSQL Architect | DDD Architect | Technical Auditor của SDMS

---

## 1. THIẾT KẾ TÍCH HỢP CÁC CỔNG THANH TOÁN (PAYMENT GATEWAYS)

### A. MoMo Integration Design
* **Khởi tạo thanh toán (Create Payment)**:
  * Backend gọi API `/v2/gateway/api/create` của MoMo để tạo phiên thanh toán.
  * Payload yêu cầu chứa: `partnerCode`, `orderId` (chính là `appTransactionId` của hệ thống chúng ta), `amount`, `orderInfo` (mô tả hóa đơn), `redirectUrl` (client quay lại sau khi đóng tiền), `ipnUrl` (Webhook Backend Callback), và `signature` (HMAC-SHA256).
  * MoMo phản hồi đối tượng chứa: `payUrl` (Link thanh toán) và `qrCodeUrl` (Mã QR thanh toán).
* **IPN Callback (Webhook)**:
  * MoMo gọi trực tiếp Webhook `/api/payments/momo/ipn` của Backend khi giao dịch hoàn tất.
  * Hệ thống giải mã và thực hiện **Signature Verification** (Xác thực chữ ký) dựa trên khóa bí mật `secretKey` trước khi cập nhật DB.

### B. VNPay Integration Design
* **Khởi tạo thanh toán**:
  * Không cần gọi API khởi tạo. Hệ thống sinh trực tiếp đường dẫn thanh toán (`vnp_PaymentUrl`) bằng cách tạo tập hợp tham số query string (Query Parameters) bao gồm: `vnp_Version`, `vnp_Command`, `vnp_TmnCode`, `vnp_Amount`, `vnp_TxnRef` (mã giao dịch nội bộ), `vnp_OrderInfo`, `vnp_ReturnUrl` (Redirect client), `vnp_IpAddr` (IP client), và ký số bằng giải thuật HMAC-SHA512 để sinh trường kiểm thử checksum `vnp_SecureHash`.
* **Redirect / IPN Url**:
  * `vnp_ReturnUrl` điều hướng client hiển thị UI kết quả.
  * VNPay gọi song song Webhook `/api/payments/vnpay/ipn` (IPN URL) để báo trạng thái an toàn. Backend thực hiện kiểm tra `vnp_SecureHash` trước khi xử lý giao dịch.

### C. Bank Transfer (VietQR / Chuyển khoản ảo)
* **VietQR Generation**:
  * Hệ thống tự động tạo ảnh QR động VietQR dựa trên định dạng NAPAS 247:
    `https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-vietqr.png?amount=<AMOUNT>&addInfo=<TRANSACTION_CODE>`
  * `TRANSACTION_CODE` là mã duy nhất sinh từ hệ thống (ví dụ: `TXN-<UUID>`).
* **Đối soát tự động (Reconciliation)**:
  * Tích hợp dịch vụ webhook của bên thứ ba (như PayOS, Cassso) hoặc API giám sát biến động số dư tài khoản ngân hàng để nhận Callback khi có luồng tiền vào tài khoản.
  * Webhook gửi payload biến động số dư chứa nội dung chuyển khoản -> Backend lọc tìm `TRANSACTION_CODE` để cập nhật trạng thái hóa đơn.

---

## 2. PHÂN TÍCH VÀ PHÒNG NGỪA RỦI RO ĐỒNG THỜI (VERIFY CONCURRENCY)

| Câu hỏi xác minh (Verify) | Đánh giá | Cơ chế phòng ngự kỹ thuật |
| :--- | :---: | :--- |
| **Can Double Payment happen?**<br>*(Có thể thanh toán trùng không?)* | **KHÔNG** | Bảo vệ bởi khóa bi quan `billRepository.findByIdForUpdate(billId)` (`SELECT ... FOR UPDATE`). Luồng giao dịch 2 bị chặn lại cho đến khi luồng 1 commit và đổi Bill sang `PAID`, sau đó luồng 2 thức dậy sẽ thấy hóa đơn đã trả để báo lỗi. |
| **Can Duplicate Callback happen?**<br>*(Webhook gọi trùng lặp có hại không?)* | **KHÔNG** | Chốt chặn cơ sở dữ liệu `UNIQUE (transaction_code)` trên bảng `payments` sẽ ném lỗi trùng khóa nếu 2 luồng callback chạy song song lưu cùng mã giao dịch. Ở tầng Java, kiểm tra trạng thái giao dịch trước khi xử lý (Idempotency Check) trong vùng khóa bi quan sẽ bỏ qua giao dịch đã xử lý thành công. |
| **Can Replay Attack happen?**<br>*(Tấn công phát lại có thành công không?)* | **KHÔNG** | Bắt buộc phải **Signature Verification** (Xác thực chữ ký số) của mọi cuộc gọi Webhook từ MoMo/VNPay dựa trên Signature mã hóa đi kèm. Nếu payload bị sửa đổi hoặc giả mạo, chữ ký sẽ không khớp và Backend lập tức từ chối xử lý (trả về lỗi HTTP 400). |
| **Can Lost Update happen?**<br>*(Có bị mất cập nhật dữ liệu không?)* | **KHÔNG** | Thực thể `Bill` chứa trường `@Version Long version`. Bất kỳ xung đột ghi đè đồng thời nào từ Admin và Callback Webhook sẽ kích hoạt Optimistic Locking Exception, rollback giao dịch thay vì âm thầm ghi đè dữ liệu. |
| **Can Payment Success Event fire twice?**<br>*(Sự kiện thành công có bị bắn ra 2 lần?)* | **KHÔNG** | Sự kiện `PaymentSuccessEvent` chỉ được kích hoạt bên trong khối logic `executePayment` nếu và chỉ nếu trạng thái hóa đơn chuyển đổi từ `UNPAID` sang `PAID`. Do giao dịch thanh toán tuần tự hóa nhờ khóa bi quan, trạng thái Bill chỉ chuyển sang `PAID` duy nhất 1 lần, ngăn chặn việc phát sự kiện trùng. |
| **Can Student/UserAccount be created twice?**<br>*(Student/Tài khoản có bị nhân bản?)* | **KHÔNG** | 1. Sự kiện thành công chỉ phát ra 1 lần duy nhất.<br>2. Trong listener `PaymentEventListener`, hệ thống kiểm tra tồn tại thông qua `existsByCccd` và `findByEmail` trước khi tạo lập. Ràng buộc `UNIQUE` trên CCCD và Email ở tầng cơ sở dữ liệu đóng vai trò là chốt chặn cuối cùng. |

---

## 3. THIẾT KẾ LUỒNG NGHIỆP VỤ (BUSINESS FLOW)

### Luồng tích hợp thanh toán Online (QR Payment / MoMo / VNPay):
```
[Sinh viên chọn cổng thanh toán]
            │
            ▼
[Yêu cầu khởi tạo: POST /api/payments/online] 
 ├── 1. Khóa bi quan Bill (findByIdForUpdate)
 ├── 2. Tạo bản ghi Payment (Status = PENDING, transactionCode = appTransactionId)
 ├── 3. Gọi MoMo/VNPay sinh url thanh toán hoặc QR Code VietQR
 └── 4. Trả Payment URL / QR Code về cho Mobile App
            │
            ▼
[Sinh viên quét mã / thanh toán trên cổng]
            │
            ▼
[IPN Webhook của Gateway gọi Backend] 
 ├── 1. Kiểm tra Chữ ký số Webhook (HMAC-SHA256/SHA512)
 ├── 2. Khóa bi quan Bill (findByIdForUpdate)
 ├── 3. Kiểm tra Idempotency (Giao dịch đã SUCCESS chưa?) -> Nếu rồi, trả về OK cho Gateway
 ├── 4. Cập nhật Payment -> SUCCESS, Bill -> PAID
 └── 5. Bắn sự kiện PaymentSuccessEvent -> Listener tự động sinh Student & UserAccount
```

---

## 4. KẾT LUẬN PHÂN LOẠI FILE HÀNH ĐỘNG

### FILES TO CREATE
Do cấu hình fake online gateway ở PAYMENT-08 đã đáp ứng đầy đủ tính năng di chuyển, các file tích hợp MoMo/VNPay thực tế (như các client kết nối API đối tác) được phân loại sang **Pha tiếp theo (Future Phase)**. Tuy nhiên, các lớp sự kiện và listener đã được thiết lập hoàn hảo.

### FILES TO MODIFY
* Không phát sinh sửa đổi file trong pha này vì toàn bộ thiết kế dịch vụ đã đóng băng ở PAYMENT-08.

---

## FINAL DECISION

**PAYMENT-09 STATUS: PASS**

*(Bản thiết kế kiến trúc tích hợp cổng thanh toán MoMo/VNPay/Bank Transfer và cơ chế bảo mật Webhook đã đạt chuẩn kiến trúc KTX SDMS. Module Payment sẵn sàng chuyển sang bước hoàn tất phân hệ).*
