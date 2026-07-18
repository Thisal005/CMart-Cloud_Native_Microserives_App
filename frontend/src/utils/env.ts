/**
 * Helper flags to determine current execution runtime environments.
 */
export const envHelper = {
  isServer: typeof window === "undefined",
  isClient: typeof window !== "undefined",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
};
