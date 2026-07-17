/**
 * Standardized API Response structures for microservices
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  status: number;
  success: boolean;
  message: string;
  code: string;
  timestamp: string;
  requestId: string | null;
  details: any | null;
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

export class ApiResponseHelper {
  /**
   * Format a successful operation response
   */
  static success<T>(data: T, message?: string, req?: any): ApiResponse<T> {
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
  static error(message: string, errors?: any, req?: any): ApiResponse<null> {
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
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    totalItems: number,
    message?: string,
    req?: any
  ): PaginatedResponse<T> {
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
