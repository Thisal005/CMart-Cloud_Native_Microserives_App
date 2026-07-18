# Global Hooks Folder (`src/hooks`)

This folder contains reusable, stateful React hooks that are utilized across multiple pages or features.

## Typical Hooks

- `useLocalStorage.ts` - Sync state with browser local storage.
- `useMediaQuery.ts` - Track responsive screen sizes.
- `useDebounce.ts` - Debounce search input keystrokes.
- `useAuth.ts` - Quick access to current user and session status.

## Guidelines

- Avoid putting feature-specific API query hooks here (those belong in `src/features/<feature>/hooks`).
- Hooks here must be generic and reusable.
