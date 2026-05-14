-- Migration script to add security question fields to the users table
ALTER TABLE users 
ADD COLUMN security_answer1 VARCHAR(255) DEFAULT NULL,
ADD COLUMN security_answer2 VARCHAR(255) DEFAULT NULL,
ADD COLUMN security_answer3 VARCHAR(255) DEFAULT NULL;
