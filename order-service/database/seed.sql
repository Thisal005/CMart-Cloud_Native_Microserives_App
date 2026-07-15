-- ============================================================
-- CMart Order Service — Seed Data
-- ============================================================
-- Run after schema.sql to populate the database with initial orders.
-- ============================================================

-- 1. Insert Orders for Test Users
INSERT INTO orders (id, user_id, status, subtotal, total_amount, created_at, updated_at)
VALUES
    (
        'de555555-5555-4555-b555-555555555551',
        'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', -- Saman (Admin)
        'PAID',
        328.99,
        328.99,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        'de555555-5555-4555-b555-555555555552',
        'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', -- Nimali (Regular User)
        'PENDING',
        120.00,
        120.00,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Order Items (Snapshots) for the Orders
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, subtotal, created_at, updated_at)
VALUES
    -- Items for Saman's Order (PAID)
    (
        'df111111-1111-4111-b111-111111111111',
        'de555555-5555-4555-b555-555555555551', -- Order ID
        '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', -- Headphones product ID
        'Wireless Noise-Canceling Headphones',  -- Product snapshot name
        1,
        149.99,                                  -- Product snapshot price
        149.99,                                  -- Subtotal
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        'df222222-2222-4222-b222-222222222222',
        'de555555-5555-4555-b555-555555555551', -- Order ID
        '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', -- Keyboard product ID
        'Mechanical Gaming Keyboard (Red Switches)', -- Product snapshot name
        2,
        89.50,                                   -- Product snapshot price
        179.00,                                  -- Subtotal
        NOW() - INTERVAL '2 days' + INTERVAL '10 minutes',
        NOW() - INTERVAL '2 days' + INTERVAL '10 minutes'
    ),

    -- Items for Nimali's Order (PENDING)
    (
        'df333333-3333-4333-b333-333333333333',
        'de555555-5555-4555-b555-555555555552', -- Order ID
        '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', -- Messenger Bag product ID
        'Leather Laptop Messenger Bag',          -- Product snapshot name
        1,
        120.00,                                  -- Product snapshot price
        120.00,                                  -- Subtotal
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;
