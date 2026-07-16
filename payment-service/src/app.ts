import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logging.middleware';
import { errorHandler } from './middleware/error.middleware';
import { PaymentRepository } from './repository/payment.repository';
import { PaymentService } from './service/payment.service';
import { PaymentController } from './controller/payment.controller';
import { MockGateway } from './gateway/mock.gateway';
import { AuthClient } from './client/auth.client';
import { OrderClient } from './client/order.client';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'payment-service' });
});

// Register routes
app.use('/api/payments', paymentController.router);
app.use('/api/v1/payments', paymentController.router);

// Global error handler (must be registered after all routes)
app.use(errorHandler);

export default app;
