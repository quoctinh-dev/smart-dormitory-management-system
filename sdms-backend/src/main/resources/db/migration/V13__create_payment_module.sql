-- V13__create_payment_module.sql
-- Create bills and payments tables for SDMS Payment Module

CREATE TABLE bills (
    bill_id UUID PRIMARY KEY,
    bill_type VARCHAR(50) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    due_date DATE,
    description TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    assignment_id UUID,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_bills_assignment FOREIGN KEY (assignment_id) REFERENCES student_housing_assignments(assignment_id)
);

CREATE TABLE payments (
    payment_id UUID PRIMARY KEY,
    bill_id UUID NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    method VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    transaction_code VARCHAR(100) NOT NULL,
    description TEXT,
    gateway_metadata TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_payments_bill FOREIGN KEY (bill_id) REFERENCES bills(bill_id) ON DELETE CASCADE,
    CONSTRAINT uk_payments_transaction_code UNIQUE (transaction_code)
);

CREATE INDEX idx_bills_assignment_id ON bills(assignment_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_payments_bill_id ON payments(bill_id);
