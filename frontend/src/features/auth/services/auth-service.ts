import { apiClient } from "@/services/api-client";
import { User } from "@/store/use-auth-store";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthResponseData {
  token: string;
  refreshToken: string;
  user: User;
}

export interface StandardApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<StandardApiResponse<AuthResponseData>> {
    const response = await apiClient.post<StandardApiResponse<AuthResponseData>>(
      "/auth/register",
      payload
    );
    return response.data;
  },

  async login(payload: LoginPayload): Promise<StandardApiResponse<AuthResponseData>> {
    const response = await apiClient.post<StandardApiResponse<AuthResponseData>>(
      "/auth/login",
      payload
    );
    return response.data;
  },

  async getProfile(): Promise<StandardApiResponse<User>> {
    const response = await apiClient.get<StandardApiResponse<User>>("/auth/me");
    return response.data;
  },

  async logout(refreshToken: string): Promise<StandardApiResponse<null>> {
    const response = await apiClient.post<StandardApiResponse<null>>("/auth/logout", {
      refreshToken,
    });
    return response.data;
  },

  async refreshToken(
    refreshToken: string
  ): Promise<StandardApiResponse<{ token: string; refreshToken: string }>> {
    const response = await apiClient.post<
      StandardApiResponse<{ token: string; refreshToken: string }>
    >("/auth/refresh-token", { refreshToken });
    return response.data;
  },
};
