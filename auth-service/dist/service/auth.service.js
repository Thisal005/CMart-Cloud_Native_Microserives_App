"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const user_1 = require("../model/user");
const refresh_token_repository_1 = require("../repository/refresh-token.repository");
const errors_1 = require("../utils/errors");
class AuthService {
    userRepository;
    refreshTokenRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = new refresh_token_repository_1.RefreshTokenRepository();
    }
    async register(dto) {
        const { firstName, lastName, email, password, phoneNumber, role } = dto;
        if (!firstName || !lastName || !email || !password) {
            throw new Error('First name, last name, email, and password are required');
        }
        const emailExists = await this.userRepository.emailExists(email);
        if (emailExists) {
            throw new Error('Email already exists');
        }
        const passwordHash = await bcrypt_1.default.hash(password, config_1.config.bcryptSaltRounds);
        const user = await this.userRepository.create({
            firstName,
            lastName,
            email,
            passwordHash,
            phoneNumber: phoneNumber || null,
            role: role || undefined, // Let the database default apply
        });
        const token = this.generateToken(user);
        const refreshTokenStr = crypto_1.default.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + config_1.config.jwtRefreshExpirationDays);
        await this.refreshTokenRepository.create({
            token: refreshTokenStr,
            userId: user.id,
            expiresAt,
        });
        return {
            token,
            refreshToken: refreshTokenStr,
            user: this.toUserResponse(user),
        };
    }
    async login(dto) {
        const { email, password } = dto;
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Check account status before verifying password
        if (user.status === user_1.AccountStatus.INACTIVE) {
            throw new Error('Account is inactive. Please contact support.');
        }
        if (user.status === user_1.AccountStatus.SUSPENDED) {
            throw new Error('Account has been suspended. Please contact support.');
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        // Update last login timestamp
        await this.userRepository.updateLastLogin(user.id);
        const token = this.generateToken(user);
        const refreshTokenStr = crypto_1.default.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + config_1.config.jwtRefreshExpirationDays);
        await this.refreshTokenRepository.create({
            token: refreshTokenStr,
            userId: user.id,
            expiresAt,
        });
        return {
            token,
            refreshToken: refreshTokenStr,
            user: this.toUserResponse(user),
        };
    }
    async validateToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            const user = await this.userRepository.findById(decoded.id);
            if (!user) {
                return { valid: false };
            }
            // Reject tokens for non-active accounts
            if (user.status !== user_1.AccountStatus.ACTIVE) {
                return { valid: false };
            }
            return {
                valid: true,
                user: this.toUserResponse(user),
            };
        }
        catch (error) {
            return { valid: false };
        }
    }
    async getProfile(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return this.toUserResponse(user);
    }
    async refreshToken(tokenStr) {
        if (!tokenStr) {
            throw new errors_1.BadRequestError('Refresh token is required');
        }
        const refreshToken = await this.refreshTokenRepository.findByToken(tokenStr);
        if (!refreshToken) {
            throw new errors_1.UnauthorizedError('Invalid refresh token');
        }
        if (refreshToken.revokedAt) {
            throw new errors_1.UnauthorizedError('Refresh token has been revoked');
        }
        if (new Date() > refreshToken.expiresAt) {
            throw new errors_1.UnauthorizedError('Refresh token has expired');
        }
        const user = await this.userRepository.findById(refreshToken.userId);
        if (!user || user.status !== user_1.AccountStatus.ACTIVE) {
            throw new errors_1.UnauthorizedError('User account is inactive or not found');
        }
        // Revoke current refresh token
        await this.refreshTokenRepository.revoke(tokenStr);
        // Generate new access and refresh tokens (token rotation)
        const newAccessToken = this.generateToken(user);
        const newRefreshTokenStr = crypto_1.default.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + config_1.config.jwtRefreshExpirationDays);
        await this.refreshTokenRepository.create({
            token: newRefreshTokenStr,
            userId: user.id,
            expiresAt,
        });
        return {
            token: newAccessToken,
            refreshToken: newRefreshTokenStr,
        };
    }
    async logout(tokenStr) {
        if (!tokenStr) {
            throw new errors_1.BadRequestError('Refresh token is required');
        }
        const refreshToken = await this.refreshTokenRepository.findByToken(tokenStr);
        if (!refreshToken) {
            throw new errors_1.UnauthorizedError('Invalid refresh token');
        }
        if (refreshToken.revokedAt) {
            return; // Already revoked
        }
        await this.refreshTokenRepository.revoke(tokenStr);
    }
    generateToken(user) {
        return jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
        }, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiration });
    }
    toUserResponse(user) {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
        };
    }
}
exports.AuthService = AuthService;
