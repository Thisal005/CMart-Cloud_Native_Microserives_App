# CMart Service Contracts

This document defines the canonical API contracts for the CMart cloud-native e-commerce platform.

It is intended for internal engineering use and should be treated as the source of truth for service-to-service integration. Public endpoints are versioned under `/api/v1/` and must remain backward compatible whenever possible.

## Shared Standards

### Base URL and Versioning

All service endpoints in this document are published under `/api/v1/`.

Versioning is required because microservices evolve independently. A stable versioned prefix allows one service to change its request and response shapes without breaking consumers that have not yet been updated.

### Standard Headers

All requests should send the following headers:

| Header | Required | Purpose |
| --- | --- | --- |
| `Content-Type: application/json` | Yes for requests with a body | Declares JSON request payloads. |
| `Accept: application/json` | Recommended | Ensures JSON responses. |
| `Authorization: Bearer <access-token>` | Yes for protected endpoints | Carries the JWT access token. |
| `X-Correlation-ID: <uuid>` | Recommended for all requests | Enables request tracing across services. |

### Standard Response Format

Successful responses should follow the shared API response shape:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {},
  "timestamp": "2026-07-09T12:00:00.000Z"
}
```

Paginated responses should include pagination metadata:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 0,
    "totalPages": 0
  },
  "timestamp": "2026-07-09T12:00:00.000Z"
}
```

Error responses should follow the shared module format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "fieldName": "Human readable validation message"
  },
  "timestamp": "2026-07-09T12:00:00.000Z"
}
```

### Design Principles

- Services communicate only through public APIs.
- Services must never access another service's database directly.
- Services remain loosely coupled and independently deployable.
- API contracts must preserve backward compatibility whenever possible.

---

# Auth Service

## Service Overview

The Auth Service is responsible for identity, authentication, and account lifecycle management.

It owns user identity records, role assignment, password verification, JWT issuance, and refresh token rotation.

It does not own catalog data, shopping cart data, orders, or payment data.

## Data Ownership

Auth Service owns:

- Users
- Roles
- Account status
- Access tokens
- Refresh tokens

Auth Service does not own:

- Products
- Cart items
- Orders
- Payments

## Versioning

Base path: `/api/v1/auth`

This service must keep the contract stable for all downstream consumers. If authentication claims or user profile fields need to change, a new version must be introduced instead of changing the meaning of existing fields in place.

## Public API Endpoints

| Method | Endpoint | Authentication | Role | Description |
| --- | --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | No | None | Create a new user account and issue access and refresh tokens. |
| `POST` | `/api/v1/auth/login` | No | None | Authenticate an existing user and issue new tokens. |
| `POST` | `/api/v1/auth/validate` | No | None | Validate an access token for other services or clients. |
| `GET` | `/api/v1/auth/me` | Yes | Any authenticated user | Return the authenticated user's profile. |
| `POST` | `/api/v1/auth/refresh-token` | No | None | Rotate a refresh token and issue new tokens. |
| `POST` | `/api/v1/auth/logout` | No | None | Revoke a refresh token and end the session. |

## Request Examples

### Register

```json
{
  "firstName": "Ava",
  "lastName": "Patel",
  "email": "ava.patel@cmart.example",
  "password": "Str0ngP@ssword!",
  "phoneNumber": "+1-555-0101",
  "role": "USER"
}
```

### Login

```json
{
  "email": "ava.patel@cmart.example",
  "password": "Str0ngP@ssword!"
}
```

### Validate Token

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Refresh Token

```json
{
  "refreshToken": "2f94d2c5c0c24c2b8d0b2f5d7a9d0fcbf0c7c0a0d3d44c17a3d5d5f0a8c2d4f1"
}
```

### Logout

```json
{
  "refreshToken": "2f94d2c5c0c24c2b8d0b2f5d7a9d0fcbf0c7c0a0d3d44c17a3d5d5f0a8c2d4f1"
}
```

## Response Examples

### Successful Register or Login

```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "2f94d2c5c0c24c2b8d0b2f5d7a9d0fcbf0c7c0a0d3d44c17a3d5d5f0a8c2d4f1",
    "user": {
      "id": "9c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9",
      "firstName": "Ava",
      "lastName": "Patel",
      "email": "ava.patel@cmart.example",
      "role": "USER",
      "status": "ACTIVE",
      "emailVerified": false
    }
  },
  "timestamp": "2026-07-09T12:00:00.000Z"
}
```

### Successful Token Validation

```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "valid": true,
    "user": {
      "id": "9c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9",
      "firstName": "Ava",
      "lastName": "Patel",
      "email": "ava.patel@cmart.example",
      "role": "USER",
      "status": "ACTIVE",
      "emailVerified": false
    }
  },
  "timestamp": "2026-07-09T12:00:00.000Z"
}
```

### Successful Profile Lookup

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "9c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9",
    "firstName": "Ava",
    "lastName": "Patel",
    "email": "ava.patel@cmart.example",
    "role": "USER",
    "status": "ACTIVE",
    "emailVerified": false
  },
  "timestamp": "2026-07-09T12:00:00.000Z"
}
```

## Error Responses

| Status Code | Error Type | Example Response |
| --- | --- | --- |
| `400` | `ValidationError` | `{"success":false,"message":"Validation failed","errors":{"email":"Email is required"},"timestamp":"2026-07-09T12:00:00.000Z"}` |
| `401` | `AuthenticationError` | `{"success":false,"message":"Authentication required","errors":{},"timestamp":"2026-07-09T12:00:00.000Z"}` |
| `403` | `AuthorizationError` | `{"success":false,"message":"You do not have permission to perform this action","errors":{},"timestamp":"2026-07-09T12:00:00.000Z"}` |
| `404` | `NotFoundError` | `{"success":false,"message":"User not found","errors":{},"timestamp":"2026-07-09T12:00:00.000Z"}` |
| `409` | `ConflictError` | `{"success":false,"message":"Email already exists","errors":{"email":"Email must be unique"},"timestamp":"2026-07-09T12:00:00.000Z"}` |

## Business Rules

- Email addresses must be unique.
- Passwords must be hashed before persistence and must never be returned in responses.
- Login must be rejected for inactive or suspended accounts.
- JWT access tokens are the primary authentication mechanism for protected requests.
- Refresh tokens must be rotated and revoked after use.
- User roles must be treated as privileged metadata and preserved in token claims.
- Protected endpoints require a valid Bearer token in the `Authorization` header.

## Internal Endpoints

These endpoints are used by other services for identity and token validation. They are not intended for browser clients.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/auth/validate` | Validate an access token and return the authenticated user context. |
| `GET` | `/api/v1/auth/me` | Resolve the current authenticated user profile for downstream workflows. |

## Future Consumers

Consumed by:

- Product Service
- Cart Service
- Order Service
- Payment Service

---

# Product Service

## Service Overview

The Product Service is responsible for the catalog domain.

It owns product records, product metadata, search and retrieval, pricing, inventory quantities, and the active/inactive lifecycle of catalog items.

It does not own user accounts, authentication state, shopping carts, orders, or payments.

## Data Ownership

Product Service owns:

- Products
- SKU values
- Catalog metadata
- Pricing
- Stock quantities
- Active/inactive product state

Product Service does not own:

- Users
- Roles
- Authentication tokens
- Cart items
- Orders
- Payments

## Versioning

Base path: `/api/v1/products`

This service must preserve backward compatibility for all consumer services that depend on catalog and inventory data. Version bumps are required if response fields, search filters, or product lifecycle semantics change in a breaking way.

## Public API Endpoints

| Method | Endpoint | Authentication | Role | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/products` | No | None | Search, filter, sort, and paginate the product catalog. |
| `GET` | `/api/v1/products/:id` | No | None | Retrieve a single product by id. |
| `POST` | `/api/v1/products` | Yes | `ADMIN` | Create a product. |
| `PUT` | `/api/v1/products/:id` | Yes | `ADMIN` | Update a product. |
| `DELETE` | `/api/v1/products/:id` | Yes | `ADMIN` | Soft delete a product. |

## Request Examples

### Search Products

```text
GET /api/v1/products?searchTerm=mouse&category=Electronics&minPrice=10&maxPrice=50&isActive=true&page=1&limit=20&sortBy=price&sortOrder=ASC
```

### Create Product

```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with silent clicks.",
  "category": "Electronics",
  "sku": "EL-MOUS-WIRE-111",
  "price": 25.0,
  "stockQuantity": 40,
  "imageUrl": "https://cdn.cmart.example/products/mouse.png",
  "isActive": true
}
```

### Update Product

```json
{
  "price": 22.5,
  "stockQuantity": 35,
  "isActive": true
}
```

## Response Examples

### Successful Product Search

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "4f3b1de8-1d5c-4e94-bf6f-39f7d3a0a7f1",
      "name": "Wireless Mouse",
      "description": "Ergonomic wireless mouse with silent clicks.",
      "category": "Electronics",
      "sku": "EL-MOUS-WIRE-111",
      "price": 25,
      "stockQuantity": 40,
      "imageUrl": "https://cdn.cmart.example/products/mouse.png",
      "isActive": true,
      "createdAt": "2026-07-09T12:00:00.000Z",
      "updatedAt": "2026-07-09T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 1,
    "totalPages": 1
  },
  "timestamp": "2026-07-09T12:00:00.000Z"
}
```

### Successful Product Lookup

```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": "4f3b1de8-1d5c-4e94-bf6f-39f7d3a0a7f1",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with silent clicks.",
    "category": "Electronics",
    "sku": "EL-MOUS-WIRE-111",
    "price": 25,
    "stockQuantity": 40,
    "imageUrl": "https://cdn.cmart.example/products/mouse.png",
    "isActive": true,
    "createdAt": "2026-07-09T12:00:00.000Z",
    "updatedAt": "2026-07-09T12:00:00.000Z"
  },
  "timestamp": "2026-07-09T12:00:00.000Z"
}
```

### Successful Create or Update

```json
{
  "success": true,
  "message": "Product saved successfully",
  "data": {
    "id": "4f3b1de8-1d5c-4e94-bf6f-39f7d3a0a7f1",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with silent clicks.",
    "category": "Electronics",
    "sku": "EL-MOUS-WIRE-111",
    "price": 22.5,
    "stockQuantity": 35,
    "imageUrl": "https://cdn.cmart.example/products/mouse.png",
    "isActive": true,
    "createdAt": "2026-07-09T12:00:00.000Z",
    "updatedAt": "2026-07-09T12:05:00.000Z"
  },
  "timestamp": "2026-07-09T12:05:00.000Z"
}
```

## Error Responses

| Status Code | Error Type | Example Response |
| --- | --- | --- |
| `400` | `ValidationError` | `{"success":false,"message":"Product creation request validation failed","errors":{"sku":"SKU is required and must be a non-empty string"},"timestamp":"2026-07-09T12:00:00.000Z"}` |
| `401` | `AuthenticationError` | `{"success":false,"message":"Authentication required","errors":{},"timestamp":"2026-07-09T12:00:00.000Z"}` |
| `403` | `AuthorizationError` | `{"success":false,"message":"You do not have permission to perform this action","errors":{},"timestamp":"2026-07-09T12:00:00.000Z"}` |
| `404` | `NotFoundError` | `{"success":false,"message":"Product not found","errors":{},"timestamp":"2026-07-09T12:00:00.000Z"}` |
| `409` | `ConflictError` | `{"success":false,"message":"SKU already exists","errors":{"sku":"SKU must be unique"},"timestamp":"2026-07-09T12:00:00.000Z"}` |

## Business Rules

- SKU values must be unique.
- Product names, category values, and SKU values must be non-empty strings within their configured limits.
- Price must be non-negative.
- Stock quantity must be a non-negative integer.
- Only active products should be returned to public consumers by default.
- Deletion is soft delete only; catalog records should not be physically removed when downstream systems still reference them.
- Only `ADMIN` users can create, update, or delete products.
- Query-based catalog access must support filtering, sorting, and pagination.

## Internal Endpoints

These endpoints are intended for service-to-service catalog lookups. They are not meant for browser clients.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/products/:id` | Resolve a product by id for Cart and Order workflows. |
| `GET` | `/api/v1/products` | Resolve catalog and pricing data for service-side search and validation. |

## Future Consumers

Consumed by:

- Cart Service
- Order Service

---

## Security Requirements

The following security rules apply to all services in this platform:

- JWT authentication is required for protected endpoints.
- Authorization must be enforced by role, not by client-side assumptions.
- All requests and responses must use JSON unless a specific endpoint is explicitly documented otherwise.
- Services should accept and propagate `X-Correlation-ID` for distributed tracing.
- Credentials, access tokens, and refresh tokens must never be logged in plaintext.
- Service-to-service calls must use the same public API surface unless a dedicated internal route is explicitly documented.

## Notes for Implementers

- Public endpoints are the contract boundary. Internal code, repositories, and database schemas can change as long as the documented behavior stays stable.
- If a response shape must change, introduce a new API version instead of mutating the existing version in place.
- Consumers should rely on the fields documented here and ignore undocumented internal fields.
