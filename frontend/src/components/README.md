# Global Components Folder (`src/components`)

This folder contains reusable, presentational UI components that are shared globally across different parts of the application.

## Structure

- `/ui`: Contains low-level primitives (buttons, dialogs, dropdowns, etc.) from `shadcn/ui`.
- `/layout`: Global layout wrappers (header, footer, sidebar) that wrap pages.
- `/feedback`: Shared feedback components (loading states, skeletons, modal notifications).

## Guidelines

- Components here should not contain page-specific business logic or API consumption.
- They should receive data via props.
- Group related child elements together inside subfolders.
