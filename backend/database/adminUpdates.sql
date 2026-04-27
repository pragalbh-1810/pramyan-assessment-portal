ALTER TABLE users ADD COLUMN assigned_teacher_id INT NULL;
ALTER TABLE users ADD FOREIGN KEY (assigned_teacher_id) REFERENCES users(id) ON DELETE SET NULL;