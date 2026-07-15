-- ============================================================
-- CMart Order Service — PostgreSQL Database Schema
-- ============================================================
-- Database   : cmart_order_db
-- Service    : order-service
-- Version    : 1.0.0
-- Created    : 2026-07-15
-- Engine     : PostgreSQL 16+
-- ============================================================

-- Enable the uuid-ossp extension for UUID generation (v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. POSTGRESQL ENUM TYPE DEFINITIONS
-- ============================================================

-- Order lifecycle statuses
CREATE TYPE order_status AS ENUM (
    'PENDING',
    'PAYMENT_PENDING',
    'PAID',
    'PAYMENT_FAILED',
    'PROCESSING',
    'CANCELLED',
    'COMPLETED'
);

-- ============================================================
-- 2. ORDERS TABLE
-- ============================================================

CREATE TABLE orders (
    -- Primary key: v4 UUID generated server-side.
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User Reference: Links to the user in auth-service.
    -- (No foreign key due to service boundary database segregation).
    user_id         UUID            NOT NULL,

    -- Order Status: Enforces the order_status enum values.
    status          order_status    NOT NULL DEFAULT 'PENDING',

    -- Financial Totals
    -- Precision 12, scale 2 (max: 9,999,999,999.99). Must be non-negative.
    subtotal        NUMERIC(12, 2)  NOT NULL DEFAULT 0.00,
    total_amount    NUMERIC(12, 2)  NOT NULL DEFAULT 0.00,

    -- Transaction Snapshot (optional/nullable)
    transaction_id  VARCHAR(255),

    -- Temporal metadata: Timezone-aware timestamps.
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_orders_subtotal CHECK (subtotal >= 0),
    CONSTRAINT chk_orders_total_amount CHECK (total_amount >= 0)
);

-- ============================================================
-- 3. ORDER_ITEMS TABLE
-- ============================================================

CREATE TABLE order_items (
    -- Primary key: v4 UUID generated server-side.
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Order Reference: Links to the parent order. Cascades deletion.
    order_id        UUID            NOT NULL,

    -- Product Reference: Links to the product in product-service.
    -- (No foreign key due to service boundary database segregation).
    product_id      UUID            NOT NULL,

    -- Product Snapshot fields (captures details at time of order creation)
    product_name    VARCHAR(255)    NOT NULL,

    -- Quantity: Count of product items in this order. Must be positive.
    quantity        INTEGER         NOT NULL,

    -- Unit Price Snapshot: Record price of item at time of checkout.
    unit_price      NUMERIC(12, 2)  NOT NULL,

    -- Subtotal: Computes quantity * unit_price. Must match that logic or be non-negative.
    subtotal        NUMERIC(12, 2)  NOT NULL,

    -- Temporal metadata: Timezone-aware timestamps.
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Foreign Key Constraint
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) 
        REFERENCES orders (id) ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_order_items_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_order_items_subtotal CHECK (subtotal >= 0),
    
    -- Composite Unique constraint: Prevents duplicate product rows in a single order.
    CONSTRAINT uq_order_items_order_product UNIQUE (order_id, product_id)
);

-- ============================================================
-- 4. INDEXES
-- ============================================================

-- Index on user_id to speed up user purchase history queries
CREATE INDEX idx_orders_user_id 
    ON orders (user_id);

-- Index on status to optimize order management dashboards and state transition processing
CREATE INDEX idx_orders_status 
    ON orders (status);

-- Index on order_id to optimize order item retrieval queries (fetching all items for an order)
CREATE INDEX idx_order_items_order_id 
    ON order_items (order_id);

-- Index on product_id to enable analytical queries checking which orders contain a product
CREATE INDEX idx_order_items_product_id 
    ON order_items (product_id);

-- ============================================================
-- 5. TRIGGERS: auto-update `updated_at` on row modification
-- ============================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for orders table
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_updated_at();

-- Trigger for order_items table
CREATE TRIGGER trg_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_updated_at();
