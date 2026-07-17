import { ValidatorFunc } from 'shared';
import { OrderStatus } from '../models/order';

/**
 * Validation rules for creating an order (CreateOrderDto).
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
