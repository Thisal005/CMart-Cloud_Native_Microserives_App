/**
 * Standardized API Response structures for microservices
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: any;
    timestamp: string;
    requestId?: string;
}
export interface PaginationMetadata {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
}
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    pagination: PaginationMetadata;
}
export declare class ApiResponseHelper {
    /**
     * Format a successful operation response
     */
    static success<T>(data: T, message?: string, req?: any): ApiResponse<T>;
    /**
     * Format an error response
     */
    static error(message: string, errors?: any, req?: any): ApiResponse<null>;
    /**
     * Format a successful paginated response
     */
    static paginated<T>(data: T[], page: number, limit: number, totalItems: number, message?: string, req?: any): PaginatedResponse<T>;
}
