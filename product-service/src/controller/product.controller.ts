import { Response, Router } from 'express';
import { ProductService } from '../service/product.service';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth.middleware';

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
    this.router.get('/:id', this.getById.bind(this));
    this.router.post('/', authenticate as any, authorize(['ADMIN']) as any, this.create.bind(this));
    this.router.put('/:id', authenticate as any, authorize(['ADMIN']) as any, this.update.bind(this));
    this.router.delete('/:id', authenticate as any, authorize(['ADMIN']) as any, this.delete.bind(this));
  }

  private async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const products = await this.productService.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  private async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const product = await this.productService.getProductById(req.params.id);
      res.json(product);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  private async create(req: AuthenticatedRequest, res: Response) {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  private async update(req: AuthenticatedRequest, res: Response) {
    try {
      const product = await this.productService.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  private async delete(req: AuthenticatedRequest, res: Response) {
    try {
      await this.productService.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
