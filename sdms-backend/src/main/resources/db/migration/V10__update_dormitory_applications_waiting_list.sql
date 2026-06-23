-- ========================================================================
-- PHÂN HỆ 1: CẬP NHẬT BẢNG DORMITORY_APPLICATIONS (HỒ SƠ)
-- ========================================================================
ALTER TABLE dormitory_applications
    ADD COLUMN waiting_list_used BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN payment_deadline TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN approved_at TIMESTAMP WITHOUT TIME ZONE;

-- ========================================================================
-- PHÂN HỆ 2: CẬP NHẬT BẢNG STUDENT_HOUSING_ASSIGNMENTS (PHIÊN CƯ TRÚ) - LUỒNG AN TOÀN
-- ========================================================================
-- Cột application_id và constraint fk_assignment_application đã được khởi tạo trực tiếp trong V7.
-- Không cần bổ sung hay cập nhật cột ở đây.

-- ========================================================================
-- PHÂN HỆ 3: TỐI ƯU HÓA HIỆU NĂNG (INDEXING LAYER FOR ROOM-05 BATCH JOBS)
-- ========================================================================

-- Tối ưu tác vụ quét danh sách chờ theo giới tính và điểm số (WaitingListPromotionJob)
CREATE INDEX idx_dorm_app_status_waiting
    ON dormitory_applications(status, gender)
    WHERE status = 'WAITING_LIST';

-- Tối ưu tác vụ quét dọn các hồ sơ quá hạn thanh toán tiền phòng (AssignmentExpireJob)
CREATE INDEX idx_dorm_app_payment_deadline
    ON dormitory_applications(payment_deadline)
    WHERE status = 'WAITING_PAYMENT';

-- Tối ưu tác vụ truy vấn ngược từ Application sang Assignment (Đã tạo index ở V7)
-- No operation