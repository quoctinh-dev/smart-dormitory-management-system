UPDATE access_history 
SET direction = (CASE WHEN random() < 0.5 THEN 'IN' ELSE 'OUT' END) 
WHERE direction = 'UNKNOWN' OR direction IS NULL;
