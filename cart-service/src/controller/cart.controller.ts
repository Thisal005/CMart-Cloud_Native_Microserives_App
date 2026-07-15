import { Response, NextFunction, Router } from 'express';
import { ApiResponseHelper, authMiddleware, AuthenticatedRequest } from 'shared';
import { CartService } from '../service/cart.service';
import { config } from '../config';
import {
  validateBody,
  validateUuidParam,
  validateAddToCartBody,
  validateUpdateQuantityBody,
} from '../middleware/validation.middleware';

export class CartController {
  private cartService: CartService;
  public router: Router;

  constructor(cartService: CartService) {
    this.cartService = cartService;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Secure all cart endpoints using standard authentication middleware from shared package
    this.router.use(authMiddleware(config.jwtSecret) as any);

    this.router.get('/', this.getCart.bind(this));
    this.router.post('/items', validateBody(validateAddToCartBody), this.addItem.bind(this));
    this.router.put('/items/:itemId', validateUuidParam('itemId'), validateBody(validateUpdateQuantityBody), this.updateQuantity.bind(this));
    this.router.delete('/items/:itemId', validateUuidParam('itemId'), this.removeItem.bind(this));
    this.router.delete('/', this.clearCart.bind(this));
  }

  /**
   * GET /api/v1/cart
   * Retrieves the current authenticated user's cart.
   */
  private async getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cart = await this.cartService.getCart(req.user!.id);
      res.json(ApiResponseHelper.success(cart));
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * POST /api/v1/cart/items
   * Adds a product item to the cart.
   */
  private async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cart = await this.cartService.addToCart(req.user!.id, req.body);
      res.json(ApiResponseHelper.success(cart, 'Product added to cart successfully'));
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/cart/items/:itemId
   * Updates the quantity of an existing item in the cart.
   */
  private async updateQuantity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { quantity } = req.body;
      const cart = await this.cartService.updateItemQuantity(req.user!.id, req.params.itemId, quantity);
      res.json(ApiResponseHelper.success(cart, 'Item quantity updated successfully'));
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/cart/items/:itemId
   * Removes a product item from the cart.
   */
  private async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cart = await this.cartService.removeFromCart(req.user!.id, req.params.itemId);
      res.json(ApiResponseHelper.success(cart, 'Item removed from cart successfully'));
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/cart
   * Clears the user's cart entirely.
   */
  private async clearCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await this.cartService.clearCart(req.user!.id);
      res.json(ApiResponseHelper.success(null, 'Cart cleared successfully'));
    } catch (error: any) {
      next(error);
    }
  }
}
