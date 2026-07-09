# Product Service

Product Service handles product catalog retrieval, management, and stock updates for the CMart Cloud-Native E-Commerce Platform.

## Architecture and Folder Responsibilities

The directory structure mirrors the `auth-service` to maintain a consistent architecture across microservices.

```
product-service/
├── src/
│   ├── config/          # Configurations & Database Data Source
│   ├── controller/      # API Controllers (Express routing/handlers)
│   ├── dto/             # Data Transfer Objects (DTOs) for Serialization
│   ├── middleware/      # Global & Route-specific Express Middlewares
│   ├── migration/       # TypeORM Database Migrations
│   ├── model/           # TypeORM Database Entities
│   ├── repository/      # Repository patterns wrapping Data Source
│   ├── service/         # Isolated Core Business Logic Services
│   ├── utils/           # Shared Utilities (Logger, Errors)
│   ├── app.ts           # App setup, registration, global middlewares
│   └── server.ts        # Server entry point, DNS ordering, bootstrapper
├── .env                 # Environment variables configuration
├── .env.example         # Example configuration template
├── package.json         # Scripts and project dependencies
└── tsconfig.json        # TypeScript configuration extending root
```

### Folder Responsibilities Details

| Directory | Responsibility |
| :--- | :--- |
| `src/config` | Loads environment variables and initializes TypeORM `DataSource` configurations for PostgreSQL connection. |
| `src/controller` | Maps HTTP verbs/routes to controller methods, processes inputs, and delegates to service layers. |
| `src/dto` | Contains structural interfaces/classes mapping to API requests and payloads to decouple external API formats from database structures. |
| `src/middleware` | Reusable HTTP pipeline handlers such as authentication checks, request logging, and incoming body structural validation. |
| `src/migration` | Stores SQL/TypeScript migrations generated or written to track database version changes. |
| `src/model` | Holds database entity declarations decorated with TypeORM instructions. |
| `src/repository` | Houses DB access patterns to encapsulate database lookup queries. |
| `src/service` | Standardizes all business use-cases, validations, processing logic, and transaction management, keeping it free of Express details. |
| `src/utils` | Common helper functions, global error structures, and service-scoped logging wrapper. |
