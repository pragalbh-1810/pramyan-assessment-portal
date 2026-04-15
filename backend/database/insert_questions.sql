CREATE DATABASE IF NOT EXISTS pramyan;
USE pramyan;

-- 1. Create all tables
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) NULL,
  class INT,
  board VARCHAR(50),
  role ENUM('student','admin') DEFAULT 'student',
  parent_phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  duration_mins INT NOT NULL,
  class INT,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_id INT NOT NULL,
  section VARCHAR(10),
  q_text TEXT NOT NULL,
  q_image VARCHAR(255) DEFAULT NULL,
  opt_a TEXT,
  opt_b TEXT,
  opt_c TEXT,
  opt_d TEXT,
  correct ENUM('a','b','c','d') NOT NULL,
  chapter VARCHAR(100) NOT NULL,
  bloom_level ENUM('L1','L2','L3','L4','L5') NOT NULL,
  skill_type ENUM('P1','P2','P3') NOT NULL,
  time_on_question INT DEFAULT 0,
  FOREIGN KEY (test_id) REFERENCES tests(id)
);

CREATE TABLE IF NOT EXISTS student_tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  test_id INT NOT NULL,
  start_time DATETIME,
  is_submitted TINYINT(1) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (test_id) REFERENCES tests(id)
);

CREATE TABLE IF NOT EXISTS responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_test_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_option ENUM('a','b','c','d'),
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  uploaded_file VARCHAR(500),
  FOREIGN KEY (student_test_id) REFERENCES student_tests(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_test_id INT NOT NULL,
  total_score INT,
  math_score INT,
  sci_score INT,
  overall_pct DECIMAL(5,2),
  status ENUM('submitted','scored') DEFAULT 'submitted',
  p1 DECIMAL(5,2),
  p2 DECIMAL(5,2),
  p3 DECIMAL(5,2),
  action_plan TEXT,
  FOREIGN KEY (student_test_id) REFERENCES student_tests(id)
);

CREATE TABLE IF NOT EXISTS chapter_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  result_id INT NOT NULL,
  chapter VARCHAR(100),
  score INT,
  max_score INT,
  pct DECIMAL(5,2),
  swot_category ENUM('Strength','Opportunity','Weakness'),
  FOREIGN KEY (result_id) REFERENCES results(id)
);

CREATE TABLE IF NOT EXISTS bloom_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  result_id INT NOT NULL,
  bloom_level ENUM('L1','L2','L3','L4','L5'),
  score INT,
  max_score INT,
  pct DECIMAL(5,2),
  FOREIGN KEY (result_id) REFERENCES results(id)
);


-- 2. Clean old test data safely
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM responses WHERE student_test_id IN (SELECT id FROM student_tests WHERE test_id = 1);
DELETE FROM questions WHERE test_id = 1;
SET FOREIGN_KEY_CHECKS = 1;


-- 3. Insert Exactly 60 Rows based on text mapping
INSERT INTO questions (test_id, section, q_text, q_image, opt_a, opt_b, opt_c, opt_d, correct, chapter, bloom_level, skill_type, time_on_question)
VALUES
-- SECTION A (20 Questions x 1 Mark)
(1, 'Math', 'Q1: Which of the following statements is true?', NULL, 'Every irrational number can be represented as a fraction.', 'Every irrational number can be represented with the help of decimals.', 'Every rational number can be represented as a terminating decimal.', 'Every rational number can be represented as an integer.', 'b', 'Number Systems', 'L1', 'P1', 60),
(1, 'Math', 'Q2: A manufacturer makes rectangular screens. Which screen size is more than double but less than three times the size of a 70-unit screen?', NULL, '145 units', '175 units', '270 units', '580 units', 'b', 'Number Systems', 'L2', 'P2', 60),
(1, 'Math', 'Q3: A polynomial is expressed as x³ + bx² + cx + d = 0, with factor form (x+p)(x+q)(x+r) = 0. How is the constant term ''d'' related to its factors p, q, r?', NULL, 'd = p+q+r', 'd = (p+q)×r', 'd = p×q×r', 'd = pq+qr+pr', 'c', 'Polynomials', 'L2', 'P2', 75),
(1, 'Math', 'Q4: A polynomial is divided by (x–1). Quotient is 3x³ – x² – x – 4 and remainder is –5. Which polynomial satisfies these conditions?', NULL, '3x³–x²–x–9', '3x³–x²–x–4', '3x⁴–4x³–3x+4', '3x⁴–4x²–3x–1', 'd', 'Polynomials', 'L3', 'P3', 90),
(1, 'Math', 'Q5: The mass of a full soap bottle is 220 g and a half-filled bottle is 120 g. What is the mass of the empty bottle?', NULL, '10 g', '20 g', '100 g', '110 g', 'b', 'Linear Equations', 'L3', 'P2', 75),
(1, 'Math', 'Q6: Two equilateral triangles sit on a straight line. What is the measure of angle x?', NULL, '30°', '40°', '60°', '65°', 'c', 'Lines & Angles', 'L2', 'P2', 60),
(1, 'Math', 'Q7: In a figure, △AFB ≅ △AFG, △ADE ≅ △AGE and ∠EAF = 45°. What is the measure of ∠DAB?', 'q7_figure.jpg', '60°', '90°', '120°', '135°', 'b', 'Triangles', 'L3', 'P3', 90),
(1, 'Math', 'Q8: A cone has radius 4 cm and height 15 cm. An ice-cream seller keeps ¼ of it empty. What is the volume (in cm³) of the empty part?', NULL, '12π', '15π', '19π', '20π', 'd', 'Surface Area & Volume', 'L3', 'P2', 90),
(1, 'Math', 'Q9: The haemoglobin counts (mg/dL) of 25 females: median is to be found. Given distribution, the median is:', NULL, '8', '9', '9.5', '12.5', 'c', 'Statistics', 'L2', 'P1', 60),
(1, 'Math', 'Q10: Shyam paints a die: one face = 2, two faces = 1, three faces = 4. What is the probability of getting a face showing an even number?', NULL, '1/2', '1/3', '1/6', '2/3', 'd', 'Probability', 'L2', 'P2', 60),

(1, 'Science', 'Q11: Masood dissolved 10 g copper sulphate crystal in Jar 1 and 10 mL of 75% copper sulphate solution in Jar 2. Which conclusion is supported?', NULL, 'Crystals dissolve partially', 'Liquids dissolve faster than solids', 'CuSO₄ dissolves faster than in any other liquid', 'Liquid particles have stronger attraction than solids', 'b', 'Matter', 'L3', 'P3', 75),
(1, 'Science', 'Q12: Which of the following is an alloy?', NULL, 'Silver', 'Copper', 'Bronze', 'Aluminium', 'c', 'Is Matter Pure?', 'L1', 'P1', 30),
(1, 'Science', 'Q13: Two ions Zn²⁺ and S²⁻ combine. What is the formula of the compound formed?', NULL, 'ZnS', 'Zn₂S', 'ZnS₂', 'Zn₂S₂', 'a', 'Atoms & Molecules', 'L2', 'P1', 45),
(1, 'Science', 'Q14: What is the maximum number of electrons that can be present in the first shell of an atom?', NULL, '1', '2', '4', '8', 'b', 'Structure of Atom', 'L1', 'P1', 30),
(1, 'Science', 'Q15: A car travels from house → school → library → back to school. What is the net displacement of the car?', NULL, '20 km', '30 km', '50 km', '70 km', 'a', 'Motion', 'L2', 'P2', 60),
(1, 'Science', 'Q16: A bus travels at 35 km/hr in the first hour, 60 km/hr in the second hour, and 40 km/hr in the third hour. What was the average speed?', NULL, '35', '40', '45', '60', 'c', 'Motion', 'L2', 'P2', 60),
(1, 'Science', 'Q17: Which of these represents a balanced force?', NULL, 'A boy sitting on a chair', 'An object sinking in water', 'An apple falling from a tree', 'A magnet attracting an iron nail', 'a', 'Force & Motion', 'L1', 'P1', 45),
(1, 'Science', 'Q18: Which of these involves conversion of kinetic energy to potential energy?', NULL, 'A person diving into a pool', 'A person gliding with a parachute', 'A person sliding down a water slide', 'A person riding a motorbike to the top of an overbridge', 'd', 'Work & Energy', 'L2', 'P2', 60),
(1, 'Science', 'Q19: Which of these is a correct pair of a chronic disease and an acute disease?', NULL, 'Arthritis / Malaria', 'Typhoid / Cancer', 'Malaria / Typhoid', 'Cancer / Arthritis', 'a', 'Why Do We Fall Ill?', 'L1', 'P1', 30),
(1, 'Science', 'Q20: Which property of the plasma membrane helps amoeba acquire food?', NULL, 'It is flexible', 'It is selectively permeable', 'It is made of proteins and lipids', 'It allows diffusion of substances', 'a', 'Cell - Fundamental Unit', 'L1', 'P1', 45),

-- SECTION B (8 Questions x 3 Marks = 24 Parts)
(1, 'Math', 'Q21 (a): The area of a rectangle is (3x² + x – 2) square units. Its width is (1 + x) units. What is the length of the rectangle?', NULL, '(3x + 2)', '(3x – 2)', '(x – 2)', '(2x – 3)', 'b', 'Polynomials', 'L2', 'P2', 60),
(1, 'Math', 'Q21 (b): Which of the following correctly shows the first step of dividing (3x² + x – 2) by (x + 1)?', NULL, '3x(x+1) = 3x² + 3x', '3x(x+1) = 3x² + x', 'x(x+1) = x² + x', '3x²(x+1) = 3x³ + 3x²', 'a', 'Polynomials', 'L1', 'P1', 45),
(1, 'Math', 'Q21 (c): What is the remainder when (3x² + x – 2) is divided by (x + 1)?', NULL, '–4', '–2', '0', '2', 'c', 'Polynomials', 'L2', 'P2', 60),

(1, 'Math', 'Q22 (a): A carton contains fragrant (f) and non-fragrant (n) soap bottles. Total = 50 bottles. A carton with 10 small bottles and 40 large bottles weighs 10.8 kg. Each large bottle = 0.25 kg. Which equation represents the total number of bottles?', NULL, 'f – n = 50', 'f × n = 50', 'f + n = 50', '2f + n = 50', 'c', 'Linear Equations', 'L1', 'P1', 45),
(1, 'Math', 'Q22 (b): If each large bottle weighs 0.25 kg and each small bottle weighs 0.06 kg, what is the mass of the empty carton?', NULL, '0.2 kg', '0.4 kg', '0.6 kg', '0.8 kg', 'a', 'Linear Equations', 'L3', 'P2', 90),
(1, 'Math', 'Q22 (c): What would be the total mass of a carton loaded with 50 large bottles only (use same carton mass)?', NULL, '12.5 kg', '13.1 kg', '13.3 kg', '14.0 kg', 'b', 'Linear Equations', 'L2', 'P2', 60),

(1, 'Math', 'Q23 (a): A cylindrical planter has a rim radius of 14 cm and a curved surface area of 1848 cm². What is the height of the planter? (Use π = 22/7)', NULL, '18 cm', '20 cm', '21 cm', '24 cm', 'c', 'Surface Area & Volume', 'L2', 'P2', 60),
(1, 'Math', 'Q23 (b): What is the volume of the planter in cm³? (Use π = 22/7)', NULL, '11,088 cm³', '12,936 cm³', '14,784 cm³', '16,632 cm³', 'b', 'Surface Area & Volume', 'L2', 'P2', 60),
(1, 'Math', 'Q23 (c): If the planter is filled with soil up to 3/4 of its height, what volume of soil does it hold?', NULL, '9,702 cm³', '10,500 cm³', '11,200 cm³', '12,000 cm³', 'a', 'Surface Area & Volume', 'L3', 'P3', 60),

(1, 'Math', 'Q24 (a): Five friends'' expenses in November: Anchal ₹3000, Amisha ₹5000, Mahi ₹6000, Vishu ₹4500, Sahar ₹7000. What is the mean (average) expense?', NULL, '₹4500', '₹5000', '₹5100', '₹5500', 'c', 'Statistics', 'L2', 'P1', 45),
(1, 'Math', 'Q24 (b): What is the median expense?', NULL, '₹4500', '₹5000', '₹5500', '₹6000', 'b', 'Statistics', 'L1', 'P1', 45),
(1, 'Math', 'Q24 (c): Which friend spent exactly the median amount?', NULL, 'Anchal', 'Amisha', 'Vishu', 'Mahi', 'b', 'Statistics', 'L1', 'P1', 30),

(1, 'Science', 'Q25 (a): Study the velocity-time graph of Rehana cycling to school. What was Rehana''s maximum cycling velocity?', 'q25_figure.jpg', '5 m/s', '8 m/s', '10 m/s', '15 m/s', 'c', 'Motion', 'L2', 'P2', 45),
(1, 'Science', 'Q25 (b): During which time interval was she cycling at uniform velocity?', 'q25_figure.jpg', '0–5 minutes', '5–10 minutes', '10–15 minutes', '0–10 minutes', 'b', 'Motion', 'L2', 'P2', 45),
(1, 'Science', 'Q25 (c): What was happening between 0–5 minutes?', 'q25_figure.jpg', 'She was decelerating', 'She was at rest', 'She was at uniform velocity', 'She was accelerating from rest', 'd', 'Motion', 'L1', 'P1', 45),

(1, 'Science', 'Q26 (a): A man pushes four boxes: Box A: 10 kg, a = 200 m/s² | Box B: 20 kg, a = 100 m/s² | Box C: 40 kg, a = 50 m/s². What force does the man exert on Box A?', 'q26_figure.jpg', '200 N', '500 N', '1000 N', '2000 N', 'd', 'Force & Motion', 'L2', 'P2', 45),
(1, 'Science', 'Q26 (b): What force does the man exert on Box B and Box C respectively?', 'q26_figure.jpg', '1000 N and 1000 N', '2000 N and 2000 N', '2000 N and 1000 N', '1000 N and 2000 N', 'b', 'Force & Motion', 'L2', 'P2', 60),
(1, 'Science', 'Q26 (c): Is the force on each box balanced or unbalanced? Why?', 'q26_figure.jpg', 'Balanced — because all forces are equal', 'Unbalanced — because the boxes are accelerating', 'Balanced — because the man applies the same force', 'Unbalanced — because the boxes have different masses', 'b', 'Force & Motion', 'L2', 'P3', 60),

(1, 'Science', 'Q27 (a): Sania places potato strips in three beakers: Beaker 1 = plain water | Beaker 2 = 1% salt solution | Beaker 3 = 2% salt solution. What did she observe in Beaker 1? Why?', 'q27_figure.jpg', 'Strip shrank — water moved out by osmosis', 'Strip became turgid — water entered cells by osmosis', 'No change — concentrations were equal', 'Strip dissolved — salt content was zero', 'b', 'Cell - Fundamental Unit', 'L2', 'P2', 60),
(1, 'Science', 'Q27 (b): In which beaker was the water concentration equal inside and outside the cell?', 'q27_figure.jpg', 'Beaker 1', 'Beaker 2', 'Beaker 3', 'None of the beakers', 'b', 'Cell - Fundamental Unit', 'L1', 'P1', 45),
(1, 'Science', 'Q27 (c): Why did she use three strips in each beaker?', 'q27_figure.jpg', 'To make the experiment look better', 'To use up all available potato strips', 'To reduce experimental error and verify results', 'Because one strip is too small to observe', 'c', 'Cell - Fundamental Unit', 'L3', 'P3', 45),

(1, 'Science', 'Q28 (a): Rahul surveys four villages: Village 1: no toilets, pond water | Village 2: toilets, tap water | Village 3: toilets, pond water | Village 4: public toilets, tap water. In which village is waterborne disease spread likely to be SLOWEST? Why?', NULL, 'Village 1 — has a large open water source', 'Village 3 — has toilets to control waste', 'Village 2 — has both proper sanitation and clean tap water', 'Village 4 — has the most toilets', 'c', 'Why Do We Fall Ill?', 'L2', 'P2', 45),
(1, 'Science', 'Q28 (b): A village near a cement factory has residents developing lung disease. What is the likely cause?', NULL, 'Contaminated drinking water', 'Bacterial infection spread by insects', 'Inhalation of cement dust / air pollution / particulate matter', 'Lack of vaccination', 'c', 'Why Do We Fall Ill?', 'L1', 'P1', 30),
(1, 'Science', 'Q28 (c): Which type of disease is lung disease caused by cement dust?', NULL, 'Infectious disease', 'Waterborne disease', 'Non-infectious / environmental disease', 'Vector-borne disease', 'c', 'Why Do We Fall Ill?', 'L1', 'P1', 30),

-- SECTION C (4 Questions x 4 Marks = 16 Parts)
(1, 'Math', 'Q29 (a): A zoo is shaped like an isosceles trapezium, divided into three zones. Zone 1 (animals) is a triangle with sides 13 km, 13 km, and 24 km. A 1.8 km wired fence separates zones. Using Heron''s formula, what is the semi-perimeter (s) of Zone 1''s triangle?', 'q29_figure.jpg', '20 km', '25 km', '30 km', '50 km', 'b', 'Heron''s Formula', 'L2', 'P2', 60),
(1, 'Math', 'Q29 (b): Using Heron''s formula, what is the area of Zone 1?', 'q29_figure.jpg', '48 km²', '56 km²', '60 km²', '72 km²', 'c', 'Heron''s Formula', 'L3', 'P2', 90),
(1, 'Math', 'Q29 (c): A glass building uses iron frames made of equal triangles with sides 7 m, 8 m, and 9 m. Using Heron''s formula, what is the area of one such triangle? (√5 ≈ 2.236)', 'q29_figure.jpg', '12√3 m²', '12√5 m² ≈ 26.8 m²', '14√5 m²', '24 m²', 'b', 'Heron''s Formula', 'L3', 'P2', 90),
(1, 'Math', 'Q29 (d): If the building frame has 40 such triangles, what is the total frame area?', 'q29_figure.jpg', '480√5 m² ≈ 1073 m²', '480 m²', '1200 m²', '960√5 m²', 'a', 'Heron''s Formula', 'L2', 'P2', 60),

(1, 'Math', 'Q30 (a): In Sun Valley School, Class X has 17 girls and 21 boys. One student is randomly chosen as head student. What is the probability of a girl being chosen as head student?', NULL, '17/21', '17/38', '21/38', '1/2', 'b', 'Probability', 'L2', 'P2', 45),
(1, 'Math', 'Q30 (b): Shyam made a die using a cuboid-shaped eraser. He painted one face of the die with the number 2, two faces with the number 1 and three faces with the number 4. He throws two such dice together and records the sum. What is the correct sample space of possible sums when two such dice are thrown?', NULL, '{1, 2, 3, 4, 5, 6, 7, 8}', '{2, 3, 4, 5, 6, 8}', '{2, 4, 5, 6, 8}', '{1, 2, 4, 5, 6, 8}', 'b', 'Probability', 'L3', 'P3', 90),
(1, 'Math', 'Q30 (c): What is the probability that the sum of the two dice is 5?', NULL, '1/9', '2/9', '1/6', '1/3', 'd', 'Probability', 'L3', 'P3', 90),
(1, 'Math', 'Q30 (d): What is the probability that the sum is NOT 5?', NULL, '7/9', '8/9', '5/9', '6/9', 'd', 'Probability', 'L1', 'P1', 30),

(1, 'Science', 'Q31 (a): A football and a tennis ball fall freely from a height of 5 m onto a marble floor. Will they hit the floor with the same momentum?', 'q31_figure.jpg', 'Yes — both fall from the same height so have the same velocity and momentum', 'No — they have different masses, so momentum differs', 'Yes — gravity acts equally on both', 'No — the football falls faster', 'b', 'Motion', 'L2', 'P2', 45),
(1, 'Science', 'Q31 (b): What caused both balls to bounce back?', 'q31_figure.jpg', 'The ball''s weight acted downward', 'Gravity reversed direction', 'The floor exerted an equal and opposite reaction force', 'The ball stored energy in its colour', 'c', 'Force & Motion', 'L1', 'P1', 30),
(1, 'Science', 'Q31 (c): Will they reach a height of 5 m or less after bouncing?', 'q31_figure.jpg', 'Exactly 5 m — Newton''s 3rd Law guarantees equal force', 'More than 5 m — the bounce adds extra energy', 'Less than 5 m — energy is lost as heat/sound on impact', 'Exactly 5 m — potential energy is always conserved', 'c', 'Work & Energy', 'L2', 'P2', 45),
(1, 'Science', 'Q31 (d): A force of 3000 N acts on 10 kg; another of 1000 N acts on 5 kg. Which produces greater acceleration?', 'q31_figure.jpg', '1000 N on 5 kg', '3000 N on 10 kg', 'Both produce equal acceleration', 'Cannot be determined', 'b', 'Force & Motion', 'L2', 'P2', 60),

(1, 'Science', 'Q32 (a): Peter drops a glass marble into four liquids in identical cylinders. Times to reach bottom: Liquid 1 = 1.8 s, Liquid 2 = 1.5 s, Liquid 3 = 0.8 s, Liquid 4 = 1.0 s. Which liquid exerted the most upward (buoyant) force on the marble?', NULL, 'Liquid 3 — marble reached bottom fastest', 'Liquid 4 — middle resistance', 'Liquid 1 — marble took the longest, indicating greatest resistance/buoyant force', 'Liquid 2 — second slowest', 'c', 'Gravitation', 'L3', 'P3', 60),
(1, 'Science', 'Q32 (b): An object floats on water. What should be its relative density?', NULL, 'Equal to 1', 'Greater than 1', 'Less than or equal to 1', 'Greater than 2', 'c', 'Gravitation', 'L1', 'P1', 30),
(1, 'Science', 'Q32 (c): Four persons pull a 100 kg cart for 500 m. Times: Person 1=12 min, 2=15 min, 3=10 min, 4=18 min. Who did the most work?', NULL, 'Person 3 (least time)', 'Person 1', 'All did equal work', 'Person 4 (most time)', 'c', 'Work & Energy', 'L2', 'P2', 60),
(1, 'Science', 'Q32 (d): Who had the most power?', NULL, 'Person 4', 'Person 2', 'Person 1', 'Person 3 — least time → highest power', 'd', 'Work & Energy', 'L2', 'P2', 60);