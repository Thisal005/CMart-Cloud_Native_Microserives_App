# Types Folder (`src/types`)

This folder contains global TypeScript type definitions, interfaces, and schemas.

## Examples

- `api.d.ts` - Standard envelope structures for API responses.
- `user.ts` - Shared User interfaces.
- `index.ts` - Common barrel file exporting shared contracts.

## Guidelines

- Write interfaces instead of type declarations when possible to support declaration merging.
- Feature-specific types should remain local to their `features/<name>/types` folders.
