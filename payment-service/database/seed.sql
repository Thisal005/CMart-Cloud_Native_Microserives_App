-- ============================================================
-- CMart Payment Service — Database Seed Data
-- ============================================================
-- Service    : payment-service
-- Database   : cmart_payment_db
-- Description: Mock transactions for local development and testing
-- ============================================================

-- Ensure uuid-ossp is enabled so we can generate UUIDs in the seed script
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clear existing payment records before seeding (safeguard for re-seeding)
TRUNCATE TABLE payments RESTART IDENTITY CASCADE;

INSERT INTO payments (
    id,
    order_id,
    user_id,
    amount,
    currency,
    payment_method,
    transaction_reference,
    status,
    gateway,
    created_at,
    updated_at
) VALUES 
(
    -- 1. Successful CARD payment processed via MOCK gateway
    uuid_generate_v4(),
    '44fad838-5017-4414-b214-0dff04beb306', -- matches order in verify.js
    '83e4b88b-84ca-4a93-ae1e-3a1f63a2d755', -- matches user in verify.js
    2999.98,
    'USD',
    'CARD',
    'ch_mock_success_59df2c7104ae',
    'SUCCESS',
    'MOCK',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
),
(
    -- 2. Processing DIGITAL_WALLET transaction simulation
    uuid_generate_v4(),
    'b8a9235e-c102-4752-b88a-ea4cbb381a98',
    '83e4b88b-84ca-4a93-ae1e-3a1f63a2d755',
    89.99,
    'USD',
    'DIGITAL_WALLET',
    'ch_mock_proc_f94bbcd1c6ea',
    'PROCESSING',
    'MOCK',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
),
(
    -- 3. Failed CARD payment simulation (triggers card decline rule)
    uuid_generate_v4(),
    '97678ebe-d0a1-453b-9eb0-8e25ce53c4bb',
    '83e4b88b-84ca-4a93-ae1e-3a1f63a2d755',
    1499.99,
    'USD',
    'CARD',
    'ch_mock_declined_91ca94ef2981',
    'FAILED',
    'MOCK',
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes'
),
(
    -- 4. Pending BANK_TRANSFER payment waiting for verification
    uuid_generate_v4(),
    'c2bc954f-12ad-48b6-9df9-c88fbb172e9a',
    '093c9290-ebd2-4f2f-a025-c6d42e7f81d0',
    499.50,
    'LKR',
    'BANK_TRANSFER',
    'tx_bank_transfer_ref_112233',
    'PENDING',
    'MOCK',
    NOW() - INTERVAL '15 minutes',
    NOW() - INTERVAL '15 minutes'
),
(
    -- 5. Refunded DIGITAL_WALLET transaction
    uuid_generate_v4(),
    'f3ca994e-28be-419b-a01b-c12e56cc1808',
    '093c9290-ebd2-4f2f-a025-c6d42e7f81d0',
    299.99,
    'USD',
    'DIGITAL_WALLET',
    'ch_mock_refunded_d7cf9d229e92',
    'REFUNDED',
    'MOCK',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '23 hours'
),
(
    -- 6. Cash on Delivery (CASH_ON_DELIVERY) pending collection
    uuid_generate_v4(),
    'a94cbcd1-12ec-4cfc-bcf1-098f48dfc999',
    'dab178bb-9a4e-41d0-b688-248ce04be5e8',
    150.00,
    'USD',
    'CASH_ON_DELIVERY',
    'tx_cod_ref_5e584108c625',
    'PENDING',
    'MOCK',
    NOW() - INTERVAL '5 minutes',
    NOW() - INTERVAL '5 minutes'
);

-- Output seeded records count
SELECT COUNT(*) as seeded_payments_count FROM payments;
