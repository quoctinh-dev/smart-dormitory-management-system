-- =====================================================
-- SDMS ROOM MODULE DATABASE GUARD - V12
-- Prevent double booking of a single bed at the DB level
-- =====================================================
CREATE UNIQUE INDEX uk_active_assignment_bed
ON student_housing_assignments(bed_id)
WHERE status IN ('RESERVED', 'OCCUPIED');
