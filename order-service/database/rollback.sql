-- ============================================================
-- CMart Order Service — Database Rollback Script
-- ============================================================
-- Run this script to completely tear down the database schema
-- and revert database components to a pre-migration state.
-------- ============================================================

-- 1. Drop Triggers
DROP TRIGGER IF EXISTS trg_order_items_updated_at ON order_items;
DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;

-- 2. Drop Trigger Functions
-- Note: Check if other tables use this. If so, drop trigger instead of the function.
-- But since it's a dedicated order database, it is safe to drop here.
DROP FUNCTION IF EXISTS fn_set_updated_at();

-- 3. Drop Indexes
DROP INDEX IF EXISTS idx_order_items_product_id;
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_user_id;

-- 4. Drop Tables (order_items has foreign key reference, drop first)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;

-- 5. Drop Enum Types
DROP TYPE IF EXISTS order_status;
