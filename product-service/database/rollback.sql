-- ============================================================
-- CMart Product Service — Database Rollback Script
-- ============================================================
-- Run this script to completely tear down the database schema
-- and revert database components to a pre-migration state.
-- ============================================================

-- Drop trigger
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;

-- Drop function
DROP FUNCTION IF EXISTS fn_set_updated_at();

-- Drop indexes (note: unique index on SKU is dropped automatically with table)
DROP INDEX IF EXISTS idx_products_name;
DROP INDEX IF EXISTS idx_products_active_price;
DROP INDEX IF EXISTS idx_products_active_category;
DROP INDEX IF EXISTS idx_products_category;

-- Drop table
DROP TABLE IF EXISTS products;
