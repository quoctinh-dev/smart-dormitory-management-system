-- V15__student_face_registration_support.sql
-- 1. Bổ sung các cột lưu trữ ảnh nhận dạng khuôn mặt vào bảng students
ALTER TABLE students ADD COLUMN IF NOT EXISTS face_image_url VARCHAR(500);
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_face_registered BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Thay đổi giá trị mặc định của trạng thái sinh viên mới khi được khởi tạo sang PENDING_CHECKIN
ALTER TABLE students ALTER COLUMN status SET DEFAULT 'PENDING_CHECKIN';
