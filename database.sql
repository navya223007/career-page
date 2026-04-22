CREATE DATABASE career_portal;
USE career_portal;
CREATE TABLE jobs (
  id INT NOT NULL AUTO_INCREMENT,
  role VARCHAR(255),
  location VARCHAR(255),
  type VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  target_email VARCHAR(255),
  PRIMARY KEY (id)
);
SHOW TABLES;
select *from jobs;
