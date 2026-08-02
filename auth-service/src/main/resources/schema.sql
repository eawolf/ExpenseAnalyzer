CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_picture_url VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'USD',
    consent_completed BOOLEAN DEFAULT FALSE,
    security_question1 VARCHAR(255),
    security_answer1_hash VARCHAR(255),
    security_question2 VARCHAR(255),
    security_answer2_hash VARCHAR(255),
    security_question3 VARCHAR(255),
    security_answer3_hash VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS auth.otps (
    id UUID PRIMARY KEY,
    expires_at TIMESTAMP(6) NOT NULL,
    email_or_phone VARCHAR(255) NOT NULL,
    otp_code_hash VARCHAR(255) NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE
);
