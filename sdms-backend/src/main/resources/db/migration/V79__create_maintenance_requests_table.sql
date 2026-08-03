CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL,
    student_id UUID NOT NULL,
    description VARCHAR(500) NOT NULL,
    image_url VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_maintenance_room FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    CONSTRAINT fk_maintenance_student FOREIGN KEY (student_id) REFERENCES students(student_id)
);
