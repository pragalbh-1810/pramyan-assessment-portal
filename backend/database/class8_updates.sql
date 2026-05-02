-- ============================================================
-- CORRECTIONS: bloom_level, skill_type, correct answer fixes
-- test_id = 3
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Q18: bloom L1, skill P1 (was L2, P2 in update script)
UPDATE questions SET bloom_level='L1', skill_type='P1'
  WHERE test_id=3 AND q_text LIKE 'Q18:%';

-- Q22 (a,b,c): bloom L4 (was L3)
UPDATE questions SET bloom_level='L4'
  WHERE test_id=3 AND q_text LIKE 'Q22 (%';

-- Q25 (a,b,c): bloom L4, skill P3 for b and c
UPDATE questions SET bloom_level='L4'
  WHERE test_id=3 AND q_text LIKE 'Q25 (%';
UPDATE questions SET skill_type='P3'
  WHERE test_id=3 AND (q_text LIKE 'Q25 (b)%' OR q_text LIKE 'Q25 (c)%');

-- Q26 (b,c): bloom L3 (a is already L3, no change needed)
UPDATE questions SET bloom_level='L3'
  WHERE test_id=3 AND (q_text LIKE 'Q26 (b)%' OR q_text LIKE 'Q26 (c)%');

-- Q27 (c): bloom L3, skill P3 (was L2, P2)
UPDATE questions SET bloom_level='L3', skill_type='P3'
  WHERE test_id=3 AND q_text LIKE 'Q27 (c)%';

-- Q28 (b,c): bloom L3, skill P3 (was L2, P2)
UPDATE questions SET bloom_level='L3', skill_type='P3'
  WHERE test_id=3 AND (q_text LIKE 'Q28 (b)%' OR q_text LIKE 'Q28 (c)%');

-- Q29 (a,b,c,d): bloom L4
UPDATE questions SET bloom_level='L4'
  WHERE test_id=3 AND q_text LIKE 'Q29 (%';

-- Q30 (a,b,c,d): bloom L4
UPDATE questions SET bloom_level='L4'
  WHERE test_id=3 AND q_text LIKE 'Q30 (%';

-- Q31 (a,b,c,d): bloom L5
UPDATE questions SET bloom_level='L5'
  WHERE test_id=3 AND q_text LIKE 'Q31 (%';

-- Q32 (a,b,c,d): bloom L5
UPDATE questions SET bloom_level='L5'
  WHERE test_id=3 AND q_text LIKE 'Q32 (%';

-- Q30 (b): correct answer -> 'a' (was 'b')
UPDATE questions SET correct='a'
  WHERE test_id=3 AND q_text LIKE 'Q30 (b)%';

SET FOREIGN_KEY_CHECKS = 1;