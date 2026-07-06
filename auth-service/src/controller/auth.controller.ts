import { Request, Response, NextFunction, Router } from 'express';
import { AuthService } from '../service/auth.service';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';
import { validateBody, validateRegisterBody, validateLoginBody } from '../middleware/validation.middleware';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

export class AuthController {
  private authService: AuthService;
  public router: Router;

  constructor(authService: AuthService) {
    this.authService = authService;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/register', validateBody(validateRegisterBody), this.register.bind(this));
    this.router.post('/login', validateBody(validateLoginBody), this.login.bind(this));
    this.router.post('/validate', this.validate.bind(this));
    this.router.get('/me', authenticateToken as any, this.getProfile.bind(this));
  }

  private async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  private async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.login(req.body);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  }

  private async validate(req: Request, res: Response, next: NextFunction) {
    try {
      // Look for token in Authorization header or body
      let token = req.body.token || req.headers.authorization;
      if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
      }

      if (!token) {
        throw new BadRequestError('Token is required');
      }

      const result = await this.authService.validateToken(token);
      if (result.valid) {
        res.json(result);
      } else {
        throw new UnauthorizedError('Invalid or expired token');
      }
    } catch (error: any) {
      next(error);
    }
  }

  private async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }
      const profile = await this.authService.getProfile(req.user.id);
      res.json(profile);
    } catch (error: any) {
      next(error);
    }
  }
}
