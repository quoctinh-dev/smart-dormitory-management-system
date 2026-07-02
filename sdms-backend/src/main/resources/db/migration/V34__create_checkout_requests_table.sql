CREATE TABLE checkout_requests (
    request_id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(student_id),
    assignment_id UUID NOT NULL REFERENCES student_housing_assignments(assignment_id),
    intended_checkout_date TIMESTAMP NOT NULL,
    reason TEXT,
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reject_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    version BIGINT NOT NULL DEFAULT 0
);
