import { Repository } from 'typeorm';
import { RefreshToken } from '../model/refresh-token';
import { AppDataSource } from '../config/data-source';

export class RefreshTokenRepository {
  private repository: Repository<RefreshToken>;

  constructor() {
    this.repository = AppDataSource.getRepository(RefreshToken);
  }

  /**
   * Find a refresh token by its token string.
   */
  public async findByToken(token: string): Promise<RefreshToken | null> {
    return this.repository.findOne({
      where: { token },
    });
  }

  /**
   * Creates and saves a new refresh token.
   */
  public async create(data: Partial<RefreshToken>): Promise<RefreshToken> {
    const refreshToken = this.repository.create(data);
    return this.repository.save(refreshToken);
  }

  /**
   * Revokes a refresh token by updating its revoked_at timestamp.
   */
  public async revoke(token: string): Promise<void> {
    await this.repository.update({ token }, { revokedAt: new Date() });
  }
}
