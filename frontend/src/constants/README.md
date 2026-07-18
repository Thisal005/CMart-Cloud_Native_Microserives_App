# Constants Folder (`src/constants`)

This folder houses application constants.

## Examples

- `routes.ts` - Client and API path endpoints.
- `storage.ts` - LocalStorage / Cookies lookup keys.
- `defaults.ts` - Initial pagination settings or system defaults.

## Guidelines

- Do not store dynamic or secret variables here (use `.env` and `src/config/env.ts` instead).
- Use `const` variables rather than string literals to avoid magic string typos.
- Utilize `as const` on declarations to preserve literal types in TypeScript.
