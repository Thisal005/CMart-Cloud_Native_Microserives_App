"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.AccountStatus = exports.Role = void 0;
const typeorm_1 = require("typeorm");
// ── Enums ──────────────────────────────────────────────────
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["INACTIVE"] = "INACTIVE";
    AccountStatus["SUSPENDED"] = "SUSPENDED";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
// ── Entity ─────────────────────────────────────────────────
let User = class User {
    id;
    firstName;
    lastName;
    email;
    passwordHash;
    phoneNumber;
    role;
    status;
    emailVerified;
    createdAt;
    updatedAt;
    lastLoginAt;
    // ── Validation Lifecycle Hooks ─────────────────────────────
    validate() {
        if (!this.firstName || this.firstName.trim().length === 0) {
            throw new Error('First name cannot be empty');
        }
        if (this.firstName.length > 100) {
            throw new Error('First name cannot exceed 100 characters');
        }
        if (!this.lastName || this.lastName.trim().length === 0) {
            throw new Error('Last name cannot be empty');
        }
        if (this.lastName.length > 100) {
            throw new Error('Last name cannot exceed 100 characters');
        }
        if (!this.email || this.email.trim().length === 0) {
            throw new Error('Email cannot be empty');
        }
        if (this.email.length > 255) {
            throw new Error('Email cannot exceed 255 characters');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            throw new Error('Invalid email format');
        }
        if (!this.passwordHash || this.passwordHash.trim().length === 0) {
            throw new Error('Password hash cannot be empty');
        }
        if (this.passwordHash.length > 255) {
            throw new Error('Password hash cannot exceed 255 characters');
        }
        if (this.phoneNumber !== undefined && this.phoneNumber !== null) {
            if (this.phoneNumber.trim().length === 0) {
                this.phoneNumber = null;
            }
            else {
                if (this.phoneNumber.length > 20) {
                    throw new Error('Phone number cannot exceed 20 characters');
                }
                const simplePhoneRegex = /^\+?[0-9\s\-()]+$/;
                if (!simplePhoneRegex.test(this.phoneNumber)) {
                    throw new Error('Invalid phone number format');
                }
            }
        }
        if (this.role && !Object.values(Role).includes(this.role)) {
            throw new Error('Invalid user role');
        }
        if (this.status && !Object.values(AccountStatus).includes(this.status)) {
            throw new Error('Invalid account status');
        }
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name', type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Role,
        enumName: 'user_role',
        default: Role.USER,
        nullable: false,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AccountStatus,
        enumName: 'account_status',
        default: AccountStatus.ACTIVE,
        nullable: false,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_verified', type: 'boolean', default: false, nullable: false }),
    __metadata("design:type", Boolean)
], User.prototype, "emailVerified", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_login_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], User.prototype, "validate", null);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
