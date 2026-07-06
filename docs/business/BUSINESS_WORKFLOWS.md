# BUSINESS WORKFLOWS

## Purpose
Tài liệu hóa các luồng nghiệp vụ thực tế trong hệ thống, chỉ ra trình tự các bước, Actor và Event.

## Scope
Toàn bộ luồng được implement trong Controller → Service → Event → Listener → Database.

## Source of Truth
Controllers, Services, Application Events, Event Listeners, Schedulers.

## Contents

### WF-01: Lưu trú KTX (Registration → Check-in)
*   **Actor:** Admin, Student.
*   **Trigger:** Sinh viên muốn đăng ký nội trú trong đợt đăng ký đang mở.
*   **Steps:**
    1. Admin mở `RegistrationPeriod` (kèm ngày bắt đầu, kết thúc, hạn mức).
    2. Student nộp `DormitoryApplication` (Status: `PENDING`).
    3. Admin xem xét hồ sơ (`UNDER_REVIEW`), có thể yêu cầu bổ sung (`REQUEST_REVISION`).
    4. Admin duyệt → Hệ thống xếp giường → tạo `Assignment` (`RESERVED`) → sinh `Bill` loại `ACCOMMODATION_FEE` (Status: `UNPAID`) → `Application` → `WAITING_PAYMENT` [Rule: BR-H01].
    5. Student thanh toán `Bill` → `PAID` → `Assignment` → `PENDING_CHECKIN`.
    6. Admin thực hiện Check-in tại quầy → `Assignment` → `OCCUPIED`.
*   **Alternative Flow:** Student không thanh toán trong 3 ngày → `ReservationExpiryJob` → `Assignment` → `EXPIRED`, `Bill` → `CANCELLED` [Rule: BR-F01].
*   **Evidence:** `RegistrationAdminController`, `ApplicationReviewController`, `HousingAssignmentService`, `ReservationExpiryJob`, `PaymentSuccessEvent`, `CheckInController`.

---

### WF-02: Trả phòng (Checkout)
*   **Actor:** Student, Admin.
*   **Trigger:** Sinh viên muốn rời KTX sớm trước hạn hợp đồng.
*   **Steps:**
    1. Student nộp `CheckoutRequest` (Status: `PENDING`).
    2. Admin duyệt (`APPROVED`).
    3. Hệ thống phát `StudentCheckedOutEvent` → `Assignment` → `CHECKED_OUT` → Giường trả về `AVAILABLE` [Rule: BR-H02].
    4. `CheckoutRequest` → `COMPLETED`.
*   **Evidence:** `CheckoutRequestController`, `CheckoutRequestAdminController`, `StudentCheckoutEventListener`, `StudentCheckedOutEvent`.

---

### WF-03: Gia hạn Lưu trú (Stay Extension)
*   **Actor:** Student, Admin.
*   **Trigger:** Sinh viên muốn gia hạn thêm thời gian lưu trú.
*   **Steps:**
    1. Student nộp `StayExtension` (Status: `PENDING`).
    2. Admin duyệt (`APPROVED`) → ngày kết thúc `Assignment` được kéo dài.
    3. Admin từ chối (`REJECTED`).
*   **Evidence:** `StayExtensionController`, `StayExtensionAdminController`, `ExtensionApprovedEvent`, `StudentEventListener`.

---

### WF-04: Vòng đời Khuôn mặt (Face Lifecycle)
*   **Actor:** Student, Admin, AI Server.
*   **Trigger:** Sinh viên muốn sử dụng cửa Face ID.
*   **Steps:**
    1. Student upload ảnh → `FaceProfile` = `PENDING`.
    2. Admin duyệt → Hệ thống gửi ảnh lên AI Server → Trích xuất Vector → lưu `FaceEmbedding` → `FaceProfile` = `APPROVED`.
    3. Student xác thực được tại cổng.
*   **Alternative Flow (Từ chối):** Admin từ chối ảnh không đủ chất lượng → `REJECTED` → Student upload lại → `PENDING`.
*   **Exception Flow (Thu hồi):** Admin phát hiện vi phạm sau khi `APPROVED` → Thu hồi → `REVOKED`.
*   **Evidence:** `FaceStudentController`, `FaceAdminController`, `FaceProfileApprovedEvent`, `FaceProfileRejectedEvent`, `FaceProfileRevokedEvent`, `FaceSyncReadyEvent`.

---

### WF-05: Kiểm soát Ra vào (Smart Access)
*   **Actor:** ESP32 (IoT), Server.
*   **Trigger:** ESP32 gửi thông tin thẻ RFID hoặc ảnh khuôn mặt lên Server.
*   **Steps:**
    1. ESP32 gọi `POST /api/v1/smartaccess/verify/card` (RFID) hoặc `POST /api/v1/smartaccess/verify/face`.
    2. Server kiểm tra `Idempotency` theo `eventId` [Rule: BR-S04].
    3. Server kiểm tra cờ Khẩn cấp (Emergency) → Nếu bật: trả về `GRANTED` ngay [Rule: BR-S03].
    4. Server kiểm tra `FaceProfileStatus == APPROVED` [Rule: BR-S02].
    5. Server đánh giá `CurfewPolicy` và `TimeWindowPolicy`.
    6. Server trả kết quả `GRANTED` hoặc `DENIED` → ESP32 thực thi.
    7. Server ghi `AccessHistory`.
*   **Evidence:** `IotVerificationController`, `AccessEvaluationService`, `EligibilityEvaluationService`, `IdentityVerifiedEvent`, `AccessGrantedEvent`, `AccessDeniedEvent`.

---

### WF-06: Mở cửa từ xa (Remote Unlock)
*   **Actor:** Admin/Staff.
*   **Trigger:** Admin cần mở một cổng cụ thể từ xa qua Web.
*   **Steps:**
    1. Admin gọi `POST /api/v1/access/gates/{gateId}/unlock`.
    2. Server phát `RemoteUnlockEvent`.
    3. Cổng mở → ghi `AccessHistory` với `VerificationMethod = REMOTE_UNLOCK`.
*   **Evidence:** `RemoteUnlockController`, `RemoteUnlockService`, `RemoteUnlockEvent`.

---

### WF-07: Tính tiền điện tự động
*   **Actor:** System (Scheduler).
*   **Trigger:** Scheduler chạy tự động vào 0h ngày cuối tháng (`cron: 0 0 0 L * ?`).
*   **Steps:**
    1. `ElectricityUsageScheduler` tạo `ElectricityUsage` (chỉ số đầu kỳ, cuối kỳ, tổng kWh) cho từng phòng.
    2. Phát `ElectricityBillCalculatedEvent`.
    3. `ElectricityBillListener` tạo `Bill` loại `ELECTRIC_FEE` (Status: `UNPAID`).
*   **Evidence:** `ElectricityUsageScheduler`, `ElectricityBillCalculatedEvent`, `ElectricityBillListener` (tất cả thuộc module `payment`), Migration `V29__init_utility_module.sql`.

---

### WF-08: Đối soát thanh toán (SePay Webhook)
*   **Actor:** System (SePay Bank Gateway).
*   **Trigger:** SePay gọi callback khi phát hiện giao dịch ngân hàng khớp.
*   **Steps:**
    1. `SepayWebhookController` nhận payload (xác thực bằng API Key).
    2. `PaymentService` đối chiếu với mã `Bill` trong mô tả giao dịch.
    3. Nếu khớp: `Bill` → `PAID` → phát `PaymentSuccessEvent`.
    4. `BillGenerationListener` / `PaymentWorkflowListener` xử lý downstream (cập nhật Assignment, gửi notification).
*   **Evidence:** `SepayWebhookController`, `SepayService`, `SepayReconciliationJob`, `PaymentSuccessEvent`, `BillEventListener`.

---

### WF-09: Hệ thống Thông báo & Issue Report
*   **Actor:** Admin, Student, System.
*   **Trigger 1 (System):** Hệ thống tự động tạo Notification sau các sự kiện nghiệp vụ (Bill, Face, Application).
*   **Trigger 2 (Admin):** Admin gửi thông báo chung cho sinh viên.
*   **Trigger 3 (Student):** Sinh viên gửi báo cáo hỏng hóc (Issue Report).
*   **Steps (Issue Report):**
    1. Student gọi `POST /api/v1/notifications/issues` với `IssueReportRequest`.
    2. Hệ thống đóng gói thành Notification với type `SYSTEM` gửi về Admin.
    3. Admin đọc và xử lý qua `AdminNotificationController`.
*   **Evidence:** `NotificationController`, `AdminNotificationController`, `NotificationWorkflowListener`, `IssueReportRequest`.

## Related Documents
- [BUSINESS_RULES](./BUSINESS_RULES.md)
- [STATE_MACHINES](./STATE_MACHINES.md)
- [PERMISSION_MATRIX](./PERMISSION_MATRIX.md)
