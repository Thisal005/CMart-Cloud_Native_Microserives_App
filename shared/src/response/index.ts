/**
 * Standardized API Response structures for microservices
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  timestamp: string;
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
  static success<T>(data: T, message?: string): ApiResponse<T> {
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
  static error(message: string, errors?: any): ApiResponse<null> {
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
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    totalItems: number,
    message?: string
  ): PaginatedResponse<T> {
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
