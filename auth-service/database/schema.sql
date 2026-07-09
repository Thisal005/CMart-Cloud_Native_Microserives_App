-- ============================================================
-- CMart Auth Service — PostgreSQL Database Schema
-- ============================================================
-- Database   : cmart_auth_db
-- Service    : auth-service
-- Version    : 1.0.0
-- Created    : 2026-07-06
-- Engine     : PostgreSQL 16+
-- ============================================================

-- Enable the uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ENUM TYPE DEFINITIONS
-- ============================================================

-- Role enum: defines the authorization level of a user.
-- USER  — standard customer with access to storefront operations.
-- ADMIN — elevated privileges for back-office management.
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');

-- Account status enum: governs login eligibility and visibility.
-- ACTIVE    — fully operational account; login permitted.
-- INACTIVE  — soft-disabled by the user or system; login denied.
-- SUSPENDED — administratively locked due to policy violation; login denied.
CREATE TYPE account_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- ============================================================
-- 2. USERS TABLE
-- ============================================================

CREATE TABLE users (
    -- --------------------------------------------------------
    -- Primary key: v4 UUID generated server-side.
    -- UUIDs prevent enumeration attacks and simplify
    -- cross-service references without a central sequence.
    -- --------------------------------------------------------
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- --------------------------------------------------------
    -- Identity fields
    -- --------------------------------------------------------
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,

    -- --------------------------------------------------------
    -- Authentication fields
    -- --------------------------------------------------------
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,   -- bcrypt / argon2 output
    phone_number    VARCHAR(20),                -- optional; E.164 format recommended

    -- --------------------------------------------------------
    -- Authorization & account governance
    -- --------------------------------------------------------
    role            user_role       NOT NULL DEFAULT 'USER',
    status          account_status  NOT NULL DEFAULT 'ACTIVE',
    email_verified  BOOLEAN         NOT NULL DEFAULT FALSE,

    -- --------------------------------------------------------
    -- Temporal metadata
    -- --------------------------------------------------------
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMPTZ                                -- NULL until first login
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

-- Unique index on email — enforces the one-account-per-email
-- business rule and accelerates login lookups (WHERE email = ?).
CREATE UNIQUE INDEX idx_users_email
    ON users (email);

-- Composite index for admin dashboards that filter by role + status.
-- Covers queries like: WHERE role = 'ADMIN' AND status = 'ACTIVE'
CREATE INDEX idx_users_role_status
    ON users (role, status);

-- Index on status for bulk account-management queries
-- (e.g., "find all SUSPENDED accounts").
CREATE INDEX idx_users_status
    ON users (status);

-- Partial index for unverified emails — useful for reminder
-- cron jobs that target only unverified accounts.
CREATE INDEX idx_users_email_unverified
    ON users (email)
    WHERE email_verified = FALSE;

-- ============================================================
-- 4. TRIGGER: auto-update `updated_at` on row modification
-- ============================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_updated_at();

