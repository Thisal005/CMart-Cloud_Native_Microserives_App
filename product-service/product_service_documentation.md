# Product Service — Architectural & System Documentation

This document serves as the developer handbook and operations guide for the **Product Service** within the CMart cloud-native e-commerce microservices platform.

---

## 1. System Architecture

The Product Service follows a decoupled **Layered Architecture** using TypeORM for data mapping and Express for HTTP transport. It is built as a modular package inside an npm monorepo workspace.

```mermaid
graph TD
    Client["Client (Postman / Frontend / verify.js)"] -->|HTTP| Express["Express Router (app.ts)"]
    
    subgraph Express HTTP Layer
        Express --> Logger["Request Logger Middleware"]
        Express --> Val["Validation Middleware (Body / Query)"]
        Express --> Auth["Auth Middleware (JWT verification)"]
        Express --> Ctrl["ProductController"]
    end
    
    subgraph Business Logic Layer
        Ctrl --> Service["ProductService (product.service.ts)"]
        Service --> DTO["Product DTOs (product.dto.ts)"]
    end
    
    subgraph Data Access Layer (ORM)
        Service --> Repo["ProductRepository (product.repository.ts)"]
        Repo --> DataSource["TypeORM AppDataSource"]
        DataSource --> DB[("PostgreSQL (Supabase / AWS RDS)")]
    end
    
    subgraph Shared Monorepo Library
        Val --> SharedErr["Shared Custom Errors"]
        Auth --> SharedAuth["Shared JWT/Role Middlewares"]
        Ctrl --> SharedRes["Shared Response Helpers"]
        Service --> SharedLog["Shared Logger"]
    end
```

### Architectural Tenets
1. **Decoupled Business Logic**: The service layer (`ProductService`) is completely isolated from HTTP details. It takes standard DTOs and handles internal logic, making it easily mockable.
2. **Repository Encapsulation**: The repository layer isolates TypeORM querying, shielding the service layer from SQL query compilation.
3. **Shared Utility Reuse**: Key features like logging structure, authentication middleware, error classes, and response JSON formats are reused from the `shared` workspace package to ensure consistent formats across all microservices.

---

## 2. Folder Structure

The directory layout of `product-service` is organized as follows:

```
product-service/
├── database/            # SQL migration and seed scripts
│   ├── schema.sql       # PostgreSQL Table, constraint, trigger definitions
│   ├── seed.sql         # Seed catalog products script
│   └── rollback.sql     # Tear-down database schema script
├── src/                 # TypeScript source files
│   ├── config/          # Configurations & Database Data Source
│   │   ├── index.ts        # Parses and exports environment config
│   │   └── data-source.ts  # Configures TypeORM PostgreSQL DataSource
│   ├── controller/      # API Controllers (Express routing/handlers)
│   │   └── product.controller.ts  # Maps routes, handles validation, calls Service
│   ├── dto/             # Data Transfer Objects (DTOs) for Serialization
│   │   └── product.dto.ts  # Request, Response, and query parameters interfaces
│   ├── middleware/      # Global & Route-specific Express Middlewares
│   │   ├── auth.middleware.ts       # JWT and role validation middleware
│   │   ├── error.middleware.ts      # Global Express exception handler
│   │   ├── logging.middleware.ts    # Incoming HTTP request logging middleware
│   │   └── validation.middleware.ts # Body & Query parsing validation schemas
│   ├── migration/       # TypeORM Database Migrations (empty / kept in git)
│   ├── model/           # TypeORM Database Entities
│   │   └── product.ts      # Product entity class with schema mapping & validation hooks
│   ├── repository/      # Repository patterns wrapping Data Source
│   │   ├── product-repository.interface.ts  # Contract for Product queries
│   │   └── product.repository.ts            # TypeORM Product database adapter
│   ├── service/         # Isolated Core Business Logic Services
│   │   └── product.service.ts  # Core business flows & transaction mapping
│   ├── utils/           # Utilities
│   │   └── logger.ts       # Instantiates service-scoped logger from shared
│   ├── app.ts           # App setup, registration, global middlewares
│   └── server.ts        # Server entry point, DNS ordering, bootstrapper
├── test/                # Unit and Integration test specs
│   ├── unit/            # Service layer isolated unit tests
│   └── integration/     # Express route and schema integration tests
├── .env                 # Local variables config
├── .env.example         # Configuration template
├── package.json         # Scripts and project dependencies
└── tsconfig.json        # Service-level TS compiler configurations
```

---

## 3. Database Schema

The database model is declared in [schema.sql](file:///t:/Projects/CMart/product-service/database/schema.sql):

```sql
CREATE TABLE products (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255)    NOT NULL,
    description     TEXT,
    category        VARCHAR(100)    NOT NULL,
    sku             VARCHAR(50)     UNIQUE NOT NULL,
    price           NUMERIC(12, 2)  NOT NULL,
    stock_quantity  INTEGER         NOT NULL DEFAULT 0,
    image_url       VARCHAR(2083),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

### Constraints
* **Primary Key**: `id` uses UUID version 4.
* **Unique SKU**: Enforces that no two records contain the same `sku`.
* **Price boundary**: `CHECK (price >= 0)` ensures non-negative pricing.
* **Stock boundary**: `CHECK (stock_quantity >= 0)` prevents underflow.
* **Non-empty values**: `CHECK (length(trim(name)) > 0)` and `CHECK (length(trim(sku)) > 0)` prevent blank spacing entry bypasses.

### Indexing
* **Category and Active Status (`idx_products_active_category`)**: A composite B-tree partial index:
  `CREATE INDEX idx_products_active_category ON products (category, is_active) WHERE is_active = TRUE;`
  *Optimized for*: Catalog pages sorting active catalog items.
* **Price Sorts (`idx_products_active_price`)**: A partial index:
  `CREATE INDEX idx_products_active_price ON products (price) WHERE is_active = TRUE;`
  *Optimized for*: Price filters (low-to-high, high-to-low).
* **Text Lookup (`idx_products_name`)**: A B-tree index on name.

---

## 4. API Endpoints

All routes are mounted under the `/api/products` prefix:

| Method | Endpoint | Authorization | Validation Applied | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Query filters validation | Search/filter products catalog with sorting and pagination. |
| `GET` | `/api/products/:id` | Public | - | Fetch a single product by UUID. |
| `POST` | `/api/products` | Protected (`ADMIN`) | Body schema validation | Create a new product. |
| `PUT` | `/api/products/:id` | Protected (`ADMIN`) | Body schema validation | Update product fields. |
| `DELETE`| `/api/products/:id` | Protected (`ADMIN`) | - | Soft-delete a product (flags `isActive = false`). |

---

## 5. Validation and Business Rules

### Validation Rules

* **Creation Body**:
  - `name`, `category`, `sku` are required and must be non-empty strings.
  - `price` is required and must be a number `>= 0`.
  - `stockQuantity` is required and must be an integer `>= 0`.
  - `imageUrl` must be shorter than 2083 characters if provided.
* **Search / Query Parameters**:
  - `page`: Must be integer `>= 1`.
  - `limit`: Must be integer between `1` and `100`.
  - `sortBy`: Must be one of `name` | `price` | `createdAt`.
  - `sortOrder`: Must be `ASC` or `DESC` (case-insensitive).

### Business Rules

1. **SKU Uniqueness**: Rejects product creation or SKU modifications with `ConflictError (409)` if the target SKU is registered to another product.
2. **Logical Soft Delete**: Deleting a product keeps the database entry but flags `isActive = false`. This ensures referencing items in orders and transactions remains uncorrupted.
3. **Structured Event Logs**: All service-level modifications publish structured metadata JSON entries to stdout:
   - `Product Created` logs `productId`, `sku`, `category`, `price`.
   - `Product Updated` logs `productId`, `sku`, and `updatedFields` array.
   - `Product Deleted` logs `productId`.
   - `Validation Errors` log the validation type, message, details map, and request path.

---

## 6. Environment Variables Config

Configuration variables are parsed from `.env` inside `product-service/` directory:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3002` | Port on which the Express server listens. |
| `JWT_SECRET` | `your-jwt-secret-key-here` | Secret token string used to verify incoming bearer user auth. |
| `DATABASE_URL` | `postgresql://...` | Connection URI for the Supabase or RDS PostgreSQL instance. |
| `DB_POOL_MAX` | `10` | Maximum number of concurrent database connections in the pool. |
| `DB_POOL_IDLE_TIMEOUT` | `30000` | Milliseconds a connection can sit idle before closing. |
| `DB_POOL_CONNECTION_TIMEOUT`| `2000` | Milliseconds to wait before timing out a database connection request. |

---

## 7. How to Execute SQL on Supabase

To apply the database schema and populate seed data:

1. **Navigate to Supabase Dashboard**: Log in to your account and open the database project.
2. **Access SQL Editor**: Click on the **SQL Editor** tab (represented by a terminal icon `>_` on the left sidebar).
3. **Apply Database Schema**:
   - Create a new query by clicking **New Query**.
   - Copy the entire contents of [schema.sql](file:///t:/Projects/CMart/product-service/database/schema.sql) and paste it into the editor.
   - Click **Run** (or press `Ctrl + Enter` / `Cmd + Enter`). Ensure no errors are returned.
4. **Load Catalog Seed Data**:
   - Create another new query window.
   - Copy the contents of [seed.sql](file:///t:/Projects/CMart/product-service/database/seed.sql) and paste it.
   - Click **Run**.
5. **Revert Changes (Rollbacks)**:
   - If you need to completely clear the schema, copy and execute [rollback.sql](file:///t:/Projects/CMart/product-service/database/rollback.sql).

---

## 8. How to Run the Product Service Locally

### Prerequisites
* **Node.js** v18+ installed on your system.
* A running **PostgreSQL** instance (or Supabase URL) configured.

### Instructions

1. **Workspace Setup**:
   Open a terminal in the monorepo root directory (`CMart/`) and install dependencies:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy the example template file to `.env` inside `product-service`:
   ```bash
   cp product-service/.env.example product-service/.env
   ```
   Open the `.env` file and replace connection strings and secret tokens with your specific local credentials.

3. **Verify Compilation**:
   Build the service package to verify TypeScript compiles correctly:
   ```bash
   npm run build -w product-service
   ```

4. **Launch Product Service in Development Mode**:
   Launch the development server with hot-reloads using `ts-node-dev`:
   ```bash
   npm run dev -w product-service
   ```
   The service will boot up and print confirmation log logs:
   ```
   [2026-07-09T10:45:00.000Z] [INFO] [product-service] ✅ Database connection established
   [2026-07-09T10:45:00.005Z] [INFO] [product-service] ✅ Database migrations executed
   [2026-07-09T10:45:00.010Z] [INFO] [product-service] 🚀 Product Service running on port 3002
   ```
   You can verify connection status by hitting the health-check: `GET http://localhost:3002/health`
