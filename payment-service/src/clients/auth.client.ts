import axios from 'axios';
import { NotFoundError, ValidationError, InternalServerError, AuthenticationError } from 'shared';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export class AuthClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.authServiceUrl;
  }

  /**
   * Validate user identity by checking JWT token.
   */
  public async validateToken(token: string): Promise<{ valid: boolean; user: UserDto }> {
    const startTime = Date.now();
    logger.info('External request started', { service: 'AuthService', operation: 'validateToken' });
    try {
      const response = await axios.post<any>(
        `${this.baseUrl}/api/auth/validate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        }
      );
      const duration = Date.now() - startTime;
      logger.info('External request successful', { service: 'AuthService', operation: 'validateToken', duration, success: true });
      return response.data.data;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error('External request failed', error, { service: 'AuthService', operation: 'validateToken', duration, success: false });
      this.handleError(error, 'validating authentication token');
    }
  }

  /**
   * Retrieve current user profile details.
   */
  public async getProfile(token: string): Promise<UserDto> {
    const startTime = Date.now();
    logger.info('External request started', { service: 'AuthService', operation: 'getProfile' });
    try {
      const response = await axios.get<any>(`${this.baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      const duration = Date.now() - startTime;
      logger.info('External request successful', { service: 'AuthService', operation: 'getProfile', duration, success: true });
      return response.data.data;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error('External request failed', error, { service: 'AuthService', operation: 'getProfile', duration, success: false });
      this.handleError(error, 'retrieving user profile');
    }
  }

  /**
   * Maps Axios exceptions to standard shared application error structures.
   */
  private handleError(error: any, action: string): never {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || error.response.data?.message || error.message;

      logger.warn(`Auth client error during ${action}: [Status ${status}] ${message}`, {
        service: 'AuthService',
        action,
        status,
      });

      if (status === 401) {
        throw new AuthenticationError(`Unauthorized: ${message}`);
      }
      if (status === 404) {
        throw new NotFoundError(`Auth resource not found: ${message}`);
      }
      if (status === 400) {
        throw new ValidationError(`Auth validation failed: ${message}`);
      }
      throw new InternalServerError(`Auth Service returned unexpected status ${status} during ${action}`);
    }

    logger.error(`Auth client communication failure during ${action}: ${error.message}`, error, {
      service: 'AuthService',
      action,
    });
    throw new InternalServerError(`Failed to communicate with Auth Service during ${action}`);
  }
}
