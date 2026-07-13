"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logging_middleware_1 = require("./middleware/logging.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const cart_repository_1 = require("./repository/cart.repository");
const cart_service_1 = require("./service/cart.service");
const cart_controller_1 = require("./controller/cart.controller");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(logging_middleware_1.requestLogger);
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
app.use(error_middleware_1.errorHandler);
exports.default = app;
