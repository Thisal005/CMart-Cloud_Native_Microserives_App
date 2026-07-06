import { NextFunction, Request, Response, Router } from 'express';
import { AuthService } from '../service/auth.service';
import { HttpStatus } from 'shared';

export class AuthController {
  private authService: AuthService;
  public router: Router;

  constructor(authService: AuthService) {
    this.authService = authService;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/register', this.register.bind(this));
    this.router.post('/login', this.login.bind(this));
    this.router.post('/validate', this.validate.bind(this));
  }

  private async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.register(req.body);
      res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  }

  private async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.login(req.body);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
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
        res.status(HttpStatus.BAD_REQUEST).json({ valid: false, error: 'Token is required' });
        return;
      }

      const result = await this.authService.validateToken(token);
      if (result.valid) {
        res.status(HttpStatus.OK).json(result);
      } else {
        res.status(HttpStatus.UNAUTHORIZED).json({ valid: false, error: 'Invalid or expired token' });
      }
    } catch (error) {
      next(error);
    }
  }
}
