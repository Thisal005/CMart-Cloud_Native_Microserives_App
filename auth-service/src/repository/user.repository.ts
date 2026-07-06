import { User, UserRole } from '../model/user';
import crypto from 'crypto';

export class UserRepository {
  private users: User[] = [];

  constructor() {
    // Seed default users for testing
    this.seedUsers();
  }

  private seedUsers() {
    const defaultUsers = [
      {
        username: 'admin',
        email: 'admin@cmart.com',
        password: 'adminpassword',
        role: UserRole.ADMIN,
      },
      {
        username: 'john_doe',
        email: 'john@gmail.com',
        password: 'userpassword',
        role: UserRole.USER,
      }
    ];

    for (const u of defaultUsers) {
      const passwordHash = this.hashPassword(u.password);
      this.users.push({
        id: crypto.randomUUID(),
        username: u.username,
        email: u.email,
        passwordHash,
        role: u.role,
        createdAt: new Date(),
      });
    }
  }

  public hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  public async findByUsername(username: string): Promise<User | undefined> {
    return this.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public async findById(id: string): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  public async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }
}
