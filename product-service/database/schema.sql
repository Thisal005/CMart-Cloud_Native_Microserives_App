-- ============================================================
-- CMart Product Service — PostgreSQL Database Schema
-- ============================================================
-- Database   : cmart_product_db
-- Service    : product-service
-- Version    : 1.0.0
-- Created    : 2026-07-09
-- Engine     : PostgreSQL 16+
-- ============================================================

-- Enable the uuid-ossp extension for UUID generation (v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PRODUCTS TABLE
-- ============================================================

CREATE TABLE products (
    -- Primary key: v4 UUID generated server-side.
    -- Prevents enumeration attacks and matches auth-service.
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Product Name: must not be empty or whitespace.
    name            VARCHAR(255)    NOT NULL,

    -- Description: Optional rich details for search.
    description     TEXT,

    -- Category: General group classification for listing & filtering.
    category        VARCHAR(100)    NOT NULL,

    -- SKU (Stock Keeping Unit): Global unique code.
    sku             VARCHAR(50)     UNIQUE NOT NULL,

    -- Price: Decimal with precision 12, scale 2 (max: 9,999,999,999.99).
    -- Non-negative constraint.
    price           NUMERIC(12, 2)  NOT NULL,

    -- Stock count: must not drop below zero.
    stock_quantity  INTEGER         NOT NULL DEFAULT 0,

    -- Image URL: standard limit length.
    image_url       VARCHAR(2083),

    -- Active status: flag to soft-disable catalog visibility.
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,

    -- Temporal metadata: Timezone-aware timestamps.
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_products_price CHECK (price >= 0),
    CONSTRAINT chk_products_stock_quantity CHECK (stock_quantity >= 0),
    CONSTRAINT chk_products_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_products_sku_not_empty CHECK (length(trim(sku)) > 0)
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

-- Note: The UNIQUE index on sku is automatically created by the UNIQUE constraint.

-- Index on category for general category filtering.
CREATE INDEX idx_products_category 
    ON products (category);

-- Composite Partial Index on category and active status.
-- Highly optimized for storefront category landing pages.
CREATE INDEX idx_products_active_category 
    ON products (category, is_active) 
    WHERE is_active = TRUE;

-- Partial Index on price for sorting filters.
-- Optimized for sorting active products by price (low-to-high, high-to-low).
CREATE INDEX idx_products_active_price 
    ON products (price) 
    WHERE is_active = TRUE;

-- B-Tree index on name for name prefix and exact search.
CREATE INDEX idx_products_name 
    ON products (name);

-- ============================================================
-- 3. TRIGGER: auto-update `updated_at` on row modification
-- ============================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_updated_at();
