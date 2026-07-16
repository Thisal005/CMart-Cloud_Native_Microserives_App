-- ============================================================
-- CMart Payment Service — Database Rollback Script
-- ============================================================
-- Service    : payment-service
-- Database   : cmart_payment_db
-- Description: Drops all tables, custom enums, and indexes
-- ============================================================

-- Drop indexes explicitly (although dropping the table removes them,
-- doing it explicitly is clean and standard practice)
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_payments_order_id;
DROP INDEX IF EXISTS idx_payments_user_id;
DROP INDEX IF EXISTS idx_payments_transaction_reference;

-- Drop payments table
DROP TABLE IF EXISTS payments CASCADE;

-- Drop custom enums
DROP TYPE IF EXISTS payment_status_type CASCADE;
DROP TYPE IF EXISTS payment_method_type CASCADE;

-- Note: We do NOT drop the "uuid-ossp" extension here,
-- as other services or database functions in the same Postgres instance
-- might depend on it.

-- Confirmation log
SELECT '✅ Rollback completed: Payments table and custom enums dropped.' AS status;
