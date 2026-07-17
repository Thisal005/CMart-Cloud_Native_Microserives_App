# CMart API Communication & E2E Workflows

This document specifies the communication contracts, request-response layouts, authentication flows, error propagation models, and the E2E checkout journey.

---

## 🔒 1. API Communication Specifications

### Uniform Request Flow
- All REST APIs follow the versioned prefix structure: `/api/v1/`.
- Interactive requests must supply appropriate payload structures (JSON format).

### Standard Response Format
A successful API response returns:
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... }
}
```

### Authentication Header Propagation
Authentication is handled using stateless JWT (JSON Web Tokens). Secure endpoints require the token in the request header:
```http
Authorization: Bearer <JWT_Token>
```

---

## 🔄 2. E2E Checkout Workflow Sequence

The sequence diagram below visualizes the complete lifecycle: User Registration $\rightarrow$ Login $\rightarrow$ Adding items to cart $\rightarrow$ Checkout $\rightarrow$ Payment validation $\rightarrow$ Order status changes:

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Client / User
    participant Auth as Auth Service
    participant Prod as Product Service
    participant Cart as Cart Service
    participant Ord as Order Service
    participant Pay as Payment Service

    %% Registration & Login
    Buyer->>Auth: 1. POST /api/v1/auth/register (Credentials)
    Auth-->>Buyer: 201 Created (JWT Token)
    Buyer->>Auth: 2. POST /api/v1/auth/login
    Auth-->>Buyer: 200 OK (JWT Token)

    %% Browse & Add to Cart
    Buyer->>Prod: 3. GET /api/v1/products (Browse)
    Prod-->>Buyer: 200 OK (Product List)
    Buyer->>Cart: 4. POST /api/v1/cart/items (productId, quantity: 2)
    Cart->>Prod: 5. GET /api/v1/products/:id (Validate Stock)
    Prod-->>Cart: 200 OK (Product details)
    Cart-->>Buyer: 200 OK (Cart summary)

    %% Checkout
    Buyer->>Ord: 6. POST /api/v1/orders (Checkout)
    Ord->>Auth: 7. POST /api/v1/auth/validate (Token check)
    Auth-->>Ord: 200 OK (User metadata)
    Ord->>Cart: 8. GET /api/v1/cart (Pull cart items)
    Cart-->>Ord: 200 OK (Cart contents)
    Ord->>Cart: 9. DELETE /api/v1/cart (Clear Cart)
    Cart-->>Ord: 200 OK (Cart cleared)
    Ord-->>Buyer: 210 Created (Order details, status: PENDING)

    %% Payment
    Buyer->>Pay: 10. POST /api/v1/payments (orderId, CARD, amount)
    Pay->>Ord: 11. GET /api/v1/orders/:id (Validate order details)
    Ord-->>Pay: 200 OK (Order data)
    Pay->>Pay: 12. processPayment() (Mock Gateway)
    Pay->>Ord: 13. PATCH /api/v1/orders/:id/status (status: PAID)
    Ord-->>Pay: 200 OK (Order updated)
    Pay-->>Buyer: 201 Created (Payment SUCCESS)
```

---

## 🚫 3. Error Propagation Schema

All microservices capture exceptions globally using the shared `errorHandler` middleware. When a failure occurs, the server responds with a standardized nested JSON error model:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Order with ID db45f9f2-e0d8-4345-bd93-eb34fb828516 not found",
    "service": "order-service",
    "timestamp": "2026-07-17T15:10:04.125Z",
    "requestId": "e44d32a2-bd83-47c0-b490-70806edaf95f"
  }
}
```

- **Downstream Exception Interceptions:** Custom HTTP client layers map downstream errors (e.g. Cart service offline) into descriptive upstream error codes like `BAD_GATEWAY` or `SERVICE_UNAVAILABLE` rather than exposing raw node crashes.
