import { Request, Response, NextFunction, Router } from 'express';
import { AuthService } from '../services/auth.service';
import { config } from '../config';
import { 
  ApiResponseHelper, 
  authMiddleware, 
  AuthenticatedRequest, 
  validateBody, 
  ValidationError, 
  AuthenticationError 
} from 'shared';
import { 
  validateRegisterBody, 
  validateLoginBody, 
  validateRefreshTokenBody 
} from '../validations/auth.validation';

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
    this.router.get('/me', authMiddleware(config.jwtSecret) as any, this.getProfile.bind(this));
    this.router.post('/refresh-token', validateBody(validateRefreshTokenBody), this.refreshToken.bind(this));
    this.router.post('/logout', validateBody(validateRefreshTokenBody), this.logout.bind(this));
  }

  private async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(ApiResponseHelper.success(result, 'User registered successfully', req));
    } catch (error: any) {
      next(error);
    }
  }

  private async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.login(req.body);
      res.json(ApiResponseHelper.success(result, 'Logged in successfully', req));
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
        throw new ValidationError('Token is required');
      }

      const result = await this.authService.validateToken(token);
      if (result.valid) {
        res.json(ApiResponseHelper.success(result, 'Token validated successfully', req));
      } else {
        throw new AuthenticationError('Invalid or expired token');
      }
    } catch (error: any) {
      next(error);
    }
  }

  private async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AuthenticationError('Unauthorized');
      }
      const profile = await this.authService.getProfile(req.user.id);
      res.json(ApiResponseHelper.success(profile, 'Profile retrieved successfully', req));
    } catch (error: any) {
      next(error);
    }
  }

  private async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);
      res.json(ApiResponseHelper.success(result, 'Token refreshed successfully', req));
    } catch (error: any) {
      next(error);
    }
  }

  private async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await this.authService.logout(refreshToken);
      res.status(200).json(ApiResponseHelper.success(null, 'Logged out successfully', req));
    } catch (error: any) {
      next(error);
    }
  }
}
