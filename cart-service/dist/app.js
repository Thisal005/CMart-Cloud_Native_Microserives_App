"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const shared_1 = require("shared");
const logger_1 = require("./utils/logger");
const cart_repository_1 = require("./repositories/cart.repository");
const cart_service_1 = require("./services/cart.service");
const cart_controller_1 = require("./controllers/cart.controller");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(shared_1.requestIdMiddleware);
app.use((0, shared_1.requestLogger)(logger_1.logger));
// Initialize dependencies
const cartRepository = new cart_repository_1.CartRepository();
const cartService = new cart_service_1.CartService(cartRepository);
const cartController = new cart_controller_1.CartController(cartService);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'cart-service' });
});
// Register routes
app.use('/api/cart', cartController.router);
app.use('/api/v1/cart', cartController.router);
// Global error handler (must be registered after all routes)
app.use(shared_1.errorHandler);
exports.default = app;
