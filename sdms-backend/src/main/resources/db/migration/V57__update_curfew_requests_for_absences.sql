-- Add request_type to distinguish between Curfew (LATE_RETURN) and Long Absence (ABSENCE)
ALTER TABLE curfew_requests
ADD COLUMN request_type VARCHAR(30) NOT NULL DEFAULT 'LATE_RETURN';

-- Add start_date for absences that span multiple days
-- (expected_arrival_time already exists and serves as the end_date/return_date)
ALTER TABLE curfew_requests
ADD COLUMN start_date TIMESTAMP;

-- Comment on columns for clarity
COMMENT ON COLUMN curfew_requests.request_type IS 'LATE_RETURN (Xin về trễ) or ABSENCE (Xin vắng mặt/Về quê)';
COMMENT ON COLUMN curfew_requests.start_date IS 'Start date for LONG_ABSENCE. Null for LATE_RETURN.';
