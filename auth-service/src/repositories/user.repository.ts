import { Repository } from 'typeorm';
import { User, AccountStatus } from '../models/user';
import { AppDataSource } from '../config/data-source';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  /**
   * Find a user by their unique ID.
   */
  public async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Find a user by their email address (case-insensitive search).
   */
  public async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Check if a user with the given email address already exists.
   */
  public async emailExists(email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }

  /**
   * Creates a new User instance (not saved to the DB yet).
   */
  public createInstance(data: Partial<User>): User {
    return this.repository.create({
      ...data,
      email: data.email?.toLowerCase(),
    });
  }

  /**
   * Creates and saves a new user in a single operation.
   */
  public async create(data: Partial<User>): Promise<User> {
    const user = this.createInstance(data);
    return this.repository.save(user);
  }

  /**
   * Persists a User entity instance to the database.
   * This is used for both inserts and updates of pre-loaded/constructed instances.
   */
  public async save(user: User): Promise<User> {
    if (user.email) {
      user.email = user.email.toLowerCase();
    }
    return this.repository.save(user);
  }

  /**
   * Updates an existing user by merging partial data.
   * Loads the user first to ensure @BeforeUpdate lifecycle hooks are triggered on save.
   */
  public async update(id: string, data: Partial<User>): Promise<User> {
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
  public async updateLastLogin(id: string): Promise<void> {
    await this.repository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  /**
   * Performs a hard delete on a user by ID.
   */
  public async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Performs a soft delete by marking the user's account status as INACTIVE.
   * Note: The current database schema does not have a dedicated 'deleted_at' timestamp,
   * so soft deletion is represented logically by changing the account status.
   */
  public async softDelete(id: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) {
      return false;
    }
    user.status = AccountStatus.INACTIVE;
    await this.repository.save(user);
    return true;
  }
}
