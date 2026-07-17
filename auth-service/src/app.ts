import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { requestIdMiddleware, requestLogger, errorHandler, createMonitoringRouter } from 'shared';
import { logger } from './utils/logger';
import { UserRepository } from './repositories/user.repository';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { AppDataSource } from './config/data-source';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLogger(logger));

// Register Health, Readiness, and Version endpoints
app.use('/', createMonitoringRouter('auth-service', [
  {
    name: 'database',
    check: async () => {
      if (!AppDataSource.isInitialized) {
        return { status: 'DOWN', details: { message: 'Database connection is not initialized' } };
      }
      try {
        await AppDataSource.query('SELECT 1');
        return { status: 'UP' };
      } catch (err: any) {
        return { status: 'DOWN', details: { message: err.message || 'Database query failed' } };
      }
    }
  }
]));

// Route registration is deferred until DataSource is initialized.
// See server.ts for bootstrap logic.
export function registerRoutes(app: express.Application): void {
  const userRepository = new UserRepository();
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);

  app.use('/api/auth', authController.router);
  app.use('/api/v1/auth', authController.router);

  // Global error handler must be registered after all routes
  app.use(errorHandler);
}

// Register global error handler
app.use(errorHandler);

export default app;
