"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeJsonParse = exports.extractBearerToken = exports.formatDate = exports.generateRandomId = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generate a cryptographically secure random ID (hex string)
 * @param bytes Number of bytes of randomness (defaults to 16, resulting in a 32-char hex string)
 */
const generateRandomId = (bytes = 16) => {
    return crypto_1.default.randomBytes(bytes).toString('hex');
};
exports.generateRandomId = generateRandomId;
/**
 * Format a date to standard readable format (YYYY-MM-DD HH:mm:ss)
 * @param date The date object, timestamp, or ISO string to format
 */
const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        throw new Error('Invalid date');
    }
    return d.toISOString().replace('T', ' ').substring(0, 19);
};
exports.formatDate = formatDate;
/**
 * Extract the Bearer JWT token from an Authorization header
 * @param authHeader The raw Authorization header (e.g. "Bearer <token>")
 */
const extractBearerToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7).trim();
};
exports.extractBearerToken = extractBearerToken;
/**
 * Safely parse a JSON string, returning a fallback value on failure
 * @param str The string to parse
 * @param fallback The fallback value if parsing fails
 */
const safeJsonParse = (str, fallback) => {
    try {
        return JSON.parse(str);
    }
    catch {
        return fallback;
    }
};
exports.safeJsonParse = safeJsonParse;
