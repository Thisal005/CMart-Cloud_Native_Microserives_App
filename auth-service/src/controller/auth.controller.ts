import { Request, Response, Router } from 'express';
import { AuthService } from '../service/auth.service';

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

  private async register(req: Request, res: Response) {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  private async login(req: Request, res: Response) {
    try {
      const result = await this.authService.login(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  private async validate(req: Request, res: Response) {
    try {
      // Look for token in Authorization header or body
      let token = req.body.token || req.headers.authorization;
      if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
      }

      if (!token) {
        res.status(400).json({ valid: false, error: 'Token is required' });
        return;
      }

      const result = await this.authService.validateToken(token);
      if (result.valid) {
        res.json(result);
      } else {
        res.status(401).json({ valid: false, error: 'Invalid or expired token' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
