-- ============================================================
-- CMart Product Service — Seed Data
-- ============================================================
-- Run after schema.sql to populate the database with initial products.
-- ============================================================

INSERT INTO products (id, name, description, category, sku, price, stock_quantity, image_url, is_active)
VALUES
    (
        '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        'Wireless Bluetooth Noise-Cancelling Headphones',
        'Over-ear headphones with 40-hour battery life, active noise cancellation, and high-fidelity sound quality.',
        'Electronics',
        'EL-HEAD-ANC-001',
        149.99,
        50,
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        TRUE
    ),
    (
        '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        'Ergonomic Mechanical Keyboard',
        'Hot-swappable mechanical gaming and office keyboard featuring tactile blue switches and custom RGB lighting.',
        'Electronics',
        'EL-KEYB-MECH-002',
        89.50,
        120,
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
        TRUE
    ),
    (
        '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
        'Classic Leather Messenger Bag',
        'Handcrafted full-grain leather laptop bag with adjustable shoulder strap and multi-compartment organizers.',
        'Apparel',
        'AP-BAG-MESS-003',
        120.00,
        35,
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        TRUE
    ),
    (
        '4d5e6f7a-8b9c-9d0e-1f2a-3b4c5d6e7f8a',
        'Stainless Steel Cold Brew Coffee Maker',
        '1-liter airtight pitcher coffee maker with fine mesh filter and spill-proof pour spout.',
        'Home & Kitchen',
        'HK-COF-BREW-004',
        29.99,
        80,
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
        TRUE
    ),
    (
        '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
        'Minimalist Water-Resistant Running Shoes',
        'Lightweight, breathable athletic sneakers optimized for long-distance road running and gym workouts.',
        'Apparel',
        'AP-SHOE-RUN-005',
        75.00,
        0, -- Out of stock product for testing purchase boundaries
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        TRUE
    ),
    (
        '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
        'Ultra-Thin 1080p Smart Home Projector',
        'Portable movie projector with built-in speakers, Wi-Fi connectivity, and screen mirroring capability.',
        'Electronics',
        'EL-PROJ-MINI-006',
        199.00,
        15,
        'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500',
        FALSE -- Inactive product to verify storefront filter rules
    )
ON CONFLICT (id) DO NOTHING;
