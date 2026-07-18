# CMart - Running the Services Guide

This guide provides step-by-step instructions on how to configure, build, and run the CMart microservices platform either concurrently (recommended for local development) or individually.

---

## 🛠️ 1. Prerequisites

Before running the services, ensure you have the following installed on your system:
- **Node.js:** version `v18.x` or higher
- **npm:** version `v9.x` or higher
- **PostgreSQL Database:** (e.g., Supabase or a local PostgreSQL instance). 
  - Note: Services requiring a database (`auth-service`, `cart-service`, `order-service`, and `payment-service`) expect a standard PostgreSQL connection URI.

---

## 📦 2. Initial Setup & Compilation

CMart uses **npm workspaces** to manage the mono-repository. The `shared` library contains common utilities (loggers, exception handlers, REST clients, DTOs) and must be built before any service can run.

### Step 1: Install Workspace Dependencies
From the repository root directory, run:
```bash
npm run install-all
```
*This command runs `npm install` across the root workspace and symlinks all packages.*

### Step 2: Build the Shared Module
The shared library must be compiled into JavaScript:
```bash
npm run build -w shared
```

---

## ⚙️ 3. Environment Configurations (`.env`)

Each service maintains its own isolated environment configurations. You must ensure that the `.env` file exists in each service folder with the correct configurations. Below is an overview of default ports and database requirements:

| Microservice | Default Port | Database Required? | Database Table Auto-Migration |
| :--- | :---: | :---: | :---: |
| **Auth Service** | `3001` | **Yes** | Yes (programmatic on startup) |
| **Product Service** | `3002` | **No** (In-memory mock) | N/A |
| **Cart Service** | `3003` | **Yes** | Yes (programmatic on startup) |
| **Order Service** | `3004` | **Yes** | Yes (programmatic on startup) |
| **Payment Service** | `3005` | **Yes** | Yes (programmatic on startup) |

### Database Configuration
For services requiring a database, configure the `DATABASE_URL` in the respective service `.env` file:
```env
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<dbname>
```
*Note: If `DATABASE_URL` is omitted, some services (like Cart, Order, and Payment) will start in offline/mock mode for testing, but functionality will be limited.*

---

## 🚀 4. Running All Services Concurrently (Recommended)

To spin up the entire microservices mesh at once, run the following command from the root directory:
```bash
npm start
```

This runs `concurrently` to start all five services under their development configurations:
* 🟨 **Auth Service:** `http://localhost:3001`
* 🟦 **Product Service:** `http://localhost:3002`
* 🟩 **Cart Service:** `http://localhost:3003`
* 🟪 **Order Service:** `http://localhost:3004`
* 🟦 **Payment Service:** `http://localhost:3005`

---

## 🏃 5. Running Services Individually

If you are debugging or only developing a single service, you can run services individually using npm workspace commands from the root directory.

### 🔑 Auth Service
Manages user authentication, session control, and JWT generation.
* **Run Command:**
  ```bash
  npm run dev -w auth-service
  ```
* **Port:** `3001`
* **Migrations Command (Optional / Manual):**
  ```bash
  npm run migration:run -w auth-service
  ```

### 📦 Product Service
Manages product listings, pricing, and catalog search. Runs in-memory.
* **Run Command:**
  ```bash
  npm run dev -w product-service
  ```
* **Port:** `3002`

### 🛒 Cart Service
Manages active customer shopping baskets and quantities.
* **Run Command:**
  ```bash
  npm run dev -w cart-service
  ```
* **Port:** `3003`
* **Migrations Command (Optional / Manual):**
  ```bash
  npm run migration:run -w cart-service
  ```

### 📝 Order Service
Orchestrates checkouts, manages order state transitions, and creates snapshots.
* **Run Command:**
  ```bash
  npm run dev -w order-service
  ```
* **Port:** `3004`
* **Migrations Command (Optional / Manual):**
  ```bash
  npm run migration:run -w order-service
  ```

### 💳 Payment Service
Handles transactions, logs charges, and mocks payment gateway interactions.
* **Run Command:**
  ```bash
  npm run dev -w payment-service
  ```
* **Port:** `3005`

---

## 🗄️ 6. Database Migrations

TypeORM migrations are designed to run **automatically on startup** for the `auth-service`, `cart-service`, `order-service`, and `payment-service` if the `DATABASE_URL` environment variable is defined.

If you ever need to manually run or revert migrations, use the workspace script commands:
```bash
# Run migrations for a specific service
npm run migration:run -w <service-folder-name>

# Revert migrations for a specific service
npm run migration:revert -w <service-folder-name>
```

---

## 🧪 7. Verifying the Deployment

Once the services are running, you can verify that they are running and integrating properly.

### Quick E2E Verification Script
Run the pre-configured Node E2E verification script from the root directory:
```bash
node verify.js
```
This script will programmatically hit all services sequentially:
1. Register a test user
2. Log the user in and retrieve JWT token
3. Query the product catalog
4. Add items to the cart
5. Place an order
6. Make a mock payment

### Full Integration Test Suite
CMart includes a complete suite of integration tests in the `integration-tests` folder.
To run these tests:
1. Navigate to the tests directory:
   ```bash
   cd integration-tests
   ```
2. Install test dependencies:
   ```bash
   npm install
   ```
3. Execute the tests:
   ```bash
   npm test
   ```
