import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url("NEXT_PUBLIC_API_BASE_URL must be a valid URL"),
  NEXT_PUBLIC_AUTH_SERVICE_URL: z.string().url("NEXT_PUBLIC_AUTH_SERVICE_URL must be a valid URL"),
  NEXT_PUBLIC_PRODUCT_SERVICE_URL: z
    .string()
    .url("NEXT_PUBLIC_PRODUCT_SERVICE_URL must be a valid URL"),
  NEXT_PUBLIC_CART_SERVICE_URL: z.string().url("NEXT_PUBLIC_CART_SERVICE_URL must be a valid URL"),
  NEXT_PUBLIC_ORDER_SERVICE_URL: z
    .string()
    .url("NEXT_PUBLIC_ORDER_SERVICE_URL must be a valid URL"),
  NEXT_PUBLIC_PAYMENT_SERVICE_URL: z
    .string()
    .url("NEXT_PUBLIC_PAYMENT_SERVICE_URL must be a valid URL"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1, "NEXT_PUBLIC_APP_NAME must be specified"),
});

// Next.js static resolution requires full environment references
const parseResult = envSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_AUTH_SERVICE_URL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
  NEXT_PUBLIC_PRODUCT_SERVICE_URL: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL,
  NEXT_PUBLIC_CART_SERVICE_URL: process.env.NEXT_PUBLIC_CART_SERVICE_URL,
  NEXT_PUBLIC_ORDER_SERVICE_URL: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL,
  NEXT_PUBLIC_PAYMENT_SERVICE_URL: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

if (!parseResult.success) {
  console.error("❌ Invalid environment variables:", parseResult.error.format());
  throw new Error("Invalid environment variables configured for the frontend application.");
}

export const env = parseResult.data;
export type Env = z.infer<typeof envSchema>;
