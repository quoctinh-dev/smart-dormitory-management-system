-- V41__add_payment_deadline_config.sql

INSERT INTO system_configs (config_key, config_value, description) 
VALUES ('PAYMENT_DEADLINE_DAYS', '3', 'Số ngày tối đa để thanh toán kể từ khi xuất hóa đơn')
ON CONFLICT (config_key) DO NOTHING;
