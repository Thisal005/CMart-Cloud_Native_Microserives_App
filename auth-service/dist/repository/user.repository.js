"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const user_1 = require("../model/user");
const data_source_1 = require("../config/data-source");
class UserRepository {
    repository;
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(user_1.User);
    }
    /**
     * Find a user by their unique ID.
     */
    async findById(id) {
        return this.repository.findOne({
            where: { id },
        });
    }
    /**
     * Find a user by their email address (case-insensitive search).
     */
    async findByEmail(email) {
        return this.repository.findOne({
            where: { email: email.toLowerCase() },
        });
    }
    /**
     * Check if a user with the given email address already exists.
     */
    async emailExists(email) {
        const count = await this.repository.count({
            where: { email: email.toLowerCase() },
        });
        return count > 0;
    }
    /**
     * Creates a new User instance (not saved to the DB yet).
     */
    createInstance(data) {
        return this.repository.create({
            ...data,
            email: data.email?.toLowerCase(),
        });
    }
    /**
     * Creates and saves a new user in a single operation.
     */
    async create(data) {
        const user = this.createInstance(data);
        return this.repository.save(user);
    }
    /**
     * Persists a User entity instance to the database.
     * This is used for both inserts and updates of pre-loaded/constructed instances.
     */
    async save(user) {
        if (user.email) {
            user.email = user.email.toLowerCase();
        }
        return this.repository.save(user);
    }
    /**
     * Updates an existing user by merging partial data.
     * Loads the user first to ensure @BeforeUpdate lifecycle hooks are triggered on save.
     */
    async update(id, data) {
        const user = await this.findById(id);
        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }
        this.repository.merge(user, {
            ...data,
            email: data.email?.toLowerCase(),
        });
        return this.repository.save(user);
    }
    /**
     * Updates the last login timestamp of a user.
     */
    async updateLastLogin(id) {
        await this.repository.update(id, {
            lastLoginAt: new Date(),
        });
    }
    /**
     * Performs a hard delete on a user by ID.
     */
    async delete(id) {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
    /**
     * Performs a soft delete by marking the user's account status as INACTIVE.
     * Note: The current database schema does not have a dedicated 'deleted_at' timestamp,
     * so soft deletion is represented logically by changing the account status.
     */
    async softDelete(id) {
        const user = await this.findById(id);
        if (!user) {
            return false;
        }
        user.status = user_1.AccountStatus.INACTIVE;
        await this.repository.save(user);
        return true;
    }
}
exports.UserRepository = UserRepository;
