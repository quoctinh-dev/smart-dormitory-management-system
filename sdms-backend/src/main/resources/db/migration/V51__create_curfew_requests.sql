CREATE TABLE curfew_requests (
    request_id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    reason TEXT NOT NULL,
    expected_arrival_time TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    resolved_by UUID,
    admin_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (resolved_by) REFERENCES user_accounts(account_id)
);
