import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logging.middleware';
import { errorHandler } from './middleware/error.middleware';
import { UserRepository } from './repository/user.repository';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { errorHandler } from 'shared';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

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
