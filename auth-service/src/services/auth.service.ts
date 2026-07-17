import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { config } from '../config';
import { User, AccountStatus } from '../models/user';
import { UserRepository } from '../repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { ValidationError, AuthenticationError, ConflictError, NotFoundError } from 'shared';
import {
  RegisterRequestDto,
  LoginRequestDto,
  AuthResponseDto,
  ValidateResponseDto,
  UserResponseDto,
} from '../types/auth.dto';

export class AuthService {
  private userRepository: UserRepository;
  private refreshTokenRepository: RefreshTokenRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
    this.refreshTokenRepository = new RefreshTokenRepository();
  }


  public async register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    const { firstName, lastName, email, password, phoneNumber, role } = dto;

    if (!firstName || !lastName || !email || !password) {
      throw new ValidationError('First name, last name, email, and password are required');
    }

    const emailExists = await this.userRepository.emailExists(email);
    if (emailExists) {
      throw new ConflictError('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);

    const user = await this.userRepository.create({
      firstName,
      lastName,
      email,
      passwordHash,
      phoneNumber: phoneNumber || null,
      role: role || undefined, // Let the database default apply
    });

    const token = this.generateToken(user);
    const refreshTokenStr = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.jwtRefreshExpirationDays);

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

  public async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    const { email, password } = dto;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check account status before verifying password
    if (user.status === AccountStatus.INACTIVE) {
      throw new AuthenticationError('Account is inactive. Please contact support.');
    }
    if (user.status === AccountStatus.SUSPENDED) {
      throw new AuthenticationError('Account has been suspended. Please contact support.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login timestamp
    await this.userRepository.updateLastLogin(user.id);

    const token = this.generateToken(user);
    const refreshTokenStr = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.jwtRefreshExpirationDays);

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

  public async validateToken(token: string): Promise<ValidateResponseDto> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      const user = await this.userRepository.findById(decoded.id);

      if (!user) {
        return { valid: false };
      }

      // Reject tokens for non-active accounts
      if (user.status !== AccountStatus.ACTIVE) {
        return { valid: false };
      }

      return {
        valid: true,
        user: this.toUserResponse(user),
      };
    } catch (error) {
      return { valid: false };
    }
  }

  public async getProfile(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.toUserResponse(user);
  }

  public async refreshToken(tokenStr: string): Promise<{ token: string; refreshToken: string }> {
    if (!tokenStr) {
      throw new ValidationError('Refresh token is required');
    }

    const refreshToken = await this.refreshTokenRepository.findByToken(tokenStr);
    if (!refreshToken) {
      throw new AuthenticationError('Invalid refresh token');
    }

    if (refreshToken.revokedAt) {
      throw new AuthenticationError('Refresh token has been revoked');
    }

    if (new Date() > refreshToken.expiresAt) {
      throw new AuthenticationError('Refresh token has expired');
    }

    const user = await this.userRepository.findById(refreshToken.userId);
    if (!user || user.status !== AccountStatus.ACTIVE) {
      throw new AuthenticationError('User account is inactive or not found');
    }

    // Revoke current refresh token
    await this.refreshTokenRepository.revoke(tokenStr);

    // Generate new access and refresh tokens (token rotation)
    const newAccessToken = this.generateToken(user);
    const newRefreshTokenStr = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.jwtRefreshExpirationDays);

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

  public async logout(tokenStr: string): Promise<void> {
    if (!tokenStr) {
      throw new ValidationError('Refresh token is required');
    }

    const refreshToken = await this.refreshTokenRepository.findByToken(tokenStr);
    if (!refreshToken) {
      throw new AuthenticationError('Invalid refresh token');
    }

    if (refreshToken.revokedAt) {
      return; // Already revoked
    }

    await this.refreshTokenRepository.revoke(tokenStr);
  }


  private generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration as StringValue }
    );
  }

  private toUserResponse(user: User): UserResponseDto {
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
