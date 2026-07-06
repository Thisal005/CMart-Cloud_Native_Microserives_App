import { Response, Router } from 'express';
import { CartService } from '../service/cart.service';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';

export class CartController {
  private cartService: CartService;
  public router: Router;

  constructor(cartService: CartService) {
    this.cartService = cartService;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authenticate as any); // secure all routes in this controller
    this.router.get('/', this.getCart.bind(this));
    this.router.post('/items', this.addItem.bind(this));
    this.router.delete('/items/:productId', this.removeItem.bind(this));
    this.router.delete('/', this.clearCart.bind(this));
  }

  private async getCart(req: AuthenticatedRequest, res: Response) {
    try {
      const cart = await this.cartService.getCart(req.user!.id);
      res.json(cart);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  private async addItem(req: AuthenticatedRequest, res: Response) {
    try {
      const cart = await this.cartService.addToCart(req.user!.id, req.body);
      res.json(cart);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  private async removeItem(req: AuthenticatedRequest, res: Response) {
    try {
      const cart = await this.cartService.removeFromCart(req.user!.id, req.params.productId);
      res.json(cart);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  private async clearCart(req: AuthenticatedRequest, res: Response) {
    try {
      await this.cartService.clearCart(req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
