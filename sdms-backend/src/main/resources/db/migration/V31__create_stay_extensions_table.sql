CREATE TABLE stay_extensions (
    extension_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    current_bed_id UUID NOT NULL,
    reason VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    description TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_extension_student FOREIGN KEY (student_id) REFERENCES students(student_id),
    CONSTRAINT fk_extension_bed FOREIGN KEY (current_bed_id) REFERENCES beds(bed_id)
);

CREATE INDEX idx_stay_extensions_student ON stay_extensions(student_id);
CREATE INDEX idx_stay_extensions_status ON stay_extensions(status);
