USE pramyan;

-- 1. Insert an Admin and a Student
INSERT INTO users (name, email, password_hash, class, board, role, parent_phone) 
VALUES 
('Admin Anshika', 'admin@pramyan.com', 'hashed_pw_123', NULL, NULL, 'admin', NULL),
('Student Keerthiga', 'keerthiga@student.com', 'hashed_pw_456', 10, 'CBSE', 'student', '9876543210');

-- 2. Insert a Test (Created by the Admin, id=1)
INSERT INTO tests (name, duration_mins, class, created_by) 
VALUES 
('Class 10 Diagnostic Assessment', 90, 10, 1);

-- 3. Insert Questions for the Test (test_id=1)
INSERT INTO questions (test_id, section, q_text, opt_a, opt_b, opt_c, opt_d, correct, chapter, bloom_level, skill_type) 
VALUES 
(1, 'A', 'What is the sum of angles in a triangle?', '90', '180', '360', '270', 'b', 'Geometry', 'L1', 'P1'),
(1, 'B', 'What is the chemical formula for water?', 'H2O', 'CO2', 'O2', 'NaCl', 'a', 'Chemical Reactions', 'L1', 'P1');

-- 4. Insert a Test Attempt by the Student (user_id=2, test_id=1)
INSERT INTO student_tests (user_id, test_id, start_time, is_submitted) 
VALUES 
(2, 1, '2026-04-13 10:00:00', 1);

-- 5. Insert the Student's Responses (student_test_id=1, question_id=1 & 2)
-- Student got Q1 right, Q2 wrong
INSERT INTO responses (student_test_id, question_id, selected_option) 
VALUES 
(1, 1, 'b'), 
(1, 2, 'b');

-- 6. Insert the Final Computed Results (student_test_id=1)
INSERT INTO results (student_test_id, total_score, math_score, sci_score, overall_pct, status, p1, p2, p3, action_plan) 
VALUES 
(1, 1, 1, 0, 50.00, 'scored', 50.00, 0.00, 0.00, 'Focus heavily on Chemical Reactions this week.');

-- 7. Insert the Chapter SWOT Scores (result_id=1)
INSERT INTO chapter_scores (result_id, chapter, score, max_score, pct, swot_category) 
VALUES 
(1, 'Geometry', 1, 1, 100.00, 'Strength'),
(1, 'Chemical Reactions', 0, 1, 0.00, 'Weakness');

-- 8. Insert the Bloom's Taxonomy Scores (result_id=1)
INSERT INTO bloom_scores (result_id, bloom_level, score, max_score, pct) 
VALUES 
(1, 'L1', 1, 2, 50.00);