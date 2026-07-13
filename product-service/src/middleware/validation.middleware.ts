import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'shared';
import { logger } from '../utils/logger';

export type ValidatorFunc = (data: any) => { error?: string; details?: Record<string, string> };

/**
 * Express middleware to validate the request body against a validator function.
 * Throws a ValidationError if the request payload is invalid.
 */
export function validateBody(validator: ValidatorFunc) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, details } = validator(req.body);
    if (error) {
      logger.warn('Validation Errors', { type: 'body', error, details, path: req.originalUrl });
      next(new ValidationError(error, details));
      return;
    }
    next();
  };
}

/**
 * Express middleware to validate query parameters against a validator function.
 * Throws a ValidationError if the request query is invalid.
 */
export function validateQuery(validator: ValidatorFunc) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, details } = validator(req.query);
    if (error) {
      logger.warn('Validation Errors', { type: 'query', error, details, path: req.originalUrl });
      next(new ValidationError(error, details));
      return;
    }
    next();
  };
}

/**
 * Validation rules for creating a product.
 */
export const validateCreateProductBody: ValidatorFunc = (body: any) => {
  const details: Record<string, string> = {};
  const { name, description, category, sku, price, stockQuantity, imageUrl, isActive } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    details.name = 'Name is required and must be a non-empty string';
  } else if (name.length > 255) {
    details.name = 'Name cannot exceed 255 characters';
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    details.description = 'Description must be a string';
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    details.category = 'Category is required and must be a non-empty string';
  } else if (category.length > 100) {
    details.category = 'Category cannot exceed 100 characters';
  }

  if (!sku || typeof sku !== 'string' || sku.trim().length === 0) {
    details.sku = 'SKU is required and must be a non-empty string';
  } else if (sku.length > 50) {
    details.sku = 'SKU cannot exceed 50 characters';
  }

  if (price === undefined || price === null) {
    details.price = 'Price is required';
  } else if (typeof price !== 'number' || isNaN(price) || price < 0) {
    details.price = 'Price must be a non-negative number';
  }

  if (stockQuantity === undefined || stockQuantity === null) {
    details.stockQuantity = 'Stock quantity is required';
  } else if (typeof stockQuantity !== 'number' || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
    details.stockQuantity = 'Stock quantity must be a non-negative integer';
  }

  if (imageUrl !== undefined && imageUrl !== null) {
    if (typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      details.imageUrl = 'Image URL must be a non-empty string';
    } else if (imageUrl.length > 2083) {
      details.imageUrl = 'Image URL cannot exceed 2083 characters';
    }
  }

  if (isActive !== undefined && isActive !== null && typeof isActive !== 'boolean') {
    details.isActive = 'IsActive must be a boolean value';
  }

  const hasErrors = Object.keys(details).length > 0;
  return {
    error: hasErrors ? 'Product creation request validation failed' : undefined,
    details: hasErrors ? details : undefined,
  };
};

/**
 * Validation rules for updating a product.
 */
export const validateUpdateProductBody: ValidatorFunc = (body: any) => {
  const details: Record<string, string> = {};
  const { name, description, category, sku, price, stockQuantity, imageUrl, isActive } = body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      details.name = 'Name must be a non-empty string';
    } else if (name.length > 255) {
      details.name = 'Name cannot exceed 255 characters';
    }
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    details.description = 'Description must be a string';
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim().length === 0) {
      details.category = 'Category must be a non-empty string';
    } else if (category.length > 100) {
      details.category = 'Category cannot exceed 100 characters';
    }
  }

  if (sku !== undefined) {
    if (typeof sku !== 'string' || sku.trim().length === 0) {
      details.sku = 'SKU must be a non-empty string';
    } else if (sku.length > 50) {
      details.sku = 'SKU cannot exceed 50 characters';
    }
  }

  if (price !== undefined) {
    if (typeof price !== 'number' || isNaN(price) || price < 0) {
      details.price = 'Price must be a non-negative number';
    }
  }

  if (stockQuantity !== undefined) {
    if (typeof stockQuantity !== 'number' || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
      details.stockQuantity = 'Stock quantity must be a non-negative integer';
    }
  }

  if (imageUrl !== undefined && imageUrl !== null) {
    if (typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      details.imageUrl = 'Image URL must be a non-empty string';
    } else if (imageUrl.length > 2083) {
      details.imageUrl = 'Image URL cannot exceed 2083 characters';
    }
  }

  if (isActive !== undefined && isActive !== null && typeof isActive !== 'boolean') {
    details.isActive = 'IsActive must be a boolean value';
  }

  const hasErrors = Object.keys(details).length > 0;
  return {
    error: hasErrors ? 'Product update request validation failed' : undefined,
    details: hasErrors ? details : undefined,
  };
};

/**
 * Validation rules for searching, pagination, and sorting queries.
 */
export const validateSearchQuery: ValidatorFunc = (query: any) => {
  const details: Record<string, string> = {};
  const { searchTerm, category, minPrice, maxPrice, isActive, page, limit, sortBy, sortOrder } = query;

  if (searchTerm !== undefined && typeof searchTerm !== 'string') {
    details.searchTerm = 'Search term must be a string';
  }

  if (category !== undefined && typeof category !== 'string') {
    details.category = 'Category must be a string';
  }

  if (minPrice !== undefined) {
    const parsedMinPrice = parseFloat(minPrice);
    if (isNaN(parsedMinPrice) || parsedMinPrice < 0) {
      details.minPrice = 'Min price must be a non-negative number';
    }
  }

  if (maxPrice !== undefined) {
    const parsedMaxPrice = parseFloat(maxPrice);
    if (isNaN(parsedMaxPrice) || parsedMaxPrice < 0) {
      details.maxPrice = 'Max price must be a non-negative number';
    }
  }

  if (isActive !== undefined) {
    if (isActive !== 'true' && isActive !== 'false' && typeof isActive !== 'boolean') {
      details.isActive = 'IsActive query must be "true", "false", or a boolean value';
    }
  }

  if (page !== undefined) {
    const parsedPage = parseInt(page, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      details.page = 'Page must be an integer greater than or equal to 1';
    }
  }

  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      details.limit = 'Limit must be an integer between 1 and 100';
    }
  }

  if (sortBy !== undefined) {
    const allowedSortKeys = ['name', 'price', 'createdAt'];
    if (!allowedSortKeys.includes(sortBy)) {
      details.sortBy = `Sort key must be one of: ${allowedSortKeys.join(', ')}`;
    }
  }

  if (sortOrder !== undefined) {
    const allowedSortOrders = ['ASC', 'DESC'];
    if (!allowedSortOrders.includes(sortOrder.toUpperCase())) {
      details.sortOrder = `Sort order must be one of: ${allowedSortOrders.join(', ')}`;
    }
  }

  const hasErrors = Object.keys(details).length > 0;
  return {
    error: hasErrors ? 'Product search request validation failed' : undefined,
    details: hasErrors ? details : undefined,
  };
};
