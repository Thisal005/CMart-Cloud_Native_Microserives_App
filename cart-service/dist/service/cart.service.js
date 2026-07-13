"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const shared_1 = require("shared");
const cart_item_entity_1 = require("../model/cart-item.entity");
const cart_item_repository_1 = require("../repository/cart-item.repository");
const product_client_1 = require("../client/product.client");
const logger_1 = require("../utils/logger");
class CartService {
    cartRepository;
    cartItemRepository;
    productClient;
    constructor(cartRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = new cart_item_repository_1.CartItemRepository();
        this.productClient = new product_client_1.ProductClient();
    }
    /**
     * Get Cart: Retrieve current user's cart, creating it if it doesn't exist,
     * and populates transient product names from the Product Service.
     */
    async getCart(userId) {
        logger_1.logger.info(`Retrieving cart for user: ${userId}`);
        let cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            logger_1.logger.info(`No existing cart found for user: ${userId}. Creating new cart.`);
            cart = await this.cartRepository.create({
                userId,
                items: [],
            });
            logger_1.logger.info(`Cart created successfully for user: ${userId} with ID: ${cart.id}`);
        }
        // Populate transient product names using ProductClient
        if (cart.items && cart.items.length > 0) {
            await Promise.all(cart.items.map(async (item) => {
                try {
                    const product = await this.productClient.getProductById(item.productId);
                    item.name = product.name;
                }
                catch (error) {
                    logger_1.logger.warn(`Could not fetch product name for item ${item.productId}: ${error.message}`);
                    item.name = 'Unknown Product';
                }
            }));
        }
        return cart;
    }
    /**
     * Add Item: Adds a product item to the user's cart.
     * Validates product existence, active status, quantity, and stock limits.
     */
    async addToCart(userId, dto) {
        const { productId, quantity } = dto;
        logger_1.logger.info(`Adding item to cart. User: ${userId}, Product: ${productId}, Quantity: ${quantity}`);
        if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
            throw new shared_1.ValidationError('Product ID is required and must be a non-empty string');
        }
        if (quantity === undefined || quantity === null || !Number.isInteger(quantity) || quantity <= 0) {
            throw new shared_1.ValidationError('Quantity must be a positive integer greater than 0');
        }
        // Fetch product details via ProductClient (handles 404/NotFoundError mapping)
        const product = await this.productClient.getProductById(productId);
        // Validate product is active
        if (product.isActive === false) {
            logger_1.logger.warn(`Failed to add item: Product ${productId} is currently inactive.`);
            throw new shared_1.ValidationError('Product is inactive and cannot be added to the cart');
        }
        // Validate stock levels
        if (product.stock < quantity) {
            logger_1.logger.warn(`Failed to add item: Insufficient stock for product ${productId}. Available: ${product.stock}, Requested: ${quantity}`);
            throw new shared_1.ValidationError(`Insufficient stock. Available: ${product.stock}`);
        }
        const cart = await this.getCart(userId);
        const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
        if (existingItemIndex > -1) {
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (product.stock < newQuantity) {
                logger_1.logger.warn(`Failed to update item: Insufficient stock for product ${productId}. Available: ${product.stock}, Total Requested: ${newQuantity}`);
                throw new shared_1.ValidationError(`Insufficient stock. Total requested quantity (${newQuantity}) exceeds stock (${product.stock})`);
            }
            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].unitPrice = product.price;
            logger_1.logger.info(`Quantity updated for product ${productId} in user ${userId}'s cart.`);
        }
        else {
            const newItem = new cart_item_entity_1.CartItem();
            newItem.productId = productId;
            newItem.quantity = quantity;
            newItem.unitPrice = product.price;
            newItem.cart = cart;
            newItem.cartId = cart.id;
            cart.items.push(newItem);
            logger_1.logger.info(`Item added successfully for product ${productId} in user ${userId}'s cart.`);
        }
        await this.cartRepository.save(cart);
        // Return fresh cart state with populated names
        return this.getCart(userId);
    }
    /**
     * Update Quantity: Updates the quantity of an existing item in the cart by item ID.
     * Validates quantity limits and stock availability.
     */
    async updateItemQuantity(userId, itemId, quantity) {
        logger_1.logger.info(`Updating item quantity. User: ${userId}, Item ID: ${itemId}, Target Quantity: ${quantity}`);
        if (quantity === undefined || quantity === null || !Number.isInteger(quantity) || quantity <= 0) {
            throw new shared_1.ValidationError('Quantity must be a positive integer greater than 0');
        }
        // Fetch item first to obtain the product ID and verify ownership
        const item = await this.cartItemRepository.findById(itemId);
        if (!item) {
            logger_1.logger.warn(`Failed to update quantity: Cart item ${itemId} not found.`);
            throw new shared_1.NotFoundError(`Cart item not found`);
        }
        // Enforce strict security: users can access/modify only their own cart
        if (item.cart.userId !== userId) {
            logger_1.logger.warn(`Unauthorized access attempt: User ${userId} tried to modify item ${itemId} belonging to user ${item.cart.userId}.`);
            throw new shared_1.NotFoundError(`Cart item not found`); // throw NotFound to avoid leaking ID existence
        }
        // Fetch product details via ProductClient (validates exists and fetches stock/price)
        const product = await this.productClient.getProductById(item.productId);
        // Validate product is active
        if (product.isActive === false) {
            throw new shared_1.ValidationError('Product is inactive and cannot be modified in the cart');
        }
        // Validate stock levels
        if (product.stock < quantity) {
            logger_1.logger.warn(`Failed to update quantity: Insufficient stock for product ${item.productId}. Available: ${product.stock}, Requested: ${quantity}`);
            throw new shared_1.ValidationError(`Insufficient stock. Available: ${product.stock}`);
        }
        item.quantity = quantity;
        item.unitPrice = product.price;
        await this.cartItemRepository.save(item);
        logger_1.logger.info(`Quantity updated for cart item ${itemId} successfully to ${quantity}.`);
        return this.getCart(userId);
    }
    /**
     * Remove Item: Removes a product from the user's cart by item ID.
     */
    async removeFromCart(userId, itemId) {
        logger_1.logger.info(`Removing item from cart. User: ${userId}, Item ID: ${itemId}`);
        const item = await this.cartItemRepository.findById(itemId);
        if (!item) {
            logger_1.logger.warn(`Failed to remove item: Cart item ${itemId} not found.`);
            throw new shared_1.NotFoundError(`Cart item not found`);
        }
        // Enforce strict security check
        if (item.cart.userId !== userId) {
            logger_1.logger.warn(`Unauthorized remove attempt: User ${userId} tried to delete item ${itemId} belonging to user ${item.cart.userId}.`);
            throw new shared_1.NotFoundError(`Cart item not found`);
        }
        await this.cartItemRepository.remove(item.id);
        logger_1.logger.info(`Item removed successfully. Cart item ID: ${itemId}`);
        return this.getCart(userId);
    }
    /**
     * Clear Cart: Deletes the user's cart and all its items.
     */
    async clearCart(userId) {
        logger_1.logger.info(`Clearing cart for user: ${userId}`);
        await this.cartRepository.deleteByUserId(userId);
        logger_1.logger.info(`Successfully cleared cart for user ${userId}.`);
    }
}
exports.CartService = CartService;
