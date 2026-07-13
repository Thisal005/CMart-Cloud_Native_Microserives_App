"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductClient = void 0;
const axios_1 = __importDefault(require("axios"));
const shared_1 = require("shared");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class ProductClient {
    baseUrl;
    constructor() {
        this.baseUrl = config_1.config.productServiceUrl;
    }
    /**
     * Fetch product details by product ID from the Product Service.
     */
    async getProductById(id) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/api/products/${id}`);
            return response.data;
        }
        catch (error) {
            this.handleError(error, `fetching product with ID ${id}`);
        }
    }
    /**
     * Check if a product is available and has sufficient stock.
     */
    async checkAvailability(id, quantity) {
        const product = await this.getProductById(id);
        return product.stock >= quantity;
    }
    /**
     * Retrieve the current price of a product.
     */
    async getProductPrice(id) {
        const product = await this.getProductById(id);
        return product.price;
    }
    /**
     * Validate that the product exists.
     */
    async validateProductStatus(id) {
        try {
            await this.getProductById(id);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Maps Axios exceptions to standard shared application error structures.
     */
    handleError(error, action) {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.error || error.message;
            logger_1.logger.warn(`Product client error during ${action}: [Status ${status}] ${message}`);
            if (status === 404) {
                throw new shared_1.NotFoundError(`Product not found: ${message}`);
            }
            if (status === 400) {
                throw new shared_1.ValidationError(`Validation failed: ${message}`);
            }
            throw new shared_1.InternalServerError(`Product Service returned unexpected status ${status} during ${action}`);
        }
        logger_1.logger.error(`Product client communication failure during ${action}: ${error.message}`, error);
        throw new shared_1.InternalServerError(`Failed to communicate with Product Service during ${action}`);
    }
}
exports.ProductClient = ProductClient;
