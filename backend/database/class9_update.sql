-- Section A Updates
UPDATE questions SET skill_type = 'P2' WHERE test_id = 2 AND q_text LIKE 'Q3:%';
UPDATE questions SET skill_type = 'P1' WHERE test_id = 2 AND q_text LIKE 'Q4:%';
UPDATE questions SET skill_type = 'P2' WHERE test_id = 2 AND q_text LIKE 'Q7:%';
UPDATE questions SET skill_type = 'P2' WHERE test_id = 2 AND q_text LIKE 'Q9:%';
UPDATE questions SET skill_type = 'P2' WHERE test_id = 2 AND q_text LIKE 'Q13:%';

-- Section B & C Updates
-- Q21 (Covers parts a, b, and c)
UPDATE questions SET skill_type = 'P2' WHERE test_id = 2 AND q_text LIKE 'Q21%';

-- Q23 (Covers parts a, b, and c)
UPDATE questions SET skill_type = 'P2' WHERE test_id = 2 AND q_text LIKE 'Q23%';

-- Q26 (part c only)
UPDATE questions SET skill_type = 'P2' WHERE test_id = 2 AND q_text LIKE 'Q26 (c)%';

-- Q28 (parts b and c only -> changed to P3)
UPDATE questions SET skill_type = 'P3' WHERE test_id = 2 AND q_text LIKE 'Q28 (b)%';
UPDATE questions SET skill_type = 'P3' WHERE test_id = 2 AND q_text LIKE 'Q28 (c)%';

-- Update Q10 to P2
UPDATE questions 
SET skill_type = 'P2' 
WHERE test_id = 2 AND q_text LIKE 'Q10:%';

-- Update Q15 to L3
UPDATE questions 
SET bloom_level = 'L3' 
WHERE test_id = 2 AND q_text LIKE 'Q15:%';

-- Update Q18 to L2
UPDATE questions 
SET bloom_level = 'L2' 
WHERE test_id = 2 AND q_text LIKE 'Q18:%';

-- Update Q26 (a) and (b) to L3
UPDATE questions 
SET bloom_level = 'L3' 
WHERE test_id = 2 AND q_text LIKE 'Q26 (a)%';

UPDATE questions 
SET bloom_level = 'L3' 
WHERE test_id = 2 AND q_text LIKE 'Q26 (b)%';

-- Update Q28 (b) and (c) to L3
UPDATE questions 
SET bloom_level = 'L3' 
WHERE test_id = 2 AND q_text LIKE 'Q28 (b)%';

UPDATE questions 
SET bloom_level = 'L3' 
WHERE test_id = 2 AND q_text LIKE 'Q28 (c)%';