"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const user_1 = require("../model/user");
const shared_1 = require("shared");
class AuthService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async register(dto) {
        const { username, email, password, role } = dto;
        if (!username || !email || !password) {
            throw new shared_1.ValidationError('Username, email, and password are required');
        }
        const existingUser = await this.userRepository.findByUsername(username);
        if (existingUser) {
            throw new shared_1.ConflictError('Username already exists');
        }
        const existingEmail = await this.userRepository.findByEmail(email);
        if (existingEmail) {
            throw new shared_1.ConflictError('Email already exists');
        }
        const passwordHash = this.userRepository.hashPassword(password);
        const user = await this.userRepository.create({
            username,
            email,
            passwordHash,
            role: role || user_1.UserRole.USER,
        });
        const token = this.generateToken(user);
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        };
    }
    async login(dto) {
        const { username, password } = dto;
        if (!username || !password) {
            throw new shared_1.ValidationError('Username and password are required');
        }
        const user = await this.userRepository.findByUsername(username);
        if (!user) {
            throw new shared_1.AuthenticationError('Invalid username or password');
        }
        const hash = this.userRepository.hashPassword(password);
        if (user.passwordHash !== hash) {
            throw new shared_1.AuthenticationError('Invalid username or password');
        }
        const token = this.generateToken(user);
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        };
    }
    async validateToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            const user = await this.userRepository.findById(decoded.id);
            if (!user) {
                return { valid: false };
            }
            return {
                valid: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            };
        }
        catch (error) {
            return { valid: false };
        }
    }
    generateToken(user) {
        return jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        }, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiration });
    }
}
exports.AuthService = AuthService;
