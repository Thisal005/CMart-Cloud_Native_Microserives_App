/**
 * Shared constants across microservices
 */
export declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED"
}
export declare const HttpStatus: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly ACCEPTED: 202;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export type HttpStatusType = typeof HttpStatus[keyof typeof HttpStatus];
