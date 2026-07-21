-- V63__add_missing_system_configs.sql
-- Thêm toàn bộ config keys đang được dùng trong backend nhưng chưa có row trong DB.
-- Backend đã có fallback default khi key không tồn tại, migration này giúp:
--   1. Admin thấy và chỉnh được tất cả config trên trang /admin/system-configs
--   2. Không còn phụ thuộc vào hardcoded default trong Java code

-- ============================================================
-- NHÓM 1: SMART ACCESS — Xác thực 2 bước (Dual Authentication)
-- IotVerificationController.java line 81-82
-- ============================================================
INSERT INTO system_configs (config_key, config_value, description)
VALUES (
    'DUAL_AUTH_START',
    '18:00',
    'Giờ bắt đầu bật xác thực 2 bước (RFID + Khuôn mặt). Định dạng HH:mm (vd: 18:00)'
)
ON CONFLICT (config_key) DO NOTHING;

INSERT INTO system_configs (config_key, config_value, description)
VALUES (
    'DUAL_AUTH_END',
    '06:00',
    'Giờ kết thúc xác thực 2 bước (trả về chế độ bình thường). Định dạng HH:mm (vd: 06:00)'
)
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================
-- NHÓM 2: SMART ACCESS — Giờ giới nghiêm toàn cầu (Global Curfew)
-- CurfewResolutionStrategy.java line 33-34
-- ============================================================
INSERT INTO system_configs (config_key, config_value, description)
VALUES (
    'GLOBAL_CURFEW_START',
    '23:00',
    'Giờ bắt đầu giới nghiêm toàn KTX (mặc định). Định dạng HH:mm (vd: 23:00)'
)
ON CONFLICT (config_key) DO NOTHING;

INSERT INTO system_configs (config_key, config_value, description)
VALUES (
    'GLOBAL_CURFEW_END',
    '05:30',
    'Giờ kết thúc giới nghiêm toàn KTX (sáng sớm). Định dạng HH:mm (vd: 05:30)'
)
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================
-- NHÓM 3: SMART ACCESS — Thời hạn về muộn có phép (Late Return)
-- AccessEvaluationService.java line 110
-- ============================================================
INSERT INTO system_configs (config_key, config_value, description)
VALUES (
    'LATE_RETURN_DEADLINE',
    '00:00',
    'Giờ tối đa được phép về muộn (sau giới nghiêm) khi có đơn xin phép. Định dạng HH:mm'
)
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================
-- NHÓM 4: CHECKOUT — Số ngày báo trước khi trả phòng
-- CheckoutRequestService.java line 67
-- ============================================================
INSERT INTO system_configs (config_key, config_value, description)
VALUES (
    'MIN_CHECKOUT_NOTICE_DAYS',
    '7',
    'Số ngày tối thiểu sinh viên phải báo trước khi nộp đơn trả phòng (ngày)'
)
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================
-- NHÓM 5: PAYMENT — Đơn giá điện và nước
-- UtilityBillListener.java line 33-34
-- (ELECTRICITY đã có từ V40, WATER đã bị xóa ở V61 — thêm lại với mô tả đầy đủ)
-- ============================================================
INSERT INTO system_configs (config_key, config_value, description)
VALUES (
    'ELECTRICITY_PRICE_PER_KWH',
    '3500',
    'Đơn giá điện năng tiêu thụ (VND/kWh)'
)
ON CONFLICT (config_key) DO NOTHING;

INSERT INTO system_configs (config_key, config_value, description)
VALUES (
    'WATER_PRICE_PER_M3',
    '15000',
    'Đơn giá nước sinh hoạt (VND/m³)'
)
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================
-- Kiểm tra: Các key sau đây ĐÃ CÓ từ migration cũ, ON CONFLICT bảo vệ:
--   PAYMENT_DEADLINE_DAYS (V40, V41)
--   PAYMENT_CHUNK_MONTHS  (V60)
--   MONTHLY_ROOM_FEE      (V60)
-- ============================================================
