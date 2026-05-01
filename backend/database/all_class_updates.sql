SET FOREIGN_KEY_CHECKS = 0;

-- class 10

UPDATE questions SET chapter = 'Why Do We Fall Ill?' WHERE test_id = 1 AND q_text LIKE 'Q28%';

UPDATE questions SET chapter = 'Heron''s Formula' WHERE test_id = 1 AND q_text LIKE 'Q29 (a)%';
UPDATE questions SET chapter = 'Heron''s Formula' WHERE test_id = 1 AND q_text LIKE 'Q29 (b)%';
UPDATE questions SET chapter = 'Heron''s Formula' WHERE test_id = 1 AND q_text LIKE 'Q29 (c)%';
UPDATE questions SET chapter = 'Surface Area & Volume' WHERE test_id = 1 AND q_text LIKE 'Q29 (d)%';

-- Update Q31 (a): Momentum -> Force & Motion | Application (P3)
UPDATE questions 
SET chapter = 'Force & Motion', skill_type = 'P3' 
WHERE test_id = 1 AND q_text LIKE 'Q31 (a)%';
UPDATE questions 
SET chapter = 'Force & Motion', skill_type = 'P1' 
WHERE test_id = 1 AND q_text LIKE 'Q31 (b)%';
UPDATE questions 
SET chapter = 'Motion', skill_type = 'P3' 
WHERE test_id = 1 AND q_text LIKE 'Q31 (c)%';
UPDATE questions 
SET chapter = 'Force & Motion', skill_type = 'P2' 
WHERE test_id = 1 AND q_text LIKE 'Q31 (d)%';

-- Update Q32 (a): Buoyancy -> Gravitation | Procedural (P2)
UPDATE questions 
SET chapter = 'Gravitation', skill_type = 'P2' 
WHERE test_id = 1 AND q_text LIKE 'Q32 (a)%';

-- Update Q32 (b): Flotation/Density -> Gravitation | Application (P3)
UPDATE questions 
SET chapter = 'Gravitation', skill_type = 'P3' 
WHERE test_id = 1 AND q_text LIKE 'Q32 (b)%';

-- Update Q32 (c): Work -> Work & Energy | Procedural (P2)
UPDATE questions 
SET chapter = 'Work & Energy', skill_type = 'P2' 
WHERE test_id = 1 AND q_text LIKE 'Q32 (c)%';

-- Update Q32 (d): Power -> Work & Energy | Application (P3)
UPDATE questions 
SET chapter = 'Work & Energy', skill_type = 'P3' 
WHERE test_id = 1 AND q_text LIKE 'Q32 (d)%';


-- class 8
-- Fix 1: Q22(b) correct answer should be 'c' not 'b'
-- (Marked price = ₹4,000 = option C, not ₹3,960 = option B)
UPDATE questions 
SET correct = 'c' 
WHERE test_id = 3 
  AND q_text LIKE 'Q22 (b)%';

-- Fix 2: Q18 skill_type should be P1 not P2
UPDATE questions 
SET skill_type = 'P1' 
WHERE test_id = 3 
  AND q_text LIKE 'Q18%';

-- Fix 3 (optional, to match Excel): Q3,Q5,Q6,Q8,Q9,Q10,Q15 bloom_level = L3
UPDATE questions SET bloom_level = 'L3' 
WHERE test_id = 3 AND q_text LIKE 'Q3%';
-- (repeat for Q5, Q6, Q8, Q9, Q10, Q15)

-- BLOOM FIXES: L2 → L3 (under-tagged Apply questions)
UPDATE questions SET bloom_level='L3' WHERE test_id=3 AND q_text LIKE 'Q3%';
UPDATE questions SET bloom_level='L3' WHERE test_id=3 AND q_text LIKE 'Q5%';
UPDATE questions SET bloom_level='L3' WHERE test_id=3 AND q_text LIKE 'Q6%';
UPDATE questions SET bloom_level='L3' WHERE test_id=3 AND q_text LIKE 'Q8%';
UPDATE questions SET bloom_level='L3' WHERE test_id=3 AND q_text LIKE 'Q9%';
UPDATE questions SET bloom_level='L3' WHERE test_id=3 AND q_text LIKE 'Q10%';
UPDATE questions SET bloom_level='L3' WHERE test_id=3 AND q_text LIKE 'Q15%';
UPDATE questions SET bloom_level='L3' WHERE test_id=3 AND q_text LIKE 'Q21%';
UPDATE questions SET bloom_level='L3' WHERE test_id=3 AND q_text LIKE 'Q23%';
UPDATE questions SET bloom_level='L3' WHERE test_id=3 AND q_text LIKE 'Q24 (a)%';
UPDATE questions SET bloom_level='L3' WHERE test_id=3 AND q_text LIKE 'Q29 (a)%';
UPDATE questions SET bloom_level='L3' WHERE test_id=3 AND q_text LIKE 'Q30 (a)%';
UPDATE questions SET bloom_level='L3' WHERE test_id=3 AND q_text LIKE 'Q30 (c)%';
UPDATE questions SET bloom_level='L3' WHERE test_id=3 AND q_text LIKE 'Q30 (d)%';

-- BLOOM FIXES: L2 → L1 (over-tagged recall questions)
UPDATE questions SET bloom_level='L1' WHERE test_id=3 AND q_text LIKE 'Q18%';
UPDATE questions SET bloom_level='L1' WHERE test_id=3 AND q_text LIKE 'Q27 (c)%';
UPDATE questions SET bloom_level='L1' WHERE test_id=3 AND q_text LIKE 'Q31 (a)%';
UPDATE questions SET bloom_level='L1' WHERE test_id=3 AND q_text LIKE 'Q31 (c)%';

-- BLOOM FIX: L3 → L2 (Q31b over-tagged)
UPDATE questions SET bloom_level='L2' WHERE test_id=3 AND q_text LIKE 'Q31 (b)%';

-- SKILL_TYPE FIXES: P2 → P1 (recall questions wrongly marked procedural)
UPDATE questions SET skill_type='P1' WHERE test_id=3 AND q_text LIKE 'Q18%';
UPDATE questions SET skill_type='P1' WHERE test_id=3 AND q_text LIKE 'Q27 (c)%';
UPDATE questions SET skill_type='P1' WHERE test_id=3 AND q_text LIKE 'Q31 (a)%';
UPDATE questions SET skill_type='P1' WHERE test_id=3 AND q_text LIKE 'Q31 (c)%';

-- SKILL_TYPE FIXES: P3 → P2 (procedural questions over-tagged as HOTS)
UPDATE questions SET skill_type='P2' WHERE test_id=3 AND q_text LIKE 'Q24 (b)%';
UPDATE questions SET skill_type='P2' WHERE test_id=3 AND q_text LIKE 'Q24 (c)%';
UPDATE questions SET skill_type='P2' WHERE test_id=3 AND q_text LIKE 'Q26 (a)%';
UPDATE questions SET skill_type='P2' WHERE test_id=3 AND q_text LIKE 'Q29 (b)%';
UPDATE questions SET skill_type='P2' WHERE test_id=3 AND q_text LIKE 'Q29 (c)%';
UPDATE questions SET skill_type='P2' WHERE test_id=3 AND q_text LIKE 'Q29 (d)%';
UPDATE questions SET skill_type='P2' WHERE test_id=3 AND q_text LIKE 'Q30 (b)%';
UPDATE questions SET skill_type='P2' WHERE test_id=3 AND q_text LIKE 'Q31 (b)%';

UPDATE questions 
SET skill_type = 'P3' 
WHERE test_id = 3 AND q_text LIKE 'Q25 (b)%';

UPDATE questions 
SET skill_type = 'P3' 
WHERE test_id = 3 AND q_text LIKE 'Q25 (c)%';

UPDATE questions 
SET skill_type = 'P3' 
WHERE test_id = 3 AND q_text LIKE 'Q27 (c)%';

UPDATE questions 
SET skill_type = 'P3' 
WHERE test_id = 3 AND q_text LIKE 'Q28 (b)%';

UPDATE questions 
SET skill_type = 'P3' 
WHERE test_id = 3 AND q_text LIKE 'Q28 (c)%';

-- class 9

ALTER TABLE questions 
ADD COLUMN question_no INT,
ADD COLUMN subject VARCHAR(20),
ADD COLUMN section_type VARCHAR(5);

-- Subject (Math / Science)
UPDATE questions SET subject = section;

-- Section Type (A/B/C)
UPDATE questions SET section_type='A' WHERE id BETWEEN 1 AND 20;
UPDATE questions SET section_type='B' WHERE id BETWEEN 21 AND 44;
UPDATE questions SET section_type='C' WHERE id BETWEEN 45 AND 60;

SET @q = 0;

UPDATE questions 
SET question_no = (@q := @q + 1)
WHERE test_id = 2
ORDER BY id;

-- Q18 should be APPLICATION
UPDATE questions 
SET bloom_level='L3' 
WHERE q_text LIKE 'Q18:%';

-- Light theory → UNDERSTAND
UPDATE questions 
SET bloom_level='L2' 
WHERE q_text LIKE 'Q26 (a)%';

UPDATE questions 
SET bloom_level='L2' 
WHERE q_text LIKE 'Q26 (b)%';

-- Sound conceptual → UNDERSTAND
UPDATE questions 
SET bloom_level='L2' 
WHERE q_text LIKE 'Q28 (b)%';

UPDATE questions 
SET bloom_level='L2' 
WHERE q_text LIKE 'Q28 (c)%';

UPDATE questions SET skill_type='P1' WHERE bloom_level='L1';
UPDATE questions SET skill_type='P2' WHERE bloom_level='L2';
UPDATE questions SET skill_type='P3' WHERE bloom_level IN ('L3','L4','L5');

UPDATE questions 
SET chapter='Cell – Structure & Functions'
WHERE chapter='Cell - Structure & Functions';

UPDATE questions 
SET chapter='Chemical Effects of Electricity'
WHERE chapter='Chemical Effects of Electric Current';

UPDATE questions 
SET chapter='Reproduction'
WHERE chapter='Reproduction in Animals';

UPDATE questions 
SET chapter='Sound'
WHERE chapter='Motion & Time';

UPDATE questions 
SET chapter='Microorganisms & Combustion'
WHERE chapter IN ('Microorganisms + Combustion');

SET FOREIGN_KEY_CHECKS = 1;