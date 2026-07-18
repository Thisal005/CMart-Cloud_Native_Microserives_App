# Providers Folder (`src/providers`)

This folder houses React context providers that wrap the entire application or major pages.

## Installed Providers

- `ThemeProvider`: Wraps the app to support dark, light, and system theme modes.
- `QueryProvider`: Configures the React Query (`@tanstack/react-query`) Client and loads React Query Devtools.

## Guidelines

- All providers should be declared with the `"use client"` directive since they hold Client context.
- Providers are imported and injected into the Root Layout (`src/app/layout.tsx`).
