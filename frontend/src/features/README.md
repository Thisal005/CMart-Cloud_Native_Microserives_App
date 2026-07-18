# Domain Features Folder (`src/features`)

This folder contains domain-specific features. Each feature represents a cohesive, functional domain of the e-commerce application.

## Recommended Structure

Within each feature folder (e.g. `auth`, `products`, `cart`, `orders`, `payments`):

- `/components`: Feature-specific UI components (e.g., `ProductCard`, `CartItemRow`) that are not needed globally.
- `/hooks`: React Query custom hooks or internal hooks specific to this feature (e.g., `useProductDetails`, `useCheckoutFlow`).
- `/services`: Feature-specific API requests and integrations.
- `/store`: Feature-specific Zustand stores (if scope is restricted to this feature).
- `/types`: Domain models and schemas.

## Guidelines

- Keeps the code modular and co-located.
- Cross-feature dependencies should be minimal. If a component is used across multiple features, it should be promoted to the global `src/components` folder.
