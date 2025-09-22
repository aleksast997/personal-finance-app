import * as bcrypt from 'bcrypt';
import { authConfig } from '../config/auth.config';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    private passwordHash: string,
    public readonly isActive: boolean = true,
    public readonly lastLogin: Date | null = null,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  // Factory method for creating new users
  static async create(
    email: string,
    firstName: string,
    lastName: string,
    plainPassword: string,
  ): Promise<{
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
  }> {
    const passwordHash = await bcrypt.hash(
      plainPassword,
      authConfig.saltRounds,
    );

    return {
      email,
      firstName,
      lastName,
      passwordHash,
    };
  }

  // Business methods
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.passwordHash);
  }

  deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.firstName,
      this.lastName,
      this.passwordHash,
      false, // isActive = false
      this.lastLogin,
      this.createdAt,
      new Date(), // updated timestamp
    );
  }

  // For serialization (remove sensitive data)
  toPublic() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Get password hash (only for repository operations)
  getPasswordHash(): string {
    return this.passwordHash;
  }
}
