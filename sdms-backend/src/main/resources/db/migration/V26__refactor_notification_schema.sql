-- Xóa bảng cũ do V25 tạo ra để thay thế bằng schema chuẩn theo kiến trúc Event-Driven
DROP TABLE IF EXISTS notification_histories;

-- Tạo bảng Notifications (Dành cho In-App hiển thị ở nút Chuông)
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(255),
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    
    -- BaseEntity columns
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE INDEX idx_notification_user_id ON notifications(user_id);
CREATE INDEX idx_notification_is_read ON notifications(is_read);

-- Tạo bảng Notification_Delivery_Histories (Lưu log gửi Email, Push)
CREATE TABLE notification_delivery_histories (
    id BIGSERIAL PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    retry_count INT NOT NULL DEFAULT 0,
    error_message TEXT,
    payload_snapshot TEXT,
    event_id VARCHAR(255),
    correlation_id VARCHAR(255),
    sent_at TIMESTAMP,
    
    -- BaseEntity columns
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE INDEX idx_noti_delivery_recipient ON notification_delivery_histories(recipient);
CREATE INDEX idx_noti_delivery_status ON notification_delivery_histories(status);
