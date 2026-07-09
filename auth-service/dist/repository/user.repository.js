"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const user_1 = require("../model/user");
const crypto_1 = __importDefault(require("crypto"));
class UserRepository {
    users = [];
    constructor() {
        // Seed default users for testing
        this.seedUsers();
    }
    seedUsers() {
        const defaultUsers = [
            {
                username: 'admin',
                email: 'admin@cmart.com',
                password: 'adminpassword',
                role: user_1.UserRole.ADMIN,
            },
            {
                username: 'john_doe',
                email: 'john@gmail.com',
                password: 'userpassword',
                role: user_1.UserRole.USER,
            }
        ];
        for (const u of defaultUsers) {
            const passwordHash = this.hashPassword(u.password);
            this.users.push({
                id: crypto_1.default.randomUUID(),
                username: u.username,
                email: u.email,
                passwordHash,
                role: u.role,
                createdAt: new Date(),
            });
        }
    }
    hashPassword(password) {
        return crypto_1.default.createHash('sha256').update(password).digest('hex');
    }
    async findByUsername(username) {
        return this.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    }
    async findByEmail(email) {
        return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }
    async findById(id) {
        return this.users.find((u) => u.id === id);
    }
    async create(user) {
        const newUser = {
            ...user,
            id: crypto_1.default.randomUUID(),
            createdAt: new Date(),
        };
        this.users.push(newUser);
        return newUser;
    }
}
exports.UserRepository = UserRepository;
