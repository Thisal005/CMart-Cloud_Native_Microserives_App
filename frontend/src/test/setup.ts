// Set mock environment variables for frontend configuration validation
process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3000/api/v1";
process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = "http://localhost:3001";
process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL = "http://localhost:3002";
process.env.NEXT_PUBLIC_CART_SERVICE_URL = "http://localhost:3003";
process.env.NEXT_PUBLIC_ORDER_SERVICE_URL = "http://localhost:3004";
process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL = "http://localhost:3005";
process.env.NEXT_PUBLIC_APP_NAME = "CMart Testing";

import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./mocks/server";

// Intercept incoming endpoint calls using MSW mocks
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));

// Clean up handler state overrides between test iterations
afterEach(() => server.resetHandlers());

// Clean up connections entirely post suite run
afterAll(() => server.close());
