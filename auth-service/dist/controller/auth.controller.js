"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const errors_1 = require("../utils/errors");
class AuthController {
    authService;
    router;
    constructor(authService) {
        this.authService = authService;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/register', (0, validation_middleware_1.validateBody)(validation_middleware_1.validateRegisterBody), this.register.bind(this));
        this.router.post('/login', (0, validation_middleware_1.validateBody)(validation_middleware_1.validateLoginBody), this.login.bind(this));
        this.router.post('/validate', this.validate.bind(this));
        this.router.get('/me', auth_middleware_1.authenticateToken, this.getProfile.bind(this));
        this.router.post('/refresh-token', (0, validation_middleware_1.validateBody)(validation_middleware_1.validateRefreshTokenBody), this.refreshToken.bind(this));
        this.router.post('/logout', (0, validation_middleware_1.validateBody)(validation_middleware_1.validateRefreshTokenBody), this.logout.bind(this));
    }
    async register(req, res, next) {
        try {
            const result = await this.authService.register(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const result = await this.authService.login(req.body);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async validate(req, res, next) {
        try {
            // Look for token in Authorization header or body
            let token = req.body.token || req.headers.authorization;
            if (token && token.startsWith('Bearer ')) {
                token = token.slice(7, token.length);
            }
            if (!token) {
                throw new errors_1.BadRequestError('Token is required');
            }
            const result = await this.authService.validateToken(token);
            if (result.valid) {
                res.json(result);
            }
            else {
                throw new errors_1.UnauthorizedError('Invalid or expired token');
            }
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            if (!req.user) {
                throw new errors_1.UnauthorizedError('Unauthorized');
            }
            const profile = await this.authService.getProfile(req.user.id);
            res.json(profile);
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await this.authService.refreshToken(refreshToken);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            await this.authService.logout(refreshToken);
            res.status(200).json({ success: true, message: 'Logged out successfully' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
