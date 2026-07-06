-- ============================================================
-- CMart Auth Service — Seed Data
-- ============================================================
-- Run after schema.sql to populate the database with test data.
-- ============================================================

INSERT INTO users (id, first_name, last_name, email, password_hash, phone_number, role, status, email_verified, last_login_at)
VALUES
    -- Admin account (password: 'Admin@1234' — pre-hashed with bcrypt, 12 rounds)
    (
        'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        'Saman',
        'Perera',
        'admin@cmart.lk',
        '$2b$12$LJ3m5ZQxKOFn5vGJqR0wXOaYwE7yFZz0xhNdKg4v2mB1qR9pC6T3e',
        '+94771234567',
        'ADMIN',
        'ACTIVE',
        TRUE,
        '2026-07-06T10:30:00Z'
    ),
    -- Regular verified user
    (
        'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
        'Nimali',
        'Fernando',
        'nimali@gmail.com',
        '$2b$12$Xk9mPQ3nR5tU7vW9yA1bCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGh',
        '+94777654321',
        'USER',
        'ACTIVE',
        TRUE,
        '2026-07-05T14:22:00Z'
    ),
    -- New user — email not yet verified, never logged in
    (
        'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
        'Kavindu',
        'Silva',
        'kavindu.silva@yahoo.com',
        '$2b$12$Ab1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7i',
        NULL,
        'USER',
        'ACTIVE',
        FALSE,
        NULL
    ),
    -- Suspended user
    (
        'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
        'Ruwan',
        'Jayawardena',
        'ruwan.j@hotmail.com',
        '$2b$12$Jk8lM9nO0pQ1rS2tU3vW4xY5zA6bC7dE8fG9hI0jK1lM2nO3pQ4r',
        '+94761112233',
        'USER',
        'SUSPENDED',
        TRUE,
        '2026-06-15T08:45:00Z'
    )
ON CONFLICT (id) DO NOTHING;
