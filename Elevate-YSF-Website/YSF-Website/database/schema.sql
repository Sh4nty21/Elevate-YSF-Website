-- ============================================================
-- Elevate YSF (Youth Sports Fellowship) Website
-- Database Schema (MySQL / MariaDB)
-- ------------------------------------------------------------
-- Import with:
--   mysql -u root -p < schema.sql
-- or paste this file's contents into phpMyAdmin's "SQL" tab.
-- ============================================================

CREATE DATABASE IF NOT EXISTS ysf_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ysf_db;

-- ------------------------------------------------------------
-- D-GROUP LEADERS
-- ------------------------------------------------------------
CREATE TABLE dgroup_leaders (
    leader_id      INT AUTO_INCREMENT PRIMARY KEY,
    full_name      VARCHAR(100) NOT NULL,
    photo          VARCHAR(255) DEFAULT 'default-leader.svg',
    contact_number VARCHAR(20),
    email          VARCHAR(100),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- D-GROUPS
-- ------------------------------------------------------------
CREATE TABLE dgroups (
    dgroup_id     INT AUTO_INCREMENT PRIMARY KEY,
    group_name    VARCHAR(100) NOT NULL,
    leader_id     INT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leader_id) REFERENCES dgroup_leaders(leader_id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE users (
    user_id        INT AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(50) NOT NULL UNIQUE,
    email          VARCHAR(100) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    full_name      VARCHAR(100) NOT NULL,
    profile_photo  VARCHAR(255) DEFAULT 'default-profile.svg',
    membership_status ENUM('Active','Inactive') DEFAULT 'Active',
    dgroup_id      INT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dgroup_id) REFERENCES dgroups(dgroup_id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- LOGIN ATTEMPTS (brute-force rate limiting)
-- ------------------------------------------------------------
CREATE TABLE login_attempts (
    attempt_id    INT AUTO_INCREMENT PRIMARY KEY,
    identifier    VARCHAR(100) NOT NULL,       -- the username/email typed in
    ip_address    VARCHAR(45) NOT NULL,
    success       TINYINT(1) NOT NULL DEFAULT 0,
    attempted_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identifier_ip_time (identifier, ip_address, attempted_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- SPORTS (master list + PER-SPORT SATURDAY CAPACITY)
-- ------------------------------------------------------------
CREATE TABLE sports (
    sport_id    INT AUTO_INCREMENT PRIMARY KEY,
    sport_name  VARCHAR(50) NOT NULL UNIQUE,
    icon_class  VARCHAR(50) DEFAULT 'fa-solid fa-medal',
    tagline     VARCHAR(150) DEFAULT '',
    capacity    INT NOT NULL DEFAULT 36        -- max pre-check-ins per Saturday
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- USER_SPORTS (many-to-many)
-- ------------------------------------------------------------
CREATE TABLE user_sports (
    user_sport_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    sport_id      INT NOT NULL,
    date_joined   DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sport_id) REFERENCES sports(sport_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_sport (user_id, sport_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ATTENDANCE
-- ------------------------------------------------------------
CREATE TABLE attendance (
    attendance_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    sport_id        INT,
    attendance_date DATE NOT NULL,
    status          ENUM('Present','Absent','Excused') DEFAULT 'Present',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sport_id) REFERENCES sports(sport_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- PRE-CHECK-INS
-- ------------------------------------------------------------
-- One row per member, per sport, per Saturday session. The UNIQUE
-- key stops duplicate check-ins, and pre_checkin.php locks the
-- parent `sports` row before counting, so capacity can never be
-- oversold even with simultaneous requests.
-- ------------------------------------------------------------
CREATE TABLE pre_checkins (
    checkin_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    sport_id      INT NOT NULL,
    session_date  DATE NOT NULL,               -- the Saturday this check-in is for
    status        ENUM('confirmed','cancelled') DEFAULT 'confirmed',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sport_id) REFERENCES sports(sport_id) ON DELETE CASCADE,
    UNIQUE KEY unique_checkin (user_id, sport_id, session_date),
    INDEX idx_sport_session (sport_id, session_date, status)
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO dgroup_leaders (full_name, photo, contact_number, email) VALUES
('Coach Miguel Santos', 'default-leader.svg', '0917-000-0000', 'miguel.santos@ysf.church');

INSERT INTO dgroups (group_name, leader_id) VALUES
('D-Group 1 - Warriors', 1);

-- Capacity rules exactly as requested:
--   Basketball: 50   |   Volleyball: 36   |   Badminton: 36
-- Change the `capacity` value any time — no code edits needed.
INSERT INTO sports (sport_name, icon_class, tagline, capacity) VALUES
('Basketball', 'fa-solid fa-basketball', 'Train, compete, and grow through teamwork.', 50),
('Volleyball', 'fa-solid fa-volleyball', 'Learn discipline, focus, and communication.', 36),
('Badminton',  'fa-solid fa-table-tennis-paddle-ball', 'Build confidence and leadership on the court.', 36);

-- Sample member: username "johndoe", password "password123"
INSERT INTO users (username, email, password_hash, full_name, profile_photo, membership_status, dgroup_id) VALUES
('johndoe', 'john.doe@example.com', '$2y$10$FJEov7EHeT/AyMMMWPChoOLm5DuLKWiwLgUGHI/XXorgQBprKTu7K', 'John Doe', 'default-profile.svg', 'Active', 1);

INSERT INTO user_sports (user_id, sport_id, date_joined) VALUES
(1, 1, '2025-01-10'),
(1, 2, '2025-03-01');

INSERT INTO attendance (user_id, sport_id, attendance_date, status) VALUES
(1, 1, '2026-07-04', 'Present'),
(1, 2, '2026-07-11', 'Present'),
(1, 1, '2026-07-18', 'Excused'),
(1, 1, '2026-07-25', 'Present');
