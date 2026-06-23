/**
 * V9: Loại bỏ cột monthly_fee khỏi bảng rooms.
 * Nghiệp vụ: Chuyển cấu hình giá sang Payment Configuration Module.
 */

ALTER TABLE rooms DROP COLUMN monthly_fee;