-- Thêm cột version bị thiếu vào bảng beds cho chức năng Optimistic Locking
ALTER TABLE beds ADD COLUMN version INTEGER DEFAULT 0;

-- Tạo bảng cho module maintenance
CREATE TABLE maintenance_tickets (
    ticket_id UUID PRIMARY KEY,
    room_id UUID NOT NULL,
    bed_id UUID,
    reported_by_student_id UUID,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    description TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
