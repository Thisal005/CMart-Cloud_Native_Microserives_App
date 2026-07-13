"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRefreshTokenBody = exports.validateLoginBody = exports.validateRegisterBody = void 0;
exports.validateBody = validateBody;
const errors_1 = require("../utils/errors");
/**
 * Express middleware to validate the request body against a validator function.
 * Throws a ValidationError if the request payload is invalid.
 */
function validateBody(validator) {
    return (req, res, next) => {
        const { error, details } = validator(req.body);
        if (error) {
            next(new errors_1.ValidationError(error, details));
            return;
        }
        next();
    };
}
/**
 * Validation rules for user registration.
 */
const validateRegisterBody = (body) => {
    const details = {};
    const { firstName, lastName, email, password, phoneNumber } = body;
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
        details.firstName = 'First name is required and must be a non-empty string';
    }
    else if (firstName.length > 100) {
        details.firstName = 'First name cannot exceed 100 characters';
    }
    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
        details.lastName = 'Last name is required and must be a non-empty string';
    }
    else if (lastName.length > 100) {
        details.lastName = 'Last name cannot exceed 100 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        details.email = 'Email is required';
    }
    else if (typeof email !== 'string' || !emailRegex.test(email)) {
        details.email = 'Invalid email format';
    }
    else if (email.length > 255) {
        details.email = 'Email cannot exceed 255 characters';
    }
    if (!password || typeof password !== 'string') {
        details.password = 'Password is required';
    }
    else if (password.length < 8) {
        details.password = 'Password must be at least 8 characters long';
    }
    if (phoneNumber !== undefined && phoneNumber !== null) {
        if (typeof phoneNumber !== 'string' || phoneNumber.trim().length === 0) {
            details.phoneNumber = 'Phone number must be a non-empty string';
        }
        else if (phoneNumber.length > 20) {
            details.phoneNumber = 'Phone number cannot exceed 20 characters';
        }
        else {
            const simplePhoneRegex = /^\+?[0-9\s\-()]+$/;
            if (!simplePhoneRegex.test(phoneNumber)) {
                details.phoneNumber = 'Invalid phone number format';
            }
        }
    }
    const hasErrors = Object.keys(details).length > 0;
    return {
        error: hasErrors ? 'Registration request validation failed' : undefined,
        details: hasErrors ? details : undefined,
    };
};
exports.validateRegisterBody = validateRegisterBody;
/**
 * Validation rules for user login.
 */
const validateLoginBody = (body) => {
    const details = {};
    const { email, password } = body;
    if (!email || typeof email !== 'string') {
        details.email = 'Email is required';
    }
    if (!password || typeof password !== 'string') {
        details.password = 'Password is required';
    }
    const hasErrors = Object.keys(details).length > 0;
    return {
        error: hasErrors ? 'Login request validation failed' : undefined,
        details: hasErrors ? details : undefined,
    };
};
exports.validateLoginBody = validateLoginBody;
/**
 * Validation rules for refresh token and logout requests.
 */
const validateRefreshTokenBody = (body) => {
    const details = {};
    const { refreshToken } = body;
    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
        details.refreshToken = 'Refresh token is required';
    }
    const hasErrors = Object.keys(details).length > 0;
    return {
        error: hasErrors ? 'Refresh token request validation failed' : undefined,
        details: hasErrors ? details : undefined,
    };
};
exports.validateRefreshTokenBody = validateRefreshTokenBody;
