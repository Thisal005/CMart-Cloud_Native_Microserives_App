import axios from 'axios';
import { AuthClient } from '../../clients/auth.client';
import { OrderClient } from '../../clients/order.client';
import { AuthenticationError, NotFoundError, InternalServerError, ValidationError } from 'shared';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('External Clients Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthClient', () => {
    let authClient: AuthClient;

    beforeEach(() => {
      authClient = new AuthClient();
    });

    it('should validate token successfully for a valid user', async () => {
      const mockUser = { id: 'user-123', username: 'john', email: 'john@example.com', role: 'USER' };
      mockedAxios.post.mockResolvedValueOnce({
        data: { data: { valid: true, user: mockUser } },
      });

      const result = await authClient.validateToken('valid-token');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/validate'),
        {},
        expect.objectContaining({
          headers: { Authorization: 'Bearer valid-token' },
        })
      );
      expect(result.valid).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should throw AuthenticationError when token validation returns 401', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { error: 'Invalid token signature' },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      await expect(authClient.validateToken('invalid-token')).rejects.toThrow(AuthenticationError);
    });

    it('should throw ValidationError when token validation returns 400', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { error: 'Token format is incorrect' },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      await expect(authClient.validateToken('bad-format-token')).rejects.toThrow(ValidationError);
    });

    it('should throw InternalServerError when Auth service is offline/network error occurs', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Connection timed out'));

      await expect(authClient.validateToken('some-token')).rejects.toThrow(InternalServerError);
    });

    it('should get user profile successfully', async () => {
      const mockProfile = { id: 'user-123', username: 'john', email: 'john@example.com', role: 'USER' };
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockProfile },
      });

      const result = await authClient.getProfile('valid-token');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/me'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer valid-token' },
        })
      );
      expect(result).toEqual(mockProfile);
    });
  });

  describe('OrderClient', () => {
    let orderClient: OrderClient;

    beforeEach(() => {
      orderClient = new OrderClient();
    });

    it('should retrieve order details successfully when order exists', async () => {
      const mockOrder = { id: 'order-123', userId: 'user-123', status: 'PENDING', totalAmount: 150.00 };
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockOrder },
      });

      const result = await orderClient.getOrder('order-123', 'token-abc');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/order-123'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer token-abc' },
        })
      );
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundError when order is not found (status 404)', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { error: 'Order not found' },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      await expect(orderClient.getOrder('missing-order', 'token-abc')).rejects.toThrow(NotFoundError);
    });

    it('should throw InternalServerError when Order service returns a 500 error', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { error: 'Internal Database Failure' },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      await expect(orderClient.getOrder('order-123', 'token-abc')).rejects.toThrow(InternalServerError);
    });

    it('should update order status successfully', async () => {
      const mockOrder = { id: 'order-123', userId: 'user-123', status: 'PAID', totalAmount: 150.00 };
      mockedAxios.patch.mockResolvedValueOnce({
        data: { data: mockOrder },
      });

      const result = await orderClient.updateOrderStatus('order-123', 'PAID', 'token-abc');

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/order-123/status'),
        { status: 'PAID' },
        expect.objectContaining({
          headers: { Authorization: 'Bearer token-abc' },
        })
      );
      expect(result).toEqual(mockOrder);
    });
  });
});
