import { http, HttpResponse } from "msw";

export const handlers = [
  // Auth mock endpoints
  http.post("*/api/v1/auth/login", () => {
    return HttpResponse.json({
      success: true,
      message: "Logged in successfully",
      data: {
        token: "mock-jwt-token",
        refreshToken: "mock-refresh-token",
        user: {
          id: "mock-user-id",
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "CUSTOMER",
          emailVerified: true,
        },
      },
    });
  }),

  http.post("*/api/v1/auth/register", () => {
    return HttpResponse.json({
      success: true,
      message: "Registered successfully",
      data: {
        token: "mock-jwt-token",
        refreshToken: "mock-refresh-token",
        user: {
          id: "mock-user-id",
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "CUSTOMER",
          emailVerified: true,
        },
      },
    });
  }),

  http.get("*/api/v1/auth/me", () => {
    return HttpResponse.json({
      success: true,
      message: "Profile details",
      data: {
        id: "mock-user-id",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "CUSTOMER",
        emailVerified: true,
      },
    });
  }),

  // Product catalog mock endpoints
  http.get("*/api/v1/products", () => {
    return HttpResponse.json({
      success: true,
      message: "Products fetched",
      data: [
        {
          id: "prod-1",
          name: "Mock Laptop",
          description: "High performance dev machine",
          price: 1299.99,
          stock: 10,
          category: "Computers",
          isActive: true,
          imageUrl: "https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?q=80&w=200",
          createdAt: "2026-07-15T12:00:00.000Z",
          updatedAt: "2026-07-15T12:00:00.000Z",
        },
        {
          id: "prod-2",
          name: "Mock Headphones",
          description: "Noise cancelling studio headphones",
          price: 199.99,
          stock: 5,
          category: "Audio",
          isActive: true,
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200",
          createdAt: "2026-07-15T12:00:00.000Z",
          updatedAt: "2026-07-15T12:00:00.000Z",
        },
      ],
    });
  }),

  http.get("*/api/v1/products/:id", ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      success: true,
      message: "Product details",
      data: {
        id: id as string,
        name: "Mock Laptop",
        description: "High performance dev machine",
        price: 1299.99,
        stock: 10,
        category: "Computers",
        isActive: true,
        imageUrl: "https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?q=80&w=200",
        createdAt: "2026-07-15T12:00:00.000Z",
        updatedAt: "2026-07-15T12:00:00.000Z",
      },
    });
  }),

  // Cart mock endpoints
  http.get("*/api/v1/cart", () => {
    return HttpResponse.json({
      success: true,
      message: "Cart items fetched",
      data: {
        id: "mock-cart-id",
        userId: "mock-user-id",
        items: [
          {
            id: "cart-item-1",
            productId: "prod-1",
            name: "Mock Laptop",
            price: 1299.99,
            quantity: 1,
            imageUrl: "https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?q=80&w=200",
            createdAt: "2026-07-15T12:00:00.000Z",
            updatedAt: "2026-07-15T12:00:00.000Z",
          },
        ],
        totalAmount: 1299.99,
        createdAt: "2026-07-15T12:00:00.000Z",
        updatedAt: "2026-07-15T12:00:00.000Z",
      },
    });
  }),

  http.post("*/api/v1/cart/items", () => {
    return HttpResponse.json({
      success: true,
      message: "Item added to cart",
      data: {
        id: "mock-cart-id",
        userId: "mock-user-id",
        items: [],
        totalAmount: 1299.99,
      },
    });
  }),

  http.put("*/api/v1/cart/items/:id", () => {
    return HttpResponse.json({
      success: true,
      message: "Quantity updated",
      data: {
        id: "mock-cart-id",
        userId: "mock-user-id",
        items: [],
        totalAmount: 2599.98,
      },
    });
  }),

  http.delete("*/api/v1/cart/items/:id", () => {
    return HttpResponse.json({
      success: true,
      message: "Item removed from cart",
      data: {
        id: "mock-cart-id",
        userId: "mock-user-id",
        items: [],
        totalAmount: 0,
      },
    });
  }),

  // Orders mock endpoints
  http.post("*/api/v1/orders", () => {
    return HttpResponse.json({
      success: true,
      message: "Order created successfully",
      data: {
        id: "mock-order-id",
        userId: "mock-user-id",
        status: "PENDING",
        subtotal: 1299.99,
        totalAmount: 1299.99,
        items: [],
        createdAt: "2026-07-15T12:00:00.000Z",
        updatedAt: "2026-07-15T12:00:00.000Z",
      },
    });
  }),

  http.get("*/api/v1/orders", () => {
    return HttpResponse.json({
      success: true,
      message: "Orders list fetched",
      data: [
        {
          id: "mock-order-id",
          userId: "mock-user-id",
          status: "PAID",
          subtotal: 1299.99,
          totalAmount: 1299.99,
          items: [],
          createdAt: "2026-07-15T12:00:00.000Z",
          updatedAt: "2026-07-15T12:00:00.000Z",
        },
      ],
    });
  }),

  http.get("*/api/v1/orders/:id", ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      success: true,
      message: "Order details",
      data: {
        id: id as string,
        userId: "mock-user-id",
        status: "PENDING",
        subtotal: 1299.99,
        totalAmount: 1299.99,
        items: [
          {
            id: "order-item-1",
            productId: "prod-1",
            productName: "Mock Laptop",
            quantity: 1,
            unitPrice: 1299.99,
            subtotal: 1299.99,
          },
        ],
        createdAt: "2026-07-15T12:00:00.000Z",
        updatedAt: "2026-07-15T12:00:00.000Z",
      },
    });
  }),

  // Payments mock endpoints
  http.post("*/api/v1/payments", () => {
    return HttpResponse.json({
      success: true,
      message: "Payment processed successfully",
      data: {
        id: "mock-payment-id",
        orderId: "mock-order-id",
        amount: 1299.99,
        status: "SUCCESS",
        transactionReference: "TX-MOCKREFERENCE",
      },
    });
  }),

  http.get("*/api/v1/payments", () => {
    return HttpResponse.json({
      success: true,
      message: "Payments list fetched",
      data: [
        {
          id: "mock-payment-id",
          orderId: "mock-order-id",
          userId: "mock-user-id",
          amount: 1299.99,
          paymentMethod: "CARD",
          transactionReference: "TX-MOCKREFERENCE",
          status: "SUCCESS",
          createdAt: "2026-07-15T12:00:00.000Z",
          updatedAt: "2026-07-15T12:00:00.000Z",
        },
      ],
    });
  }),
];
export type { handlers as HandlersList };
