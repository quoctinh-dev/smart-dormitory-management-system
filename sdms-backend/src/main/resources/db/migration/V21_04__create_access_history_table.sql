-- V21_04__create_access_history_table.sql
-- Access History for Smart Access (APPEND ONLY)

CREATE TABLE access_history (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    gate_id UUID NOT NULL,
    building_id UUID NOT NULL,
    operator_id UUID,
    event_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    decision access_decision_enum NOT NULL,
    denial_reason VARCHAR(255),
    method verification_method_enum NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- NO CASCADE DELETE PERMITTED. SOFT UUID REFERENCES ONLY.

-- Optimized B-Tree Indexes for operational queries
CREATE INDEX idx_access_history_student ON access_history(student_id);
CREATE INDEX idx_access_history_building ON access_history(building_id);
CREATE INDEX idx_access_history_decision ON access_history(decision);

-- BRIN Index for PostgreSQL 17 time-series massive volume efficiency
CREATE INDEX idx_access_history_timestamp ON access_history USING BRIN (event_timestamp);

-- Enforce Append Only at DB level (Operational safeguard)
REVOKE DELETE, UPDATE ON access_history FROM PUBLIC;
