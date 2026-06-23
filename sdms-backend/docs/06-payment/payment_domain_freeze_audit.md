# SDMS PAYMENT-03 & PAYMENT-05: ARCHITECTURAL AUDIT & REFACTOR PLAN DESIGN (CORRECTED PATCH)

**Tác giả**: Senior Java Architect | PostgreSQL Architect | Domain Driven Design Architect | SDMS Technical Governance Board

---

## SECTION 1 - DOMAIN BOUNDARY AUDIT

1. **Bill có phải Aggregate Root hay không?**
   * **CÓ**. `Bill` là Aggregate Root của ngữ cảnh Bounded Context **Payment**. Nó quản lý toàn bộ vòng đời tài chính của một khoản thu, chịu trách nhiệm thực thi các ràng buộc bất biến (invariant) về mặt nghiệp vụ tài chính, và bảo vệ tính nhất quán giao dịch của các đối tượng con trực thuộc.
2. **Payment có phải Aggregate Root hay chỉ là Child Entity?**
   * `Payment` chỉ là **Child Entity** nằm bên trong ranh giới Aggregate của `Bill`. Bản thân một giao dịch thanh toán (`Payment`) không thể tồn tại độc lập nếu không gắn liền với một hóa đơn gốc (`Bill`).
3. **StudentHousingAssignment liên kết với Bill như thế nào?**
   * Vì SDMS được xây dựng theo kiến trúc **Modular Monolith**, chúng ta **giữ nguyên liên kết JPA trực tiếp** để tối ưu hóa truy vấn và bảo toàn toàn vẹn dữ liệu:
     ```java
     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "assignment_id")
     private StudentHousingAssignment assignment;
     ```
   * *Ràng buộc*: Phân hệ Payment chỉ được phép **đọc (Read-only)** dữ liệu của `StudentHousingAssignment`, không được tự ý cập nhật trạng thái của nó.
4. **DormitoryApplication liên kết với Payment như thế nào?**
   * **Không liên kết trực tiếp ở tầng dữ liệu**. `DormitoryApplication` liên kết 1:1 với `StudentHousingAssignment`, còn `StudentHousingAssignment` liên kết 1:N với `Bill`, và `Bill` liên kết 1:N với `Payment`. Ở tầng nghiệp vụ, khi thanh toán thành công, hệ thống sử dụng cơ chế sự kiện hướng đối tượng (`PaymentSuccessEvent`) để thông báo cho các module liên quan xử lý.
5. **Student liên kết với Payment như thế nào?**
   * **Không liên kết trực tiếp**. Hóa đơn được gán cho một lượt ở phòng cụ thể (`StudentHousingAssignment`), và sinh viên chỉ được liên kết vào Assignment đó sau khi thanh toán thành công. Lịch sử hóa đơn của sinh viên sẽ được truy vấn gián tiếp thông qua `assignmentId`.

### Sơ đồ quan hệ nghiệp vụ liên kết (Domain Flow):
```
[DormitoryApplication] (App Domain Context)
      ↓ (Liên kết 1 : 1)
[StudentHousingAssignment] (Room Domain Context)
      ↓ (Liên kết JPA direct @ManyToOne)
[Bill] (Payment Domain Context - AGGREGATE ROOT)
      ↓ (Liên kết 1 : N)
[Payment] (Payment Domain Context - CHILD ENTITY)
```

---

## SECTION 2 - BILL LIFECYCLE AUDIT

1. **Trạng thái tồn tại**: Cả 5 trạng thái (`UNPAID`, `PARTIALLY_PAID`, `PAID`, `CANCELLED`, `OVERDUE`) đều được giữ lại trong enum [BillStatus](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/BillStatus.java).
2. **Cách SDMS sử dụng thực tế**:
   * `UNPAID`: Hóa đơn mới phát sinh (tiền phòng/tiền cọc ban đầu hoặc hóa đơn điện nước hàng tháng).
   * `PARTIALLY_PAID`: Sinh viên mới thanh toán một phần hóa đơn (thường chỉ áp dụng cho điện nước định kỳ).
   * `PAID`: Sinh viên đã nộp đủ 100% số tiền hóa đơn yêu cầu.
   * `OVERDUE`: Hóa đơn đã quá hạn đóng tiền (Quét tự động bởi Job để hủy đặt chỗ).
   * `CANCELLED`: Hóa đơn bị hủy do sinh viên rút đơn đăng ký hoặc thay đổi phòng ở.

---

## SECTION 3 - PAYMENT LIFECYCLE AUDIT

1. **Trạng thái giữ lại**: Cả 5 trạng thái (`PENDING`, `SUCCESS`, `FAILED`, `EXPIRED`, `REFUNDED`) đều được giữ lại trong enum [PaymentStatus](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/PaymentStatus.java).
2. **Mô hình hoạt động**:
   * **CASH**: Chuyển thẳng `PENDING` ──► `SUCCESS` ngay lập tức khi Admin xác nhận thu tiền mặt trực tiếp.
   * **BANK_TRANSFER**: Khởi tạo `PENDING` (chờ webhook đối soát chuyển khoản). Chuyển sang `SUCCESS` khi khớp lệnh giao dịch, hoặc `FAILED`/`EXPIRED` nếu lỗi/quá hạn.
   * **MOMO & VNPAY**: Khởi tạo `PENDING` và chuyển hướng sinh viên sang cổng thanh toán. Nhận kết quả IPN WebHook để chuyển thành `SUCCESS` hoặc `FAILED`. Hết phiên chuyển sang `EXPIRED`. Trạng thái `REFUNDED` áp dụng khi hoàn tiền qua API.

---

## SECTION 4 - BILL CREATION STRATEGY (CẬP NHẬT SỬA ĐỔI)

* **Cấu hình động cho hóa đơn ban đầu**: Hệ thống không đóng băng cứng việc tạo luôn luôn 2 hóa đơn. Thay vào đó:
  * **Hóa đơn phòng (`ACCOMMODATION_FEE`)**: Là hóa đơn **bắt buộc (Mandatory)**, luôn được sinh ra sau khi duyệt đơn và gán phòng thành công.
  * **Hóa đơn cọc (`DEPOSIT_FEE`)**: Là hóa đơn **không bắt buộc (Optional)**, được sinh ra hay không tùy thuộc vào cấu hình quy định tài sản của KTX hoặc loại phòng đặc thù.
* **Nguyên tắc đối soát**: Điều kiện thanh toán thành công để hoàn tất thủ tục online là **tất cả các hóa đơn ban đầu được sinh ra** liên kết với Assignment đó đều phải chuyển sang trạng thái `PAID`.

---

## SECTION 5 - PAYMENT SUCCESS FLOW & INTEGRATION (CẬP NHẬT SỬA ĐỔI)

Khi tất cả hóa đơn bắt buộc và tự chọn của lượt đăng ký phòng đạt trạng thái **SUCCESS** (Bill chuyển sang **PAID**), hệ thống phát sự kiện `PaymentSuccessEvent` để thực hiện luồng tích hợp:

### 1. Luồng chuẩn chuyển trạng thái đơn (ApplicationStatus Flow):
* **Trước thanh toán**: Admin duyệt đơn -> Trạng thái đơn chuyển sang `APPROVED` (Approved documents/eligibility) -> Giữ chỗ giường vật lý -> Trạng thái đơn chuyển sang **`WAITING_PAYMENT`**.
* **Sau thanh toán thành công (Payment Success)**: 
  * Trạng thái đơn đăng ký **giữ nguyên trạng thái hiện tại là `WAITING_PAYMENT`** (không quay lại trạng thái `APPROVED` trước đó).
  * Ở các pha tiếp theo (Future Phase), hệ thống sẽ đề xuất bổ sung thêm trạng thái chuyên biệt **`READY_FOR_CHECKIN`** vào enum để phản ánh chính xác trạng thái hồ sơ đã sẵn sàng Check-In vật lý.

### 2. Khởi tạo dữ liệu cư dân & Tài khoản đăng nhập:
* **Khởi tạo Student**: Tự động tạo lập hồ sơ [Student](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/student/entity/Student.java) để phục vụ định danh KTX.
* **Khởi tạo UserAccount**: Tạo tài khoản [UserAccount](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/user/entity/UserAccount.java) ở trạng thái `PENDING_ACTIVATION` với vai trò `STUDENT` để sinh viên đăng nhập portal.
* **Cập nhật Assignment**: Liên kết `student_id` vào trường `student` của [StudentHousingAssignment](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/entity/StudentHousingAssignment.java).
* **Trạng thái Assignment & Giường (Bed)**: **BẮT BUỘC giữ nguyên trạng thái `RESERVED`** (chưa dọn vào ở).

### 3. Quy trình làm thủ tục thực tế:
* Sinh viên đến KTX -> Kiểm tra hồ sơ giấy tờ gốc & Kiểm kê tài sản phòng -> Thực hiện Check-in trực tiếp -> Gọi API Check-in của Room Module -> Assignment và Bed chuyển sang **`OCCUPIED`**.

---

## SECTION 6 - CONCURRENCY AUDIT & LOCKING DESIGN

* **Pessimistic Lock**: Gọi `billRepository.findByIdForUpdate(billId)` (`SELECT ... FOR UPDATE`) để tuần tự hóa giao dịch thanh toán trực tuyến/tiền mặt, loại bỏ rủi ro Double Payment.
* **Optimistic Lock**: Giữ lại cột `@Version private Long version;` trên thực thể `Bill` làm chốt chặn bảo vệ tính nhất quán dữ liệu cho các luồng cập nhật thông tin hành chính đồng thời từ Admin (tránh Lost Update).
* **Ràng buộc duy nhất**: Đặt unique constraint trên cột `transaction_code` của bảng `payments` để ngăn chặn callback trùng lặp từ cổng đối tác.

---

## SECTION 7 - PHÂN TÍCH VAI TRÒ BILLSTATUS.OVERDUE

* **Đặc tả quét hết hạn**: [PaymentExpireJob.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/scheduler/PaymentExpireJob.java) chỉ quét thuộc tính `DormitoryApplication.paymentDeadline`, không quét `Bill.dueDate` để hủy đơn và giải phóng giường.
* **Hành vi trạng thái OVERDUE**:
  * Trạng thái `OVERDUE` trên hóa đơn ban đầu chỉ là trạng thái phản ánh hậu quả (Consequence) sau khi `PaymentExpireJob` thực hiện hủy đơn và giải phóng giường thành công.
  * **Xác nhận**: `OVERDUE` của hóa đơn hoàn toàn không tham gia giải phóng giường/phòng và không thay thế vai trò quét của `PaymentExpireJob`.
  * Đối với các hóa đơn định kỳ hàng tháng (điện/nước), trạng thái `OVERDUE` được sử dụng để kích hoạt các biện pháp hành chính như tự động khóa tài khoản ứng dụng `UserAccount` sang `LOCKED`.

---

## SECTION 8 - FINAL PAYMENT DOMAIN MODEL

### 1. Entity: `Bill` (Aggregate Root)
* `billId`: `UUID` (Khóa chính `@Id`, `@GeneratedValue(strategy = GenerationType.UUID)`)
* `billType`: Enum `BillType` (ACCOMMODATION_FEE, DEPOSIT_FEE, ELECTRIC_FEE, WATER_FEE, PENALTY_FEE)
* `amount`: `BigDecimal` (Số tiền cần đóng, > 0)
* `paidAmount`: `BigDecimal` (Số tiền đã đóng, mặc định 0.00)
* `status`: Enum `BillStatus` (UNPAID, PARTIALLY_PAID, PAID, CANCELLED, OVERDUE)
* `dueDate`: `LocalDate` (Hạn thanh toán)
* `description`: `String` (Mô tả hóa đơn)
* `assignment`: `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "assignment_id") StudentHousingAssignment assignment` (Liên kết JPA trực tiếp - Read-only)
* `version`: `@Version Long version` (Khóa lạc quan)

### 2. Entity: `Payment` (Child Entity)
* `paymentId`: `UUID` (Khóa chính `@Id`, `@GeneratedValue(strategy = GenerationType.UUID)`)
* `bill`: `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "bill_id", nullable = false) Bill bill`
* `amount`: `BigDecimal` (Số tiền thực tế của giao dịch này, > 0)
* `method`: Enum `PaymentMethod` (CASH, BANK_TRANSFER, MOMO, VNPAY)
* `status`: Enum `PaymentStatus` (PENDING, SUCCESS, FAILED, EXPIRED, REFUNDED)
* `transactionCode`: `String` (Mã giao dịch đối soát duy nhất, `unique = true`)
* `description`: `String` (Mô tả giao dịch)
* `gatewayMetadata`: `String` (TEXT/JSONB lưu trữ dữ liệu thô đối soát từ cổng thanh toán)
* `paidAt`: `LocalDateTime` (Thời điểm hoàn tất giao dịch thành công)

---

## SECTION 9 - REFACTOR EXECUTION PLAN

1. **BƯỚC 1: XÓA FILE CŨ**
   * Xóa bỏ lớp `PaymentExpirationService.java`.
2. **BƯỚC 2: CẬP NHẬT ENUMS & DTOS**
   * Đổi package và điều chỉnh cấu trúc dữ liệu cho:
     * `BillStatus.java`, `BillType.java`, `PaymentMethod.java`, `PaymentStatus.java`.
     * `CashPaymentRequest.java`, `OnlinePaymentRequest.java`.
     * `BillResponse.java` (Cập nhật `assignmentId` sang `UUID`).
     * `PaymentResponse.java`.
3. **BƯỚC 3: HIỆU CHỈNH ENTITIES & REPOSITORIES**
   * Chỉnh sửa `Bill.java` và `Payment.java` (Khai báo khóa UUID `@Id`, trường `@Version` cho Bill, trường `gatewayMetadata` cho Payment).
   * Thay đổi generic key của `BillRepository.java` và `PaymentRepository.java` sang `UUID`.
4. **BƯỚC 4: XÂY DỰNG EVENT & LISTENERS**
   * Tạo sự kiện `PaymentSuccessEvent.java` để thông báo thanh toán thành công.
   * Tạo `PaymentEventListener.java` để tự động tạo `Student`, `UserAccount` (`PENDING_ACTIVATION`), và cập nhật trạng thái liên kết.
5. **BƯỚC 5: TÁI CẤU TRÚC SERVICES & CONTROLLERS**
   * Hiệu chỉnh `PaymentService.java` (Loại bỏ check-in/assignment status mutation thô, tiêm event publisher để phát hành `PaymentSuccessEvent`).
   * Hiệu chỉnh `PaymentController.java` (Đổi kiểm tra vai trò bảo mật từ `USER` sang `STUDENT`).
6. **BƯỚC 6: FILE DI CƯ DB FLYWAY**
   * Tạo file `V1_0_6__create_payment_tables.sql` để tạo bảng và index theo thiết kế.

---

## CORRECTION RESULT

**PASS**
*(Mọi nội dung hiệu chỉnh luồng trạng thái đơn WAITING_PAYMENT, cấu hình động bắt buộc đối với Accommodation Fee và tùy chọn đối với Deposit Fee, thiết kế domain model và database đã được đồng bộ hóa và lưu trữ chính thức).*
