import { ValidatorFunc } from 'shared';
import { PaymentStatus, PaymentMethod } from '../models/payment';

/**
 * Validation rules for processing/creating a payment (CreatePaymentRequestDto).
 */
export const validateCreatePaymentBody: ValidatorFunc = (body: any) => {
  const details: Record<string, string> = {};
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!body.orderId || typeof body.orderId !== 'string' || body.orderId.trim().length === 0) {
    details.orderId = 'orderId is required and must be a non-empty string';
  } else if (!uuidRegex.test(body.orderId)) {
    details.orderId = 'orderId must be a valid UUID';
  }

  const allowedMethods = Object.values(PaymentMethod);
  if (!body.paymentMethod || typeof body.paymentMethod !== 'string' || body.paymentMethod.trim().length === 0) {
    details.paymentMethod = 'paymentMethod is required and must be a non-empty string';
  } else if (!allowedMethods.includes(body.paymentMethod as PaymentMethod)) {
    details.paymentMethod = `paymentMethod must be one of: ${allowedMethods.join(', ')}`;
  }

  if (body.amount !== undefined) {
    if (typeof body.amount !== 'number') {
      details.amount = 'amount must be a number';
    } else if (body.amount <= 0) {
      details.amount = 'amount must be greater than zero';
    }
  }

  if (body.cardNumber !== undefined) {
    if (typeof body.cardNumber !== 'string' || body.cardNumber.trim().length === 0) {
      details.cardNumber = 'cardNumber must be a non-empty string';
    }
  }

  const hasErrors = Object.keys(details).length > 0;
  return {
    error: hasErrors ? 'Payment creation request validation failed' : undefined,
    details: hasErrors ? details : undefined,
  };
};

/**
 * Validation rules for get-user-payments query parameters.
 */
export const validateGetUserPaymentsQuery: ValidatorFunc = (query: any) => {
  const details: Record<string, string> = {};
  const allStatuses = Object.values(PaymentStatus);

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

  if (query.status !== undefined && !allStatuses.includes(query.status as PaymentStatus)) {
    details.status = `status must be one of: ${allStatuses.join(', ')}`;
  }

  const hasErrors = Object.keys(details).length > 0;
  return {
    error: hasErrors ? 'Get user payments query validation failed' : undefined,
    details: hasErrors ? details : undefined,
  };
};

/**
 * Validation rules for refunding a payment.
 */
export const validateRefundPaymentBody: ValidatorFunc = (body: any) => {
  const details: Record<string, string> = {};

  if (body.amount !== undefined) {
    if (typeof body.amount !== 'number') {
      details.amount = 'amount must be a number';
    } else if (body.amount <= 0) {
      details.amount = 'amount must be greater than zero';
    }
  }

  const hasErrors = Object.keys(details).length > 0;
  return {
    error: hasErrors ? 'Refund payment validation failed' : undefined,
    details: hasErrors ? details : undefined,
  };
};
