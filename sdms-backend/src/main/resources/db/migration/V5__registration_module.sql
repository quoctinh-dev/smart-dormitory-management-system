-- ==========================================================
-- STEP 1: Registration Module Foundation
-- ==========================================================

-- 1. Thêm cột registration_type vào bảng registration_periods
-- Sử dụng DEFAULT để đảm bảo các record cũ không bị lỗi NOT NULL
ALTER TABLE registration_periods
    ADD COLUMN registration_type VARCHAR(50) NOT NULL DEFAULT 'OPEN_REGISTRATION';

-- 2. Tạo bảng registration_eligibilities
-- Dùng để quản lý danh sách sinh viên hợp lệ cho từng đợt đăng ký
CREATE TABLE registration_eligibilities (
                                            eligibility_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

                                            period_id UUID NOT NULL,

                                            cccd VARCHAR(20) NOT NULL,

                                            full_name VARCHAR(100),

                                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ràng buộc khóa ngoại
                                            CONSTRAINT fk_eligibility_period
                                                FOREIGN KEY (period_id)
                                                    REFERENCES registration_periods(period_id)
                                                    ON DELETE CASCADE
);

-- 3. Tạo Unique Constraint
-- Đảm bảo mỗi CCCD chỉ xuất hiện 1 lần trong 1 đợt đăng ký (tránh trùng lặp khi import)
CREATE UNIQUE INDEX uk_eligibility_period_cccd
    ON registration_eligibilities(period_id, cccd);

-- 4. Tạo Index cho việc tìm kiếm
-- Tối ưu hóa truy vấn khi sinh viên check eligibility bằng CCCD
CREATE INDEX idx_eligibility_cccd
    ON registration_eligibilities(cccd);

-- Comment mô tả bảng (optional - dùng cho PostgreSQL)
COMMENT ON TABLE registration_eligibilities IS 'Danh sách sinh viên đủ điều kiện đăng ký ký túc xá theo từng đợt';