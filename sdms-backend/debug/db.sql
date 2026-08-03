DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

SELECT status, student_id FROM student_housing_assignments
WHERE student_id = (SELECT student_id FROM students WHERE student_code = 'DH52201580');

SELECT profile_id, status FROM face_profiles;

SELECT student_id, rfid_code, full_name
FROM students
WHERE rfid_code = 'A35DAEFC';

SELECT student_id, student_code, rfid_code, full_name
FROM students
WHERE rfid_code = 'A35DAEFC';

SELECT
    a.assignment_id,
    a.status as assignment_status,
    a.reserved_at,
    a.check_in_at,
    a.check_out_at,
    b.bed_code,
    r.room_code
FROM student_housing_assignments a
         JOIN students s ON a.student_id = s.student_id
         JOIN beds b ON a.bed_id = b.bed_id
         JOIN rooms r ON b.room_id = r.room_id
WHERE s.student_code = 'DH52201789';



SELECT
    cr.request_id,
    cr.status as checkout_status,
    cr.intended_checkout_date,
    cr.created_at
FROM checkout_requests cr
         JOIN students s ON cr.student_id = s.student_id
WHERE s.student_code = 'DH52201789';

TRUNCATE TABLE utility_usages CASCADE;



SELECT * FROM  rooms
WHERE room_code = 'A101';

update rooms
    set occupied_beds = 4
    where room_code = 'A101';


UPDATE beds
SET status = 'OCCUPIED'
WHERE room_id = 'dddddddd-4444-4444-4444-dddddddddddd';

select * from user_accounts;

SELECT * FROM notifications WHERE notification_type = 'ELECTRIC_FEE';



