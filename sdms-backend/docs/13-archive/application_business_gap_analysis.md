# SDMS Application Business & Gap Analysis (v1.0)

This document standardizes the registration eligibility, applicant categories, lifecycles, and compatibility rules for the new SDMS Application and Registration modules, preparing for `APPLICATION-01` implementation.

---

## 1. Registration Eligibility Strategy

To optimize administration and support different student profiles, SDMS separates eligibility verification into three distinct strategies:

### 1.1 Group A (Freshmen)
* **Website Entry:** Registers via the **Public Web Portal**.
* **Eligibility Rule:** Bắt buộc phải có tên trong Danh sách trúng tuyển đại học do nhà trường cung cấp trước (Freshman Eligibility List).
* **Implementation:** Sinh viên nhập số CCCD $\rightarrow$ Hệ thống đối khớp bản ghi trong bảng `registration_eligibilities` cho đợt đăng ký hiện tại. Chỉ khi khớp mới cho phép tạo hồ sơ.

### 1.2 Group B (Current Students - New to KTX)
* **Website Entry:** Registers via the **Public Web Portal**.
* **Eligibility Rule:** Phải là sinh viên đang theo học tại trường và chưa từng ở KTX.
* **Implementation:** Để đồng bộ kỹ thuật với Group A, nhà trường sẽ tải danh sách CCCD của các sinh viên đủ điều kiện đăng ký vào bảng `registration_eligibilities` trước khi mở đợt đăng ký. Quy trình kiểm tra CCCD diễn ra tương tự Group A.

### 1.3 Group C (Returning Students)
* **App Entry:** Registers via the authenticated **Student Mobile App**.
* **Eligibility Rule:** Sinh viên đã từng ở KTX và đã làm thủ tục trả phòng (trạng thái `Student.status` là `INACTIVE` hoặc `GRADUATED`).
* **Implementation:** Không sử dụng bảng `registration_eligibilities`. Hệ thống tự động xác thực dựa trên tài khoản đăng nhập của sinh viên. Việc sinh viên đăng nhập thành công với vai trò `Role.STUDENT` và có trạng thái hồ sơ cũ đã trả phòng là điều kiện đủ để làm đơn gia hạn. Dữ liệu cá nhân sẽ tự động điền (Auto-fill) từ hồ sơ cũ.

---

## 2. Dormitory Application Lifecycle (PAYMENT-10 Sync)

The application status follows this exact transaction path to respect the frozen **PAYMENT MODULE** and **ROOM MODULE**:

```
Application Submitted (PENDING)
↓
Under Review (UNDER_REVIEW)
↓
Approved (APPROVED)
↓
Create StudentHousingAssignment (RESERVED)
↓
Create Bills (Accommodation Fee)
↓
Transition Application Status to WAITING_PAYMENT (3-Day deadline window starts)
↓
Payment Success (Bill status changes to PAID)
↓
PaymentEventListener consumes event:
  - Creates/Reuses Student (PENDING_CHECKIN)
  - Creates/Reuses UserAccount (PENDING_ACTIVATION)
  - Links Student to Assignment
  (DormitoryApplication status remains WAITING_PAYMENT)
```
> [!IMPORTANT]
> To comply with the frozen Payment Module, **Payment Success does NOT update the application status to `APPROVED`**. The status remains `WAITING_PAYMENT` (or is handled asynchronously outside the Payment Module boundary).

---

## 3. Waiting List & Promotion Strategy

* **Trigger:** If the admin approves an application but no beds are available in KTX $\rightarrow$ Application status transitions to `WAITING_LIST`.
* **Promotion:** The `WaitingListPromotionJob` scans for `WAITING_LIST` applications, sorted by `priorityScore DESC` and `submittedAt ASC`.
* **Execution:** Once a bed is released $\rightarrow$ The job allocates the bed $\rightarrow$ Creates the bill $\rightarrow$ Transitions application status to `WAITING_PAYMENT` $\rightarrow$ Sets the 3-day payment deadline.

---

## 4. Renewal Flow (Group C)

1. Student logs into the Student Mobile App.
2. Cấu hình tự động điền (Auto-fill) tải toàn bộ thông tin liên lạc, gia đình, học vụ từ thực thể `Student` cũ.
3. Hệ thống tự động xuất PDF: Giấy cam kết nội trú và Giấy lưu trú đã điền sẵn thông tin.
4. Student submits renewal $\rightarrow$ Application transitions to `PENDING` under `RegistrationType.RENEWAL`.
5. Admin reviews and approves $\rightarrow$ assigns new bed $\rightarrow$ transitions to `WAITING_PAYMENT`.
6. Student pays $\rightarrow$ `PaymentEventListener` updates the existing `Student` status to `PENDING_CHECKIN` (instead of creating a duplicate Student or UserAccount).

---

## 5. Compatibility With Frozen Modules

* **No Direct DB Mutations:** The Application Module does not directly alter room occupancy counts or bill payment states. It communicates via service calls (`housingAssignmentService.reserveBed()`, `billService.createAccommodationBill()`) and listens to `PaymentSuccessEvent`.
* **UUID Standardization:** All new application and period entities utilize UUID primary keys, replacing the legacy `Long` sequence IDs to comply with SDMS V15 database standards.

---

## 6. PASS / WARNING / FAIL

* **Status:** **PASS**. All business rules, applicant categories, and status lifecycles are aligned with the frozen modular boundaries of the backend system.

---

## 7. Final Decision

**APPLICATION-00 PASS. READY FOR APPLICATION-01 ARCHITECTURE AUDIT.**
