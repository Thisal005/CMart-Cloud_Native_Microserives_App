import express from 'express';
import cors from 'cors';
import { requestIdMiddleware, requestLogger, errorHandler, createMonitoringRouter } from 'shared';
import { logger } from './utils/logger';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';
import { MockGateway } from './gateways/mock.gateway';
import { AuthClient } from './clients/auth.client';
import { OrderClient } from './clients/order.client';
import { AppDataSource } from './config/data-source';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLogger(logger));

// Initialize dependencies
const paymentRepository = new PaymentRepository();
const paymentGateway = new MockGateway();
const authClient = new AuthClient();
const orderClient = new OrderClient();

const paymentService = new PaymentService(
  paymentRepository,
  paymentGateway,
  authClient,
  orderClient
);
const paymentController = new PaymentController(paymentService, orderClient);

// Register Health, Readiness, and Version endpoints
app.use('/', createMonitoringRouter('payment-service', [
  {
    name: 'database',
    check: async () => {
      if (!AppDataSource.isInitialized) {
        return { status: 'DOWN', details: { message: 'Database connection is not initialized' } };
      }
      try {
        await AppDataSource.query('SELECT 1');
        return { status: 'UP' };
      } catch (err: any) {
        return { status: 'DOWN', details: { message: err.message || 'Database query failed' } };
      }
    }
  }
]));

// Register routes
app.use('/api/payments', paymentController.router);
app.use('/api/v1/payments', paymentController.router);

// Global error handler (must be registered after all routes)
app.use(errorHandler);

export default app;
