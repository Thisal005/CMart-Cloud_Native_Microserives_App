import { Response, Router } from 'express';
import { OrderService } from '../service/order.service';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';

export class OrderController {
  private orderService: OrderService;
  public router: Router;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authenticate as any); // secure all order endpoints
    this.router.post('/', this.createOrder.bind(this));
    this.router.get('/', this.getOrders.bind(this));
    this.router.get('/:id', this.getOrder.bind(this));
  }

  private async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      let token = req.headers.authorization;
      if (token && token.startsWith('Bearer ')) {
        token = token.slice(7);
      }

      if (!token) {
        res.status(401).json({ error: 'Auth token is missing' });
        return;
      }

      const order = await this.orderService.createOrder(req.user!.id, token, req.body);
      
      if (order.status === 'PAID') {
        res.status(201).json(order);
      } else {
        res.status(400).json({
          message: 'Order created, but payment processing failed.',
          order,
        });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  private async getOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const orders = await this.orderService.getOrdersByUserId(req.user!.id);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  private async getOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const order = await this.orderService.getOrderById(req.params.id);
      // Authorization check: User can only see their own orders
      if (order.userId !== req.user!.id) {
        res.status(403).json({ error: 'Access forbidden' });
        return;
      }
      res.json(order);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
