-- V3__add_password_reset_to_user_accounts.sql

-- Thêm các cột phục vụ cho luồng khôi phục mật khẩu an toàn vào bảng user_accounts.
-- reset_password_token: Lưu trữ mã hash SHA-256 của token được gửi cho người dùng.
-- reset_password_expiry: Thời điểm hết hạn của mã khôi phục.
ALTER TABLE user_accounts
    ADD COLUMN reset_password_token VARCHAR(255) NULL,
    ADD COLUMN reset_password_expiry TIMESTAMP NULL;

-- Tạo chỉ mục (Index) trên cột reset_password_token để tối ưu tốc độ tra cứu
-- khi người dùng thực hiện khôi phục mật khẩu. Điều này giúp tránh việc hệ thống
-- phải quét toàn bộ bảng (full table scan), tăng hiệu năng đáng kể.
CREATE INDEX idx_user_accounts_reset_token ON user_accounts (reset_password_token);