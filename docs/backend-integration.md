# CMart Backend Integrations, Testing, & Production Roadmap

This document outlines our shared cross-cutting modules, configurations strategy, testing methodologies, and future roadmaps for production scaling.

---

## 🛠️ 1. The Shared Module Capabilities

The [shared](file:///t:/Projects/CMart/shared) folder is registered as an NPM workspace, building compiled JavaScript modules that are shared across all five microservices:

1. **Structured Logging:** Centralized Winston loggers wrapping JSON schemas and fetching request contexts.
2. **Context Correlation:** `AsyncLocalStorage` request-context storage preserving `requestId` and `correlationId` tracing across async execution threads.
3. **Unified Exception Handler:** Express `errorHandler` mapping database/application exceptions to standardized HTTP status codes and error payloads.
4. **Resiliency Engine:** Custom REST `ApiClient` classes integrating:
   - Stateful Circuit Breaking (CLOSED, OPEN, HALF_OPEN states).
   - Jittered Exponential Backoff Retries.
5. **Security Middlewares:** Standardized JWT verification (`authMiddleware`) and role-based access checking (`requireRole`).

---

## ⚙️ 2. Configuration & Secrets Strategy

### Configuration Management
Each service contains a standard [config](file:///t:/Projects/CMart/order-service/src/config) directory reading environment variables into strongly-typed structures validated at startup:

```typescript
// Config validation schema
const envSchema = {
  PORT: { type: 'number', required: false, default: 3004 },
  DATABASE_URL: { type: 'string', required: true },
  JWT_SECRET: { type: 'string', required: false, default: 'cmart-default-secret-key-1234567890-xyz' }
} as const;
```

### Secrets Management Preparation
- In **Development/Test:** Loaded from local git-ignored `.env` files.
- In **Production:** Environment variables will be injected dynamically at container startup using **AWS Secrets Manager** or **HashiCorp Vault**, avoiding plain-text secrets in source repositories or configuration files.

---

## 🧪 3. Verification & Testing Strategy

CMart has a two-tiered testing model:

### 1. Isolated Unit & Integration Tests
Each microservice folder (e.g. [payment-service/src/tests](file:///t:/Projects/CMart/payment-service/src/tests)) has its own Jest configurations running unit and mock API tests:
- **Services mocking:** Downstream API calls are stubbed using Mock HTTP response matrices to isolate code validation.
- **Run command:**
  ```bash
  npm test -w <service-name>
  ```

### 2. End-to-End Integration Suite
Located in [integration-tests](file:///t:/Projects/CMart/integration-tests), E2E test cases execute dynamic registrations, catalog browses, cart edits, and checkouts against active services:
- **Card decline simulation:** Supplying a card ending in `9999` verifies that the payment state resolves to `FAILED` and order state transitions to `PAYMENT_FAILED`.
- **Run command:**
  ```bash
  cd integration-tests && npm test
  ```

---

## 🗺️ 4. Future Cloud-Native Production Roadmap

To scale CMart in production environments, the following roadmaps are established:

### 1. Infrastructure & Orchestration (DevOps)
- **Containerization:** Create standard multi-stage `Dockerfile` manifests for microservices.
- **Docker Compose:** Local orchestration configs defining Postgres instances, Redis cache keys, and workspace links.
- **AWS ECS (Fargate) & ECR:** Container images pushed to Amazon Elastic Container Registry (ECR) and run as serverless tasks in Amazon ECS behind an **Application Load Balancer (ALB)**.
- **Amazon RDS:** PostgreSQL databases migrated to AWS RDS with multi-AZ replication.

### 2. Observability & Distributed Tracing
- **OpenTelemetry & Jaeger:** Migrate custom correlation wrappers to OpenTelemetry Node SDKs, capturing database queries and HTTP spans.
- **Prometheus & Grafana:** Expose service metrics (latency, HTTP throughput, memory) to Prometheus scrapers, rendering dashboards in Grafana.
- **Loki & Grafana Agent:** Ingest stdout JSON logs into Loki for centralized indexing and searching.

### 3. CI/CD Pipelines (GitHub Actions)
- Lint checks, TypeScript compilation, and Unit test execution.
- Build Docker images, check vulnerabilities, and deploy to ECS environments using Terraform infra configurations.
