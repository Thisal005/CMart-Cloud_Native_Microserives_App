import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import http from 'http';
import https from 'https';
import { getRequestContext } from '../utils/request-context';
import { ResiliencePolicy, ResilienceOptions } from './resilience';
import { NotFoundError, ValidationError, AuthenticationError, AuthorizationError, InternalServerError } from '../errors';

// Standard connection pooling configurations
const keepAliveHttpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
});

const keepAliveHttpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
});

export interface ApiClientConfig {
  baseUrl: string;
  serviceName: string;
  defaultTimeout?: number;
  retryCount?: number;
  retryDelay?: number;
}

export class ApiClient {
  protected axiosInstance: AxiosInstance;
  protected serviceName: string;
  protected config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.serviceName = config.serviceName;
    this.config = config;

    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.defaultTimeout || 5000,
      httpAgent: keepAliveHttpAgent,
      httpsAgent: keepAliveHttpsAgent,
    });

    this.initializeInterceptors();
  }

  /**
   * Sets up request and response interceptors for header propagation and error mapping.
   */
  private initializeInterceptors() {
    // Request Interceptor: Automatic header propagation from RequestContext
    this.axiosInstance.interceptors.request.use(
      (axiosConfig) => {
        const context = getRequestContext();

        if (context) {
          // Downstream Request Propagation
          if (context.token) {
            axiosConfig.headers['Authorization'] = `Bearer ${context.token}`;
          }
          if (context.requestId) {
            axiosConfig.headers['x-request-id'] = context.requestId;
          }
          if (context.correlationId) {
            axiosConfig.headers['x-correlation-id'] = context.correlationId;
          }
          if (context.userId) {
            axiosConfig.headers['x-user-id'] = context.userId;
          }

          // Tracing Headers (Prepare Only)
          // Standard distributed tracing headers (e.g. W3C Trace Context, Zipkin B3)
          // axiosConfig.headers['traceparent'] = `00-${context.correlationId}-0000000000000000-01`;
          // axiosConfig.headers['x-b3-traceid'] = context.correlationId;
          // axiosConfig.headers['x-b3-spanid'] = context.requestId;
        }

        return axiosConfig;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Performs an HTTP request wrapped with resilience policies and standardized error mapping.
   */
  protected async request<T = any>(
    axiosConfig: AxiosRequestConfig,
    resilienceOptions?: ResilienceOptions
  ): Promise<T> {
    const operationName = `${this.serviceName}:${axiosConfig.method || 'GET'}:${axiosConfig.url}`;

    // Apply config-level retry options if none provided
    const mergedResilienceOptions: ResilienceOptions = {
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        cooldownPeriodMs: 10000,
      },
      retry: {
        enabled: (this.config.retryCount || 0) > 0,
        maxRetries: this.config.retryCount,
        backoffMs: this.config.retryDelay,
        exponential: true,
      },
      ...resilienceOptions,
    };

    try {
      const response = await ResiliencePolicy.execute<AxiosResponse<any>>(
        operationName,
        () => this.axiosInstance.request<any>(axiosConfig),
        mergedResilienceOptions
      );
      // Auto-unpack standardized CMart response body wrapper if present
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      this.handleError(error, operationName);
    }
  }

  /**
   * Centralized Axios exception mapping to standard shared application errors.
   */
  private handleError(error: any, operationName: string): never {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;
      const message = responseData?.error || responseData?.message || error.message;

      if (status === 400) {
        throw new ValidationError(`Validation failed from downstream: ${message}`, responseData?.details || responseData?.errors);
      }
      if (status === 401) {
        throw new AuthenticationError(`Authentication failed from downstream: ${message}`);
      }
      if (status === 403) {
        throw new AuthorizationError(`Authorization failed from downstream: ${message}`);
      }
      if (status === 404) {
        throw new NotFoundError(`Resource not found from downstream: ${message}`);
      }

      throw new InternalServerError(
        `Downstream service returned error status ${status} during ${operationName}. Details: ${message}`
      );
    }

    throw new InternalServerError(
      `Downstream service communication failure during ${operationName}: ${error.message}`
    );
  }
}
