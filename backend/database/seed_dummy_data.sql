USE pramyan;

-- Dummy data for frontend testing.
-- Login credentials:
--   Admin   -> admin@pramyan.com / Admin@123
--   Student -> any student email below / Student@123

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE bloom_scores;
TRUNCATE TABLE chapter_scores;
TRUNCATE TABLE results;
TRUNCATE TABLE responses;
TRUNCATE TABLE student_tests;
TRUNCATE TABLE questions;
TRUNCATE TABLE tests;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1) Users (Updated with google_id)
INSERT INTO users (name, email, password_hash, google_id, class, board, role, parent_phone)
VALUES
('Admin Anshika', 'admin@pramyan.com', '$2y$12$bZdaQTylwXK3E5MKtAZvquUhglTlpMoXZ.kYnr77Rjd3VihN.4UXm', NULL, NULL, NULL, 'admin', NULL),
('Aarav Sharma', 'aarav.student@pramyan.com', '$2y$12$wFcMqMbM4rBmcgDemERmWOHmAFr534KeQn/7r0Tzj8rCw8npdO2lG', NULL, 10, 'CBSE', 'student', '9876500011'),
('Diya Nair', 'diya.student@pramyan.com', '$2y$12$wFcMqMbM4rBmcgDemERmWOHmAFr534KeQn/7r0Tzj8rCw8npdO2lG', NULL, 10, 'CBSE', 'student', '9876500022'),
('Vihaan Patel', 'vihaan.student@pramyan.com', '$2y$12$wFcMqMbM4rBmcgDemERmWOHmAFr534KeQn/7r0Tzj8rCw8npdO2lG', NULL, 9, 'ICSE', 'student', '9876500033'),
('Anaya Reddy', 'anaya.student@pramyan.com', '$2y$12$wFcMqMbM4rBmcgDemERmWOHmAFr534KeQn/7r0Tzj8rCw8npdO2lG', NULL, 8, 'CBSE', 'student', '9876500044');

-- 2) Tests (created_by = admin id 1)
INSERT INTO tests (name, duration_mins, class, created_by)
VALUES
('Class 10 Diagnostic Assessment', 90, 10, 1),
('Class 9 Mid-Term Readiness Test', 60, 9, 1),
('Class 8 Foundation Check', 45, 8, 1);

-- 3) Questions
INSERT INTO questions (test_id, section, q_text, opt_a, opt_b, opt_c, opt_d, correct, chapter, bloom_level, skill_type, time_on_question)
VALUES
-- Test 1
(1, 'A', 'What is the sum of angles in a triangle?', '90', '180', '270', '360', 'b', 'Geometry', 'L1', 'P1', 75),
(1, 'A', 'If x + 5 = 13, then x = ?', '6', '7', '8', '9', 'c', 'Algebra', 'L1', 'P1', 64),
(1, 'B', 'What is the chemical formula for water?', 'CO2', 'H2O', 'O2', 'NaCl', 'b', 'Chemical Reactions', 'L1', 'P1', 58),
(1, 'B', 'Which organ pumps blood in the human body?', 'Liver', 'Lungs', 'Kidney', 'Heart', 'd', 'Life Processes', 'L2', 'P2', 70),
-- Test 2
(2, 'A', 'Find HCF of 18 and 24.', '3', '6', '9', '12', 'b', 'Number Systems', 'L2', 'P2', 81),
(2, 'A', 'A triangle with two equal sides is called?', 'Scalene', 'Right', 'Isosceles', 'Equilateral', 'c', 'Geometry', 'L1', 'P1', 67),
(2, 'B', 'Which process do plants use to make food?', 'Respiration', 'Transpiration', 'Photosynthesis', 'Digestion', 'c', 'Natural Resources', 'L1', 'P1', 73),
-- Test 3
(3, 'A', 'What is 25% of 200?', '25', '40', '50', '75', 'c', 'Percentages', 'L1', 'P1', 55),
(3, 'B', 'Which state change is from liquid to gas?', 'Condensation', 'Evaporation', 'Freezing', 'Melting', 'b', 'Matter', 'L2', 'P2', 62);

-- 4) Student test attempts
INSERT INTO student_tests (user_id, test_id, start_time, is_submitted)
VALUES
(2, 1, '2026-04-10 10:00:00', 1),
(3, 1, '2026-04-10 11:30:00', 1),
(4, 2, '2026-04-11 09:15:00', 1),
(5, 3, '2026-04-12 14:00:00', 0);

-- 5) Responses
INSERT INTO responses (student_test_id, question_id, selected_option)
VALUES
-- Aarav / Test 1
(1, 1, 'b'),
(1, 2, 'c'),
(1, 3, 'b'),
(1, 4, 'd'),
-- Diya / Test 1
(2, 1, 'a'),
(2, 2, 'c'),
(2, 3, 'b'),
(2, 4, 'c'),
-- Vihaan / Test 2
(3, 5, 'b'),
(3, 6, 'c'),
(3, 7, 'c'),
-- Anaya / Test 3 (in progress)
(4, 8, 'c');

-- 6) Results (only for submitted tests)
INSERT INTO results (student_test_id, total_score, math_score, sci_score, overall_pct, status, p1, p2, p3, action_plan)
VALUES
(1, 4, 2, 2, 100.00, 'scored', 100.00, 100.00, 0.00, 'Keep up the consistency and move to higher-order questions (P3).'),
(2, 2, 1, 1, 50.00, 'scored', 66.67, 33.33, 0.00, 'Revise Geometry and Life Processes with daily concept practice.'),
(3, 3, 2, 1, 100.00, 'scored', 66.67, 33.33, 0.00, 'Introduce time-bound mixed question drills to improve speed.');

-- 7) Chapter-level SWOT
INSERT INTO chapter_scores (result_id, chapter, score, max_score, pct, swot_category)
VALUES
-- Result 1 (Aarav)
(1, 'Geometry', 1, 1, 100.00, 'Strength'),
(1, 'Algebra', 1, 1, 100.00, 'Strength'),
(1, 'Chemical Reactions', 1, 1, 100.00, 'Strength'),
(1, 'Life Processes', 1, 1, 100.00, 'Strength'),
-- Result 2 (Diya)
(2, 'Geometry', 0, 1, 0.00, 'Weakness'),
(2, 'Algebra', 1, 1, 100.00, 'Strength'),
(2, 'Chemical Reactions', 1, 1, 100.00, 'Strength'),
(2, 'Life Processes', 0, 1, 0.00, 'Opportunity'),
-- Result 3 (Vihaan)
(3, 'Number Systems', 1, 1, 100.00, 'Strength'),
(3, 'Geometry', 1, 1, 100.00, 'Strength'),
(3, 'Natural Resources', 1, 1, 100.00, 'Strength');

-- 8) Bloom levels
INSERT INTO bloom_scores (result_id, bloom_level, score, max_score, pct)
VALUES
(1, 'L1', 3, 3, 100.00),
(1, 'L2', 1, 1, 100.00),
(2, 'L1', 2, 3, 66.67),
(2, 'L2', 0, 1, 0.00),
(3, 'L1', 1, 1, 100.00),
(3, 'L2', 2, 2, 100.00);