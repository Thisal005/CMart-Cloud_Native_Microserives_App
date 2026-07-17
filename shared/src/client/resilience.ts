import { InternalServerError } from '../errors';

export interface ResilienceOptions {
  circuitBreaker?: {
    enabled: boolean;
    failureThreshold?: number;
    cooldownPeriodMs?: number;
  };
  retry?: {
    enabled: boolean;
    maxRetries?: number;
    backoffMs?: number;
    exponential?: boolean;
  };
  bulkhead?: {
    enabled: boolean;
    maxConcurrentCalls?: number;
    maxQueueSize?: number;
  };
  fallback?: {
    enabled: boolean;
    fallbackFn: (...args: any[]) => Promise<any>;
  };
}

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  lastFailureTime?: number;
}

export class ResiliencePolicy {
  private static circuits = new Map<string, CircuitBreakerState>();

  /**
   * Executes a given operation wrapped in structured resilience strategies.
   */
  public static async execute<T>(
    operationName: string,
    action: () => Promise<T>,
    options?: ResilienceOptions
  ): Promise<T> {
    const cbOptions = options?.circuitBreaker;
    const retryOptions = options?.retry;

    // 1. Circuit Breaker check
    if (cbOptions?.enabled) {
      const state = this.getCircuitState(operationName);
      if (state.state === CircuitState.OPEN) {
        const cooldown = cbOptions.cooldownPeriodMs ?? 10000;
        const now = Date.now();
        if (state.lastFailureTime && now - state.lastFailureTime > cooldown) {
          state.state = CircuitState.HALF_OPEN;
          this.circuits.set(operationName, state);
        } else {
          throw new InternalServerError(
            `Circuit breaker is OPEN for downstream operations at "${operationName}". Service is currently offline.`
          );
        }
      }
    }

    // 2. Retry policy logic
    try {
      let result: T;
      if (retryOptions?.enabled) {
        result = await this.executeWithRetry(action, retryOptions);
      } else {
        result = await action();
      }

      // If successful, reset circuit breaker
      if (cbOptions?.enabled) {
        const state = this.getCircuitState(operationName);
        if (state.state !== CircuitState.CLOSED) {
          state.state = CircuitState.CLOSED;
          state.failures = 0;
          this.circuits.set(operationName, state);
        }
      }

      return result;
    } catch (error: any) {
      // 3. Record failure in Circuit Breaker
      if (cbOptions?.enabled) {
        this.recordFailure(operationName, cbOptions);
      }

      // 4. Fallback execution if configured
      if (options?.fallback?.enabled) {
        return options.fallback.fallbackFn(error);
      }

      throw error;
    }
  }

  /**
   * Fetch current circuit state or initialize to CLOSED.
   */
  public static getCircuitState(operationName: string): CircuitBreakerState {
    let state = this.circuits.get(operationName);
    if (!state) {
      state = { state: CircuitState.CLOSED, failures: 0 };
      this.circuits.set(operationName, state);
    }
    return state;
  }

  /**
   * Reset all static circuit states (useful for testing).
   */
  public static resetCircuits(): void {
    this.circuits.clear();
  }

  private static recordFailure(
    operationName: string,
    cbOptions: NonNullable<ResilienceOptions['circuitBreaker']>
  ) {
    const state = this.getCircuitState(operationName);
    const threshold = cbOptions.failureThreshold ?? 5;

    state.failures++;
    state.lastFailureTime = Date.now();

    if (state.state === CircuitState.HALF_OPEN || state.failures >= threshold) {
      state.state = CircuitState.OPEN;
    }

    this.circuits.set(operationName, state);
  }

  private static async executeWithRetry<T>(
    action: () => Promise<T>,
    retryOptions: NonNullable<ResilienceOptions['retry']>
  ): Promise<T> {
    const maxRetries = retryOptions.maxRetries ?? 3;
    const backoffMs = retryOptions.backoffMs ?? 1000;
    const exponential = retryOptions.exponential ?? true;

    let attempt = 0;
    while (true) {
      try {
        return await action();
      } catch (error: any) {
        attempt++;
        if (attempt > maxRetries) {
          throw error;
        }

        // Do not retry on standard client errors (400, 401, 403, 404)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }

        const delay = exponential ? backoffMs * Math.pow(2, attempt - 1) : backoffMs;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}
