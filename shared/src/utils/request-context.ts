import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextData {
  requestId: string;
  correlationId: string;
  token?: string | null;
  userId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContextData>();

/**
 * Gets the current request context data, if active.
 */
export function getRequestContext(): RequestContextData | undefined {
  return requestContext.getStore();
}
