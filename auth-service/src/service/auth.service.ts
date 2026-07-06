import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { config } from '../config';
import { User, AccountStatus } from '../model/user';
import { UserRepository } from '../repository/user.repository';
import {
  RegisterRequestDto,
  LoginRequestDto,
  AuthResponseDto,
  ValidateResponseDto,
  UserResponseDto,
} from '../dto/auth.dto';

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    const { firstName, lastName, email, password, phoneNumber, role } = dto;

    if (!firstName || !lastName || !email || !password) {
      throw new Error('First name, last name, email, and password are required');
    }

    const emailExists = await this.userRepository.emailExists(email);
    if (emailExists) {
      throw new Error('Email already exists');
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

    return {
      token,
      user: this.toUserResponse(user),
    };
  }

  public async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    const { email, password } = dto;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check account status before verifying password
    if (user.status === AccountStatus.INACTIVE) {
      throw new Error('Account is inactive. Please contact support.');
    }
    if (user.status === AccountStatus.SUSPENDED) {
      throw new Error('Account has been suspended. Please contact support.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login timestamp
    await this.userRepository.updateLastLogin(user.id);

    const token = this.generateToken(user);

    return {
      token,
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
