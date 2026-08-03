-- Add bill_code to bills table
ALTER TABLE bills ADD COLUMN bill_code VARCHAR(50);

-- Update existing records with a generated bill_code based on bill_type
UPDATE bills 
SET bill_code = CASE 
    WHEN bill_type = 'ACCOMMODATION_FEE' THEN 'HDP-' || SUBSTRING(bill_id::text, 1, 8)
    WHEN bill_type = 'ELECTRIC_FEE' THEN 'HDD-' || SUBSTRING(bill_id::text, 1, 8)
    WHEN bill_type = 'PENALTY_FEE' THEN 'HDF-' || SUBSTRING(bill_id::text, 1, 8)
    ELSE 'HD-' || SUBSTRING(bill_id::text, 1, 8)
END
WHERE bill_code IS NULL;

-- Make it NOT NULL and add UNIQUE constraint
ALTER TABLE bills ALTER COLUMN bill_code SET NOT NULL;
ALTER TABLE bills ADD CONSTRAINT uk_bills_bill_code UNIQUE (bill_code);
