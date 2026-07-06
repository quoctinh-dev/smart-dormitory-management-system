# STATE MACHINES

## Purpose
Định nghĩa vòng đời trạng thái của các đối tượng nghiệp vụ cốt lõi. Đảm bảo không có trạng thái mồ côi hay chuyển đổi không hợp lệ.

## Scope
Toàn bộ Status Enum trong Backend.

## Source of Truth
Enums, Event Listeners, Services, Guards trong mã nguồn.

## Contents

---

### SM-01: `StudentHousingAssignment`
*   **Evidence:** Enum `AssignmentStatus`
*   **Initial State:** `RESERVED`

| Transition | Trigger | Guard | Evidence |
|---|---|---|---|
| `RESERVED` → `PENDING_CHECKIN` | Sinh viên thanh toán Bill thành công | `Bill.status == PAID` | `PaymentWorkflowListener`, `PaymentSuccessEvent` |
| `RESERVED` → `CANCELLED` | Admin hủy thủ công hoặc sinh viên từ chối | — | `HousingAssignmentService` |
| `RESERVED` → `EXPIRED` | Quá 3 ngày không thanh toán | `now > dueDate` | `ReservationExpiryJob` |
| `PENDING_CHECKIN` → `OCCUPIED` | Admin thực hiện Check-in tại quầy | — | `CheckInController`, `CheckInService` |
| `OCCUPIED` → `CHECKED_OUT` | Checkout được duyệt và hoàn tất | `CheckoutRequest.APPROVED` | `StudentCheckedOutEvent`, `StudentCheckoutEventListener` |

*   **Terminal States:** `CHECKED_OUT`, `CANCELLED`, `EXPIRED`
*   **Invalid:** `OCCUPIED` → `RESERVED`, `CHECKED_OUT` → bất kỳ

---

### SM-02: `DormitoryApplication`
*   **Evidence:** Enum `ApplicationStatus`
*   **Initial State:** `PENDING`

| Transition | Trigger | Guard | Evidence |
|---|---|---|---|
| `PENDING` → `UNDER_REVIEW` | Admin bắt đầu xem xét | — | `ApplicationReviewController` |
| `UNDER_REVIEW` → `REQUEST_REVISION` | Admin yêu cầu bổ sung tài liệu | — | `ApplicationReviewController` |
| `REQUEST_REVISION` → `UNDER_REVIEW` | Sinh viên nộp bổ sung | Trong thời hạn | `ApplicationController` |
| `UNDER_REVIEW` → `WAITING_PAYMENT` | Admin duyệt, giường xếp thành công | `Bed.AVAILABLE` | `ApplicationReviewController`, `HousingAssignmentService` |
| `UNDER_REVIEW` → `REJECTED` | Admin từ chối | — | `ApplicationReviewController` |
| `UNDER_REVIEW` → `WAITING_LIST` | KTX hết chỗ | `Room.capacity == full` | `ApplicationReviewController` |
| `WAITING_PAYMENT` → `APPROVED` | Sinh viên thanh toán xong | `Bill.PAID` | `PaymentWorkflowListener` |
| `WAITING_PAYMENT` → `EXPIRED` | Quá 3 ngày không thanh toán | `now > dueDate` | `ReservationExpiryJob` |

*   **Terminal States:** `APPROVED`, `REJECTED`, `EXPIRED`

---

### SM-03: `FaceProfile`
*   **Evidence:** Enum `FaceProfileStatus`
*   **Initial State:** `PENDING`

| Transition | Trigger | Guard | Evidence |
|---|---|---|---|
| `PENDING` → `APPROVED` | Admin duyệt và AI trích xuất Vector thành công | — | `FaceAdminController`, `FaceProfileApprovedEvent`, `FaceSyncReadyEvent` |
| `PENDING` → `REJECTED` | Admin từ chối ảnh không đạt | — | `FaceAdminController`, `FaceProfileRejectedEvent` |
| `REJECTED` → `PENDING` | Sinh viên upload lại ảnh mới | — | `FaceStudentController` |
| `APPROVED` → `REVOKED` | Admin thu hồi quyền vì vi phạm | — | `FaceAdminController`, `FaceProfileRevokedEvent` |
| `REVOKED` → `PENDING` | Sinh viên upload lại ảnh sau khi được phục hồi | Admin cho phép | `FaceStudentController` |

*   **Terminal State:** `REVOKED` (có thể tái kích hoạt nếu Admin cho phép)
*   **Note:** Không có trạng thái `REPLACEMENT_PENDING` trong source code.

---

### SM-04: `Bill`
*   **Evidence:** Enum `BillStatus`, `BillType`
*   **Initial State:** `UNPAID`
*   **BillTypes:** `APPLICATION_FEE`, `ACCOMMODATION_FEE`, `ELECTRIC_FEE`, `WATER_FEE`, `PENALTY_FEE`, `DEPOSIT_FEE`

| Transition | Trigger | Guard | Evidence |
|---|---|---|---|
| `UNPAID` → `PAID` | Webhook SePay xác nhận giao dịch | Amount khớp | `SepayWebhookController`, `PaymentSuccessEvent` |
| `UNPAID` → `PARTIALLY_PAID` | Ghi nhận Payment chưa đủ tổng tiền | `amount < totalAmount` | `PaymentService` |
| `UNPAID` → `OVERDUE` | Job tự động theo lịch | `now > dueDate` | `BillOverdueJob` |
| `UNPAID` → `CANCELLED` | Admin hủy thủ công hoặc `ReservationExpiryJob` | — | `BillService`, `ReservationExpiryJob` |
| `PARTIALLY_PAID` → `PAID` | Ghi nhận Payment đủ tổng tiền | `totalPaid >= totalAmount` | `PaymentService` |
| `OVERDUE` → `CANCELLED` | Admin xử lý sau khi overdue | — | `BillService` |

*   **Terminal States:** `PAID`, `CANCELLED`

---

### SM-05: `CheckoutRequest`
*   **Evidence:** Enum `CheckoutStatus`
*   **Initial State:** `PENDING`

| Transition | Trigger | Guard | Evidence |
|---|---|---|---|
| `PENDING` → `APPROVED` | Admin duyệt đơn trả phòng | — | `CheckoutRequestAdminController` |
| `PENDING` → `REJECTED` | Admin từ chối | — | `CheckoutRequestAdminController` |
| `APPROVED` → `COMPLETED` | Hệ thống xử lý xong downstream | — | `StudentCheckedOutEvent`, `StudentCheckoutEventListener` |

*   **Terminal States:** `COMPLETED`, `REJECTED`

---

### SM-06: `StayExtension`
*   **Evidence:** Enum `ExtensionStatus`
*   **Initial State:** `PENDING`

| Transition | Trigger | Guard | Evidence |
|---|---|---|---|
| `PENDING` → `APPROVED` | Admin duyệt gia hạn | — | `StayExtensionAdminController`, `ExtensionApprovedEvent` |
| `PENDING` → `REJECTED` | Admin từ chối | — | `StayExtensionAdminController` |

*   **Terminal States:** `APPROVED`, `REJECTED`

---

### SM-07: `UserAccount`
*   **Evidence:** Enum `AccountStatus`
*   **Initial State:** `PENDING_ACTIVATION`

| Transition | Trigger | Guard | Evidence |
|---|---|---|---|
| `PENDING_ACTIVATION` → `ACTIVE` | Sinh viên đăng nhập lần đầu / đổi mật khẩu | — | `AuthController`, `CustomUserDetailsService` |
| `ACTIVE` → `LOCKED` | Admin khóa tài khoản (vi phạm, nợ tiền) | — | `UserService` |
| `LOCKED` → `ACTIVE` | Admin mở khóa | — | `UserService` |

*   **Terminal State:** Không có (tài khoản có thể được mở khóa)

## Related Documents
- [BUSINESS_GLOSSARY](./BUSINESS_GLOSSARY.md)
- [BUSINESS_WORKFLOWS](./BUSINESS_WORKFLOWS.md)
- [BUSINESS_RULES](./BUSINESS_RULES.md)
