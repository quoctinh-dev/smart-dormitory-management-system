
-- Tạo Index
CREATE UNIQUE INDEX idx_unique_active_registration_period
    ON registration_periods (is_active)
    WHERE is_active = TRUE;