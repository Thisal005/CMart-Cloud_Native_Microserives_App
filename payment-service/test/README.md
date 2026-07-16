# Payment Service Test Suite

This directory contains the unit and integration tests for the Payment Service.

## Environment Variables

The tests run with mocked configuration values and do not require connection to real external services or databases. However, for a production environment, the following variables must be configured:

- `JWT_SECRET`: Signature key for validating incoming authentication tokens.
- `ORDER_SERVICE_URL`: Base URL for calling the Order Service REST API.
- `AUTH_SERVICE_URL`: Base URL for calling the Auth Service REST API.
- `PORT`: Server listening port (default: `3005`).

---

## Suite Structure

1. **Unit Tests** (`test/unit/`):
   - `payment.service.spec.ts`: Tests core business validation rules, payment creation states, duplicate execution prevention, and error propagation.
   - `mock-gateway.spec.ts`: Tests mock gateway transaction generation, decline logic, card verification patterns, and timeouts.
   - `payment.repository.spec.ts`: Verifies TypeORM repository operations (finding by order, pagination, transaction reference matches, updates).
   - `external-clients.spec.ts`: Profiles REST network mocks using Axios for Auth and Order service interactions.

2. **Integration / API Tests** (`test/integration/`):
   - `payment.api.spec.ts`: Tests authenticated REST endpoints, ownership verification rules (requester matches order/payment owner), pagination, and refund authorization overrides.

---

## How to Run Tests

Ensure you have installed all node dependencies first:
```bash
npm install
```

### Run All Tests
To run all unit and integration test suites:
```bash
npm test
```

### Run Unit Tests only
To execute only unit tests:
```bash
npx jest test/unit
```

### Run Integration Tests only
To execute only API integration tests:
```bash
npx jest test/integration
```
