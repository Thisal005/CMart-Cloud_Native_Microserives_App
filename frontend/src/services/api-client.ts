import axios, { InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";

// Request configurations extending Axios interface for custom retries
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Refresh token concurrency tracking
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

// Resolve or reject requests in the queue
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach credentials and correlation IDs
apiClient.interceptors.request.use(
  (config) => {
    // Dynamic microservice routing based on prefix
    if (config.url) {
      if (config.url.startsWith("/auth")) {
        config.baseURL = env.NEXT_PUBLIC_AUTH_SERVICE_URL + "/api/v1";
      } else if (config.url.startsWith("/products")) {
        config.baseURL = env.NEXT_PUBLIC_PRODUCT_SERVICE_URL + "/api/v1";
      } else if (config.url.startsWith("/cart")) {
        config.baseURL = env.NEXT_PUBLIC_CART_SERVICE_URL + "/api/v1";
      } else if (config.url.startsWith("/orders")) {
        config.baseURL = env.NEXT_PUBLIC_ORDER_SERVICE_URL + "/api/v1";
      } else if (config.url.startsWith("/payments")) {
        config.baseURL = env.NEXT_PUBLIC_PAYMENT_SERVICE_URL + "/api/v1";
      }
    }

    // Inject request/correlation IDs matching backend distributed tracing
    if (!config.headers["X-Request-ID"]) {
      config.headers["X-Request-ID"] = crypto.randomUUID();
    }
    if (!config.headers["X-Correlation-ID"]) {
      config.headers["X-Correlation-ID"] = config.headers["X-Request-ID"];
    }

    // Bind Bearer token if located in client-side storage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error layouts and orchestrate token refreshing
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig;

    // Check if error is a 401 Unauthorized and request has not already been retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((_resolve, reject) => {
        // PREPARED REFRESH-TOKEN ARCHITECTURE SKELETON
        // Once auth integration details are defined:
        // authService.refreshToken()
        //   .then((newToken) => {
        //     localStorage.setItem("auth_token", newToken);
        //     apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        //     processQueue(null, newToken);
        //     resolve(apiClient(originalRequest));
        //   })
        //   .catch((refreshError) => {
        //     processQueue(refreshError, null);
        //     localStorage.removeItem("auth_token"); // logout user session
        //     reject(refreshError);
        //   })
        //   .finally(() => {
        //     isRefreshing = false;
        //   });

        // Mock rejection fallback until endpoint integration
        isRefreshing = false;
        processQueue(error, null);
        reject(error);
      });
    }

    let errorMessage =
      error.response?.data?.message || error.message || "An unexpected error occurred";
    const isNetworkOrTimeout =
      !error.response &&
      (error.message === "Network Error" ||
        error.code === "ECONNABORTED" ||
        error.message?.toLowerCase().includes("timeout"));

    if (isNetworkOrTimeout) {
      const url = originalRequest?.url || "";
      if (url.startsWith("/auth")) {
        errorMessage =
          "Auth Service connection timed out or is unreachable. Please verify it is running on port 3001.";
      } else if (url.startsWith("/products")) {
        errorMessage =
          "Product Service connection timed out or is unreachable. Please verify it is running on port 3002.";
      } else if (url.startsWith("/cart")) {
        errorMessage =
          "Cart Service connection timed out or is unreachable. Please verify it is running on port 3003.";
      } else if (url.startsWith("/orders")) {
        errorMessage =
          "Order Service connection timed out or is unreachable. Please verify it is running on port 3004.";
      } else if (url.startsWith("/payments")) {
        errorMessage =
          "Payment Service connection timed out or is unreachable. Please verify it is running on port 3005.";
      } else {
        errorMessage = "Connection timed out. Please verify that all backend services are online.";
      }
    }

    const customError = {
      message: errorMessage,
      status: error.response?.status,
      code: error.code || "UNKNOWN_ERROR",
      details: error.response?.data?.details || null,
    };

    console.error(
      `[API Error] [${customError.status || "Network"} - ${customError.code}]:`,
      customError.message
    );
    return Promise.reject(customError);
  }
);
