# Cart Service

The **Cart Service** is a core microservice of the CMart Cloud-Native E-Commerce Platform. It is responsible for managing user shopping carts, keeping track of items, and calculating the totals before a customer proceeds to checkout.

---

## 1. Service Purpose
The Cart Service manages the lifecycle of customer shopping carts. Its scope includes:
- Maintaining persistent records of user shopping carts and cart items.
- Implementing business rules such as quantity constraints and pricing/stock validations.
- Locking price quotes (via unit price snapshots) and executing cart calculations locally.

**Domain Boundaries**: The Cart Service does *not* own or store user records (managed by Auth Service), catalog details (managed by Product Service), order details (managed by Order Service), or payments (managed by Payment Service). It interacts with these services exclusively using API references (`user_id`, `product_id`).

---

## 2. Architecture Overview
The service uses a standard layered N-Tier architecture designed around TypeORM and Express:

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
                  │   - Performs stock/status checks        │
                  │   - Calculates cart totals              │
                  └──────────┬───────────────────┬──────────┘
                             │                   │
                             ▼                   ▼
     ┌───────────────────────────────┐   ┌───────────────────────────────┐
     │      Data Access Layer        │   │      Communication Layer      │
     │      (Repositories)           │   │       (Product Client)        │
     │  - TypeORM Cart/Item Repos    │   │   - Wraps Axios HTTP calls    │
     │  - Database queries           │   │   - Resolves product names    │
     └───────────────────────────────┘   └───────────────────────────────┘
```

---

## 3. Folder Structure
The directory structure mirrors the other microservices in the CMart platform to maintain a consistent code layout:

```
cart-service/
├── database/            # SQL scripts for database operations
│   ├── schema.sql       # Database schema (tables, constraints, indexes, triggers)
│   ├── seed.sql         # Local development seed data
│   └── rollback.sql     # Database tear-down script
├── src/
│   ├── client/          # HTTP clients for cross-service calls (ProductClient)
│   ├── config/          # Configurations & Database Data Source (AppDataSource)
│   ├── controller/      # REST API Controllers (Express routing/handlers)
│   ├── dto/             # Data Transfer Objects (DTOs) for payloads
│   ├── middleware/      # Global & local Express Middlewares (Validation, Errors)
│   ├── model/           # TypeORM Database Entities (Cart, CartItem)
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
The Cart Service utilizes PostgreSQL to manage its domain model.

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    CARTS {
        uuid id PK "DEFAULT uuid_generate_v4()"
        uuid user_id UK "UNIQUE, NOT NULL"
        timestamptz created_at "DEFAULT NOW()"
        timestamptz updated_at "DEFAULT NOW()"
    }
    CART_ITEMS {
        uuid id PK "DEFAULT uuid_generate_v4()"
        uuid cart_id FK "REFERENCES carts(id) ON DELETE CASCADE"
        uuid product_id "NOT NULL"
        integer quantity "NOT NULL, DEFAULT 1"
        numeric unit_price "NUMERIC(12,2), NOT NULL"
        timestamptz created_at "DEFAULT NOW()"
        timestamptz updated_at "DEFAULT NOW()"
    }
    CARTS ||--o{ CART_ITEMS : contains
```

### Table Definitions

#### 1. `carts` Table
Stores parent cart records. Each authenticated user is mapped to exactly one cart.
- `id` (UUID, Primary Key): Automatically generated `uuid_generate_v4()`.
- `user_id` (UUID, Unique, Not Null): References the user's ID from the Auth Service.
- `created_at` / `updated_at` (TIMESTAMPTZ): Audit logging timestamps.

#### 2. `cart_items` Table
Stores items associated with a cart.
- `id` (UUID, Primary Key): Generated `uuid_generate_v4()`.
- `cart_id` (UUID, Foreign Key, Not Null): References `carts(id)` with `ON DELETE CASCADE`.
- `product_id` (UUID, Not Null): References the product ID from the Product Service.
- `quantity` (Integer, Not Null): Checked to be positive (`CHECK (quantity > 0)`).
- `unit_price` (Numeric(12,2), Not Null): Price of the item when added (`CHECK (unit_price >= 0)`).

### Constraints & Indexes
- **Single Cart Per User**: Unique constraint on `carts(user_id)`.
- **Composite Uniqueness**: Composite unique constraint `uq_cart_items_cart_product` on `(cart_id, product_id)` in `cart_items`. This ensures products aren't duplicated in the cart database, forcing quantity increments instead.
- **Eager Retrieval Index**: B-Tree index on `cart_items(cart_id)` to speed up cart retrievals.
- **Analytics Index**: B-Tree index on `cart_items(product_id)` to identify which carts contain specific catalog items.
- **Auto-updated Timestamps**: Set up a PostgreSQL trigger (`BEFORE UPDATE`) executing `fn_set_updated_at()` to keep `updated_at` timestamps current.

---

## 5. API Documentation

All request payloads and query parameters must be structured in JSON format. The service endpoints are protected and require a valid Bearer token in the `Authorization` header.

### Endpoints

#### 1. Get Cart
- **Method & URL**: `GET /api/v1/cart` (or `/api/cart` for legacy compatibility)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "ca777777-7777-4777-a777-777777777771",
    "userId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "items": [
      {
        "id": "cb111111-1111-4111-b111-111111111111",
        "productId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        "name": "Wireless Noise-Cancelling Headphones",
        "price": 149.99,
        "quantity": 1,
        "createdAt": "2026-07-13T11:34:00.000Z",
        "updatedAt": "2026-07-13T11:34:00.000Z"
      }
    ],
    "totalAmount": 149.99,
    "createdAt": "2026-07-13T11:34:00.000Z",
    "updatedAt": "2026-07-13T11:34:00.000Z"
  },
  "timestamp": "2026-07-13T11:35:00.000Z"
}
```

#### 2. Add Item to Cart
- **Method & URL**: `POST /api/v1/cart/items`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
```json
{
  "productId": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
  "quantity": 2
}
```
- **Response (200 OK)**: Returns the updated cart payload wrapped in standard success layout.

#### 3. Update Item Quantity
- **Method & URL**: `PUT /api/v1/cart/items/:itemId`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
```json
{
  "quantity": 5
}
```
- **Response (200 OK)**: Returns the updated cart payload with updated item quantity.

#### 4. Remove Item from Cart
- **Method & URL**: `DELETE /api/v1/cart/items/:itemId`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK)**: Returns the updated cart payload minus the deleted item.

#### 5. Clear Cart
- **Method & URL**: `DELETE /api/v1/cart`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": null,
  "timestamp": "2026-07-13T11:35:00.000Z"
}
```

---

## 6. Environment Variables
The application reads configuration from environment variables defined in a `.env` file at the root:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Local port number the HTTP server listens on. | `3003` |
| `JWT_SECRET` | Secret key used by the shared auth middleware. | `your-jwt-secret-key-here` |
| `PRODUCT_SERVICE_URL` | Base API URL of the Product Service. | `http://localhost:3002` |
| `DATABASE_URL` | PostgreSQL connection URL. | `postgresql://user:pass@host:5432/db` |
| `DB_POOL_MAX` | Max concurrent database connections. | `10` |
| `DB_POOL_IDLE_TIMEOUT` | Time in ms before idle connections close. | `30000` |
| `DB_POOL_CONNECTION_TIMEOUT` | Time in ms before failing a database connection. | `2000` |

---

## 7. Product Service Communication Flow
The Cart Service utilizes a dedicated `ProductClient` ([product.client.ts](file:///t:/Projects/CMart/cart-service/src/client/product.client.ts)) to communicate with the Product Service:
- **Encapsulated Axios Calls**: No direct HTTP/API calls are performed inside core business logic classes.
- **Stock & Details Validations**: Before adding/updating items, `ProductClient` is called to fetch availability (`checkAvailability`) and prices (`getProductPrice`).
- **Transient Data Mapping**: Database tables do not duplicate product names. The service layer fetches name details at runtime and populates a transient `name` property on `CartItem` before JSON serialization.
- **Failure Mapping**: HTTP failures from the Product Service are caught and translated to shared errors (`NotFoundError`, `ValidationError`, or `InternalServerError`) with detailed warning logs.

---

## 8. Authentication Flow
Endpoints are protected using the shared platform JWT verification middleware:
- **Shared Middleware Integration**: `authMiddleware` is imported from `shared` and registered globally on the cart router.
- **Strict User Isolation**: All cart operations read `userId` from the decoded token payload (`req.user!.id`). Users can only query, modify, or delete their own cart data; they have no path exposure to other users' carts.

---

## 9. Error Handling
Error handling is centralized using a global middleware pipeline:
- **Operational Exceptions**: Custom error classes (`ValidationError`, `NotFoundError`, `AuthenticationError`, `AuthorizationError`, `InternalServerError`) are imported from the `shared` module.
- **No Controller Duplication**: Controller routes do not serialize errors. Instead, they catch and delegate them directly via `next(error)`.
- **Global Serialization**: The global `errorHandler` ([error.middleware.ts](file:///t:/Projects/CMart/cart-service/src/middleware/error.middleware.ts)) intercepts errors, writes structured logs (info/warn/error level depending on the status code), and serializes standard JSON responses:
```json
{
  "success": false,
  "message": "Error details",
  "error": "Error details",
  "timestamp": "2026-07-13T11:35:00.000Z"
}
```

---

## 10. How to Run Locally

### 1. Install Workspace Dependencies
From the root workspace directory:
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the `cart-service` directory using the `.env.example` template.

### 3. Initialize Database Schema
Run the database schema script on your Supabase PostgreSQL instance:
```bash
# Execute cart-service/database/schema.sql in Supabase SQL editor
# Optionally run cart-service/database/seed.sql to populate test records
```

### 4. Run Service in Development Mode
To launch the hot-reloading development server:
```bash
npm run dev -w cart-service
```
By default, the server starts listening on port `3003`.

---

## 11. Testing Instructions

The service features Jest-based unit and integration tests.

### Execution
To build and verify the Cart Service:
```bash
npm run build -w cart-service
```

### Unit Tests
Unit tests mock repository structures and Product Service calls.
- **Target File**: `cart-service/test/unit/cart.service.spec.ts`
- **Scope**: Tests quantity updates, pricing calculations, stock checking boundaries, and active status checks.

### Integration Tests
Integration tests spin up a mock application router using `supertest`.
- **Target File**: `cart-service/test/integration/cart.api.spec.ts`
- **Scope**: Tests endpoint validation schemas, headers, authentication checks, success payloads, and failure response formatting.
