import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'shared';
import { OrderStatus } from '../model/order';
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

/**
 * Validation rules for creating an order (CreateOrderDto).
 * The body is optional — no required fields because the cart is
 * fetched server-side. We only validate optional field types.
 */
export const validateCreateOrderBody: ValidatorFunc = (body: any) => {
  const details: Record<string, string> = {};

  if (body.shippingAddress !== undefined && typeof body.shippingAddress !== 'string') {
    details.shippingAddress = 'shippingAddress must be a string';
  }

  if (body.notes !== undefined && typeof body.notes !== 'string') {
    details.notes = 'notes must be a string';
  }

  const hasErrors = Object.keys(details).length > 0;
  return {
    error: hasErrors ? 'Create order request validation failed' : undefined,
    details: hasErrors ? details : undefined,
  };
};

/**
 * Allowed status values for the update-status endpoint.
 */
const ALLOWED_STATUS_TRANSITIONS: OrderStatus[] = [
  OrderStatus.PAYMENT_PENDING,
  OrderStatus.PAID,
  OrderStatus.PAYMENT_FAILED,
  OrderStatus.PROCESSING,
  OrderStatus.CANCELLED,
  OrderStatus.COMPLETED,
];

/**
 * Validation rules for updating order status (UpdateOrderStatusDto).
 */
export const validateUpdateStatusBody: ValidatorFunc = (body: any) => {
  const details: Record<string, string> = {};

  if (!body.status || typeof body.status !== 'string' || body.status.trim().length === 0) {
    details.status = 'status is required and must be a non-empty string';
  } else if (!ALLOWED_STATUS_TRANSITIONS.includes(body.status as OrderStatus)) {
    details.status = `status must be one of: ${ALLOWED_STATUS_TRANSITIONS.join(', ')}`;
  }

  const hasErrors = Object.keys(details).length > 0;
  return {
    error: hasErrors ? 'Update order status validation failed' : undefined,
    details: hasErrors ? details : undefined,
  };
};

/**
 * Validation rules for get-orders query parameters.
 */
export const validateGetOrdersQuery: ValidatorFunc = (query: any) => {
  const details: Record<string, string> = {};
  const allStatuses = Object.values(OrderStatus);

  if (query.page !== undefined) {
    const page = parseInt(query.page, 10);
    if (isNaN(page) || page < 1) {
      details.page = 'page must be a positive integer';
    }
  }

  if (query.limit !== undefined) {
    const limit = parseInt(query.limit, 10);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      details.limit = 'limit must be an integer between 1 and 100';
    }
  }

  if (query.status !== undefined && !allStatuses.includes(query.status as OrderStatus)) {
    details.status = `status must be one of: ${allStatuses.join(', ')}`;
  }

  if (query.userId !== undefined) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(query.userId)) {
      details.userId = 'userId query parameter must be a valid UUID';
    }
  }

  const hasErrors = Object.keys(details).length > 0;
  return {
    error: hasErrors ? 'Get orders query validation failed' : undefined,
    details: hasErrors ? details : undefined,
  };
};
