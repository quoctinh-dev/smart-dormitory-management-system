INSERT INTO system_configs (config_key, config_value, description, group_name)
VALUES ('OVERDUE_DAYS_BEFORE_EVICTION', '7', 'Số ngày nợ tối đa (tiền lưu trú) trước khi tự động đuổi khỏi KTX (Check-out cưỡng chế)', 'PAYMENT')
ON CONFLICT (config_key) DO NOTHING;
