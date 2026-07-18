# Services Folder (`src/services`)

This folder contains global network interaction services, API configuration clients, and wrappers.

## Core Files

- `api-client.ts` - Customized Axios client instance.

## Guidelines

- Write API clients with common interceptor support here (e.g. inject JWT token, attach correlation/request headers, handle unauthorized sessions globally).
- Feature-specific endpoints should consume these base clients inside their own `features/<name>/services` folder to keep domains separate.
