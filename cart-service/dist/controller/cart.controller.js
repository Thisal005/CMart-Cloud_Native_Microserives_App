"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const express_1 = require("express");
const shared_1 = require("shared");
const config_1 = require("../config");
const validation_middleware_1 = require("../middleware/validation.middleware");
class CartController {
    cartService;
    router;
    constructor(cartService) {
        this.cartService = cartService;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Secure all cart endpoints using standard authentication middleware from shared package
        this.router.use((0, shared_1.authMiddleware)(config_1.config.jwtSecret));
        this.router.get('/', this.getCart.bind(this));
        this.router.post('/items', (0, validation_middleware_1.validateBody)(validation_middleware_1.validateAddToCartBody), this.addItem.bind(this));
        this.router.put('/items/:itemId', (0, validation_middleware_1.validateUuidParam)('itemId'), (0, validation_middleware_1.validateBody)(validation_middleware_1.validateUpdateQuantityBody), this.updateQuantity.bind(this));
        this.router.delete('/items/:itemId', (0, validation_middleware_1.validateUuidParam)('itemId'), this.removeItem.bind(this));
        this.router.delete('/', this.clearCart.bind(this));
    }
    /**
     * GET /api/v1/cart
     * Retrieves the current authenticated user's cart.
     */
    async getCart(req, res, next) {
        try {
            const cart = await this.cartService.getCart(req.user.id);
            res.json(shared_1.ApiResponseHelper.success(cart));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/v1/cart/items
     * Adds a product item to the cart.
     */
    async addItem(req, res, next) {
        try {
            const cart = await this.cartService.addToCart(req.user.id, req.body);
            res.json(shared_1.ApiResponseHelper.success(cart, 'Product added to cart successfully'));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PUT /api/v1/cart/items/:itemId
     * Updates the quantity of an existing item in the cart.
     */
    async updateQuantity(req, res, next) {
        try {
            const { quantity } = req.body;
            const cart = await this.cartService.updateItemQuantity(req.user.id, req.params.itemId, quantity);
            res.json(shared_1.ApiResponseHelper.success(cart, 'Item quantity updated successfully'));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * DELETE /api/v1/cart/items/:itemId
     * Removes a product item from the cart.
     */
    async removeItem(req, res, next) {
        try {
            const cart = await this.cartService.removeFromCart(req.user.id, req.params.itemId);
            res.json(shared_1.ApiResponseHelper.success(cart, 'Item removed from cart successfully'));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * DELETE /api/v1/cart
     * Clears the user's cart entirely.
     */
    async clearCart(req, res, next) {
        try {
            await this.cartService.clearCart(req.user.id);
            res.json(shared_1.ApiResponseHelper.success(null, 'Cart cleared successfully'));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CartController = CartController;
