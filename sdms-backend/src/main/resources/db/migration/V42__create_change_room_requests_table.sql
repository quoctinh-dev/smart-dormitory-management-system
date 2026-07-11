CREATE TABLE change_room_requests (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID NOT NULL,
    current_assignment_id UUID NOT NULL,
    target_room_id UUID,
    reason TEXT NOT NULL,
    admin_note TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by_user_id UUID,
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_change_room_student FOREIGN KEY (student_id) REFERENCES students(student_id),
    CONSTRAINT fk_change_room_assignment FOREIGN KEY (current_assignment_id) REFERENCES student_housing_assignments(assignment_id),
    CONSTRAINT fk_change_room_target FOREIGN KEY (target_room_id) REFERENCES rooms(room_id)
);

CREATE INDEX idx_change_room_student ON change_room_requests(student_id);
CREATE INDEX idx_change_room_status ON change_room_requests(status);
