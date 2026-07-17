# CMart Integration Testing Suite - Execution & CI Guide

This document describes the structure, execution configurations, mock parameters, and CI-friendly test reporting for the microservices integration testing suite.

---

## 🏗️ 1. Test Suite Scaffolding

The integration testing suite is located in the [integration-tests](file:///t:/Projects/CMart/integration-tests) directory and compiles down to run against active services:

- **Runner & Assertion Engine:** [Jest](https://jestjs.io/) using `ts-jest` for TypeScript compilation.
- **HTTP client:** [Axios](https://axios-http.com/) for making service-to-service REST requests.
- **Configurations:**
  - [package.json](file:///t:/Projects/CMart/integration-tests/package.json): Lists development dependencies and execution scripts.
  - [tsconfig.json](file:///t:/Projects/CMart/integration-tests/tsconfig.json): TypeScript compilation options.
  - [jest.config.js](file:///t:/Projects/CMart/integration-tests/jest.config.js): Jest configurations, test timeouts, matched files, and options.

---

## 🏃 2. Execution Instructions

### Step 1: Install Dependencies
Navigate to the integration tests directory and install dependencies:
```bash
cd integration-tests
npm install
```

### Step 2: Start backend microservices
Ensure all CMart backend microservices are up and running concurrently. You can boot them from the root directory using:
```bash
npm start
```

### Step 3: Run the Integration Tests
Execute the test runner:
```bash
npm test
```

---

## 🌐 3. Target Environment Configurations

Base URLs for the microservices can be overridden using environment variables in CI/CD pipelines.

| Service | Default URL | Environment Variable |
| :--- | :--- | :--- |
| **Auth Service** | `http://localhost:3001` | `AUTH_SERVICE_URL` |
| **Product Service** | `http://localhost:3002` | `PRODUCT_SERVICE_URL` |
| **Cart Service** | `http://localhost:3003` | `CART_SERVICE_URL` |
| **Order Service** | `http://localhost:3004` | `ORDER_SERVICE_URL` |
| **Payment Service** | `http://localhost:3005` | `PAYMENT_SERVICE_URL` |

### CI Run Command Example
```bash
AUTH_SERVICE_URL="http://auth:3001" PRODUCT_SERVICE_URL="http://product:3002" npm test
```

---

## 🧪 4. Integration Verification Matrix

| Workflow Step | Inbound Request | Validations performed | Downstream Dependency Checked | Expected HTTP Status |
| :--- | :--- | :--- | :--- | :--- |
| **Registration** | `POST /api/v1/auth/register` | Unique User creation. | Database write. | `201 Created` |
| **Login** | `POST /api/v1/auth/login` | Credentials validity check. | Token generation. | `200 OK` |
| **Catalog Query** | `GET /api/v1/products` | Retrieve active products. | In-memory catalog database. | `200 OK` |
| **Add To Cart** | `POST /api/v1/cart/items` | Item quantity, product status. | Product Service stock lookup. | `200 OK` |
| **Get Cart** | `GET /api/v1/cart` | Validate items list. | Product details resolving. | `200 OK` |
| **Checkout** | `POST /api/v1/orders` | Cart contents, stock limits. | Cart clearing, Product lookup. | `201 Created` |
| **Payment** | `POST /api/v1/payments` | Card decline, ownership checks. | Order state update (`PAID`/`FAILED`). | `200 OK` |

---

## 🛑 5. Failure & Isolated Mock Configurations

Where appropriate, dependencies are simulated using designated gateway payloads to avoid third-party provider calls:

1. **Card Declines simulation:**
   - Hitting `POST /api/v1/payments` with `cardNumber` ending in `9999` forces the Payment service mock gateway to issue a transaction status `FAILED`.
2. **Invalid Amount declines:**
   - Passing a transaction `amount` equal to `999.99` triggers decline simulation.
3. **Invalid Token rejection:**
   - Supplying a random string in authorization headers triggers validation failure (HTTP 401 Unauthorized) across all secure paths.
