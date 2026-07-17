# CMart - Cloud-Native E-Commerce Microservices Platform

Welcome to **CMart**, a production-grade, highly resilient cloud-native e-commerce backend platform built using Node.js, Express, TypeScript, and TypeORM. 

This repository serves as a showcase of modern software engineering principles, distributed systems patterns, and microservice integration techniques.

---

## 🏗️ 1. Platform Overview

CMart is designed around a **decentralized microservices architecture** where each service manages its own domain boundaries, data models, and persistence layers.

### Technology Stack
- **Languages & Runtimes:** TypeScript, Node.js (v18+), ES2022
- **Web Framework:** Express.js
- **Persistence Layer:** PostgreSQL, TypeORM
- **Shared Library:** Standardized DTOs, custom exception handler middleware, Winston/AsyncLocalStorage logger.
- **Testing:** Jest, ts-jest, Supertest, Axios

### Architectural Design Principles
1. **Database per Service:** Avoids tight schema coupling. Databases are isolated, and services communicate exclusively via REST APIs.
2. **Resilient Communication:** Integrates exponential backoff retries and stateful circuit breaking to limit cascading failures.
3. **Observability First:** Propagates `requestId` and `correlationId` using Node's `AsyncLocalStorage` to enable distributed tracing.
4. **Idempotence & Safety:** Designed to support `Idempotency-Key` headers on non-idempotent endpoints (Checkout, Payments).

---

## 📦 2. Microservices Overview

The platform consists of five core domain services and a shared operational library:

| Microservice | Responsibility | Data Ownership |
| :--- | :--- | :--- |
| **[Auth Service](file:///t:/Projects/CMart/auth-service)** | User registration, authentication session control, JWT issuance, and role access checking. | Users, Refresh Tokens |
| **[Product Service](file:///t:/Projects/CMart/product-service)** | Manages product catalog inventory, active listings, and pricing constraints. | Product Catalog |
| **[Cart Service](file:///t:/Projects/CMart/cart-service)** | Manages user shopping carts, quantities, and price snapshots. | Cart items |
| **[Order Service](file:///t:/Projects/CMart/order-service)** | Manages checkouts, order item snapshot generation, and order state transition logs. | Orders, Order Items |
| **[Payment Service](file:///t:/Projects/CMart/payment-service)** | Interface for credit card charges, transaction ledgers, and mock gateway integrations. | Payment transactions |
| **[Shared Module](file:///t:/Projects/CMart/shared)** | Centralized logging, validation helpers, unified exception handlers, and resilient REST clients. | *Shared Utilities Code* |

---

## 📂 3. Repository Folder Structure

```
CMart/
├── auth-service/        # JWT Authentication, login, & user management
├── product-service/     # Product catalog & stock inventory listings
├── cart-service/        # User shopping session basket storage
├── order-service/       # Checkout orchestration & order snapshots
├── payment-service/     # Transaction ledger & gateway processor mock
├── shared/              # Centralized error handler, loggers, & API clients
├── integration-tests/   # E2E integration test suite and configs
└── docs/                # System architectural and contract documentation
```

---

## 🚀 4. Bootstrapping & Local Setup

### Step 1: Install root dependencies
```bash
npm run install-all
```

### Step 2: Build the Shared Module
```bash
npm run build -w shared
```

### Step 3: Run the Platform locally
Start all five microservices concurrently:
```bash
npm start
```
The services will be active on the following ports:
- **Auth Service:** `http://localhost:3001`
- **Product Service:** `http://localhost:3002`
- **Cart Service:** `http://localhost:3003`
- **Order Service:** `http://localhost:3004`
- **Payment Service:** `http://localhost:3005`

---

## 📚 5. Deep-Dive Documentation

For more in-depth architectural and operational guides, please refer to the following:
- **[Architecture Specification Guide](file:///t:/Projects/CMart/docs/architecture.md):** Deep-dive on database isolation, inter-service maps, and data ownership.
- **[API Contract Overview](file:///t:/Projects/CMart/docs/api-overview.md):** Detail request-response JSON shapes, authentication, and E2E checkout sequences.
- **[Integration & Platform Roadmap](file:///t:/Projects/CMart/docs/backend-integration.md):** Information on testing suites, shared module details, and the Kubernetes/AWS cloud roadmaps.
