# SDMS Payment Database & Flyway Design Audit

**Technical Role**: Lead Database Architect | Database Security Officer  
**Status**: **PASS**  
**Audit Date**: 2026-06-21  

---

## 1. Database Schema Matrix

The database schema manages the persistence of charges and payments, protecting against audit gaps and double processing.

### 1.1 Bills Table (`bills`)
* **Primary Key**: `bill_id UUID PRIMARY KEY`
* **Column Taxonomy**:

| Column Name | Data Type | Nullability | Default / Constraint | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `bill_id` | `UUID` | `NOT NULL` | `PRIMARY KEY` | Unique ID of the bill. |
| `bill_type` | `VARCHAR(50)` | `NOT NULL` | | Type of fee (e.g. `ACCOMMODATION_FEE`). |
| `amount` | `NUMERIC(15, 2)` | `NOT NULL` | | Total billed amount. |
| `paid_amount` | `NUMERIC(15, 2)` | `NOT NULL` | `DEFAULT 0.00` | Sum of successful payments. |
| `status` | `VARCHAR(30)` | `NOT NULL` | `DEFAULT 'UNPAID'` | Lifecycle status (`UNPAID`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `CANCELLED`). |
| `due_date` | `DATE` | `NULL` | | Payment deadline. |
| `description` | `TEXT` | `NULL` | | Optional notes. |
| `version` | `BIGINT` | `NOT NULL` | `DEFAULT 0` | Optimistic locking counter. |
| `assignment_id` | `UUID` | `NULL` | `FOREIGN KEY` (references assignments) | Link to Room bed allocation. |
| `created_at` | `TIMESTAMP` | `NOT NULL` | | Creation timestamp. |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | | Last update timestamp. |

### 1.2 Payments Table (`payments`)
* **Primary Key**: `payment_id UUID PRIMARY KEY`
* **Column Taxonomy**:

| Column Name | Data Type | Nullability | Default / Constraint | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `payment_id` | `UUID` | `NOT NULL` | `PRIMARY KEY` | Unique ID of the payment transaction. |
| `bill_id` | `UUID` | `NOT NULL` | `FOREIGN KEY` (references bills) | Associated bill parent. |
| `amount` | `NUMERIC(15, 2)` | `NOT NULL` | | Paid amount. |
| `method` | `VARCHAR(30)` | `NOT NULL` | | Payment method (`CASH`, `BANK_TRANSFER`). |
| `status` | `VARCHAR(30)` | `NOT NULL` | `DEFAULT 'PENDING'` | State of transaction (`PENDING`, `SUCCESS`, etc.). |
| `transaction_code` | `VARCHAR(100)` | `NOT NULL` | `UNIQUE` | Internal tracking ID. |
| `gateway_transaction_id`| `VARCHAR(100)` | `NULL` | `UNIQUE` (V18 addition) | External gateway platform transaction reference. |
| `description` | `TEXT` | `NULL` | | Notes. |
| `gateway_metadata` | `TEXT` | `NULL` | | Full webhook payload cache (JSON). |
| `paid_at` | `TIMESTAMP` | `NULL` | | Date funds were captured. |
| `created_at` | `TIMESTAMP` | `NOT NULL` | | Creation timestamp. |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | | Last update timestamp. |

---

## 2. Constraints & Index Matrix

### 2.1 Index Specifications

| Table | Index Name | Target Column | Index Type | Reason |
| :--- | :--- | :--- | :--- | :--- |
| `bills` | `idx_bills_assignment_id` | `assignment_id` | B-Tree | Accelerates joins between Room allocations and Bills. |
| `bills` | `idx_bills_status` | `status` | B-Tree | Accelerates scanning for active unpaid or overdue bills. |
| `bills` | `idx_bills_due_date` | `due_date` | B-Tree (V18) | Speeds up daily cron jobs processing reservation expirations. |
| `payments` | `idx_payments_bill_id` | `bill_id` | B-Tree | Speeds up parent-child aggregate fetching. |
| `payments` | `uk_payments_transaction_code`| `transaction_code` | Unique B-Tree | Enforces uniqueness of application transaction codes. |
| `payments` | `uk_payments_gateway_txn_id` | `gateway_transaction_id`| Unique B-Tree (V18) | Webhook duplicate request filter protecting transaction ledger. |

### 2.2 Relationship Integrity (Delete Rules Audit)
> [!WARNING]
> **Cascading Delete Risk**:  
> In `V13__create_payment_module.sql`, the foreign key `fk_payments_bill` is defined as `ON DELETE CASCADE`. This is a significant auditing risk. If a Bill is deleted, its complete payment history would be cascade-deleted from the database, destroying the financial audit trail.  
> **Recommendation**: Alter this foreign key rule to `ON DELETE RESTRICT` or `ON DELETE NO ACTION` in future database cleanup scripts.

---

## 3. Webhook Idempotency & Safety

To protect against duplicate webhook processing (e.g. gateway retries):
1. **Database Unique Constraints**: `uk_payments_gateway_transaction_id` rejects any duplicate callback with the same gateway reference at the database layer.
2. **Pessimistic Locking**: `billRepository.findByIdForUpdate(billId)` locks the bill row, ensuring that serial threads checking `bill.getStatus()` read committed values and cannot post multiple payments simultaneously.
3. **Application Deduplication**: `PaymentService.createPaymentRecord` checks for existing transaction codes, returning HTTP 200 immediately without reprocessing.

---

## 4. Flyway Migration Plan (`V18__payment_module_refactor.sql`)

The migration below adds the `gateway_transaction_id` and optimization indexes to the schema. It is backward-compatible as the new column is nullable, permitting historical data to persist without errors.

```sql
-- V18__payment_module_refactor.sql
-- Database hardening and refactoring for SDMS Payment Module

-- 1. Add gateway_transaction_id column and unique constraint
ALTER TABLE payments ADD COLUMN gateway_transaction_id VARCHAR(100) NULL;
ALTER TABLE payments ADD CONSTRAINT uk_payments_gateway_transaction_id UNIQUE (gateway_transaction_id);

-- 2. Drop historical ON DELETE CASCADE foreign key and re-add it as ON DELETE RESTRICT
ALTER TABLE payments DROP CONSTRAINT fk_payments_bill;
ALTER TABLE payments ADD CONSTRAINT fk_payments_bill FOREIGN KEY (bill_id) REFERENCES bills(bill_id) ON DELETE RESTRICT;

-- 3. Add CHECK constraints to prevent negative or zero financial amounts
ALTER TABLE bills ADD CONSTRAINT chk_bills_amount CHECK (amount > 0);
ALTER TABLE bills ADD CONSTRAINT chk_bills_paid_amount CHECK (paid_amount >= 0);
ALTER TABLE payments ADD CONSTRAINT chk_payments_amount CHECK (amount > 0);

-- 4. Add index on bills due_date for expiration scanning jobs
CREATE INDEX idx_bills_due_date ON bills(due_date);
```
