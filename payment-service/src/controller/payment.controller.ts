import { Response, Router } from 'express';
import { PaymentService } from '../service/payment.service';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';

export class PaymentController {
  private paymentService: PaymentService;
  public router: Router;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', authenticate as any, this.process.bind(this));
  }

  private async process(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await this.paymentService.processPayment(req.body);
      if (result.status === 'SUCCESS') {
        res.json(result);
      } else {
        res.status(402).json(result); // 402 Payment Required for declined card
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
