import { ValidatorFunc } from 'shared';

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
