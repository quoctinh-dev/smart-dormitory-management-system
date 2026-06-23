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

-- 5. Add columns to support generic billing targets (room-level utilities & student-level penalties/deposits)
ALTER TABLE bills ADD COLUMN room_id UUID NULL;
ALTER TABLE bills ADD COLUMN student_id UUID NULL;
ALTER TABLE bills ADD COLUMN application_id UUID NULL;

ALTER TABLE bills ADD CONSTRAINT fk_bills_room FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT;
ALTER TABLE bills ADD CONSTRAINT fk_bills_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE RESTRICT;

CREATE INDEX idx_bills_room_id ON bills(room_id);
CREATE INDEX idx_bills_student_id ON bills(student_id);
CREATE INDEX idx_bills_application_id ON bills(application_id);
