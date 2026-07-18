# Global Zustand Store (`src/store`)

This folder contains global client-state stores managed by **Zustand**.

## Examples

- `useCartStore.ts` - Local ephemeral cart item tracking before checkout syncing.
- `useAuthStore.ts` - Ephemeral user session state, login status, and user profile cache.
- `useUIStore.ts` - Layout specific states (sidebar visibility, global search overlays).

## Guidelines

- Use Zustand for client-side ephemeral state.
- Keep server-sourced or cached data in **TanStack Query** to avoid synchronization and caching headaches.
- Enable DevTools and persist options where appropriate (e.g. persisting active sessions).
