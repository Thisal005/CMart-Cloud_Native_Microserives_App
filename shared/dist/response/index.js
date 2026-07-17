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
    static success(data, message, req) {
        const requestId = typeof req === 'string' ? req : req?.requestId;
        return {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
            ...(requestId && { requestId }),
        };
    }
    /**
     * Format an error response
     */
    static error(message, errors, req) {
        const requestId = typeof req === 'string' ? req : req?.requestId;
        return {
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString(),
            ...(requestId && { requestId }),
        };
    }
    /**
     * Format a successful paginated response
     */
    static paginated(data, page, limit, totalItems, message, req) {
        const totalPages = Math.ceil(totalItems / limit);
        const requestId = typeof req === 'string' ? req : req?.requestId;
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
            ...(requestId && { requestId }),
        };
    }
}
exports.ApiResponseHelper = ApiResponseHelper;
