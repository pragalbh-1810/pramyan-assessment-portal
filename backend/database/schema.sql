CREATE DATABASE IF NOT EXISTS pramyan;
USE pramyan;

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  password      VARCHAR(255) NOT NULL,
  phone         VARCHAR(20),
  parent_phone  VARCHAR(20),
  class_name    VARCHAR(50),
  board         VARCHAR(50),
  role          ENUM('student','admin') DEFAULT 'student',
  google_id     VARCHAR(255) DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tests (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  class_name    VARCHAR(50),
  duration      INT NOT NULL,
  total_marks   INT DEFAULT 60,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  test_id          INT NOT NULL,
  question_text    TEXT NOT NULL,
  option_a         VARCHAR(500),
  option_b         VARCHAR(500),
  option_c         VARCHAR(500),
  option_d         VARCHAR(500),
  correct_option   VARCHAR(1) NOT NULL,
  chapter          VARCHAR(100),
  bloom_level      VARCHAR(5),
  skill_type       VARCHAR(5),
  section          VARCHAR(1),
  marks            INT DEFAULT 1,
  time_on_question INT DEFAULT 0,
  class10_link     VARCHAR(255),
  FOREIGN KEY (test_id) REFERENCES tests(id)
);

CREATE TABLE IF NOT EXISTS responses (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  student_test_id INT NOT NULL,
  question_id     INT NOT NULL,
  selected_option VARCHAR(1) DEFAULT NULL,
  is_correct      TINYINT(1) DEFAULT 0,
  auto_saved      TINYINT(1) DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS results (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  student_id        INT NOT NULL,
  test_id           INT NOT NULL,
  total_score       INT DEFAULT 0,
  total_marks       INT DEFAULT 60,
  overall_pct       DECIMAL(5,2) DEFAULT 0,
  math_score        INT DEFAULT 0,
  math_total        INT DEFAULT 30,
  math_pct          DECIMAL(5,2) DEFAULT 0,
  sci_score         INT DEFAULT 0,
  sci_total         INT DEFAULT 30,
  sci_pct           DECIMAL(5,2) DEFAULT 0,
  performance_label VARCHAR(100),
  skill_scores      JSON,
  action_plan       TEXT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (test_id) REFERENCES tests(id)
);

CREATE TABLE IF NOT EXISTS bloom_scores (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  student_id      INT NOT NULL,
  test_id         INT NOT NULL,
  bloom_level     VARCHAR(5) NOT NULL,
  marks_scored    INT DEFAULT 0,
  total_marks     INT DEFAULT 0,
  score_pct       DECIMAL(5,2) DEFAULT 0,
  subject         VARCHAR(50),
  interpretation  TEXT,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (test_id) REFERENCES tests(id)
);

CREATE TABLE IF NOT EXISTS chapter_scores (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  student_id      INT NOT NULL,
  test_id         INT NOT NULL,
  chapter         VARCHAR(100),
  subject         VARCHAR(50),
  marks_scored    INT DEFAULT 0,
  total_marks     INT DEFAULT 0,
  score_pct       DECIMAL(5,2) DEFAULT 0,
  swot_category   VARCHAR(20),
  class10_link    VARCHAR(255),
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (test_id) REFERENCES tests(id)
);