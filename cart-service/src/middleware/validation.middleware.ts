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
 * Validation rules for adding an item to the cart (AddToCartDto).
 */
export const validateAddToCartBody: ValidatorFunc = (body: any) => {
  const details: Record<string, string> = {};
  const { productId, quantity } = body;

  if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
    details.productId = 'ProductId is required and must be a non-empty string';
  }

  if (quantity === undefined || quantity === null) {
    details.quantity = 'Quantity is required';
  } else if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
    details.quantity = 'Quantity must be a positive integer';
  }

  const hasErrors = Object.keys(details).length > 0;
  return {
    error: hasErrors ? 'Add to cart request validation failed' : undefined,
    details: hasErrors ? details : undefined,
  };
};

/**
 * Validation rules for updating item quantity.
 */
export const validateUpdateQuantityBody: ValidatorFunc = (body: any) => {
  const details: Record<string, string> = {};
  const { quantity } = body;

  if (quantity === undefined || quantity === null) {
    details.quantity = 'Quantity is required';
  } else if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
    details.quantity = 'Quantity must be a positive integer';
  }

  const hasErrors = Object.keys(details).length > 0;
  return {
    error: hasErrors ? 'Update quantity request validation failed' : undefined,
    details: hasErrors ? details : undefined,
  };
};

/**
 * Express middleware to validate a UUID path parameter.
 * Throws a ValidationError if the path parameter is not a valid UUID.
 */
export function validateUuidParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!value || !uuidRegex.test(value)) {
      logger.warn(`Invalid UUID path parameter: ${paramName}=${value}`);
      next(new ValidationError(`Parameter ${paramName} must be a valid UUID`));
      return;
    }
    next();
  };
}
