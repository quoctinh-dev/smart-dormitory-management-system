ALTER TABLE students 
    RENAME COLUMN emergency_contact TO contact_address;

ALTER TABLE students 
    ALTER COLUMN contact_address TYPE TEXT;
