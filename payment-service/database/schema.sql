-- ============================================================
-- CMart Payment Service — PostgreSQL Database Schema
-- ============================================================
-- Database   : cmart_payment_db
-- Service    : payment-service
-- Version    : 1.0.0
-- Created    : 2026-07-16
-- Engine     : PostgreSQL 16+ (Supabase & Amazon RDS Compatible)
-- ============================================================

-- Enable the uuid-ossp extension for UUID generation (v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. POSTGRESQL ENUM TYPE DEFINITIONS
-- ============================================================

-- Supported payment methods
CREATE TYPE payment_method_type AS ENUM (
    'CARD',
    'BANK_TRANSFER',
    'CASH_ON_DELIVERY',
    'DIGITAL_WALLET'
);

-- Payment lifecycle statuses
CREATE TYPE payment_status_type AS ENUM (
    'PENDING',
    'PROCESSING',
    'SUCCESS',
    'FAILED',
    'REFUNDED',
    'CANCELLED'
);

-- ============================================================
-- 2. PAYMENTS TABLE
-- ============================================================

CREATE TABLE payments (
    -- Primary Key: v4 UUID generated server-side
    id                      UUID                    PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Order Reference: Links to the associated order in order-service
    -- (No foreign key constraint to respect database segregation across microservices)
    order_id                UUID                    NOT NULL,

    -- User Reference: Links to the associated user in auth-service
    -- (No foreign key constraint to respect database segregation across microservices)
    user_id                 UUID                    NOT NULL,

    -- Financial Fields
    -- Numeric chosen over floating-point types to prevent accuracy loss
    amount                  NUMERIC(12, 2)          NOT NULL,
    
    -- ISO 4217 Currency Code (e.g. 'USD', 'EUR', 'LKR')
    currency                VARCHAR(3)              NOT NULL DEFAULT 'USD',

    -- Payment Method Enum
    payment_method          payment_method_type     NOT NULL,

    -- Transaction Reference: Unique ID returned by external gateways (Stripe, PayPal, etc.)
    -- Used for idempotency check and matching transactions on gateways
    transaction_reference   VARCHAR(255)            NOT NULL,

    -- Payment Lifecycle Status
    status                  payment_status_type     NOT NULL DEFAULT 'PENDING',

    -- Payment Gateway Name (e.g. 'MOCK', 'STRIPE', 'PAYPAL')
    gateway                 VARCHAR(50)             NOT NULL,

    -- Temporal metadata: Timezone-aware timestamps
    created_at              TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

    -- ============================================================
    -- CONSTRAINTS
    -- ============================================================
    
    -- Enforce positive amount value
    CONSTRAINT chk_payments_amount 
        CHECK (amount >= 0),

    -- Enforce uppercase standard ISO currency format
    CONSTRAINT chk_payments_currency 
        CHECK (length(currency) = 3),

    -- Enforce non-empty transaction reference value
    CONSTRAINT chk_payments_transaction_reference
        CHECK (length(trim(transaction_reference)) > 0)
);

-- ============================================================
-- 3. INDEXES FOR PERFORMANCE AND DATA INTEGRITY
-- ============================================================

-- Uniqueness: Enforce unique transaction references to prevent duplicate payments or replays
CREATE UNIQUE INDEX idx_payments_transaction_reference 
    ON payments (transaction_reference);

-- Foreign Key References: Speeds up lookup of payment history per user
CREATE INDEX idx_payments_user_id 
    ON payments (user_id);

-- Foreign Key References: Speeds up query of payments for a particular order
CREATE INDEX idx_payments_order_id 
    ON payments (order_id);

-- Status Index: Speeds up dashboard reporting, analytical aggregates, and pending payment polling
CREATE INDEX idx_payments_status 
    ON payments (status);
