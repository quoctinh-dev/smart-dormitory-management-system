ALTER TABLE registration_eligibilities DROP CONSTRAINT IF EXISTS uk_eligibility_period_cccd;
ALTER TABLE registration_eligibilities ALTER COLUMN cccd DROP NOT NULL;
ALTER TABLE registration_eligibilities ALTER COLUMN email SET NOT NULL;
ALTER TABLE registration_eligibilities ALTER COLUMN student_code SET NOT NULL;
ALTER TABLE registration_eligibilities ADD CONSTRAINT uk_eligibility_period_student_code UNIQUE (period_id, student_code);
ALTER TABLE registration_eligibilities ADD CONSTRAINT uk_eligibility_period_email UNIQUE (period_id, email);
