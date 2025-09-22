import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/interfaces/user-repository.interface';
import { authConfig } from '../config/auth.config';
import { PublicUser } from './types/auth.types';
import { REPOSITORY_TOKENS } from '../repositories/repository.module';

@Injectable()
export class AuthService {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER) private userRepository: IUserRepository,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const userExists = await this.userRepository.existsByEmail(email);
    if (userExists) {
      throw new BadRequestException('User already exists with this email');
    }

    // Create user entity (with hashed password)
    const newUserData = await User.create(email, firstName, lastName, password);

    // Save to database
    const savedUser = await this.userRepository.save({
      email: newUserData.email,
      firstName: newUserData.firstName,
      lastName: newUserData.lastName,
      passwordHash: newUserData.passwordHash,
    });

    // Generate JWT token
    const token = this.generateToken(savedUser);

    return AuthResponseDto.create(savedUser, token);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user with password
    const user = await this.userRepository.findByEmailWithPassword(email);

    // Always validate password to prevent timing attacks, even if user doesn't exist
    let isPasswordValid = false;
    if (user) {
      isPasswordValid = await user.validatePassword(password);
    } else {
      // Perform dummy password validation to maintain consistent timing
      await this.performDummyPasswordValidation(password);
    }

    // Check both user existence and password validity
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Generate JWT token
    const token = this.generateToken(user);

    return AuthResponseDto.create(user, token);
  }

  async validateUser(userId: string): Promise<PublicUser | null> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      return null;
    }

    return user.toPublic(); // Return public data for JWT strategy
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  // Dummy password validation to prevent timing attacks
  private async performDummyPasswordValidation(
    password: string,
  ): Promise<void> {
    // Use a fixed hash for dummy validation to maintain consistent timing
    await bcrypt.compare(password, authConfig.dummyPasswordHash);
  }
}
