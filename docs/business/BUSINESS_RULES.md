# BUSINESS RULES

## Purpose
Tập hợp toàn bộ quy tắc nghiệp vụ (Business Rules) đang được enforce trong code. Không chứa Workflow hay State Machines.

## Scope
Validation, Condition, Guard, Exception trong Service, Validator, Scheduler, Listener, Security.

## Source of Truth
Validators, Services, Event Listeners, Schedulers, SecurityConfig.

## Contents

### BR-H01: Ràng buộc Trạng thái Giường khi xếp phòng
*   **Description:** Chỉ được gán giường (`Assignment`) khi `Bed` có trạng thái `AVAILABLE`.
*   **Trigger:** Khi Admin xếp giường cho sinh viên sau khi duyệt đơn.
*   **Validation:** Kiểm tra `BedStatus == AVAILABLE`. Nếu không, ném ngoại lệ chặn giao dịch.
*   **Evidence:** `BedValidator.java`, `HousingAssignmentService.java`.

### BR-H02: Giải phóng Giường khi kết thúc lưu trú
*   **Description:** Bất kỳ hành động nào kết thúc lưu trú (Checkout, Assignment bị CANCELLED hoặc EXPIRED) bắt buộc phải trả giường về `AVAILABLE`.
*   **Trigger:** Nhận `StudentCheckedOutEvent` (Assignment → `CHECKED_OUT`) hoặc `AssignmentCancelledEvent` (Assignment → `CANCELLED` hoặc `EXPIRED`).
*   **Validation:** Cập nhật DB trong Transaction — không được phép thất bại.
*   **Evidence:** `StudentCheckoutEventListener.java`, `RoomCancellationListener.java`.

### BR-H03: Một sinh viên — Một Assignment OCCUPIED
*   **Description:** Hệ thống ngăn chặn sinh viên được gán vào nhiều giường đồng thời.
*   **Trigger:** Trước khi tạo Assignment mới.
*   **Validation:** Kiểm tra tồn tại Assignment đang `OCCUPIED` của sinh viên đó.
*   **Evidence:** Migration `V12__add_active_assignment_bed_unique_constraint.sql`, `HousingAssignmentService.java`.

### BR-F01: Hủy Assignment do quá hạn thanh toán
*   **Description:** Nếu `Bill` giữ chỗ không được thanh toán (Status không phải `PAID`) sau 3 ngày kể từ ngày phát sinh, hệ thống tự động hủy `Assignment` liên quan.
*   **Trigger:** Job chạy nền tự động theo lịch.
*   **Validation:** So sánh `dueDate` của Bill với thời điểm hiện tại. `Bill` → `CANCELLED`, `Assignment` → `EXPIRED`.
*   **Evidence:** `ReservationExpiryJob.java` (Scheduler trong module `room`).

### BR-F02: Hóa đơn quá hạn (Overdue)
*   **Description:** `Bill` chưa thanh toán sau ngày đến hạn sẽ bị chuyển sang `OVERDUE` bởi job tự động.
*   **Trigger:** `BillOverdueJob` chạy định kỳ.
*   **Validation:** So sánh `dueDate` của Bill với thời điểm chạy Job.
*   **Evidence:** `BillOverdueJob.java` (module `payment`).

### BR-F03: Chặn thanh toán khi Giữ chỗ đã bị hủy
*   **Description:** Không cho phép thanh toán `Bill` nếu nó được gắn với một `Assignment` đang ở trạng thái `EXPIRED` hoặc `CANCELLED` (đơn giữ chỗ đã hết hạn hoặc bị hủy).
*   **Trigger:** Student hoặc Admin thực hiện thanh toán (SePay Webhook hoặc Manual).
*   **Validation:** Truy vấn trạng thái `Assignment` từ `bill.assignmentId`. Khóa PESSIMISTIC_WRITE để chống Race Condition.
*   **Evidence:** `PaymentService.java` (`validateBillAndAmount`).

### BR-F04: Cấm thanh toán Tiền mặt (CASH) qua API Trực tuyến
*   **Description:** API thanh toán trực tuyến dành cho sinh viên (`processOnlinePayment`) nghiêm cấm truyền `PaymentMethod.CASH`. Thanh toán tiền mặt chỉ được thực hiện bởi Admin.
*   **Trigger:** Sinh viên gọi API `/api/v1/payments/online`.
*   **Validation:** Kiểm tra tham số `method == PaymentMethod.CASH`.
*   **Evidence:** `PaymentService.java` (`processOnlinePayment`).

### BR-S01: IDOR Protection — Phân quyền theo JWT
*   **Description:** Mọi thao tác lấy/sửa dữ liệu cá nhân của sinh viên phải dùng định danh từ JWT, không nhận từ Payload hoặc Path Variable.
*   **Trigger:** API có Role `STUDENT` được gọi.
*   **Validation:** Backend tự trích xuất `StudentId` hoặc `username` từ `SecurityContext`. Không bao giờ tin tham số đầu vào.
*   **Evidence:** `StudentController.java`, `FaceStudentController.java`, `BillController.java`.

### BR-S02: Quyền xác thực khuôn mặt tại cổng
*   **Description:** Sinh viên chỉ được xác thực bằng khuôn mặt nếu `FaceProfile` đang ở trạng thái `APPROVED`.
*   **Trigger:** ESP32 gọi `POST /api/v1/smartaccess/verify/face`.
*   **Validation:** Truy vấn `FaceProfileStatus == APPROVED` trước khi so sánh Vector.
*   **Evidence:** `IotVerificationController.java`, `EligibilityEvaluationService.java`.

### BR-S03: Emergency Override — Bỏ qua mọi chính sách
*   **Description:** Khi cờ khẩn cấp được kích hoạt, hệ thống bỏ qua `TimeWindowPolicy`, `CurfewPolicy` và `FaceProfileStatus`, luôn trả về `GRANTED`.
*   **Trigger:** Admin kích hoạt qua `EmergencyOverrideController`.
*   **Validation:** Guard condition kiểm tra cờ khẩn cấp trước mọi bước đánh giá trong `AccessEvaluationService`.
*   **Evidence:** `EmergencyOverrideController.java`, `AccessEvaluationService.java`, `EmergencyOverrideService.java`.

### BR-S04: Idempotency cho IoT Request
*   **Description:** Mỗi request từ ESP32 mang một `eventId` duy nhất. Hệ thống từ chối xử lý nếu `eventId` đã được xử lý trước đó.
*   **Trigger:** Nhận request tại `IotVerificationController`.
*   **Validation:** Tra cứu bảng `processed_messages` theo `eventId`.
*   **Evidence:** `IdempotencyService.java`, `ProcessedMessage.java`, Migration `V21_05__create_processed_messages_table.sql`.

### BR-H04: Ràng buộc thay đổi sức chứa và trạng thái Phòng
*   **Description:** Sức chứa mới (Capacity) không được nhỏ hơn số giường đang `OCCUPIED`. Không được đổi `RoomStatus` sang `CLOSED` hoặc `MAINTENANCE` nếu phòng đang có Assignment `RESERVED` hoặc `OCCUPIED`.
*   **Trigger:** Admin cập nhật thông tin phòng.
*   **Validation:** Đếm số giường đang sử dụng và kiểm tra trạng thái Assignment.
*   **Evidence:** `RoomValidator.java` (`validateCapacity`, `validateCanClose`, `validateCanMaintenance`).

### BR-H05: Ràng buộc giới tính (Gender Policy) của Tầng
*   **Description:** Không được thay đổi chính sách giới tính của tầng (MALE/FEMALE) nếu tầng đó đang có sinh viên lưu trú hoặc đã đặt chỗ (`RESERVED` / `OCCUPIED`).
*   **Trigger:** Admin cập nhật thông tin tầng.
*   **Validation:** Kiểm tra tồn tại Assignment trong tầng.
*   **Evidence:** `FloorValidator.java` (`validatePolicyChange`).

### BR-H06: Điều kiện mở Đợt Gia hạn (Stay Extension)
*   **Description:** Sinh viên chỉ có thể nộp đơn gia hạn khi hệ thống đang có một đợt đăng ký hoạt động (Active) mang cờ `RegistrationType = CURRENT_RESIDENT`.
*   **Trigger:** Student gọi API `/api/v1/extensions`.
*   **Validation:** Query Database tìm `RegistrationPeriod` thỏa điều kiện.
*   **Evidence:** `StayExtensionService.java` (`submitExtension`).

### BR-H07: Điều kiện người nộp Đơn Gia hạn
*   **Description:** Sinh viên nộp đơn gia hạn bắt buộc phải có `StudentStatus == ACTIVE` và đang có hợp đồng phòng `AssignmentStatus == OCCUPIED`. Mỗi sinh viên chỉ được phép có tối đa 1 đơn gia hạn.
*   **Trigger:** Student gửi form `StayExtensionRequest`.
*   **Validation:** Kiểm tra DB `stayExtensionRepository.existsByStudent_StudentId`.
*   **Evidence:** `StayExtensionService.java` (`submitExtension`).

### BR-R01: Ràng buộc số lượng Đợt Đăng Ký và Đơn Đăng Ký
*   **Description:** Tại một thời điểm, chỉ có DUY NHẤT một `RegistrationPeriod` được phép hoạt động (Active). Mỗi sinh viên (dựa trên CCCD) chỉ được phép nộp tối đa 1 `DormitoryApplication` trong cùng một đợt đăng ký.
*   **Trigger:** Admin kích hoạt đợt đăng ký, hoặc Student nộp đơn.
*   **Validation:** Unique Database Index chặn các bản ghi trùng lặp.
*   **Evidence:** Migration `V6__add_unique_constraint_to_active_registration.sql`, `V16__application_module_refactor.sql` (`uk_period_cccd`).

### BR-R02: Ràng buộc công nợ khi trả phòng sớm (Checkout)
*   **Description:** Sinh viên không thể nộp đơn xin trả phòng (`CheckoutRequest`) nếu đang có hóa đơn tiền phòng hoặc điện nước chưa thanh toán (`UNPAID`, `PARTIALLY_PAID`, `OVERDUE`).
*   **Trigger:** Student gửi `CheckoutRequest`.
*   **Validation:** Query số lượng `Bill` chưa thanh toán của sinh viên.
*   **Evidence:** `CheckoutRequestService.java` (`submitCheckoutRequest`).

### BR-R03: Ràng buộc Yêu cầu Bổ sung Hồ sơ
*   **Description:** Admin chỉ có thể yêu cầu sinh viên bổ sung hồ sơ nếu có ít nhất 1 tài liệu (VerificationDocument) bị đánh dấu là Không hợp lệ (`INVALID`).
*   **Trigger:** Admin gọi API Request Revision.
*   **Validation:** Kiểm tra danh sách tài liệu đính kèm của Application.
*   **Evidence:** `ApplicationReviewService.java` (`requestRevision`).

### BR-A01: Kích hoạt Tài khoản (Account Activation)
*   **Description:** Sinh viên chỉ được đổi mật khẩu tạm thời và kích hoạt tài khoản khi ở trạng thái `PENDING_ACTIVATION`. Quá trình này khóa bản ghi DB (`PESSIMISTIC_WRITE`) để chống Double Activation.
*   **Trigger:** Student gọi API Activate Account.
*   **Validation:** Kiểm tra trạng thái tài khoản.
*   **Evidence:** `AuthService.java` (`activate`).

### BR-A02: Độ phức tạp mật khẩu kích hoạt
*   **Description:** Khi sinh viên kích hoạt tài khoản (`ActivateAccountRequest`), mật khẩu mới bắt buộc phải tuân thủ chuẩn: 8-50 ký tự, ít nhất 1 chữ thường, 1 chữ hoa, 1 số, 1 ký tự đặc biệt, không chứa khoảng trắng.
*   **Trigger:** Student gửi request `POST /api/v1/auth/activate`.
*   **Validation:** Regex pattern trong DTO `@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!])(?=\\S+$).{8,50}$")`.
*   **Evidence:** `ActivateAccountRequest.java`.

### BR-R08: Chuyển hàng đợi khi KTX hết chỗ (Waiting List)
*   **Description:** Nếu Admin duyệt hồ sơ nhưng KTX không còn giường khả dụng (`BedReservationFailedEvent`), hồ sơ sẽ tự động chuyển sang trạng thái `WAITING_LIST` và hủy bỏ Payment Deadline.
*   **Trigger:** Hệ thống phát `BedReservationFailedEvent`.
*   **Validation:** Không có giường `AVAILABLE`.
*   **Evidence:** `ApplicationEventListener.java` (`handleBedReservationFailed`).

### BR-R09: Ràng buộc thăng hạng từ Hàng đợi (Promotion)
*   **Description:** Khi có sinh viên trả phòng (`BedReleasedEvent`), hệ thống tìm hồ sơ `WAITING_LIST` ưu tiên nhất cùng giới tính. Hồ sơ này chỉ được thăng hạng (trở về `PENDING` để Admin duyệt lại) 1 lần duy nhất trong vòng đời (`waitingListUsed = true`).
*   **Trigger:** Hệ thống phát `BedReleasedEvent`.
*   **Validation:** Trạng thái phải là `WAITING_LIST` và cờ `waitingListUsed == false`.
*   **Evidence:** `WaitingListValidator.java`, `ApplicationEventListener.java`.

### BR-I01: Giới hạn Đăng ký Khuôn mặt (Face AI)
*   **Description:** Mỗi sinh viên chỉ được phép có 1 hồ sơ khuôn mặt ở trạng thái `APPROVED` hoặc `PENDING`. Không cho phép gửi yêu cầu thay thế (Replacement) nếu đã có 1 yêu cầu thay thế đang chờ xử lý (`pendingFaceImageUrl != null`).
*   **Trigger:** Student gọi API đăng ký khuôn mặt hoặc yêu cầu thay đổi khuôn mặt.
*   **Validation:** Kiểm tra lịch sử `FaceProfile` trong database.
*   **Evidence:** `FaceProfileServiceImpl.java` (`registerFace`).

### BR-I02: Smart Access - Chiến lược giờ giới nghiêm (Curfew Strategy)
*   **Description:** Khi quét khuôn mặt tại cổng, sinh viên Nội trú (`BOARDING`) sẽ bị kiểm tra bởi `CurfewResolutionStrategy` (Giờ giới nghiêm). Các đối tượng khác sẽ bị kiểm tra bởi `TimeWindowEvaluationStrategy`.
*   **Trigger:** IoT Module gửi event `FaceRecognizedEvent`.
*   **Validation:** Dựa trên `ResidentType` trả về từ `StudentEligibilitySnapshot`.
*   **Evidence:** `AccessEvaluationService.java` (`evaluateAccess`).

### BR-N01: Khoan dung lỗi gửi thông báo (Notification Fault Tolerance)
*   **Description:** Khi thực hiện gửi Email và ghi lịch sử (Audit Log) vào cơ sở dữ liệu. Lệnh ghi Database `historyRepository.save(history)` phải được bọc trong khối `try-catch` nằm trong `finally`.
*   **Trigger:** Hệ thống gửi Email Notification.
*   **Validation:** Ngay cả khi DB lỗi hoặc quá tải (lỗi ghi log), hệ thống không được phép ném Exception làm sập luồng nghiệp vụ chính (như duyệt đơn đăng ký, thanh toán).
*   **Evidence:** `NotificationServiceImpl.java` (`sendHtmlEmail`).

### BR-U01: Kiểm soát định dạng File đính kèm
*   **Description:** API Upload mặc định (cho sinh viên tải lên CMND/CCCD, ảnh minh chứng) sẽ nghiêm cấm mọi file không phải định dạng hình ảnh.
*   **Trigger:** Request upload file MultipartFile.
*   **Validation:** Hệ thống chặn và ném `415 UNSUPPORTED_MEDIA_TYPE` nếu `contentType` không bắt đầu bằng `image/`.
*   **Evidence:** `CloudinaryService.java` (`uploadFile`).

## Related Documents
- [BUSINESS_GLOSSARY](./BUSINESS_GLOSSARY.md)
- [STATE_MACHINES](./STATE_MACHINES.md)
- [BUSINESS_WORKFLOWS](./BUSINESS_WORKFLOWS.md)
