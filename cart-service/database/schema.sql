-- ============================================================
-- CMart Cart Service — PostgreSQL Database Schema
-- ============================================================
-- Database   : cmart_cart_db
-- Service    : cart-service
-- Version    : 1.0.0
-- Created    : 2026-07-13
-- Engine     : PostgreSQL 16+
-- ============================================================

-- Enable the uuid-ossp extension for UUID generation (v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CARTS TABLE
-- ============================================================

CREATE TABLE carts (
    -- Primary key: v4 UUID generated server-side.
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User Reference: Links to the user in auth-service.
    -- Unique constraint enforces exactly one active cart per user.
    user_id         UUID            UNIQUE NOT NULL,

    -- Temporal metadata: Timezone-aware timestamps.
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_carts_user_id_not_empty CHECK (user_id IS NOT NULL)
);

-- ============================================================
-- 2. CART_ITEMS TABLE
-- ============================================================

CREATE TABLE cart_items (
    -- Primary key: v4 UUID generated server-side.
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Cart Reference: Links to the parent cart. Cascades deletion.
    cart_id         UUID            NOT NULL,

    -- Product Reference: Links to the product in product-service.
    product_id      UUID            NOT NULL,

    -- Quantity: Count of product items in cart. Must be positive.
    quantity        INTEGER         NOT NULL DEFAULT 1,

    -- Unit Price Snapshot: Record price of item at time of cart update/addition.
    -- Precision 12, scale 2 (max: 9,999,999,999.99). Must be non-negative.
    unit_price      NUMERIC(12, 2)  NOT NULL,

    -- Temporal metadata: Timezone-aware timestamps.
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Foreign Key Constraint
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) 
        REFERENCES carts (id) ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT chk_cart_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_cart_items_unit_price CHECK (unit_price >= 0),
    
    -- Composite Unique constraint: Prevents duplicate product rows in a single cart.
    -- Forces updates to modify "quantity" instead of creating new rows.
    CONSTRAINT uq_cart_items_cart_product UNIQUE (cart_id, product_id)
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

-- Note: B-Tree index for carts(user_id) is automatically created by the UNIQUE constraint.
-- Note: Composite index for cart_items(cart_id, product_id) is automatically created by the UNIQUE constraint.

-- Index on cart_id to optimize cart retrieval queries (fetching all items for a cart)
CREATE INDEX idx_cart_items_cart_id 
    ON cart_items (cart_id);

-- Index on product_id to enable queries checking which active carts contain a product
CREATE INDEX idx_cart_items_product_id 
    ON cart_items (product_id);

-- ============================================================
-- 4. TRIGGERS: auto-update `updated_at` on row modification
-- ============================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for carts table
CREATE TRIGGER trg_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_updated_at();

-- Trigger for cart_items table
CREATE TRIGGER trg_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_updated_at();
