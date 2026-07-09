"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_repository_1 = require("./repository/user.repository");
const auth_service_1 = require("./service/auth.service");
const auth_controller_1 = require("./controller/auth.controller");
const shared_1 = require("shared");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize dependencies
const userRepository = new user_repository_1.UserRepository();
const authService = new auth_service_1.AuthService(userRepository);
const authController = new auth_controller_1.AuthController(authService);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'auth-service' });
});
// Register routes
app.use('/api/auth', authController.router);
// Register global error handler
app.use(shared_1.errorHandler);
exports.default = app;
