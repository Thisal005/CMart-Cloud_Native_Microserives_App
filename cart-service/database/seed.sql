-- ============================================================
-- CMart Cart Service — Seed Data
-- ============================================================
-- Run after schema.sql to populate the database with initial carts.
-- ============================================================

-- 1. Insert Carts for Test Users
INSERT INTO carts (id, user_id, created_at, updated_at)
VALUES
    (
        'ca777777-7777-4777-a777-777777777771',
        'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', -- Saman (Admin)
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        'ca777777-7777-4777-a777-777777777772',
        'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', -- Nimali (Regular User)
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Cart Items for Carts
INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price, created_at, updated_at)
VALUES
    -- Items for Saman's Cart
    (
        'cb111111-1111-4111-b111-111111111111',
        'ca777777-7777-4777-a777-777777777771', -- Saman's Cart
        '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', -- Headphones product ID
        1,
        149.99,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        'cb222222-2222-4222-b222-222222222222',
        'ca777777-7777-4777-a777-777777777771', -- Saman's Cart
        '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', -- Keyboard product ID
        2,
        89.50,
        NOW() - INTERVAL '2 days' + INTERVAL '1 hour',
        NOW() - INTERVAL '2 days' + INTERVAL '1 hour'
    ),

    -- Items for Nimali's Cart
    (
        'cb333333-3333-4333-b333-333333333333',
        'ca777777-7777-4777-a777-777777777772', -- Nimali's Cart
        '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', -- Messenger Bag product ID
        1,
        120.00,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;
