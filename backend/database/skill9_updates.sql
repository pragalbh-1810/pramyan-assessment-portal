-- class 8

-- Update Q30 (a) and (c) to Data Handling and P2
UPDATE questions 
SET chapter = 'Data Handling', skill_type = 'P2' 
WHERE test_id = 2 AND q_text LIKE 'Q30 (a)%';

UPDATE questions 
SET chapter = 'Data Handling', skill_type = 'P2' 
WHERE test_id = 2 AND q_text LIKE 'Q30 (c)%';

-- Update Q30 (b) and (d) to Comparing Quantities and P3
UPDATE questions 
SET chapter = 'Comparing Quantities', skill_type = 'P3' 
WHERE test_id = 2 AND q_text LIKE 'Q30 (b)%';

UPDATE questions 
SET chapter = 'Comparing Quantities', skill_type = 'P3' 
WHERE test_id = 2 AND q_text LIKE 'Q30 (d)%';

-- Update Q31 (a) and (b) to Metals & Non-metals (P2)
UPDATE questions 
SET chapter = 'Metals & Non-metals', skill_type = 'P2' 
WHERE test_id = 2 AND q_text LIKE 'Q31 (a)%';

UPDATE questions 
SET chapter = 'Metals & Non-metals', skill_type = 'P2' 
WHERE test_id = 2 AND q_text LIKE 'Q31 (b)%';

-- Update Q31 (c) and (d) to Chemical Effects of Electric Current (P3)
UPDATE questions 
SET chapter = 'Chemical Effects of Electric Current', skill_type = 'P3' 
WHERE test_id = 2 AND q_text LIKE 'Q31 (c)%';

UPDATE questions 
SET chapter = 'Chemical Effects of Electric Current', skill_type = 'P3' 
WHERE test_id = 2 AND q_text LIKE 'Q31 (d)%';

-- Update Q32 (a) and (b) to Microorganisms (Procedural/Concept - P2)
UPDATE questions 
SET chapter = 'Microorganisms', skill_type = 'P2' 
WHERE test_id = 2 AND q_text LIKE 'Q32 (a)%';

UPDATE questions 
SET chapter = 'Microorganisms', skill_type = 'P2' 
WHERE test_id = 2 AND q_text LIKE 'Q32 (b)%';

-- Update Q32 (c) to Microorganisms 
UPDATE questions 
SET chapter = 'Microorganisms', skill_type = 'P2' 
WHERE test_id = 2 AND q_text LIKE 'Q32 (c)%';

-- Update Q32 (d) to Combustion & Flame (Application - P3)
UPDATE questions 
SET chapter = 'Combustion & Flame', skill_type = 'P3' 
WHERE test_id = 2 AND q_text LIKE 'Q32 (d)%';

UPDATE questions 
SET chapter = 'Squares, Cubes & Factorisation' 
WHERE test_id = 2 AND q_text LIKE 'Q5:%';

UPDATE questions 
SET chapter = 'Squares, Cubes & Factorisation' 
WHERE test_id = 2 AND q_text LIKE 'Q9:%';

UPDATE questions 
SET chapter = 'Chemical Effects of Electricity' 
WHERE test_id = 2 AND q_text LIKE 'Q31 (c)%';

UPDATE questions 
SET chapter = 'Chemical Effects of Electricity' 
WHERE test_id = 2 AND q_text LIKE 'Q31 (d)%';

UPDATE questions 
SET chapter = 'Reproduction in Animals' 
WHERE test_id = 2 AND q_text LIKE 'Q20:%';