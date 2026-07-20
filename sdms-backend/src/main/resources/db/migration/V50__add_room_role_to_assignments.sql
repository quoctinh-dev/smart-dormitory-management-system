-- V50__add_room_role_to_assignments.sql
-- Thêm cột room_role vào bảng student_housing_assignments

ALTER TABLE student_housing_assignments
ADD COLUMN room_role VARCHAR(30) DEFAULT 'MEMBER';

-- Cập nhật các bản ghi hiện tại thành MEMBER (mặc dù DEFAULT đã xử lý phần nào)
UPDATE student_housing_assignments SET room_role = 'MEMBER' WHERE room_role IS NULL;
