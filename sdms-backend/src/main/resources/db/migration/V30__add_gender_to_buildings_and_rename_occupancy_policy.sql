-- Thêm cột gender vào bảng buildings
ALTER TABLE buildings ADD COLUMN gender VARCHAR(20) NOT NULL DEFAULT 'MIXED';

-- Đổi tên cột occupancy_policy thành gender trong bảng floors
ALTER TABLE floors RENAME COLUMN occupancy_policy TO gender;
