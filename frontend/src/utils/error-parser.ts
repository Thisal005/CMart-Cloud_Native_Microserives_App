import axios from "axios";

export interface ParsedError {
  message: string;
  status?: number;
  code: string;
  details?: Record<string, unknown> | Array<unknown> | null;
}

/**
 * Normalizes network and frontend exceptions into a standardized ParsedError structure.
 */
export function parseApiError(error: unknown): ParsedError {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    return {
      message:
        responseData?.message ||
        error.message ||
        "A network error occurred. Please verify your connection.",
      status: error.response?.status,
      code: responseData?.code || error.code || "NETWORK_ERROR",
      details: responseData?.details || null,
    };
  }

  // Handle client-side structured throws
  if (error && typeof error === "object" && "message" in error) {
    const errObj = error as Record<string, unknown>;
    return {
      message: typeof errObj.message === "string" ? errObj.message : "An unexpected error occurred",
      status: typeof errObj.status === "number" ? errObj.status : undefined,
      code: typeof errObj.code === "string" ? errObj.code : "CLIENT_ERROR",
      details: (errObj.details as ParsedError["details"]) || null,
    };
  }

  if (typeof error === "string") {
    return {
      message: error,
      code: "UNKNOWN_ERROR",
    };
  }

  return {
    message: "An unknown error occurred.",
    code: "UNKNOWN_ERROR",
  };
}
