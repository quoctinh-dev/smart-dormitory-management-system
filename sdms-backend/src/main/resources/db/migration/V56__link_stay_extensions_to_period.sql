-- Migration V56: Link stay_extensions to registration_periods
-- Business Rule: Mỗi sinh viên chỉ được nộp 1 đơn gia hạn trong 1 đợt đăng ký.
-- Thay vì check existsByStudentId toàn cục, ta check theo (student_id, period_id).
-- Điều này cho phép sinh viên gia hạn lại ở những đợt KHÁC trong các kỳ khác nhau.

ALTER TABLE stay_extensions
    ADD COLUMN IF NOT EXISTS registration_period_id UUID;

-- Gán giá trị mặc định cho các record cũ (nếu có):
-- Gán vào period active gần nhất loại CURRENT_RESIDENT để không bị null constraint vi phạm
UPDATE stay_extensions se
SET registration_period_id = (
    SELECT rp.period_id
    FROM registration_periods rp
    WHERE rp.registration_type = 'CURRENT_RESIDENT'
      AND rp.is_deleted = false
    ORDER BY rp.created_at DESC
    LIMIT 1
)
WHERE se.registration_period_id IS NULL;

-- Set NOT NULL sau khi đã gán giá trị cho dữ liệu cũ
ALTER TABLE stay_extensions
    ALTER COLUMN registration_period_id SET NOT NULL;

-- FK constraint
ALTER TABLE stay_extensions
    ADD CONSTRAINT fk_extension_period
        FOREIGN KEY (registration_period_id) REFERENCES registration_periods(period_id);

-- Unique constraint: 1 sinh viên chỉ có 1 đơn gia hạn trong 1 đợt
ALTER TABLE stay_extensions
    ADD CONSTRAINT uq_extension_student_period
        UNIQUE (student_id, registration_period_id);

-- Index hỗ trợ tìm kiếm theo period
CREATE INDEX idx_stay_extensions_period ON stay_extensions(registration_period_id);
