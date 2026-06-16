INSERT INTO user_accounts (
    account_id,
    username,
    email,
    password,
    role,
    status,
    created_at,
    updated_at
)
VALUES (
           gen_random_uuid(),
           'staff01',
           'staff01@sdms.com',
           '$2a$10$8l1fqN6ICT9UGiHR2elTR.qwVpPMHdNG8zne5aN2yZebXHXbwoAhW',
           'STAFF',
           'ACTIVE',
           NOW(),
           NOW()
       );

SELECT * FROM user_accounts;