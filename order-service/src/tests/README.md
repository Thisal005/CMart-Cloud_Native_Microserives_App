# Order Service Testing Suite

This directory contains the automated test suites for the **Order Service** of the CMart E-Commerce Platform.

Tests are split into two categories:
1. **Unit Tests**: Test the isolated business logic layers and validation patterns of the service, mocking database operations and outbound REST APIs.
2. **API Integration Tests**: Test the Express routes, HTTP parameter validators, and role-based authorization middleware using Supertest.

---

## 1. Test Architecture

The testing suite operates completely in-memory without requiring a running PostgreSQL database instance or active network connectivity to the downstream microservices (`auth-service`, `product-service`, `cart-service`). 

All external dependencies and database interactions are mocked using Jest:
- **TypeORM Repositories**: Mocked repository entities representing database schemas.
- **REST Clients**: Mocked clients for HTTP calls which encapsulate operational success/failure maps.
- **Middlewares**: Mounted locally alongside controllers inside in-memory Express testing instances.

---

## 2. Dependencies Setup

To run tests, Jest and TS-Jest devDependencies are required. Run the following command inside the `order-service` directory to install them:

```bash
npm install
```

---

## 3. How to Run Tests

From the `order-service` root folder, execute the following script runner:

```bash
# Run all tests
npm run test
```

---

## 4. Test Specifications

### Unit Tests (`test/unit/order.service.spec.ts`)
- **Checkout workflows**: Tests success paths (generating order summaries, items snapshots, and clearing cart post-checkout) and failure states (out-of-stock items, inactive items, empty product IDs, invalid quantities, empty carts).
- **Status Lifecycle State Machine**: Tests whitelisted state machine logic transitions (e.g. `PENDING -> PAYMENT_PENDING` is valid; `COMPLETED -> PENDING` throws validation exceptions).
- **Client Mock Integrations**: Asserts that connection errors or service downtime map correctly into the standardized HTTP exception classes of the `shared` module.

### API Integration Tests (`test/integration/order.api.spec.ts`)
- **Authentication**: Verifies route protection, ensuring missing/invalid JWT headers return HTTP 401.
- **Authorization / Roles**: Verifies role permissions, confirming non-admin calls to PATCH `/status` return HTTP 403, and standard users cannot fetch detail listings of other users' orders.
- **Parameters Validation**: Checks that UUID constraints on route path variables and query limits are validated, returning HTTP 400.
