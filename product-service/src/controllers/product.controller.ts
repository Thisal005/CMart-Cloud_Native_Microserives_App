import { Response, Router, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { config } from '../config';
import { 
  ApiResponseHelper, 
  authMiddleware, 
  requireRole, 
  AuthenticatedRequest, 
  validateBody,
  validateUuidParam
} from 'shared';
import { 
  validateCreateProductBody, 
  validateUpdateProductBody 
} from '../validations/product.validation';

export class ProductController {
  private productService: ProductService;
  public router: Router;

  constructor(productService: ProductService) {
    this.productService = productService;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/:id', validateUuidParam('id'), this.getById.bind(this));
    this.router.post('/', authMiddleware(config.jwtSecret) as any, requireRole(['ADMIN']) as any, validateBody(validateCreateProductBody), this.create.bind(this));
    this.router.put('/:id', validateUuidParam('id'), authMiddleware(config.jwtSecret) as any, requireRole(['ADMIN']) as any, validateBody(validateUpdateProductBody), this.update.bind(this));
    this.router.delete('/:id', validateUuidParam('id'), authMiddleware(config.jwtSecret) as any, requireRole(['ADMIN']) as any, this.delete.bind(this));
  }

  private async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const products = await this.productService.getAllProducts();
      res.json(ApiResponseHelper.success(products, 'Products retrieved successfully', req));
    } catch (error: any) {
      next(error);
    }
  }

  private async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const product = await this.productService.getProductById(req.params.id);
      res.json(ApiResponseHelper.success(product, 'Product retrieved successfully', req));
    } catch (error: any) {
      next(error);
    }
  }

  private async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json(ApiResponseHelper.success(product, 'Product created successfully', req));
    } catch (error: any) {
      next(error);
    }
  }

  private async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const product = await this.productService.updateProduct(req.params.id, req.body);
      res.json(ApiResponseHelper.success(product, 'Product updated successfully', req));
    } catch (error: any) {
      next(error);
    }
  }

  private async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await this.productService.deleteProduct(req.params.id);
      res.status(200).json(ApiResponseHelper.success(null, 'Product deleted successfully', req));
    } catch (error: any) {
      next(error);
    }
  }
}
