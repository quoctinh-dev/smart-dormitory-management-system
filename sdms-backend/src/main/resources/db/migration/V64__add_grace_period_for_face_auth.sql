INSERT INTO system_configs (config_key, config_value, description)
VALUES 
('FACE_GRACE_PERIOD_DAYS', '3', 'Số ngày ân hạn (từ lúc check-in) cho sinh viên mới chưa có khuôn mặt được qua cổng ban đêm bằng thẻ từ')
ON CONFLICT (config_key) DO NOTHING;
