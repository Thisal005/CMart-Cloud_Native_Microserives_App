import { Response, NextFunction, Router } from 'express';
import { 
  ApiResponseHelper, 
  authMiddleware, 
  AuthenticatedRequest, 
  NotFoundError,
  validateBody,
  validateQuery,
  validateUuidParam
} from 'shared';
import { PaymentService } from '../services/payment.service';
import { OrderClient } from '../clients/order.client';
import { PaymentStatus } from '../models/payment';
import { config } from '../config';
import { logger } from '../utils/logger';
import {
  validateCreatePaymentBody,
  validateGetUserPaymentsQuery,
  validateRefundPaymentBody,
} from '../validations/payment.validation';

export class PaymentController {
  private paymentService: PaymentService;
  private orderClient: OrderClient;
  public router: Router;

  constructor(paymentService: PaymentService, orderClient: OrderClient) {
    this.paymentService = paymentService;
    this.orderClient = orderClient;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Secure endpoints with Platform standard JWT auth middleware
    this.router.use(authMiddleware(config.jwtSecret) as any);

    // POST /api/v1/payments - Create and process a payment
    this.router.post('/', validateBody(validateCreatePaymentBody), this.process.bind(this));

    // GET /api/v1/payments - Get user payments with filters and pagination
    this.router.get('/', validateQuery(validateGetUserPaymentsQuery), this.getUserPayments.bind(this));

    // GET /api/v1/payments/:id - Get payment details by ID
    this.router.get('/:id', validateUuidParam('id'), this.getById.bind(this));

    // GET /api/v1/payments/order/:orderId - Get payment history for an order
    this.router.get('/order/:orderId', validateUuidParam('orderId'), this.getByOrder.bind(this));

    // POST /api/v1/payments/:id/refund - Refund a payment
    this.router.post('/:id/refund', validateUuidParam('id'), validateBody(validateRefundPaymentBody), this.refund.bind(this));
  }

  /**
   * POST /api/v1/payments
   * Processes a payment transaction for an order.
   */
  private async process(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const correlationId = (req.headers['x-correlation-id'] || req.headers['x-request-id'] || (req as any).requestId) as string | undefined;
      logger.info('Processing payment request received', {
        userId: req.user!.id,
        orderId: req.body.orderId,
        amount: req.body.amount,
        path: req.originalUrl,
        method: req.method,
        ...(correlationId && { correlationId }),
      });

      // Extract the bearer token from request headers to forward to other services
      let token = req.headers.authorization;
      if (token && token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
      }

      if (!token) {
        token = (req.body?.token || req.query?.token || '') as string;
      }

      // Extract properties or default them based on requirements
      const { orderId, paymentMethod } = req.body;
      let amount = req.body.amount;
      const cardNumber = req.body.cardNumber || '1111-2222-3333-4444';
      const currency = req.body.currency || 'USD';

      // If amount is not explicitly provided, fetch the order to get the total amount
      if (amount === undefined || amount === null) {
        logger.info(`Fetching order details for orderId ${orderId} in payment controller to retrieve amount`);
        const order = await this.orderClient.getOrder(orderId, token);
        if (!order) {
          throw new NotFoundError(`Order with ID ${orderId} not found`);
        }
        amount = Number(order.totalAmount);
      }

      const result = await this.paymentService.processPayment(req.user!.id, token, {
        orderId,
        amount,
        paymentMethod,
        cardNumber,
        currency,
      });

      // Map output entity to CreatePaymentResponseDto shape
      const responsePayload = {
        id: result.id,
        orderId: result.orderId,
        amount: result.amount,
        status: result.status,
        transactionReference: result.transactionReference,
      };

      res.status(201).json(ApiResponseHelper.success(responsePayload, 'Payment processed successfully', req));
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * GET /api/v1/payments/:id
   * Retrieves details of a specific payment by ID.
   */
  private async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const payment = await this.paymentService.getPaymentById(req.params.id, req.user!.id, req.user!.role);
      res.json(ApiResponseHelper.success(payment, undefined, req));
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * GET /api/v1/payments/order/:orderId
   * Retrieves payment records associated with a specific Order.
   */
  private async getByOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let token = req.headers.authorization;
      if (token && token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
      }
      if (!token) {
        token = (req.body?.token || req.query?.token || '') as string;
      }

      const payments = await this.paymentService.getPaymentsByOrderId(req.params.orderId, req.user!.id, req.user!.role, token);
      res.json(ApiResponseHelper.success(payments, undefined, req));
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * GET /api/v1/payments
   * Retrieves paginated payment records for the authenticated user, optionally filtered by status.
   */
  private async getUserPayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const status = req.query.status as PaymentStatus | undefined;
      const targetUserId = req.query.userId as string | undefined;

      const result = await this.paymentService.getUserPayments(
        req.user!.id,
        req.user!.role,
        { status, targetUserId },
        page,
        limit
      );

      res.json(ApiResponseHelper.paginated(result.data, page, limit, result.total, undefined, req));
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * POST /api/v1/payments/:id/refund
   * Triggers the refund process for a payment transaction.
   */
  private async refund(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let { amount } = req.body;
      const id = req.params.id;

      // If amount is not explicitly provided, fetch the payment details to retrieve original payment amount
      if (amount === undefined || amount === null) {
        logger.info(`Fetching payment ${id} details to determine default refund amount`);
        const payment = await this.paymentService.getPaymentById(id, req.user!.id, req.user!.role);
        amount = payment.amount;
      }

      const updatedPayment = await this.paymentService.refundPayment(id, amount, req.user!.id, req.user!.role);
      res.json(ApiResponseHelper.success(updatedPayment, 'Payment refunded successfully', req));
    } catch (error: any) {
      next(error);
    }
  }
}
export default PaymentController;
