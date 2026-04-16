USE pramyan;

-- 1. Add teacher role to users table
ALTER TABLE users
MODIFY COLUMN role ENUM('student', 'teacher', 'admin') DEFAULT 'student';

-- 2. Add created_at column (for AdminPanel) without IF NOT EXISTS
-- 3. Create a demo teacher account to test login
-- Login: teacher@pramyan.com/password: teacher123
ALTER TABLE users
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 3. Create a demo teacher account to test login
INSERT IGNORE INTO users (name, email, password_hash, role)
VALUES (
    'Demo Teacher',
    'teacher@pramyan.com',
    '$2y$12$BHEhW4nxEXz0gJkxTnpYkuhUJ1jljnRUN41yxsYNk56eYSOu1YrQa',
    'teacher'
);