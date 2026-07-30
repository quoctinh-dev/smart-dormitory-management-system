UPDATE system_configs 
SET description = 'Số ngày lưu trữ ảnh chụp an ninh từ camera IoT (Smart Access). Sau thời gian này, ảnh sẽ tự động được làm sạch để tối ưu không gian lưu trữ đám mây.'
WHERE config_key = 'IOT_SNAPSHOT_RETENTION_DAYS';
