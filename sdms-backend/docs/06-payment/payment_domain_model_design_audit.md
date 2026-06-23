# SDMS Payment Domain Model & Entity Design Audit

**Technical Role**: Lead Systems Architect | Database Administrator  
**Status**: **PASS**  
**Audit Date**: 2026-06-21  

---

## 1. Entity & Relationship Matrix

### 1.1 Entities
The Payment Module owns two primary aggregates:

| Entity Name | Source File | Key Fields | Nullability & Constraints | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Bill** | [Bill.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/entity/Bill.java) | `billId` (UUID, PK)<br>`billType` (Enum)<br>`amount` (BigDecimal)<br>`paidAmount` (BigDecimal)<br>`status` (Enum)<br>`dueDate` (LocalDate)<br>`assignment` (FK) | `amount` (nullable = false)<br>`paidAmount` (default = 0, nullable = false)<br>`status` (default = UNPAID)<br>`dueDate` (nullable = true)<br>`assignment_id` (ManyToOne, FetchType.LAZY) | Represents a financial charge generated for a dormitory resident. |
| **Payment** | [Payment.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/entity/Payment.java) | `paymentId` (UUID, PK)<br>`bill` (FK)<br>`amount` (BigDecimal)<br>`method` (Enum)<br>`status` (Enum)<br>`transactionCode` (String)<br>`gatewayTransactionId` (String)<br>`paidAt` (LocalDateTime) | `bill_id` (nullable = false, ManyToOne)<br>`amount` (nullable = false)<br>`status` (default = PENDING)<br>`transactionCode` (unique = true, nullable = false)<br>`gateway_transaction_id` (nullable = true, length = 100) | Represents an individual transaction attempt or collection record. |

### 1.2 Relationships & Boundaries
* **Bill ↔ Payment**: One-to-Many. Managed strictly inside the Payment module boundary.
* **Bill ↔ StudentHousingAssignment**: Many-to-One. Bill references the Assignment ID owned by the Room module.
* **No Direct Leaks**: There are no direct JPA mappings to `Student`, `UserAccount`, `DormitoryApplication`, `Room`, or `Bed` inside either `Bill` or `Payment`. This strictly preserves bounded context limits.

---

## 2. Enum Spec Matrix

### 2.1 BillStatus Enum
Statuses defined in [BillStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/BillStatus.java):
* **`UNPAID`**: Initial state of a newly generated bill.
* **`PARTIALLY_PAID`**: Set when a transaction successfully pays a portion of the bill but does not clear the total.
* **`PAID`**: The bill is completely settled (`paidAmount >= amount`).
* **`OVERDUE`**: Assigned when `LocalDate.now()` exceeds `dueDate` and `status` is not `PAID`.
* **`CANCELLED`**: Assigned when the corresponding reservation is expired or deleted, voiding the charge.

*Note: The status `EXPIRED` is redundant for bills because overdue bills are managed by the `OVERDUE` status, and voided bills are managed by `CANCELLED`.*

### 2.2 PaymentStatus Enum
Statuses defined in [PaymentStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/PaymentStatus.java):
* **`PENDING`**: Payment transaction created and awaiting gateway/webhook verification.
* **`SUCCESS`**: Payment successfully captured and verified.
* **`FAILED`**: Gateway reported transaction failure.
* **`EXPIRED`**: The transaction page session timed out.
* **`REFUNDED`**: Funds returned to the student.

### 2.3 PaymentMethod Enum
Methods defined in [PaymentMethod.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/PaymentMethod.java):
* **`CASH`**: Handled manually by dormitory staff.
* **`BANK_TRANSFER`**: Direct transfer matching via webhooks (e.g. SePay/VietQR).

---

## 3. Domain Invariants

The Payment Domain model enforces the following logical invariants Programmatically and Schema-wise:

> [!IMPORTANT]
> 1. **No Payment Without Bill**: Every transaction record must map to an existing parent `Bill` row (`nullable = false` on `bill_id`).
> 2. **No Duplicate Successful Payments**: A unique index on `transaction_code` prevents gateways from posting the same transaction twice.
> 3. **No Overpayment**: Programmatic check in `validateBillAndAmount` prevents transaction amounts from exceeding the bill's remaining balance.
> 4. **No Negative Balance**: Checks verify `amount > 0` on both bills and transactions.
> 5. **Optimistic Locking**: Utilizes `@Version` on `Bill` to prevent concurrent transactions from double-updating `paidAmount`.
