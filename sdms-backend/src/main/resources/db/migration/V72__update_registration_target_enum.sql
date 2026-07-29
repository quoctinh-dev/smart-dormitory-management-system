-- Migrate values from RegistrationTarget to RegistrationType enum in registration_eligibilities
UPDATE registration_eligibilities SET target = 'NEW_STUDENT' WHERE target = 'FRESHMAN';
UPDATE registration_eligibilities SET target = 'CURRENT_RESIDENT' WHERE target = 'CURRENT_STUDENT';
UPDATE registration_eligibilities SET target = 'OPEN_REGISTRATION' WHERE target = 'ALL';

-- Also alter default value
ALTER TABLE registration_eligibilities ALTER COLUMN target SET DEFAULT 'NEW_STUDENT';
