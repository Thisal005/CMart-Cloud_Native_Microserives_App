import crypto from 'crypto';

/**
 * Generate a cryptographically secure random ID (hex string)
 * @param bytes Number of bytes of randomness (defaults to 16, resulting in a 32-char hex string)
 */
export const generateRandomId = (bytes: number = 16): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Format a date to standard readable format (YYYY-MM-DD HH:mm:ss)
 * @param date The date object, timestamp, or ISO string to format
 */
export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date');
  }
  return d.toISOString().replace('T', ' ').substring(0, 19);
};

/**
 * Extract the Bearer JWT token from an Authorization header
 * @param authHeader The raw Authorization header (e.g. "Bearer <token>")
 */
export const extractBearerToken = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7).trim();
};

/**
 * Safely parse a JSON string, returning a fallback value on failure
 * @param str The string to parse
 * @param fallback The fallback value if parsing fails
 */
export const safeJsonParse = <T = any>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
};
