import express from 'express';
import cors from 'cors';
import { TransactionRepository } from './repository/transaction.repository';
import { PaymentService } from './service/payment.service';
import { PaymentController } from './controller/payment.controller';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize dependencies
const transactionRepository = new TransactionRepository();
const paymentService = new PaymentService(transactionRepository);
const paymentController = new PaymentController(paymentService);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'payment-service' });
});

// Register routes
app.use('/api/payments', paymentController.router);

export default app;
