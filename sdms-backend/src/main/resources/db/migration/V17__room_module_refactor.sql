-- =====================================================
-- SDMS ROOM MODULE DATABASE REFACTOR - V17
-- Recreate partial unique indexes to include PENDING_CHECKIN
-- Add check constraints for room occupancy and capacity
-- =====================================================

-- 1. Drop old indexes
DROP INDEX IF EXISTS uk_active_assignment_application;
DROP INDEX IF EXISTS uk_active_assignment_student;
DROP INDEX IF EXISTS uk_active_assignment_bed;

-- 2. Recreate unique indexes with support for PENDING_CHECKIN
CREATE UNIQUE INDEX uk_active_assignment_application 
ON student_housing_assignments(application_id) 
WHERE status IN ('RESERVED', 'PENDING_CHECKIN', 'OCCUPIED');

CREATE UNIQUE INDEX uk_active_assignment_student 
ON student_housing_assignments(student_id) 
WHERE status IN ('RESERVED', 'PENDING_CHECKIN', 'OCCUPIED') AND student_id IS NOT NULL;

CREATE UNIQUE INDEX uk_active_assignment_bed 
ON student_housing_assignments(bed_id) 
WHERE status IN ('RESERVED', 'PENDING_CHECKIN', 'OCCUPIED');

-- 3. Add safety check constraints to rooms
ALTER TABLE rooms ADD CONSTRAINT chk_room_occupied_beds CHECK (occupied_beds >= 0 AND occupied_beds <= capacity);
ALTER TABLE rooms ADD CONSTRAINT chk_room_capacity_positive CHECK (capacity > 0);
