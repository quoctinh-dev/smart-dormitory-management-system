CREATE TABLE notification_histories (
                                        id BIGSERIAL PRIMARY KEY,
                                        recipient VARCHAR(255) NOT NULL,
                                        title VARCHAR(255) NOT NULL,
                                        content TEXT NOT NULL,
                                        channel VARCHAR(50) NOT NULL,
                                        status VARCHAR(50) NOT NULL,
                                        notification_type VARCHAR(50) NOT NULL,
                                        error_message TEXT,
                                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tạo Index tăng tốc độ truy vấn tra cứu lịch sử gửi tin của sinh viên/admin
CREATE INDEX idx_noti_recipient ON notification_histories(recipient);
CREATE INDEX idx_noti_status ON notification_histories(status);