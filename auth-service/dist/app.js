"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const shared_1 = require("shared");
const logger_1 = require("./utils/logger");
const user_repository_1 = require("./repositories/user.repository");
const auth_service_1 = require("./services/auth.service");
const auth_controller_1 = require("./controllers/auth.controller");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(shared_1.requestIdMiddleware);
app.use((0, shared_1.requestLogger)(logger_1.logger));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'auth-service' });
});
// Route registration is deferred until DataSource is initialized.
// See server.ts for bootstrap logic.
function registerRoutes(app) {
    const userRepository = new user_repository_1.UserRepository();
    const authService = new auth_service_1.AuthService(userRepository);
    const authController = new auth_controller_1.AuthController(authService);
    app.use('/api/auth', authController.router);
    // Global error handler must be registered after all routes
    app.use(shared_1.errorHandler);
}
// Register global error handler
app.use(shared_1.errorHandler);
exports.default = app;
