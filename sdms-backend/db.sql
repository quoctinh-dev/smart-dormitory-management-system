DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

SELECT status, student_id FROM student_housing_assignments
WHERE student_id = (SELECT student_id FROM students WHERE student_code = 'DH52201580');
