"use strict";
/**
 * Standardized API Response structures for microservices
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseHelper = void 0;
class ApiResponseHelper {
    /**
     * Format a successful operation response
     */
    static success(data, message) {
        return {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Format an error response
     */
    static error(message, errors) {
        return {
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Format a successful paginated response
     */
    static paginated(data, page, limit, totalItems, message) {
        const totalPages = Math.ceil(totalItems / limit);
        return {
            success: true,
            message,
            data,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
            },
            timestamp: new Date().toISOString(),
        };
    }
}
exports.ApiResponseHelper = ApiResponseHelper;
