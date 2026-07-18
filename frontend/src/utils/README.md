# Utils Folder (`src/utils`)

This folder contains pure utility helper functions.

## Examples

- `format.ts` - Functions for parsing currency (`formatCurrency`), processing dates (`formatDate`), and truncating text.
- `validation.ts` - Custom zod parsing or form validators.
- `storage.ts` - Local/Session storage API wrappers.

## Guidelines

- Utility functions should ideally be **pure functions** (same input always produces the same output).
- Write comprehensive unit tests for functions located in this folder.
