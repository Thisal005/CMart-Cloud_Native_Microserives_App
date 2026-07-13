-- ============================================================
-- CMart Cart Service — Database Rollback Script
-- ============================================================
-- Run this script to completely tear down the database schema
-- and revert database components to a pre-migration state.
-- ============================================================

-- 1. Drop Triggers
DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON cart_items;
DROP TRIGGER IF EXISTS trg_carts_updated_at ON carts;

-- 2. Drop Trigger Functions
DROP FUNCTION IF EXISTS fn_set_updated_at();

-- 3. Drop Indexes
-- (Note: Composite unique indexes on uq_cart_items_cart_product and uq_carts_user_id
-- are dropped automatically with the tables)
DROP INDEX IF EXISTS idx_cart_items_product_id;
DROP INDEX IF EXISTS idx_cart_items_cart_id;

-- 4. Drop Tables (foreign key dependencies require cart_items to be dropped first)
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
