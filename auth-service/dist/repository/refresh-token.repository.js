"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRepository = void 0;
const refresh_token_1 = require("../model/refresh-token");
const data_source_1 = require("../config/data-source");
class RefreshTokenRepository {
    repository;
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(refresh_token_1.RefreshToken);
    }
    /**
     * Find a refresh token by its token string.
     */
    async findByToken(token) {
        return this.repository.findOne({
            where: { token },
        });
    }
    /**
     * Creates and saves a new refresh token.
     */
    async create(data) {
        const refreshToken = this.repository.create(data);
        return this.repository.save(refreshToken);
    }
    /**
     * Revokes a refresh token by updating its revoked_at timestamp.
     */
    async revoke(token) {
        await this.repository.update({ token }, { revokedAt: new Date() });
    }
}
exports.RefreshTokenRepository = RefreshTokenRepository;
