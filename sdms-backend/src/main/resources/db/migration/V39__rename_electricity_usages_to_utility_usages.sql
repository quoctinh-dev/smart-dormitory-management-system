ALTER TABLE electricity_usages RENAME TO utility_usages;

ALTER TABLE utility_usages RENAME COLUMN total_kwh TO total_usage;

-- Thêm cột mới để phân biệt tiện ích
ALTER TABLE utility_usages ADD COLUMN utility_type VARCHAR(50);

-- Đặt giá trị mặc định cho các record cũ là Điện (ELECTRICITY)
UPDATE utility_usages SET utility_type = 'ELECTRICITY' WHERE utility_type IS NULL;

-- Set NOT NULL
ALTER TABLE utility_usages ALTER COLUMN utility_type SET NOT NULL;
