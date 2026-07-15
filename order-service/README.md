# Order Service

The **Order Service** is a core microservice of the CMart Cloud-Native E-Commerce Platform. It is responsible for managing customer orders, processing checkouts by converting shopping carts, and coordinating order lifecycles and transactions.

---

## 1. Service Purpose
The Order Service manages the lifecycle of customer orders. Its scope includes:
- Creating orders from user's shopping carts.
- Performing catalog checks on product status, pricing snapshots, and stock availability before checkout.
- Managing order item snapshots (persisting historical product names and unit prices at purchase time).
- Maintaining order lifecycle states (`PENDING`, `PAYMENT_PENDING`, `PAID`, `PAYMENT_FAILED`, `PROCESSING`, `COMPLETED`, `CANCELLED`).
- Enforcing user ownership rules and administrator action controls.

**Domain Boundaries**: The Order Service does *not* own or store user profiles (managed by Auth Service), active catalog items (managed by Product Service), or active cart contents (managed by Cart Service). It references these domains using UUID keys (`user_id`, `product_id`) and queries details via REST API client wrappers.

---

## 2. Architecture Overview
The service uses a standard layered N-Tier architecture designed around TypeORM, Postgres, and Express:

```
                  ┌─────────────────────────────────────────┐
                  │          Express Routing Layer          │
                  │   - Maps HTTP methods to controllers    │
                  │   - Uses shared authentication JWT      │
                  │   - Enforces parameter validation       │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │              Service Layer              │
                  │   - Implements business logic           │
                  │   - Performs state transition checks    │
                  │   - Validates purchase snapshot rule    │
                  └──────────┬───────────────────┬──────────┘
                             │                   │
                             ▼                   ▼
      ┌───────────────────────────────┐   ┌───────────────────────────────┐
      │      Data Access Layer        │   │      Communication Layer      │
      │      (Repositories)           │   │    (Auth, Cart, Prod Clients) │
      │  - TypeORM Order/Item Repos   │   │   - Wraps Axios HTTP calls    │
      │  - Database queries           │   │   - Handles service retries   │
      └───────────────────────────────┘   └───────────────────────────────┘
```

---

## 3. Folder Structure
The directory structure matches the other microservices in the CMart platform to maintain architectural consistency:

```
order-service/
├── database/            # SQL scripts for database operations
│   ├── schema.sql       # Database schema (tables, constraints, indexes, triggers)
│   ├── seed.sql         # Local development seed data
│   └── rollback.sql     # Database tear-down script
├── src/
│   ├── client/          # API clients (AuthClient, CartClient, ProductClient)
│   ├── config/          # Configurations & Database Data Source
│   ├── controller/      # REST API Controllers (Express routing)
│   ├── dto/             # Data Transfer Objects (DTOs) for payloads
│   ├── middleware/      # Express Middlewares (Validation, Errors)
│   ├── model/           # TypeORM Database Entities (Order, OrderItem)
│   ├── repository/      # Repository patterns wrapping database DataSource
│   ├── service/         # Isolated Core Business Logic Layer
│   ├── utils/           # Utilities (Logger)
│   ├── app.ts           # App setup, registration, global middlewares
│   └── server.ts        # Server entry point and bootstrapper
├── test/
│   ├── integration/     # Integration API tests using supertest
│   └── unit/            # Unit tests using Jest mocks
├── .env                 # Environment variables configuration
├── .env.example         # Example configuration template
├── package.json         # Scripts and project dependencies
└── tsconfig.json        # TypeScript configuration extending root
```

---

## 4. Database Design
The Order Service utilizes PostgreSQL to manage its domain model.

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    ORDERS {
        uuid id PK "DEFAULT uuid_generate_v4()"
        uuid user_id "NOT NULL"
        varchar status "NOT NULL, DEFAULT 'PENDING'"
        numeric subtotal "NUMERIC(12,2), NOT NULL"
        numeric total_amount "NUMERIC(12,2), NOT NULL"
        varchar transaction_id "NULL"
        timestamptz created_at "DEFAULT NOW()"
        timestamptz updated_at "DEFAULT NOW()"
    }
    ORDER_ITEMS {
        uuid id PK "DEFAULT uuid_generate_v4()"
        uuid order_id FK "REFERENCES orders(id) ON DELETE CASCADE"
        uuid product_id "NOT NULL"
        varchar product_name "NOT NULL"
        integer quantity "NOT NULL"
        numeric unit_price "NUMERIC(12,2), NOT NULL"
        numeric subtotal "NUMERIC(12,2), NOT NULL"
        timestamptz created_at "DEFAULT NOW()"
        timestamptz updated_at "DEFAULT NOW()"
    }
    ORDERS ||--o{ ORDER_ITEMS : contains
```

### Table Definitions

#### 1. `orders` Table
Stores parent order records.
- `id` (UUID, Primary Key): Automatically generated `uuid_generate_v4()`.
- `user_id` (UUID, Not Null): References the customer who placed the order.
- `status` (Varchar, Not Null): Holds current state values (e.g. `PENDING`, `PAID`, `CANCELLED`).
- `subtotal` / `total_amount` (Numeric(12,2), Not Null): Total checkout costs.
- `transaction_id` (Varchar, Null): Payment gateway reference token.
- `created_at` / `updated_at` (TIMESTAMPTZ): Audit logging timestamps.

#### 2. `order_items` Table
Stores historical product line items associated with an order.
- `id` (UUID, Primary Key): Generated `uuid_generate_v4()`.
- `order_id` (UUID, Foreign Key, Not Null): References `orders(id)` with `ON DELETE CASCADE`.
- `product_id` (UUID, Not Null): References the catalog product.
- `product_name` (Varchar, Not Null): Snapshot of the product name at checkout.
- `quantity` (Integer, Not Null): Checked to be positive (`CHECK (quantity > 0)`).
- `unit_price` (Numeric(12,2), Not Null): Snapshot of product price when ordered.
- `subtotal` (Numeric(12,2), Not Null): Computed snapshot value (`quantity * unit_price`).

### Constraints & Indexes
- **Status Enum Verification**: Check constraints ensure orders only transition within valid lifecycle status ranges.
- **Relational Integrity**: Foreign key from `order_items` to `orders` with cascade deletes.
- **Eager Retrieval Index**: B-Tree index on `order_items(order_id)` to speed up order detail loads.
- **Auto-updated Timestamps**: PostgreSQL triggers keep `updated_at` timestamps current.

---

## 5. API Documentation

All request payloads and query parameters must be structured in JSON format. The service endpoints are protected and require a valid Bearer token in the `Authorization` header.

### Endpoints

#### 1. Create Order
- **Method & URL**: `POST /api/v1/orders`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response (211 Created)**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "de555555-5555-4555-b555-555555555551",
    "userId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "status": "PENDING",
    "subtotal": 149.99,
    "totalAmount": 149.99,
    "items": [
      {
        "id": "cb111111-1111-4111-b111-111111111111",
        "productId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        "productName": "Wireless Headphones",
        "quantity": 1,
        "unitPrice": 149.99,
        "subtotal": 149.99
      }
    ],
    "createdAt": "2026-07-15T14:31:00.000Z",
    "updatedAt": "2026-07-15T14:31:00.000Z"
  },
  "timestamp": "2026-07-15T14:31:00.000Z"
}
```

#### 2. Get Order By ID
- **Method & URL**: `GET /api/v1/orders/:id`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK)**: Returns the order details. Users can only fetch their own orders; Admins can fetch any order.

#### 3. Get User Orders (Paginated & Filterable)
- **Method & URL**: `GET /api/v1/orders?page=1&limit=10&status=PAID`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 15,
    "totalPages": 2
  },
  "timestamp": "2026-07-15T14:32:00.000Z"
}
```

#### 4. Update Order Status (Admin Only)
- **Method & URL**: `PATCH /api/v1/orders/:id/status`
- **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Request Body**:
```json
{
  "status": "PROCESSING"
}
```
- **Response (200 OK)**: Returns the updated order payload.

---

## 6. Configuration & Environment Variables

Create a local `.env` file in the root directory:

```env
PORT=3004
JWT_SECRET=your-jwt-secret-key-here

# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Downstream Microservices
AUTH_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
CART_SERVICE_URL=http://localhost:3003
```

---

## 7. Local Development Guide

### Running locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the hot-reload development server:
   ```bash
   npm run dev
   ```
3. Compile production build:
   ```bash
   npm run build
   ```

---

## 8. Testing Harness

Run the automated test suite containing isolated unit tests and routing integration tests:
```bash
npm run test
```
See the [test/README.md](file:///t:/Projects/CMart/order-service/test/README.md) file for more testing details.
