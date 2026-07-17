import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { requestIdMiddleware, requestLogger, errorHandler } from 'shared';
import { logger } from './utils/logger';
import { UserRepository } from './repositories/user.repository';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLogger(logger));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'auth-service' });
});

// Route registration is deferred until DataSource is initialized.
// See server.ts for bootstrap logic.
export function registerRoutes(app: express.Application): void {
  const userRepository = new UserRepository();
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);

  app.use('/api/auth', authController.router);

  // Global error handler must be registered after all routes
  app.use(errorHandler);
}

// Register global error handler
app.use(errorHandler);

export default app;
