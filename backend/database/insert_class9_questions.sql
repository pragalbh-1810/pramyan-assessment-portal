-- 1. Safely clean old dummy data for Test 2 (Class 9)
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM responses WHERE student_test_id IN (SELECT id FROM student_tests WHERE test_id = 2);
DELETE FROM questions WHERE test_id = 2;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Insert Exactly 60 Rows for Class 9 (test_id = 2)
INSERT INTO questions (test_id, section, q_text, q_image, opt_a, opt_b, opt_c, opt_d, correct, chapter, bloom_level, skill_type, time_on_question)
VALUES
-- SECTION A: MATH (10 Questions x 1 Mark)
(2, 'Math', 'Q1: Which of the following statements about rational numbers is TRUE?', NULL, 'Every integer is a rational number', 'Every rational number is an integer', 'Zero is not a rational number', 'Rational numbers cannot be negative', 'a', 'Rational Numbers', 'L1', 'P1', 60),
(2, 'Math', 'Q2: What is the additive inverse of -7/5?', NULL, '7/5', '-7/5', '5/7', '-5/7', 'a', 'Rational Numbers', 'L1', 'P1', 45),
(2, 'Math', 'Q3: The solution of 3x - 7 = 2x + 4 is:', NULL, 'x = 3', 'x = 7', 'x = 11', 'x = -3', 'c', 'Linear Equations (One Variable)', 'L3', 'P2', 60),
(2, 'Math', 'Q4: Using the identity (a + b)² = a² + 2ab + b², what is (x + 4)²?', NULL, 'x² + 4', 'x² + 8x + 16', 'x² + 4x + 16', 'x² + 16', 'b', 'Algebraic Expressions & Identities', 'L2', 'P1', 60),
(2, 'Math', 'Q5: What is the value of √(1.44)?', NULL, '0.12', '1.2', '12', '0.012', 'b', 'Squares & Square Roots', 'L2', 'P2', 45),
(2, 'Math', 'Q6: A price is first increased by 25% and then decreased by 20%. The net percentage change is:', NULL, '0%', '+5%', '-5%', '+45%', 'a', 'Comparing Quantities', 'L4', 'P3', 75),
(2, 'Math', 'Q7: The area of a trapezium with parallel sides 8 cm and 6 cm, and height 5 cm is:', NULL, '30 cm²', '35 cm²', '40 cm²', '70 cm²', 'b', 'Mensuration', 'L3', 'P2', 60),
(2, 'Math', 'Q8: Simplified value of (2³ × 2⁴) ÷ 2⁵ is:', NULL, '2', '4', '8', '16', 'b', 'Exponents & Powers', 'L2', 'P2', 45),
(2, 'Math', 'Q9: The factorised form of x² - 5x + 6 is:', NULL, '(x - 2)(x - 3)', '(x + 2)(x + 3)', '(x - 1)(x - 6)', '(x + 1)(x - 6)', 'a', 'Factorisation', 'L3', 'P2', 60),
(2, 'Math', 'Q10: In a pie chart, a sector represents 90°. What fraction of the total does this sector represent?', NULL, '1/2', '1/3', '1/4', '1/6', 'c', 'Data Handling', 'L3', 'P2', 45),

-- SECTION A: SCIENCE (10 Questions x 1 Mark)
(2, 'Science', 'Q11: Which of the following is a property of metals but NOT of non-metals?', NULL, 'Brittleness', 'Poor conductor of heat', 'Malleability', 'Low melting point', 'c', 'Metals & Non-metals', 'L1', 'P1', 30),
(2, 'Science', 'Q12: Which cell organelle is known as the ''powerhouse of the cell''?', NULL, 'Nucleus', 'Ribosome', 'Mitochondria', 'Chloroplast', 'c', 'Cell - Structure & Functions', 'L1', 'P1', 30),
(2, 'Science', 'Q13: A force of 200 N acts on a surface of area 0.4 m². The pressure exerted is:', NULL, '80 Pa', '200 Pa', '500 Pa', '800 Pa', 'c', 'Force & Pressure', 'L3', 'P2', 60),
(2, 'Science', 'Q14: Which type of friction acts on a ball rolling on the ground?', NULL, 'Static friction', 'Sliding friction', 'Rolling friction', 'Fluid friction', 'c', 'Friction', 'L1', 'P1', 30),
(2, 'Science', 'Q15: A sound wave has a frequency of 500 Hz. Its time period is:', NULL, '500 s', '0.002 s', '0.02 s', '5 s', 'b', 'Motion & Time', 'L2', 'P2', 45),
(2, 'Science', 'Q16: Which type of mirror is used as a rear-view mirror in vehicles?', NULL, 'Plane mirror', 'Concave mirror', 'Convex mirror', 'Cylindrical mirror', 'c', 'Light', 'L1', 'P1', 30),
(2, 'Science', 'Q17: The microorganism that causes malaria in humans is:', NULL, 'Bacterium', 'Virus', 'Protozoan (Plasmodium)', 'Fungus', 'c', 'Microorganisms', 'L1', 'P1', 30),
(2, 'Science', 'Q18: A candle flame goes out when covered with a glass jar. The most correct reason is:', NULL, 'The flame produces CO₂ which puts it out', 'The oxygen inside gets used up, stopping combustion', 'Glass absorbs heat from the flame', 'The wax melts completely under the glass', 'b', 'Combustion & Flame', 'L2', 'P3', 45),
(2, 'Science', 'Q19: Which substance, when dissolved in water, makes it a good conductor of electricity?', NULL, 'Sugar', 'Urea', 'Common salt (NaCl)', 'Glucose', 'c', 'Chemical Effects of Electric Current', 'L1', 'P1', 30),
(2, 'Science', 'Q20: Budding as a form of asexual reproduction is seen in:', NULL, 'Plants', 'Hydra', 'Spirogyra', 'Planaria', 'b', 'Reproduction in Animals', 'L1', 'P1', 30),

-- SECTION B: MATH (4 Questions x 3 parts = 12 Rows)
(2, 'Math', 'Q21 (a): The perimeter of a rectangle is 72 cm. Its length is 6 cm more than twice its breadth. Set up a linear equation in one variable.', NULL, '2(x + 2x + 6) = 72', '2(x + 2x - 6) = 72', 'x + (2x + 6) = 72', '2x + 6 = 72', 'c', 'Linear Equations (One Variable)', 'L3', 'P2', 60),
(2, 'Math', 'Q21 (b): Find the length and breadth of the rectangle.', NULL, 'Length = 20 cm, Breadth = 8 cm', 'Length = 26 cm, Breadth = 10 cm', 'Length = 24 cm, Breadth = 12 cm', 'Length = 22 cm, Breadth = 10 cm', 'b', 'Linear Equations (One Variable)', 'L3', 'P2', 60),
(2, 'Math', 'Q21 (c): If the sum of two consecutive numbers is 71 and one number is x, then the other number is:', NULL, 'x + (x+1) = 71', 'x + (x+2) = 71', 'x + x = 71', 'none of these', 'a', 'Linear Equations (One Variable)', 'L3', 'P2', 45),

(2, 'Math', 'Q22 (a): Expand (3x + 4y)²', NULL, '9x² + 16y²', '9x² + 12xy + 16y²', '9x² + 24xy + 16y²', '6x² + 24xy + 8y²', 'c', 'Algebraic Expressions & Identities', 'L4', 'P3', 45),
(2, 'Math', 'Q22 (b): Expand (5a - 2b)(5a + 2b)', NULL, '25a² + 4b²', '10a² - 4b²', '25a² - 4b²', '25a² - 20ab + 4b²', 'c', 'Algebraic Expressions & Identities', 'L4', 'P3', 45),
(2, 'Math', 'Q22 (c): Using the result from (b), evaluate 98 × 102 without direct multiplication:', NULL, '9,996', '10,004', '9,604', '10,000', 'a', 'Algebraic Expressions & Identities', 'L4', 'P3', 60),

(2, 'Math', 'Q23 (a): A cylindrical water tank has radius 7 m and height 5 m. The total surface area of the tank (use π = 22/7) is:', NULL, '440 m²', '528 m²', '264 m²', '308 m²', 'b', 'Mensuration', 'L3', 'P2', 60),
(2, 'Math', 'Q23 (b): The volume of water the tank can hold is:', NULL, '154 m³', '385 m³', '770 m³', '1540 m³', 'c', 'Mensuration', 'L3', 'P2', 60),
(2, 'Math', 'Q23 (c): If water is pumped in at 2 m³ per minute, the time to fill the tank is:', NULL, '385 min', '770 min', '154 min', '1540 min', 'd', 'Mensuration', 'L3', 'P2', 60),

(2, 'Math', 'Q24 (a): Ramesh invests ₹10,000 for 2 years. Simple Interest at 8% per annum is:', NULL, '₹800', '₹1,200', '₹1,600', '₹2,000', 'c', 'Comparing Quantities', 'L3', 'P3', 45),
(2, 'Math', 'Q24 (b): Compound Interest at 8% per annum (compounded annually) is:', NULL, '₹1,600', '₹1,664', '₹1,728', '₹1,856', 'b', 'Comparing Quantities', 'L3', 'P3', 60),
(2, 'Math', 'Q24 (c): How much more does Ramesh earn with Compound Interest? What does this tell us?', NULL, '₹64 more — CI earns on interest too', '₹100 more — CI is always higher', '₹0 more', '₹164 more', 'a', 'Comparing Quantities', 'L3', 'P3', 45),

-- SECTION B: SCIENCE (4 Questions x 3 parts = 12 Rows)
(2, 'Science', 'Q25 (a): A wooden block is placed on different surfaces. The block weighs 60 N and its base dimensions are 30 cm × 20 cm. The pressure exerted is:', NULL, '500 Pa', '750 Pa', '1000 Pa', '1200 Pa', 'c', 'Force & Pressure', 'L3', 'P3', 60),
(2, 'Science', 'Q25 (b): If the block is tilted so that only a face of 10 cm × 20 cm touches the surface, the new pressure is:', NULL, '1500 Pa', '2000 Pa', '2500 Pa', '3000 Pa', 'd', 'Force & Pressure', 'L3', 'P3', 60),
(2, 'Science', 'Q25 (c): Which position exerts less pressure on the floor? Why is this useful in real life?', NULL, 'Tilted position; for cutting tools', 'Flat position; for snowshoes', 'Both are equal', 'Tilted position; for snowshoes', 'b', 'Force & Pressure', 'L3', 'P3', 45),

(2, 'Science', 'Q26 (a): A ray of light strikes a plane mirror at an angle of incidence of 35°. Which states the two laws of reflection?', NULL, 'Angles equal; different planes', 'Angles equal; same plane', 'Incidence is twice reflection', 'Parallel reflection', 'b', 'Light', 'L3', 'P2', 30),
(2, 'Science', 'Q26 (b): The angle between the incident ray and the reflected ray is:', NULL, '35°', '55°', '70°', '90°', 'c', 'Light', 'L3', 'P2', 45),
(2, 'Science', 'Q26 (c): What happens to the angle of reflection if the mirror is rotated by 10°?', NULL, 'Decreases by 10°', 'Remains 35°', 'Increases by 10°', 'Becomes 90°', 'c', 'Light', 'L3', 'P2', 60),

(2, 'Science', 'Q27 (a): Which THREE structures are found in plant cells but NOT in animal cells?', NULL, 'Cell membrane, nucleus, mitochondria', 'Cell wall, chloroplast, large central vacuole', 'Ribosome, ER, Golgi body', 'Nucleus, cytoplasm, cell wall', 'b', 'Cell - Structure & Functions', 'L3', 'P3', 45),
(2, 'Science', 'Q27 (b): "The cell wall makes a plant cell rigid." Which option is CORRECT?', NULL, 'Incorrect - chloroplasts make it rigid', 'Correct - wall provides rigidity and protection', 'Correct - wall provides ONLY support', 'Incorrect - membrane provides rigidity', 'b', 'Cell - Structure & Functions', 'L3', 'P3', 45),
(2, 'Science', 'Q27 (c): What is the role of chloroplasts? Why are they absent in animal cells?', NULL, 'Produce energy; animals breathe O2', 'Perform photosynthesis; animals eat food', 'Store water; animals drink', 'Produce protein; animals eat protein', 'b', 'Cell - Structure & Functions', 'L3', 'P3', 45),

(2, 'Science', 'Q28 (a): Sohan claps his hands near a large wall 340 m away. Speed of sound in air = 340 m/s. Time for echo is:', NULL, '0.5 s', '1 s', '2 s', '4 s', 'c', 'Sound', 'L3', 'P3', 60),
(2, 'Science', 'Q28 (b): For an echo to be heard distinctly, the minimum distance required is:', NULL, '10 m', '17 m', '34 m', '50 m', 'b', 'Sound', 'L3', 'P2', 30),
(2, 'Science', 'Q28 (c): How do bats navigate in the dark?', NULL, 'Photoreception', 'Echolocation / SONAR', 'Magnetoreception', 'Infrared Detection', 'b', 'Sound', 'L3', 'P2', 30),

-- SECTION C: MATH (2 Questions x 4 parts = 8 Rows)
(2, 'Math', 'Q29 (a): A student says 4x² - 12x + 9 = (2x - 3)² and another says it = (2x - 3)(2x - 3). Are they both correct?', NULL, 'Only first is correct', 'Only second is correct', 'Both are correct', 'Neither is correct', 'c', 'Squares, Cubes & Factorisation', 'L4', 'P2', 45),
(2, 'Math', 'Q29 (b): The smallest number by which 108 must be multiplied to make it a perfect cube is:', NULL, '1', '2', '3', '4', 'b', 'Squares, Cubes & Factorisation', 'L4', 'P3', 60),
(2, 'Math', 'Q29 (c): ∛(-216) equals:', NULL, '+6', '-6', '6i', 'undefined', 'b', 'Squares, Cubes & Factorisation', 'L4', 'P2', 30),
(2, 'Math', 'Q29 (d): The complete factorisation of 16x² - 32x + 64 is:', NULL, '(4x - 3)(x - 3)', '(4x - 8)²', '(2x + 3)(2x - 3)', '(4x - 9)(x - 1)', 'b', 'Squares, Cubes & Factorisation', 'L4', 'P3', 60),

(2, 'Math', 'Q30 (a): Pocket money: 200, 350, 150, 500, 350, 400, 200, 350. The mean, median, and mode are:', NULL, 'Mean = 300, Median = 350, Mode = 200', 'Mean = 312.5, Median = 350, Mode = 350', 'Mean = 350, Median = 300, Mode = 350', 'Mean = 325, Median = 325, Mode = 200', 'b', 'Data Handling', 'L5', 'P2', 75),
(2, 'Math', 'Q30 (b): A student says ''the average pocket money is ₹350.'' Which measure is she using?', NULL, 'Mean', 'Mode', 'Median', 'Mode or Median', 'd', 'Data Handling', 'L5', 'P3', 45),
(2, 'Math', 'Q30 (c): If a 9th student who gets ₹800 joins the group, the new mean is:', NULL, '₹350', '₹366.67', '₹380', '₹400', 'b', 'Data Handling', 'L5', 'P3', 60),
(2, 'Math', 'Q30 (d): Mira gets 8% discount on a ₹350 dress, then uses a ₹15 coupon. She pays:', NULL, '₹322', '₹315', '₹307', '₹310', 'c', 'Data Handling', 'L5', 'P3', 60),

-- SECTION C: SCIENCE (2 Questions x 4 parts = 8 Rows)
(2, 'Science', 'Q31 (a): Which correctly classifies all four materials?', NULL, 'Sulphur=metal, Copper=non-metal, Graphite=metal, Mercury=non-metal', 'Sulphur=non-metal, Copper=metal, Graphite=non-metal, Mercury=metal', 'Sulphur=non-metal, Copper=metal, Graphite=metal, Mercury=non-metal', 'All four are non-metals', 'b', 'Metals & Non-metals + Chemical Effects', 'L5', 'P2', 45),
(2, 'Science', 'Q31 (b): Why are electric wires made of copper but covered with PVC/rubber?', NULL, 'Copper is cheap, PVC is flexible', 'Copper is good conductor, PVC is insulator', 'Copper is hard, PVC protects bending', 'Copper resists heat, PVC prevents rust', 'b', 'Metals & Non-metals + Chemical Effects', 'L5', 'P2', 45),
(2, 'Science', 'Q31 (c): Rohan places an iron nail in copper sulphate solution. What happens?', NULL, 'Iron dissolves; decomposition', 'Iron coats with copper; displacement', 'Iron sulphate forms only; combination', 'Nothing happens', 'b', 'Metals & Non-metals + Chemical Effects', 'L5', 'P3', 60),
(2, 'Science', 'Q31 (d): In electrolysis with copper electrodes in copper sulphate solution, what happens?', NULL, 'Both gain copper', 'Anode gains; cathode dissolves', 'Anode dissolves; cathode gains copper', 'Both dissolve', 'c', 'Metals & Non-metals + Chemical Effects', 'L5', 'P3', 60),

(2, 'Science', 'Q32 (a): Which correctly lists the four major types of microorganisms with one example each?', NULL, 'Bacteria(Lactobacillus), Fungi(Yeast), Protozoa(Amoeba), Virus(Influenza)', 'Bacteria(Malaria), Fungi(Yeast), Protozoa(Plasmodium), Virus(Lactobacillus)', 'Bacteria, Algae, Protozoa, Fungi', 'Bacteria(Rhizobium), Virus(Cholera), Protozoa(Yeast), Fungi(Amoeba)', 'a', 'Microorganisms + Combustion', 'L5', 'P2', 45),
(2, 'Science', 'Q32 (b): Why does Monika''s mother store pickle in an airtight jar?', NULL, 'To keep warm and prevent evaporation', 'To prevent entry of oxygen and airborne microbes', 'To keep moist and preserve colour', 'To increase CO₂ inside', 'b', 'Microorganisms + Combustion', 'L5', 'P2', 45),
(2, 'Science', 'Q32 (c): Which correctly gives TWO examples of microorganisms used in food production?', NULL, 'Yeast(bread); Lactobacillus(curd)', 'Plasmodium(cheese); Rhizobium(vinegar)', 'Penicillium(bread); Amoeba(curd)', 'Yeast(curd); Lactobacillus(bread)', 'a', 'Microorganisms + Combustion', 'L5', 'P3', 45),
(2, 'Science', 'Q32 (d): Why should Anjali NOT pour water on an oil pan fire? What should she use?', NULL, 'Water cools too quickly; use sand', 'Water reacts with oil; use extinguisher', 'Water spreads burning oil; use wet cloth or CO₂', 'Water evaporates; use more oil', 'c', 'Microorganisms + Combustion', 'L5', 'P3', 60);