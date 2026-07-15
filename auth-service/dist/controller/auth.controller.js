"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_1 = require("express");
const shared_1 = require("shared");
class AuthController {
    authService;
    router;
    constructor(authService) {
        this.authService = authService;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/register', this.register.bind(this));
        this.router.post('/login', this.login.bind(this));
        this.router.post('/validate', this.validate.bind(this));
    }
    async register(req, res, next) {
        try {
            const result = await this.authService.register(req.body);
            res.status(shared_1.HttpStatus.CREATED).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const result = await this.authService.login(req.body);
            res.status(shared_1.HttpStatus.OK).json(result);
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
                res.status(shared_1.HttpStatus.BAD_REQUEST).json({ valid: false, error: 'Token is required' });
                return;
            }
            const result = await this.authService.validateToken(token);
            if (result.valid) {
                res.status(shared_1.HttpStatus.OK).json(result);
            }
            else {
                res.status(shared_1.HttpStatus.UNAUTHORIZED).json({ valid: false, error: 'Invalid or expired token' });
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
