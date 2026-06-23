# SDMS PAYMENT-07: THIẾT KẾ PHÂN HỆ DỊCH VỤ VÀ LUỒNG NGHIỆP VỤ (SERVICE LAYER REFACTOR DESIGN)

**Tác giả**: Senior Java Architect | Spring Boot Architect | PostgreSQL Architect | DDD Architect | Technical Auditor của SDMS

---

## 1. PHÂN TÍCH VI PHẠM RANH GIỚI NGỮ CẢNH (BOUNDARY VIOLATION AUDIT)

Trong mã nguồn cũ, lớp [PaymentService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/service/PaymentService.java) đã vi phạm nghiêm trọng ranh giới ngữ cảnh Bounded Context của Room Module:

* **Tự ý ghi đè trạng thái thực thể của Room**:
  * Dòng 143: `assignment.setStatus(AssignmentStatus.OCCUPIED)`
  * Dòng 144: `assignment.setCheckInAt(LocalDateTime.now())`
  * Dòng 145: `assignmentRepository.save(assignment)`
  * Dòng 148: `bed.setStatus(BedStatus.OCCUPIED)`
  * Dòng 149: `bedRepository.save(bed)`
* **Liên kết phụ thuộc trực tiếp (Tight Coupling)**:
  * Tiêm trực tiếp `StudentHousingAssignmentRepository` và `BedRepository` vào PaymentService để lưu thay đổi thực thể của Room Module.
* **Hậu quả**: Vi phạm thiết kế Check-In vật lý của KTX, gây nguy cơ Lost Update số giường occupiedBeds do bỏ qua cơ chế khóa bi quan Room và các validation nghiệp vụ check-in của Room Module.
* **Giải pháp khắc phục**: Loại bỏ hoàn toàn 2 repository của Room khỏi `PaymentService`. Tách biệt nghiệp vụ thanh toán thành công và check-in thông qua hệ thống sự kiện hướng đối tượng (`PaymentSuccessEvent`).

---

## 2. LUỒNG THANH TOÁN THÀNH CÔNG CHUẨN (PAYMENT SUCCESS FLOW)

```
[Sinh viên hoàn tất Thanh toán]
            │
            ▼
[PaymentService.executePayment()] 
 ├── 1. Khóa bi quan hóa đơn: billRepository.findByIdForUpdate(billId)
 ├── 2. Cập nhật Payment -> SUCCESS, Bill -> PAID
 └── 3. Phát sự kiện nội bộ: ApplicationEventPublisher.publishEvent(new PaymentSuccessEvent(...))
            │
            ▼
[PaymentEventListener.handlePaymentSuccess()]
 ├── 1. Gọi Application Module ──► Cập nhật DormitoryApplication -> APPROVED
 ├── 2. Gọi Student Module ──────► Tạo hồ sơ Student mới
 ├── 3. Gọi User Module ─────────► Tạo tài khoản UserAccount (Status = PENDING_ACTIVATION, Role = STUDENT)
 └── 4. Gọi Room Module ─────────► Gán studentId vừa tạo vào StudentHousingAssignment
            │
            ▼
(Kết quả: Assignment và Bed vẫn giữ nguyên trạng thái RESERVED. Sinh viên đăng nhập portal lấy mã phòng)
            │
            ▼
[Sinh viên đến làm thủ tục nhập phòng tại KTX]
            │
            ▼
[Admin thực hiện Check-In tại quầy] ──► Gọi HousingAssignmentService.checkIn(assignmentId)
            │
            ▼
[Room Module cập nhật trạng thái] ──► Assignment -> OCCUPIED, Bed -> OCCUPIED
```

---

## 3. LUỒNG THANH TOÁN TIỀN MẶT CHUẨN (CASH PAYMENT FLOW)

1. **Khởi đầu**: Sinh viên đến quầy tiếp đón nộp tiền mặt trực tiếp cho Admin/Staff.
2. **Thực thi nghiệp vụ**:
   * Admin tra cứu hóa đơn của sinh viên trên hệ thống, nhập số tiền và bấm nút "Approve Cash Payment" gửi request lên API `/api/payments/cash/approve` (`CashPaymentRequest`).
   * `PaymentService.approveCashPayment` mở ra một Transaction Boundary độc lập:
     * Sử dụng **Pessimistic Lock** (`findByIdForUpdate`) để khóa dòng hóa đơn `Bill`.
     * Idempotency Check: Kiểm tra nếu hóa đơn đã được thanh toán đầy đủ (`PAID`), từ chối giao dịch tránh nộp dư tiền.
     * Tạo mã giao dịch đối soát tự động: `CASH-<UUID>`.
     * Lưu bản ghi `Payment` với trạng thái `SUCCESS` và phương thức `CASH`.
     * Cộng dồn `paidAmount` và cập nhật `Bill.status` sang `PAID` (nếu nộp đủ tiền).
     * Phát sự kiện `PaymentSuccessEvent` để đồng bộ đơn đăng ký, tạo sinh viên và tài khoản.
     * Commit giao dịch, giải phóng khóa.
3. **Phản hồi**: Hệ thống gửi email biên nhận tiền mặt tự động cho sinh viên.

---

## 4. LUỒNG THANH TOÁN TRỰC TUYẾN CHUẨN (ONLINE PAYMENT FLOW)

1. **Khởi tạo**: Sinh viên mở ứng dụng di động, bấm nút thanh toán hóa đơn.
2. **Giao dịch PENDING**:
   * Ứng dụng gửi request lên Backend API.
   * Backend tạo bản ghi `Payment` ở trạng thái **`PENDING`** cùng mã `transactionCode` và `appTransactionId` duy nhất.
   * Backend gọi API đối tác (MoMo/VNPay) sinh Link/QR thanh toán, trả về ứng dụng để chuyển hướng người dùng.
3. **Nhập cuộc Webhook (IPN Callback)**:
   * Sinh viên quét QR chuyển tiền thành công. Cổng thanh toán gọi Webhook Backend Callback API.
   * Bộ điều phối IPN Controller nhận request và gọi `PaymentService.processPaymentCallback` chạy trong Transaction:
     * **Xác thực chữ ký số (Signature Verification)** của payload phản hồi từ MoMo/VNPay để chặn đứng các cuộc tấn công giả mạo kết quả.
     * Áp dụng **Pessimistic Lock** (`findByIdForUpdate`) trên `Bill` liên quan.
     * Idempotency Check: Tìm kiếm giao dịch trong cơ sở dữ liệu. Nếu trạng thái giao dịch đã xử lý thành công (`SUCCESS`), phản hồi OK ngay lập tức.
     * Cập nhật `Payment` sang `SUCCESS` (hoặc `FAILED` nếu cổng báo lỗi thanh toán).
     * Cập nhật `Bill` sang `PAID` và phát sự kiện `PaymentSuccessEvent` để đồng bộ.
     * Commit giao dịch, giải phóng khóa.

---

## 5. PHÂN TÍCH VÀ PHÒNG CHỐNG LỖI ĐỒNG THỜI (CONCURRENCY ANALYSIS)

* **Double Payment (Thanh toán hai lần)**:
  * *Tình huống*: Người dùng click nút thanh toán tiền mặt/chuyển khoản liên tiếp tạo ra hai luồng xử lý song song cho cùng một hóa đơn.
  * *Giải quyết*: Cơ chế **Pessimistic Lock** (`findByIdForUpdate`) trên `Bill` sẽ khóa dòng hóa đơn lại. Luồng 2 bị block cho đến khi luồng 1 hoàn tất giao dịch và commit (thay đổi Bill sang `PAID`). Khi luồng 2 thức dậy, nó kiểm tra trạng thái và ném ra lỗi `Bill already paid`, chặn đứng nguy cơ thu thừa tiền.
* **Duplicate Callback (IPN trùng lập)**:
  * *Tình huống*: Cổng thanh toán MoMo/VNPay gửi lại IPN Callback nhiều lần do lỗi mạng hoặc độ trễ phản hồi.
  * *Giải quyết*: Ràng buộc **Unique Constraint** trên cột `transaction_code` ở DB chặn đứng mọi nỗ lực ghi trùng. Bộ lọc trạng thái ở tầng Java (`findByTransactionCode`) trong phạm vi transaction được khóa bi quan cũng sẽ phát hiện giao dịch đã xử lý để bỏ qua an toàn.
* **Lost Update (Mất cập nhật dữ liệu)**:
  * *Tình huống*: Admin đang chỉnh sửa nội dung hóa đơn (description, dueDate) và bấm lưu cùng lúc luồng Callback online cập nhật hóa đơn sang `PAID`.
  * *Giải quyết*: Trường kiểm soát phiên bản `@Version` (Khóa lạc quan) trên `Bill` sẽ phát hiện sự không khớp chỉ số phiên bản khi một trong hai luồng lưu trước, luồng lưu sau sẽ bị từ chối thay vì âm thầm đè đè đè dữ liệu trạng thái của nhau.
* **Replay Attack (Tấn công phát lại kết quả)**:
  * *Tình huống*: Kẻ tấn công bắt lén gói tin webhook thành công và phát lại gói tin đó lên API của chúng ta để nhận phòng miễn phí.
  * *Giải quyết*: Tầng bảo mật IPN Controller bắt buộc phải chạy giải thuật xác thực mã Hmac SHA256 ký số kèm theo khóa bí mật của hệ thống đối tác nhằm đảm bảo nội dung payload không bị can thiệp và nguồn gửi là chính thống.

---

## 6. KẾT LUẬN PHÂN LOẠI FILE HÀNH ĐỘNG

### FILES TO MODIFY
1. [BillService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/service/BillService.java)
   *(Sửa đổi package, đổi kiểu dữ liệu đối số liên kết sang UUID)*
2. [PaymentService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/service/PaymentService.java)
   *(Loại bỏ các repository của Room Module, viết lại luồng executePayment để loại bỏ Check-In tự động, tiêm ApplicationEventPublisher phát sự kiện PaymentSuccessEvent)*
3. [PaymentController.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/controller/PaymentController.java)
   *(Sửa đổi package, đổi vai trò bảo mật sang STUDENT)*

### FILES TO CREATE
1. [PaymentSuccessEvent.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/event/PaymentSuccessEvent.java)
   *(Tạo sự kiện thanh toán thành công)*
2. [PaymentEventListener.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/event/PaymentEventListener.java)
   *(Tạo bộ lắng nghe sự kiện đồng bộ/bất đồng bộ phối hợp tạo Student/UserAccount và đổi trạng thái Application)*

### FILES TO DELETE
* Không có (Tập tin `PaymentExpirationService.java` cũ đã bị xóa ở PAYMENT-06).
