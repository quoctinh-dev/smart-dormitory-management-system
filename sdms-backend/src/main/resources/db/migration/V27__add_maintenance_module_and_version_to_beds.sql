-- Thêm cột version bị thiếu vào bảng beds cho chức năng Optimistic Locking
ALTER TABLE beds ADD COLUMN version INTEGER DEFAULT 0;

