USE pramyan;

-- 1. Clean old test data for Test 1 (Class 10)
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM responses WHERE student_test_id IN (SELECT id FROM student_tests WHERE test_id = 1);
DELETE FROM questions WHERE test_id = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Insert Exactly 60 Rows for Class 10 (test_id = 1)
INSERT INTO questions (test_id, section, q_text, q_image, opt_a, opt_b, opt_c, opt_d, correct, chapter, bloom_level, skill_type, time_on_question)
VALUES
-- SECTION A (20 Questions x 1 Mark)
(1, 'Math', 'Q1: Which of the following statements about rational numbers is TRUE?', NULL, 'Every integer is a rational number', 'Every rational number is an integer', 'Zero is not a rational number', 'Rational numbers cannot be negative', 'a', 'Number Systems', 'L1', 'P1', 60),
(1, 'Math', 'Q2: A manufacturer makes rectangular screens. Which screen size is more than double but less than three times the size of a 70-unit screen?', NULL, '145 units', '175 units', '270 units', '580 units', 'd', 'Number Systems', 'L2', 'P3', 60),
(1, 'Math', 'Q3: A polynomial is expressed as x³ + bx² + cx + d = 0, with factor form (x+p)(x+q)(x+r) = 0. How is the constant term ''d'' related to its factors p, q, r?', NULL, 'd = p+q+r', 'd = (p+q)×r', 'd = p×q×r', 'd = pq+qr+pr', 'c', 'Polynomials', 'L2', 'P1', 75),
(1, 'Math', 'Q4: A polynomial is divided by (x–1). Quotient is 3x³ – x² – x – 4 and remainder is –5. Which polynomial satisfies these conditions?', NULL, '3x³–x²–x–9', '3x³–x²–x–4', '3x⁴–4x³–3x+4', '3x⁴–4x²–3x–1', 'd', 'Polynomials', 'L3', 'P2', 90),
(1, 'Math', 'Q5: The mass of a full soap bottle is 220 g and a half-filled bottle is 120 g. What is the mass of the empty bottle?', NULL, '10 g', '20 g', '100 g', '110 g', 'b', 'Linear Equations', 'L3', 'P2', 75),
(1, 'Math', 'Q6: Two equilateral triangles sit on a straight line. What is the measure of angle x?', NULL, '30°', '40°', '60°', '65°', 'b', 'Lines & Angles', 'L2', 'P2', 60),
(1, 'Math', 'Q7: In a figure, △AFB ≅ △AFG, △ADE ≅ △AGE and ∠EAF = 45°. What is the measure of ∠DAB?', NULL, '60°', '90°', '120°', '135°', 'b', 'Triangles', 'L3', 'P1', 90),
(1, 'Math', 'Q8: A cone has radius 4 cm and height 15 cm. An ice-cream seller keeps ¼ of it empty. What is the volume (in cm³) of the empty part?', NULL, '12π', '15π', '19π', '20π', 'd', 'Surface Area & Volume', 'L3', 'P2', 90),
(1, 'Math', 'Q9: The haemoglobin counts (mg/dL) of 25 females: median is to be found. Given distribution, the median is:', NULL, '8', '9', '9.5', '12.5', 'b', 'Statistics', 'L2', 'P2', 60),
(1, 'Math', 'Q10: Shyam paints a die: one face = 2, two faces = 1, three faces = 4. What is the probability of getting a face showing an even number?', NULL, '1/2', '1/3', '1/6', '2/3', 'd', 'Probability', 'L2', 'P2', 60),

(1, 'Science', 'Q11: Masood dissolved 10 g copper sulphate crystal in Jar 1 and 10 mL of 75% copper sulphate solution in Jar 2. Which conclusion is supported?', NULL, 'Crystals dissolve partially', 'Liquids dissolve faster than solids', 'CuSO₄ dissolves faster than in any other liquid', 'Liquid particles have stronger attraction than solids', 'b', 'Matter', 'L3', 'P1', 75),
(1, 'Science', 'Q12: Which of the following is an alloy?', NULL, 'Silver', 'Copper', 'Bronze', 'Aluminium', 'c', 'Is Matter Pure?', 'L1', 'P1', 30),
(1, 'Science', 'Q13: Two ions Zn²⁺ and S²⁻ combine. What is the formula of the compound formed?', NULL, 'ZnS', 'Zn₂S', 'ZnS₂', 'Zn₂S₂', 'a', 'Atoms & Molecules', 'L2', 'P1', 45),
(1, 'Science', 'Q14: What is the maximum number of electrons that can be present in the first shell of an atom?', NULL, '1', '2', '4', '8', 'b', 'Structure of Atom', 'L1', 'P1', 30),
(1, 'Science', 'Q15: A car travels from house → school → library → back to school. What is the net displacement of the car?', NULL, '20 km', '30 km', '50 km', '70 km', 'b', 'Motion', 'L2', 'P1', 60),
(1, 'Science', 'Q16: A bus travels at 35 km/hr in the first hour, 60 km/hr in the second hour, and 40 km/hr in the third hour. What was the average speed?', NULL, '35', '40', '45', '60', 'c', 'Motion', 'L2', 'P2', 60),
(1, 'Science', 'Q17: Which of these represents a balanced force?', NULL, 'A boy sitting on a chair', 'An object sinking in water', 'An apple falling from a tree', 'A magnet attracting an iron nail', 'a', 'Force & Motion', 'L1', 'P1', 45),
(1, 'Science', 'Q18: Which of these involves conversion of kinetic energy to potential energy?', NULL, 'A person diving into a pool', 'A person gliding with a parachute', 'A person sliding down a water slide', 'A person riding a motorbike to the top of an overbridge', 'd', 'Work & Energy', 'L2', 'P3', 60),
(1, 'Science', 'Q19: Which is an indigenous variety of hen?', NULL, 'Aseel', 'Leghorn', 'Rhode Island Red', 'Minorca', 'a', 'Improvement in food resources', 'L1', 'P1', 30),
(1, 'Science', 'Q20: Which property of the plasma membrane helps amoeba acquire food?', NULL, 'It is flexible', 'It is selectively permeable', 'It is made of proteins and lipids', 'It allows diffusion of substances', 'a', 'Cell - Fundamental Unit', 'L1', 'P1', 45),

-- SECTION B (8 Questions x 3 Marks = 24 Parts)
(1, 'Math', 'Q21 (a): The area of a rectangle is (3x² + x – 2) square units. Its width is (1 + x) units. What is the length of the rectangle?', NULL, '(3x + 2)', '(3x – 2)', '(x – 2)', '(2x – 3)', 'b', 'Polynomials', 'L2', 'P2', 60),
(1, 'Math', 'Q21 (b): Which of the following correctly shows the first step of dividing (3x² + x – 2) by (x + 1)?', NULL, '3x(x+1) = 3x² + 3x', '3x(x+1) = 3x² + x', 'x(x+1) = x² + x', '3x²(x+1) = 3x³ + 3x²', 'a', 'Polynomials', 'L1', 'P2', 45),
(1, 'Math', 'Q21 (c): What is the remainder when (3x² + x – 2) is divided by (x + 1)?', NULL, '–4', '–2', '0', '2', 'c', 'Polynomials', 'L2', 'P2', 60),

(1, 'Math', 'Q22 (a): Which equation represents the total number of bottles?', NULL, 'f – n = 50', 'f × n = 50', 'f + n = 50', '2f + n = 50', 'c', 'Linear Equations', 'L1', 'P2', 45),
(1, 'Math', 'Q22 (b): If each large bottle weighs 0.25 kg and each small bottle weighs 0.06 kg, what is the mass of the empty carton?', NULL, '0.2 kg', '0.4 kg', '0.6 kg', '0.8 kg', 'c', 'Linear Equations', 'L3', 'P2', 90),
(1, 'Math', 'Q22 (c): What would be the total mass of a carton loaded with 50 large bottles only?', NULL, '12.5 kg', '13.1 kg', '13.3 kg', '14.0 kg', 'b', 'Linear Equations', 'L2', 'P2', 60),

(1, 'Math', 'Q23 (a): What is the height of the planter? (Use π = 22/7)', NULL, '18 cm', '20 cm', '21 cm', '24 cm', 'c', 'Surface Area & Volume', 'L2', 'P2', 60),
(1, 'Math', 'Q23 (b): What is the volume of the planter in cm³? (Use π = 22/7)', NULL, '11,088 cm³', '12,936 cm³', '14,784 cm³', '16,632 cm³', 'b', 'Surface Area & Volume', 'L2', 'P2', 60),
(1, 'Math', 'Q23 (c): If the planter is filled with soil up to 3/4 of its height, what volume of soil does it hold?', NULL, '9,702 cm³', '10,500 cm³', '11,200 cm³', '12,000 cm³', 'a', 'Surface Area & Volume', 'L3', 'P2', 60),

(1, 'Math', 'Q24 (a): What is the mean (average) expense?', NULL, '₹4500', '₹5000', '₹5100', '₹5500', 'c', 'Statistics', 'L2', 'P2', 45),
(1, 'Math', 'Q24 (b): What is the median expense?', NULL, '₹4500', '₹5000', '₹5500', '₹6000', 'b', 'Statistics', 'L1', 'P2', 45),
(1, 'Math', 'Q24 (c): Which friend spent exactly the median amount?', NULL, 'Anchal', 'Amisha', 'Vishu', 'Mahi', 'b', 'Statistics', 'L1', 'P2', 30),

(1, 'Science', 'Q25 (a): What was Rehana''s maximum cycling velocity?', NULL, '5 m/s', '8 m/s', '10 m/s', '15 m/s', 'c', 'Motion', 'L2', 'P2', 45),
(1, 'Science', 'Q25 (b): During which time interval was she cycling at uniform velocity?', NULL, '0–5 minutes', '5–10 minutes', '10–15 minutes', '0–10 minutes', 'c', 'Motion', 'L2', 'P2', 45),
(1, 'Science', 'Q25 (c): What was happening between 0–5 minutes?', NULL, 'She was decelerating', 'She was at rest', 'She was at uniform velocity', 'She was accelerating from rest', 'd', 'Motion', 'L1', 'P2', 45),

(1, 'Science', 'Q26 (a): What force does the man exert on Box A?', NULL, '200 N', '500 N', '1000 N', '2000 N', 'd', 'Force & Motion', 'L2', 'P2', 45),
(1, 'Science', 'Q26 (b): What force does the man exert on Box B and Box C respectively?', NULL, '1000 N and 1000 N', '2000 N and 2000 N', '2000 N and 1000 N', '1000 N and 2000 N', 'b', 'Force & Motion', 'L2', 'P2', 60),
(1, 'Science', 'Q26 (c): Is the force on each box balanced or unbalanced? Why?', NULL, 'Balanced', 'Unbalanced', 'Partially Balanced', 'None', 'b', 'Force & Motion', 'L2', 'P2', 60),

(1, 'Science', 'Q27 (a): What did she observe in Beaker 1? Why?', NULL, 'Strip shrank', 'Strip became turgid', 'No change', 'Strip dissolved', 'b', 'Cell - Fundamental Unit', 'L2', 'P3', 60),
(1, 'Science', 'Q27 (b): In which beaker was the water concentration equal inside and outside the cell?', NULL, 'Beaker 1', 'Beaker 2', 'Beaker 3', 'None', 'b', 'Cell - Fundamental Unit', 'L1', 'P3', 45),
(1, 'Science', 'Q27 (c): Why did she use three strips in each beaker?', NULL, 'To look better', 'To use strips', 'To reduce error', 'To see clearly', 'c', 'Cell - Fundamental Unit', 'L3', 'P3', 45),

(1, 'Science', 'Q28 (a): Which method helps maintain soil fertility?', NULL, 'Over-irrigation', 'Monocropping', 'Crop rotation', 'Deforestation', 'c', 'Improvement in food resources', 'L2', 'P3', 45),
(1, 'Science', 'Q28 (b): What adds specific nutrients to the soil quickly?', NULL, 'Sand', 'Pebbles', 'Fertilizers', 'Clay', 'c', 'Improvement in food resources', 'L1', 'P3', 30),
(1, 'Science', 'Q28 (c): What protects plants from pests and increases yield?', NULL, 'Keeping them in dark', 'Ignoring weeds', 'Improved seeds and pest control', 'Using salty water', 'c', 'Improvement in food resources', 'L1', 'P3', 30),

-- SECTION C (4 Questions x 4 Parts = 16 Parts)
(1, 'Math', 'Q29 (a): Using Heron''s formula, what is the semi-perimeter (s) of Zone 1?', NULL, '20 km', '25 km', '30 km', '50 km', 'b', 'Heron''s Formula', 'L2', 'P2', 60),
(1, 'Math', 'Q29 (b): Using Heron''s formula, what is the area of Zone 1?', NULL, '48 km²', '56 km²', '60 km²', '72 km²', 'c', 'Heron''s Formula', 'L3', 'P3', 90),
(1, 'Math', 'Q29 (c): What is the area of one glass triangle? (√5 ≈ 2.236)', NULL, '12√3 m²', '12√5 m² ≈ 26.8 m²', '14√5 m²', '24 m²', 'b', 'Heron''s Formula', 'L3', 'P2', 90),
(1, 'Math', 'Q29 (d): If the building frame has 40 such triangles, what is the total frame area?', NULL, '480√5 m² ≈ 1073 m²', '480 m²', '1200 m²', '960√5 m²', 'a', 'Heron''s Formula', 'L2', 'P3', 60),

(1, 'Math', 'Q30 (a): What is the probability of a girl being chosen as head student?', NULL, '17/21', '17/38', '21/38', '1/2', 'b', 'Probability', 'L2', 'P2', 45),
(1, 'Math', 'Q30 (b): What is the correct sample space of possible sums when two such dice are thrown?', NULL, '{1, 2, 3}', '{2, 3, 4, 5, 6, 8}', '{2, 4, 5, 6}', '{1, 2, 8}', 'b', 'Probability', 'L3', 'P3', 90),
(1, 'Math', 'Q30 (c): What is the probability that the sum of the two dice is 5?', NULL, '1/9', '2/9', '1/6', '1/3', 'b', 'Probability', 'L3', 'P2', 90),
(1, 'Math', 'Q30 (d): What is the probability that the sum is NOT 5?', NULL, '7/9', '8/9', '5/9', '6/9', 'a', 'Probability', 'L1', 'P3', 30),

(1, 'Science', 'Q31 (a): Will they hit the floor with the same momentum?', NULL, 'Yes', 'No', 'Maybe', 'N/A', 'b', 'Motion', 'L2', 'P2', 45),
(1, 'Science', 'Q31 (b): What caused both balls to bounce back?', NULL, 'Weight', 'Gravity', 'Reaction force', 'Color', 'c', 'Force & Motion', 'L1', 'P3', 30),
(1, 'Science', 'Q31 (c): Will they reach a height of 5 m or less after bouncing?', NULL, 'Exactly 5m', 'More than 5m', 'Less than 5m', 'N/A', 'c', 'Work & Energy', 'L2', 'P2', 45),
(1, 'Science', 'Q31 (d): Which produces greater acceleration?', NULL, '1000N on 5kg', '3000N on 10kg', 'Both equal', 'N/A', 'b', 'Force & Motion', 'L2', 'P3', 60),

(1, 'Science', 'Q32 (a): Which liquid exerted the most upward (buoyant) force?', NULL, 'Liquid 3', 'Liquid 4', 'Liquid 1', 'Liquid 2', 'c', 'Gravitation', 'L3', 'P2', 60),
(1, 'Science', 'Q32 (b): An object floats on water. What should be its relative density?', NULL, 'Equal to 1', 'Greater than 1', 'Less than or equal to 1', 'Greater than 2', 'c', 'Gravitation', 'L1', 'P3', 30),
(1, 'Science', 'Q32 (c): Who did the most work?', NULL, 'Person 3', 'Person 1', 'All equal', 'Person 4', 'c', 'Work & Energy', 'L2', 'P2', 60),
(1, 'Science', 'Q32 (d): Who had the most power?', NULL, 'Person 4', 'Person 2', 'Person 3', 'Person 1', 'c', 'Work & Energy', 'L2', 'P3', 60);