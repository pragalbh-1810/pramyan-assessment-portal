USE pramyan;

-- 1. Safely clean old data for Test (Class 8)
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM responses WHERE student_test_id IN (SELECT id FROM student_tests WHERE test_id = 3);
DELETE FROM questions WHERE test_id = 3;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Insert Exactly 60 Rows for Class 8 (test_id = 3)
INSERT INTO questions (test_id, section, q_text, q_image, opt_a, opt_b, opt_c, opt_d, correct, chapter, bloom_level, skill_type, time_on_question)
VALUES

-- SECTION A: MATH (10 Questions x 1 Mark = 10)

(3, 'Math', 'Q1: [Math | Integers] Which of the following statements about integers is TRUE?', NULL, 'The product of two negative integers is always negative', 'Division of any integer by zero is zero', 'The product of two negative integers is always positive', 'Sum of a positive and a negative integer is always positive', 'c', 'Integers', 'L1', 'P1', 60),

(3, 'Math', 'Q2: [Math | Fractions & Decimals] What is the value of 2⅓ × 1⅘?', NULL, '2⁴⁄₁₅', '4⅕', '3⁸⁄₁₅', '4¹⁄₁₅', 'b', 'Fractions & Decimals', 'L2', 'P2', 60),

(3, 'Math', 'Q3: [Math | Simple Equations] The solution of 5x + 3 = 28 is:', NULL, 'x = 5', 'x = 7', 'x = 3', 'x = 4', 'a', 'Simple Equations', 'L2', 'P2', 45),

(3, 'Math', 'Q4: [Math | Lines & Angles] Two lines intersect at a point. One angle formed is 65°. What is the vertically opposite angle?', NULL, '25°', '115°', '65°', '90°', 'c', 'Lines & Angles', 'L1', 'P1', 30),

(3, 'Math', 'Q5: [Math | Triangle & its Properties] The sum of two angles of a triangle is 110°. What is the third angle?', NULL, '110°', '70°', '250°', '90°', 'b', 'Triangle & its Properties', 'L2', 'P2', 45),

(3, 'Math', 'Q6: [Math | Comparing Quantities] A shopkeeper marks a shirt at ₹800 and gives a 15% discount. What is the selling price?', NULL, '₹120', '₹680', '₹815', '₹785', 'b', 'Comparing Quantities', 'L2', 'P2', 60),

(3, 'Math', 'Q7: [Math | Rational Numbers] Which of the following is NOT a rational number?', NULL, '-3/7', '0', '√3', '22/7', 'c', 'Rational Numbers', 'L1', 'P1', 45),

(3, 'Math', 'Q8: [Math | Perimeter & Area] The area of a parallelogram with base 12 cm and height 8 cm is:', NULL, '40 cm²', '48 cm²', '96 cm²', '192 cm²', 'c', 'Perimeter & Area', 'L2', 'P2', 45),

(3, 'Math', 'Q9: [Math | Algebraic Expressions] What is the value of 3x² - 2x + 5 when x = 2?', NULL, '13', '9', '15', '17', 'a', 'Algebraic Expressions', 'L2', 'P2', 60),

(3, 'Math', 'Q10: [Math | Exponents & Powers] What is the standard form of 0.000365?', NULL, '3.65 × 10⁻⁴', '3.65 × 10⁰', '36.5 × 10⁻³', '3.65 × 10⁻²', 'a', 'Exponents & Powers', 'L2', 'P2', 45),


-- SECTION A: SCIENCE (10 Questions x 1 Mark = 10)

(3, 'Science', 'Q11: [Science | Nutrition in Plants] The process by which green plants make their own food using sunlight is called:', NULL, 'Respiration', 'Transpiration', 'Photosynthesis', 'Digestion', 'c', 'Nutrition in Plants', 'L1', 'P1', 30),

(3, 'Science', 'Q12: [Science | Heat] Which of the following is the BEST conductor of heat?', NULL, 'Wood', 'Wool', 'Air', 'Copper', 'd', 'Heat', 'L1', 'P1', 30),

(3, 'Science', 'Q13: [Science | Acids, Bases & Salts] A student tests a solution with litmus paper. The blue litmus paper turns red. The solution is:', NULL, 'Neutral', 'Acidic', 'Basic', 'Salty', 'b', 'Acids, Bases & Salts', 'L1', 'P1', 30),

(3, 'Science', 'Q14: [Science | Physical & Chemical Changes] Which of the following is a CHEMICAL change?', NULL, 'Melting of ice', 'Cutting of paper', 'Rusting of iron', 'Dissolving sugar in water', 'c', 'Physical & Chemical Changes', 'L1', 'P1', 30),

(3, 'Science', 'Q15: [Science | Motion & Time] A car travels 150 km in 3 hours. What is its average speed?', NULL, '450 km/h', '50 km/h', '153 km/h', '147 km/h', 'b', 'Motion & Time', 'L2', 'P2', 45),

(3, 'Science', 'Q16: [Science | Electric Current & its Effects] In a circuit with two bulbs connected in series, one bulb fuses. What happens to the other bulb?', NULL, 'It glows brighter', 'It continues to glow normally', 'It also goes off', 'It glows dimmer', 'c', 'Electric Current & its Effects', 'L1', 'P1', 45),

(3, 'Science', 'Q17: [Science | Light] An object is placed in front of a plane mirror. The image formed is:', NULL, 'Real, inverted, same size', 'Virtual, erect, same size', 'Real, erect, diminished', 'Virtual, inverted, magnified', 'b', 'Light', 'L1', 'P1', 30),

(3, 'Science', 'Q18: [Science | Respiration in Organisms] During strenuous exercise, when oxygen supply is insufficient, muscles produce energy through:', NULL, 'Aerobic respiration', 'Photosynthesis', 'Anaerobic respiration', 'Transpiration', 'c', 'Respiration in Organisms', 'L2', 'P2', 45),

(3, 'Science', 'Q19: [Science | Nutrition in Animals] Which part of the human digestive system is responsible for absorbing most nutrients into the blood?', NULL, 'Stomach', 'Large intestine', 'Small intestine', 'Oesophagus', 'c', 'Nutrition in Animals', 'L1', 'P1', 30),

(3, 'Science', 'Q20: [Science | Reproduction in Plants] Which of the following is an example of vegetative propagation?', NULL, 'Seeds of mango dispersed by animals', 'New plants growing from eyes of a potato', 'Pollen grains carried by wind to another flower', 'Spores of a fern germinating in soil', 'b', 'Reproduction in Plants', 'L1', 'P1', 30),


-- SECTION B: MATH (4 Questions x 3 parts = 12 Rows, 3 Marks each)

(3, 'Math', 'Q21 (a): [Math | Simple Equations] Solve: 4(2x - 3) = 20. Find x.', NULL, 'x = 2', 'x = 3.5', 'x = 4', 'x = 5', 'c', 'Simple Equations', 'L2', 'P2', 60),
(3, 'Math', 'Q21 (b): [Math | Simple Equations] The sum of three consecutive integers is 72. Which set of integers is correct?', NULL, '23, 24, 25', '22, 24, 26', '24, 25, 26', '21, 23, 25', 'a', 'Simple Equations', 'L2', 'P2', 60),
(3, 'Math', 'Q21 (c): [Math | Simple Equations] A number is multiplied by 6 and then 4 is subtracted from the result to give 44. What is the number?', NULL, '6', '7', '8', '9', 'c', 'Simple Equations', 'L2', 'P2', 60),

(3, 'Math', 'Q22 (a): [Math | Comparing Quantities] Riya buys a bicycle for ₹3,600 and sells it for ₹4,320. What is the profit percentage?', NULL, '10%', '15%', '20%', '25%', 'c', 'Comparing Quantities', 'L3', 'P3', 60),
(3, 'Math', 'Q22 (b): [Math | Comparing Quantities] She bought it at a discount of 10% from the marked price. What was the marked price?', NULL, '₹3,240', '₹3,960', '₹4,000', '₹4,500', 'b', 'Comparing Quantities', 'L3', 'P3', 60),
(3, 'Math', 'Q22 (c): [Math | Comparing Quantities] Her friend Sana sells the same model at 5% loss. At what price does Sana sell?', NULL, '₹3,420', '₹3,260', '₹3,700', '₹3,500', 'a', 'Comparing Quantities', 'L3', 'P3', 60),

(3, 'Math', 'Q23 (a): [Math | Perimeter & Area] A room is 8 m long and 6 m wide. What is the area of the floor?', NULL, '14 m²', '28 m²', '48 m²', '96 m²', 'c', 'Perimeter & Area', 'L2', 'P2', 45),
(3, 'Math', 'Q23 (b): [Math | Perimeter & Area] Tiles of size 40 cm × 40 cm are used to tile the floor. How many tiles are needed?', NULL, '120', '200', '300', '480', 'c', 'Perimeter & Area', 'L2', 'P2', 60),
(3, 'Math', 'Q23 (c): [Math | Perimeter & Area] The room has 4 walls each of height 3 m. If 1 litre of paint covers 12 m², how many litres are needed to paint all four walls?', NULL, '5 litres', '6 litres', '7 litres', '8 litres', 'c', 'Perimeter & Area', 'L2', 'P2', 60),

(3, 'Math', 'Q24 (a): [Math | Algebraic Expressions] Simplify: (3a + 2b) + (5a - 4b) - (2a - b) = ?', NULL, '6a - b', '6a + b', '8a - 3b', '4a - 3b', 'a', 'Algebraic Expressions', 'L2', 'P2', 45),
(3, 'Math', 'Q24 (b): [Math | Algebraic Expressions] Subtract (4x² - 3x + 1) from (7x² + 2x - 5). The result is:', NULL, '3x² - 5x - 6', '3x² + 5x - 6', '11x² - x - 4', '3x² + 5x + 6', 'b', 'Algebraic Expressions', 'L3', 'P3', 60),
(3, 'Math', 'Q24 (c): [Math | Algebraic Expressions] Find the value of 5p² - 3pq + 2q² when p = 2 and q = -1.', NULL, '24', '26', '28', '32', 'c', 'Algebraic Expressions', 'L3', 'P3', 60),


-- SECTION B: SCIENCE (4 Questions x 3 parts = 12 Rows, 3 Marks each)

(3, 'Science', 'Q25 (a): [Science | Acids, Bases & Salts] Rajan tests three solutions: Solution A turns blue litmus red only; Solution B turns red litmus blue only; Solution C: no change. How should A, B, and C be classified?', NULL, 'Base, Acid, Neutral', 'Acid, Neutral, Base', 'Acid, Base, Neutral', 'Neutral, Base, Acid', 'c', 'Acids, Bases & Salts', 'L3', 'P3', 60),
(3, 'Science', 'Q25 (b): [Science | Acids, Bases & Salts] Which of the following is a correct pair of a household acid and a household base?', NULL, 'Vinegar and Baking soda', 'Soap and Lemon juice', 'Salt and Sugar', 'Milk and Turmeric', 'a', 'Acids, Bases & Salts', 'L2', 'P2', 45),
(3, 'Science', 'Q25 (c): [Science | Acids, Bases & Salts] When an acid and a base react together, this reaction is called:', NULL, 'Oxidation', 'Neutralisation', 'Decomposition', 'Combustion', 'b', 'Acids, Bases & Salts', 'L1', 'P1', 30),

(3, 'Science', 'Q26 (a): [Science | Motion & Time] A train covers the first 120 km in 2 hours and the next 180 km in 3 hours. What is the average speed for the entire journey?', NULL, '50 km/h', '54 km/h', '60 km/h', '75 km/h', 'c', 'Motion & Time', 'L3', 'P3', 60),
(3, 'Science', 'Q26 (b): [Science | Motion & Time] In a distance-time graph of a body moving at constant speed, what does the slope of the line represent?', NULL, 'Acceleration', 'Distance', 'Time', 'Speed', 'd', 'Motion & Time', 'L2', 'P2', 45),
(3, 'Science', 'Q26 (c): [Science | Motion & Time] A clock''s second hand completes one revolution per minute. What is the time period of its motion?', NULL, '1 minute', '30 seconds', '2 minutes', '60 minutes', 'a', 'Motion & Time', 'L2', 'P2', 30),

(3, 'Science', 'Q27 (a): [Science | Electric Current & its Effects] Which of the following is a property that makes an electromagnet DIFFERENT from a permanent magnet?', NULL, 'It attracts iron filings', 'Its magnetism can be switched on and off', 'It has a north and south pole', 'It is made of metal', 'b', 'Electric Current & its Effects', 'L3', 'P3', 60),
(3, 'Science', 'Q27 (b): [Science | Electric Current & its Effects] A student wants to reduce the risk involved in an electric circuit. Which method should he adopt?', NULL, 'Use electricity from mains', 'Use an inverter for electricity', 'Use a generator for electricity', 'Use electric cells for electricity', 'd', 'Electric Current & its Effects', 'L3', 'P3', 60),
(3, 'Science', 'Q27 (c): [Science | Electric Current & its Effects] Which of the following is a safety device used in household electric circuits?', NULL, 'Switch', 'Fuse', 'Bulb', 'Wire', 'b', 'Electric Current & its Effects', 'L2', 'P2', 30),

(3, 'Science', 'Q28 (a): [Science | Physical & Chemical Changes] A candle burns — the wax melts AND it produces light and heat. This is:', NULL, 'Only a physical change', 'Only a chemical change', 'Both a physical and a chemical change', 'Neither physical nor chemical', 'c', 'Physical & Chemical Changes', 'L3', 'P3', 60),
(3, 'Science', 'Q28 (b): [Science | Physical & Chemical Changes] Milk turns sour when left overnight. This is a:', NULL, 'Physical change', 'Chemical change', 'Reversible change', 'Both physical and chemical', 'b', 'Physical & Chemical Changes', 'L2', 'P2', 45),
(3, 'Science', 'Q28 (c): [Science | Physical & Chemical Changes] A strip of copper is beaten into a thin sheet. This is a:', NULL, 'Chemical change', 'Irreversible change', 'Physical change', 'Both physical and chemical', 'c', 'Physical & Chemical Changes', 'L2', 'P2', 30),


-- SECTION C: MATH (2 Questions x 4 parts = 8 Rows, 4 Marks each)

(3, 'Math', 'Q29 (a): [Math | Triangle Properties + Lines & Angles] The angles of a triangle are in ratio 2:3:4. The largest angle is:', NULL, '40°', '60°', '80°', '90°', 'c', 'Triangle Properties + Lines & Angles', 'L2', 'P2', 45),
(3, 'Math', 'Q29 (b): [Math | Triangle Properties + Lines & Angles] In △ABC, AB = AC and ∠B = 65°. What is ∠A?', NULL, '65°', '50°', '70°', '130°', 'b', 'Triangle Properties + Lines & Angles', 'L3', 'P3', 60),
(3, 'Math', 'Q29 (c): [Math | Triangle Properties + Lines & Angles] The exterior angle of a triangle is 120°. One non-adjacent interior angle is 45°. The other non-adjacent interior angle is:', NULL, '60°', '75°', '80°', '90°', 'b', 'Triangle Properties + Lines & Angles', 'L3', 'P3', 60),
(3, 'Math', 'Q29 (d): [Math | Triangle Properties + Lines & Angles] A triangle has sides 3 cm, 4 cm and 8 cm. Can such a triangle exist?', NULL, 'Yes, it forms a right triangle', 'Yes, it forms an obtuse triangle', 'No, because 3 + 4 = 7 < 8', 'No, because all sides must be equal', 'c', 'Triangle Properties + Lines & Angles', 'L3', 'P3', 45),

(3, 'Math', 'Q30 (a): [Math | Data Handling + Fractions & Decimals] The marks of 10 students (out of 50): 42, 36, 28, 48, 36, 25, 42, 36, 50, 17. What are the Mean, Median, and Mode respectively?', NULL, '36, 36, 42', '36, 39, 36', '36, 36, 36', '38, 36, 36', 'c', 'Data Handling + Fractions & Decimals', 'L2', 'P2', 90),
(3, 'Math', 'Q30 (b): [Math | Data Handling] An 11th student joins and scores 36. What happens to the Mode and new Mean?', NULL, 'Mode changes to 42; Mean = 36', 'Mode stays 36; Mean = 36', 'Mode stays 36; Mean increases', 'Both Mode and Mean change', 'b', 'Data Handling + Fractions & Decimals', 'L3', 'P3', 60),
(3, 'Math', 'Q30 (c): [Math | Fractions & Decimals] The passing mark is 60% of 50. How many students passed?', NULL, '7', '8', '9', '10', 'a', 'Data Handling + Fractions & Decimals', 'L2', 'P2', 45),
(3, 'Math', 'Q30 (d): [Math | Fractions & Decimals] Rajan scored 42 out of 50. His score as a percentage is:', NULL, '80%', '82%', '84%', '86%', 'c', 'Data Handling + Fractions & Decimals', 'L2', 'P2', 30),


-- SECTION C: SCIENCE (2 Questions x 4 parts = 8 Rows, 4 Marks each)

(3, 'Science', 'Q31 (a): [Science | Nutrition in Plants] Which part of the leaf allows gases to enter and exit during photosynthesis?', NULL, 'Chlorophyll', 'Vascular bundles', 'Stomata', 'Cuticle', 'c', 'Nutrition in Plants + Nutrition in Animals', 'L2', 'P2', 30),
(3, 'Science', 'Q31 (b): [Science | Nutrition in Plants] Insectivorous plants like Venus flytrap digest insects mainly to obtain which nutrient?', NULL, 'Carbon', 'Oxygen', 'Nitrogen', 'Phosphorus', 'c', 'Nutrition in Plants + Nutrition in Animals', 'L3', 'P3', 45),
(3, 'Science', 'Q31 (c): [Science | Nutrition in Plants] Cuscuta (Amarbel) has no chlorophyll and derives nutrition from a host plant. This type of nutrition is called:', NULL, 'Autotrophic', 'Saprotrophic', 'Parasitic', 'Holozoic', 'c', 'Nutrition in Plants + Nutrition in Animals', 'L2', 'P2', 30),
(3, 'Science', 'Q31 (d): [Science | Nutrition in Animals] Why is it important to chew food thoroughly?', NULL, 'It increases the pH of food', 'It increases surface area for enzyme action', 'It kills bacteria in food', 'It converts starch to glucose directly', 'b', 'Nutrition in Plants + Nutrition in Animals', 'L2', 'P2', 30),

(3, 'Science', 'Q32 (a): [Science | Heat + Light] Mia wears a black coat and Tia wears a white coat on a sunny day. Who feels warmer and why?', NULL, 'Tia, because white absorbs more heat', 'Mia, because black absorbs more heat', 'Mia, because black reflects heat', 'Tia, because white emits heat', 'b', 'Heat + Light', 'L3', 'P3', 45),
(3, 'Science', 'Q32 (b): [Science | Heat + Light] A clinical thermometer reads 40.2°C. What is the temperature in Fahrenheit?', NULL, '100.36°F', '102.36°F', '104.36°F', '106.36°F', 'c', 'Heat + Light', 'L3', 'P3', 60),
(3, 'Science', 'Q32 (c): [Science | Heat + Light] What does a body temperature of 40.2°C indicate?', NULL, 'Normal temperature', 'Mild fever', 'High fever', 'Hypothermia', 'c', 'Heat + Light', 'L2', 'P2', 30),
(3, 'Science', 'Q32 (d): [Science | Light] A boy stands 3 m in front of a plane mirror. How far is his image from the mirror?', NULL, '6 m in front', '3 m behind', '3 m in front', '6 m behind', 'b', 'Heat + Light', 'L2', 'P2', 30);