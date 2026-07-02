-- Thêm trường stay_start_date và stay_end_date vào bảng registration_periods
-- Bắt buộc Not Null, nên phải có giá trị mặc định cho dữ liệu cũ
ALTER TABLE registration_periods 
ADD COLUMN stay_start_date TIMESTAMP;

ALTER TABLE registration_periods 
ADD COLUMN stay_end_date TIMESTAMP;

-- Cập nhật dữ liệu cũ
UPDATE registration_periods SET stay_start_date = start_date, stay_end_date = end_date;

-- Chỉnh lại thành NOT NULL
ALTER TABLE registration_periods ALTER COLUMN stay_start_date SET NOT NULL;
ALTER TABLE registration_periods ALTER COLUMN stay_end_date SET NOT NULL;

-- Thêm trường old_expected_check_out_at và new_expected_check_out_at vào bảng stay_extensions
ALTER TABLE stay_extensions
ADD COLUMN old_expected_check_out_at TIMESTAMP;

ALTER TABLE stay_extensions
ADD COLUMN new_expected_check_out_at TIMESTAMP;
