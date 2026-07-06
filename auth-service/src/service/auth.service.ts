import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, UserRole } from '../model/user';
import { UserRepository } from '../repository/user.repository';
import { RegisterRequestDto, LoginRequestDto, AuthResponseDto, ValidateResponseDto } from '../dto/auth.dto';

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    const { username, email, password, role } = dto;

    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required');
    }

    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    const passwordHash = this.userRepository.hashPassword(password);
    const user = await this.userRepository.create({
      username,
      email,
      passwordHash,
      role: role || UserRole.USER,
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

  public async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    const { username, password } = dto;

    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    const hash = this.userRepository.hashPassword(password);
    if (user.passwordHash !== hash) {
      throw new Error('Invalid username or password');
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

  public async validateToken(token: string): Promise<ValidateResponseDto> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
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
    } catch (error) {
      return { valid: false };
    }
  }

  private generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );
  }
}
