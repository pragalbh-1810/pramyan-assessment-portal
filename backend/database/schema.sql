CREATE DATABASE IF NOT EXISTS pramyan;
USE pramyan;

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
