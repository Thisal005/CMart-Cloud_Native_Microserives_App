import express from 'express';
import cors from 'cors';
import { UserRepository } from './repository/user.repository';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize dependencies
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'auth-service' });
});

// Register routes
app.use('/api/auth', authController.router);

export default app;
