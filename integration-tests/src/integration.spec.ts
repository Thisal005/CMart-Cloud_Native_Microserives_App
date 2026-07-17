import axios, { AxiosError } from 'axios';

const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const CART_URL = process.env.CART_SERVICE_URL || 'http://localhost:3003';
const ORDER_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';

describe('CMart End-to-End Microservices Integration Tests', () => {
  let userToken: string;
  let userRefreshToken: string;
  let userId: string;
  let testProductId: string;
  let testOrderId: string;
  let adminToken: string;

  const uniqueEmail = `qa_test_${Date.now()}@example.com`;
  const password = 'Password123!';

  // Helper for intercepting axios errors to easily get the error status
  const catchError = async (fn: () => Promise<any>): Promise<AxiosError> => {
    try {
      await fn();
      throw new Error('Expected request to fail, but it succeeded');
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        return err;
      }
      throw err;
    }
  };

  beforeAll(async () => {
    // Register and login a QA user to obtain tokens
    const regRes = await axios.post(`${AUTH_URL}/api/v1/auth/register`, {
      firstName: 'QA',
      lastName: 'Automation',
      email: uniqueEmail,
      password: password,
      phoneNumber: '1234567890',
    });

    userToken = regRes.data.data.token;
    userRefreshToken = regRes.data.data.refreshToken;
    userId = regRes.data.data.user.id;

    // Register a dynamic admin account for role checks
    const adminRegRes = await axios.post(`${AUTH_URL}/api/v1/auth/register`, {
      firstName: 'QA',
      lastName: 'Admin',
      email: `qa_admin_${Date.now()}@example.com`,
      password: password,
      role: 'ADMIN',
    });
    adminToken = adminRegRes.data.data.token;
  });

  describe('🔐 Authentication Workflows', () => {
    it('should successfully login and retrieve JWT tokens', async () => {
      const loginRes = await axios.post(`${AUTH_URL}/api/v1/auth/login`, {
        email: uniqueEmail,
        password: password,
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.data.success).toBe(true);
      expect(loginRes.data.data.token).toBeDefined();
    });

    it('should fail registration with duplicate email (409 Conflict)', async () => {
      const err = await catchError(() =>
        axios.post(`${AUTH_URL}/api/v1/auth/register`, {
          firstName: 'Duplicate',
          lastName: 'User',
          email: uniqueEmail,
          password: password,
        })
      );

      expect(err.response?.status).toBe(409);
      expect((err.response?.data as any).success).toBe(false);
      expect((err.response?.data as any).error.code).toBe('CONFLICT');
    });

    it('should fail validation when passing an expired or invalid JWT (401 Unauthorized)', async () => {
      const err = await catchError(() =>
        axios.get(`${AUTH_URL}/api/v1/auth/me`, {
          headers: { Authorization: 'Bearer invalid-jwt-token-value' },
        })
      );

      expect(err.response?.status).toBe(401);
      expect((err.response?.data as any).success).toBe(false);
      expect((err.response?.data as any).error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('📦 Product & Cart Management Workflows', () => {
    it('should browse product catalog and fetch product details', async () => {
      const productsRes = await axios.get(`${PRODUCT_URL}/api/v1/products`);

      expect(productsRes.status).toBe(200);
      expect(Array.isArray(productsRes.data.data)).toBe(true);
      expect(productsRes.data.data.length).toBeGreaterThan(0);

      // Save a product ID for subsequent shopping workflows
      testProductId = productsRes.data.data[0].id;

      const singleProductRes = await axios.get(`${PRODUCT_URL}/api/v1/products/${testProductId}`);
      expect(singleProductRes.status).toBe(200);
      expect(singleProductRes.data.data.name).toBe(productsRes.data.data[0].name);
    });

    it('should add items to user cart and verify transient product details', async () => {
      const addToCartRes = await axios.post(
        `${CART_URL}/api/v1/cart/items`,
        {
          productId: testProductId,
          quantity: 2,
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      expect(addToCartRes.status).toBe(200);
      expect(addToCartRes.data.success).toBe(true);

      const cartRes = await axios.get(`${CART_URL}/api/v1/cart`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      expect(cartRes.status).toBe(200);
      expect(cartRes.data.data.items.length).toBeGreaterThan(0);
      expect(cartRes.data.data.items[0].productId).toBe(testProductId);
      expect(cartRes.data.data.items[0].name).toBeDefined(); // Transient name populated
    });

    it('should throw validation error when adding negative stock counts (400 Bad Request)', async () => {
      const err = await catchError(() =>
        axios.post(
          `${CART_URL}/api/v1/cart/items`,
          {
            productId: testProductId,
            quantity: -5,
          },
          { headers: { Authorization: `Bearer ${userToken}` } }
        )
      );

      expect(err.response?.status).toBe(400);
      expect((err.response?.data as any).error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('💳 Checkout & Order Processing Workflows', () => {
    it('should check out shopping cart, create order, and empty cart', async () => {
      const checkoutRes = await axios.post(
        `${ORDER_URL}/api/v1/orders`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      expect(checkoutRes.status).toBe(201);
      expect(checkoutRes.data.success).toBe(true);
      expect(checkoutRes.data.data.status).toBe('PENDING');

      testOrderId = checkoutRes.data.data.id;

      // Verify cart has been cleared after checkout
      const cartRes = await axios.get(`${CART_URL}/api/v1/cart`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(cartRes.data.data.items.length).toBe(0);
    });

    it('should fail order checkout when cart is empty (400 Bad Request)', async () => {
      const err = await catchError(() =>
        axios.post(
          `${ORDER_URL}/api/v1/orders`,
          {},
          { headers: { Authorization: `Bearer ${userToken}` } }
        )
      );

      expect(err.response?.status).toBe(400);
      expect((err.response?.data as any).error.code).toBe('VALIDATION_ERROR');
    });

    it('should block non-admin users from patching order status (403 Forbidden)', async () => {
      const err = await catchError(() =>
        axios.patch(
          `${ORDER_URL}/api/v1/orders/${testOrderId}/status`,
          { status: 'PAYMENT_PENDING' },
          { headers: { Authorization: `Bearer ${userToken}` } }
        )
      );

      expect(err.response?.status).toBe(403);
      expect((err.response?.data as any).error.code).toBe('FORBIDDEN');
    });
  });

  describe('💰 Payment Gateway Interlocks', () => {
    it('should deny payment of someone else\'s order (403 Forbidden)', async () => {
      // Create a second user token
      const secondUserReg = await axios.post(`${AUTH_URL}/api/v1/auth/register`, {
        firstName: 'Second',
        lastName: 'QA',
        email: `second_qa_${Date.now()}@example.com`,
        password: password,
      });
      const secondToken = secondUserReg.data.data.token;

      // Try paying for first user's order with second user token
      const err = await catchError(() =>
        axios.post(
          `${PAYMENT_URL}/api/v1/payments`,
          {
            orderId: testOrderId,
            amount: 2999.98, // laptop * 2
            paymentMethod: 'CARD',
            cardNumber: '1111-2222-3333-4444',
          },
          { headers: { Authorization: `Bearer ${secondToken}` } }
        )
      );

      expect(err.response?.status).toBe(403);
      expect((err.response?.data as any).error.code).toBe('FORBIDDEN');
    });

    it('should record payment failure on payment card decline (invalid card)', async () => {
      // Create a new order for payment failure test
      await axios.post(
        `${CART_URL}/api/v1/cart/items`,
        { productId: testProductId, quantity: 1 },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      const checkoutRes = await axios.post(
        `${ORDER_URL}/api/v1/orders`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      const failedOrderId = checkoutRes.data.data.id;

      // Pay with card ending in 9999 (Simulates Decline)
      const payRes = await axios.post(
        `${PAYMENT_URL}/api/v1/payments`,
        {
          orderId: failedOrderId,
          amount: 1499.99,
          paymentMethod: 'CARD',
          cardNumber: '1111-2222-3333-9999', // Triggers mock failure
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      expect(payRes.status).toBe(201);
      expect(payRes.data.data.status).toBe('FAILED');
    });
  });
});
