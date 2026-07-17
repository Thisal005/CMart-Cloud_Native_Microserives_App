import { Response, NextFunction, Router } from 'express';
import { 
  ApiResponseHelper, 
  authMiddleware, 
  AuthenticatedRequest, 
  requireRole,
  validateBody,
  validateQuery,
  validateUuidParam
} from 'shared';
import { OrderService } from '../services/order.service';
import { config } from '../config';
import { OrderStatus } from '../models/order';
import { logger } from '../utils/logger';
import {
  validateCreateOrderBody,
  validateUpdateStatusBody,
  validateGetOrdersQuery,
} from '../validations/order.validation';

export class OrderController {
  private orderService: OrderService;
  public router: Router;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Secure all order endpoints using standard authentication middleware from shared package
    this.router.use(authMiddleware(config.jwtSecret) as any);

    this.router.post('/', validateBody(validateCreateOrderBody), this.createOrder.bind(this));
    this.router.get('/', validateQuery(validateGetOrdersQuery), this.getOrders.bind(this));
    this.router.get('/:id', validateUuidParam('id'), this.getOrder.bind(this));
    
    // Status update is restricted to Admin role only
    this.router.patch(
      '/:id/status',
      requireRole(['ADMIN']) as any,
      validateUuidParam('id'),
      validateBody(validateUpdateStatusBody),
      this.updateOrderStatus.bind(this)
    );
  }

  /**
   * POST /api/v1/orders
   * Creates a new order from user's current cart.
   */
  private async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const correlationId = (req.headers['x-correlation-id'] || req.headers['x-request-id'] || (req as any).requestId) as string | undefined;
      logger.info('Create order request received', {
        userId: req.user!.id,
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

      const order = await this.orderService.createOrder(req.user!.id, token);

      res.status(201).json(ApiResponseHelper.success(order, 'Order created successfully', req));
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * GET /api/v1/orders
   * Retrieves orders with filters and pagination.
   *
   * Query params: ?page=1&limit=10&status=PAID&userId=uuid
   */
  private async getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const status = req.query.status as OrderStatus | undefined;
      const targetUserId = req.query.userId as string | undefined;

      const result = await this.orderService.getOrders(
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
   * GET /api/v1/orders/:id
   * Retrieves a specific order by ID.
   * Ownership check is enforced in the service layer.
   */
  private async getOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const order = await this.orderService.getOrderById(req.params.id, req.user!.id, req.user!.role);
      res.json(ApiResponseHelper.success(order, undefined, req));
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/orders/:id/status
   * Updates the lifecycle status of an existing order.
   */
  private async updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const order = await this.orderService.updateOrderStatus(req.params.id, status as OrderStatus, req.user!.id);
      res.json(ApiResponseHelper.success(order, 'Order status updated successfully', req));
    } catch (error: any) {
      next(error);
    }
  }
}
