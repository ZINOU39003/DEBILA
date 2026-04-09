-- MySQL Schema for Bader Portal

CREATE DATABASE IF NOT EXISTS bader_db;
USE bader_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  role ENUM('citizen', 'department', 'admin') DEFAULT 'citizen',
  organization VARCHAR(100),
  cover_uri TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id VARCHAR(50) PRIMARY KEY, -- RPT-XXXX format
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location_text TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  category VARCHAR(100),
  status ENUM('submitted', 'under_review', 'in_progress', 'resolved') DEFAULT 'submitted',
  reporter_id INT,
  assigned_dept VARCHAR(100),
  media_urls JSON, -- Stores array as JSON string
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id VARCHAR(50),
  sender_id INT,
  sender_name VARCHAR(255),
  sender_role VARCHAR(50),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  logo_uri TEXT,
  cover_uri TEXT,
  sector VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Initial Admin User
INSERT INTO users (full_name, phone, username, password, role) 
VALUES ('المدير العام للمنصة', '0500000000', 'admin', '123456', 'admin')
ON DUPLICATE KEY UPDATE full_name=full_name;
