/**
 * Generate a cryptographically secure random ID (hex string)
 * @param bytes Number of bytes of randomness (defaults to 16, resulting in a 32-char hex string)
 */
export declare const generateRandomId: (bytes?: number) => string;
/**
 * Format a date to standard readable format (YYYY-MM-DD HH:mm:ss)
 * @param date The date object, timestamp, or ISO string to format
 */
export declare const formatDate: (date: Date | string | number) => string;
/**
 * Extract the Bearer JWT token from an Authorization header
 * @param authHeader The raw Authorization header (e.g. "Bearer <token>")
 */
export declare const extractBearerToken: (authHeader?: string) => string | null;
/**
 * Safely parse a JSON string, returning a fallback value on failure
 * @param str The string to parse
 * @param fallback The fallback value if parsing fails
 */
export declare const safeJsonParse: <T = any>(str: string, fallback: T) => T;
