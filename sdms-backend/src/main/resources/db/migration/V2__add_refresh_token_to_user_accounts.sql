-- Thêm các cột mới vào bảng user_accounts để quản lý Refresh Token
ALTER TABLE user_accounts ADD COLUMN refresh_token VARCHAR(500) NULL;
ALTER TABLE user_accounts ADD COLUMN refresh_token_expiry TIMESTAMP NULL;

-- Tạo chỉ mục (Index) duy nhất cho cột refresh_token
-- Việc này giúp hệ thống tra cứu tài khoản theo Refresh Token nhanh hơn rất nhiều
CREATE UNIQUE INDEX idx_user_accounts_refresh_token
    ON user_accounts(refresh_token);