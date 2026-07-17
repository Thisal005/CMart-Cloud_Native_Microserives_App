import { ApiClient } from 'shared';
import { config } from '../config';

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export class AuthClient extends ApiClient {
  constructor() {
    super({
      serviceName: 'AuthService',
      baseUrl: config.authServiceUrl,
      defaultTimeout: config.requestTimeout,
      retryCount: config.httpRetryCount,
      retryDelay: config.httpRetryDelay,
    });
  }

  /**
   * Validate user identity by checking JWT token.
   */
  public async validateToken(token: string): Promise<{ valid: boolean; user: UserDto }> {
    return this.request<{ valid: boolean; user: UserDto }>({
      url: '/api/v1/auth/validate',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Retrieve current user profile details.
   */
  public async getProfile(token: string): Promise<UserDto> {
    return this.request<UserDto>({
      url: '/api/v1/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
