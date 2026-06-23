-- =====================================================
-- SDMS ROOM FOUNDATION MODULE - V7
-- =====================================================

-- 1. BUILDINGS
CREATE TABLE buildings (
                           building_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                           code VARCHAR(20) NOT NULL UNIQUE,
                           name VARCHAR(100) NOT NULL,
                           description TEXT,
                           status VARCHAR(20) NOT NULL,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. FLOORS
CREATE TABLE floors (
                        floor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        building_id UUID NOT NULL,
                        floor_number INTEGER NOT NULL,
                        occupancy_policy VARCHAR(20) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT fk_floor_building FOREIGN KEY (building_id) REFERENCES buildings(building_id),
                        CONSTRAINT uk_building_floor UNIQUE (building_id, floor_number)
);

-- 3. ROOMS (Unique room_code theo floor)
CREATE TABLE rooms (
                       room_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       floor_id UUID NOT NULL,
                       room_code VARCHAR(30) NOT NULL,
                       capacity INTEGER NOT NULL,
                       occupied_beds INTEGER NOT NULL DEFAULT 0,
                       monthly_fee NUMERIC(12,2) NOT NULL,
                       status VARCHAR(20) NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT fk_room_floor FOREIGN KEY (floor_id) REFERENCES floors(floor_id),
                       CONSTRAINT uk_floor_room_code UNIQUE (floor_id, room_code)
);

-- 4. BEDS (Unique bed_code theo room)
CREATE TABLE beds (
                      bed_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                      room_id UUID NOT NULL,
                      bed_code VARCHAR(30) NOT NULL,
                      status VARCHAR(20) NOT NULL,
                      note VARCHAR(500),
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      CONSTRAINT fk_bed_room FOREIGN KEY (room_id) REFERENCES rooms(room_id),
                      CONSTRAINT uk_room_bed_code UNIQUE (room_id, bed_code)
);

-- 5. STUDENT HOUSING ASSIGNMENT (Resident-Centric Design)
CREATE TABLE student_housing_assignments (
                                             assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                             application_id UUID NOT NULL,
                                             student_id UUID, -- Nullable cho giai doan WAITING_PAYMENT / RESERVED
                                             bed_id UUID NOT NULL,
                                             status VARCHAR(30) NOT NULL,
                                             reserved_at TIMESTAMP,
                                             check_in_at TIMESTAMP,
                                             check_out_at TIMESTAMP,
                                             expected_check_out_at TIMESTAMP,
                                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                             CONSTRAINT fk_assignment_student FOREIGN KEY (student_id) REFERENCES students(student_id),
                                             CONSTRAINT fk_assignment_bed FOREIGN KEY (bed_id) REFERENCES beds(bed_id),
                                             CONSTRAINT fk_assignment_application FOREIGN KEY (application_id) REFERENCES dormitory_applications(application_id)
);

-- 6. INDEXES FOR PERFORMANCE
CREATE INDEX idx_building_status ON buildings(status);
CREATE INDEX idx_room_status ON rooms(status);
CREATE INDEX idx_bed_status ON beds(status);
CREATE INDEX idx_assignment_status ON student_housing_assignments(status);
CREATE INDEX idx_assignment_student ON student_housing_assignments(student_id);
CREATE INDEX idx_assignment_bed ON student_housing_assignments(bed_id);
CREATE INDEX idx_assignment_application_id ON student_housing_assignments(application_id);

-- Database Guards for Concurrency (Unique active assignments per application/student)
CREATE UNIQUE INDEX uk_active_assignment_application ON student_housing_assignments(application_id) WHERE status IN ('RESERVED', 'OCCUPIED');
CREATE UNIQUE INDEX uk_active_assignment_student ON student_housing_assignments(student_id) WHERE status IN ('RESERVED', 'OCCUPIED') AND student_id IS NOT NULL;

-- 7. SAMPLE DATA (Building A)
INSERT INTO buildings (building_id, code, name, status)
VALUES (uuid_generate_v4(), 'A', 'Dormitory Building A', 'ACTIVE');