# Authentication & Authorization Patterns

## Overview

This application implements JWT-based stateless authentication with Passport.js strategies. The authentication system prioritizes security, scalability, and developer experience while preventing common security vulnerabilities.

## Authentication Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Client Request                        │
│              (with Bearer Token)                        │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                JWT Guard                                │
│           (JwtAuthGuard)                               │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│               JWT Strategy                              │
│         (validates token & user)                       │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│             Auth Service                                │
│          (user validation)                              │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│             Controller                                  │
│      (@CurrentUser() decorator)                        │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Auth Service (`src/auth/auth.service.ts`)

The central authentication service handles user registration, login, and validation.

```typescript
@Injectable()
export class AuthService {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER) private userRepository: IUserRepository,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // 1. Check if user exists
    // 2. Create user entity with hashed password
    // 3. Save to database
    // 4. Generate JWT token
    // 5. Return auth response
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // 1. Find user by email
    // 2. Validate password (with timing attack protection)
    // 3. Update last login timestamp
    // 4. Generate JWT token
    // 5. Return auth response
  }

  async validateUser(userId: string): Promise<PublicUser | null> {
    // Used by JWT strategy to validate token payload
  }
}
```

**Key Security Features:**
- Password hashing with bcrypt (salt rounds: 12)
- Timing attack prevention during login
- User existence check during registration
- Last login tracking

### 2. JWT Strategy (`src/auth/strategies/jwt.strategy.ts`)

Passport strategy for validating JWT tokens.

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: { sub: string; email: string }): Promise<PublicUser> {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

**Configuration:**
- Extracts token from Authorization header
- Validates token expiration
- Verifies user still exists and is active

### 3. JWT Guard (`src/auth/guards/jwt-auth.guard.ts`)

Guards protect routes requiring authentication.

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Extends Passport's AuthGuard with JWT strategy
}
```

**Usage:**
```typescript
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountController {
  // All endpoints require authentication
}
```

### 4. Current User Decorator (`src/common/decorators/current-user.decorator.ts`)

Custom decorator to access the authenticated user in controllers.

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PublicUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

**Usage:**
```typescript
async createAccount(
  @CurrentUser() user: PublicUser,
  @Body() createAccountDto: CreateAccountDto,
): Promise<DetailedAccountResponseDto> {
  // user.id is available for authorization
}
```

## Security Patterns

### 1. Password Security

#### Password Hashing
```typescript
// In User entity
static async create(
  email: string,
  firstName: string,
  lastName: string,
  plainPassword: string,
): Promise<{...}> {
  const passwordHash = await bcrypt.hash(
    plainPassword,
    authConfig.saltRounds, // 12 rounds
  );
  // ...
}
```

#### Password Validation
```typescript
// In User entity
async validatePassword(plainPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, this.passwordHash);
}
```

### 2. Timing Attack Prevention

During login, the system prevents timing attacks by always performing password validation:

```typescript
async login(loginDto: LoginDto): Promise<AuthResponseDto> {
  const user = await this.userRepository.findByEmailWithPassword(email);

  // Always validate password to prevent timing attacks
  let isPasswordValid = false;
  if (user) {
    isPasswordValid = await user.validatePassword(password);
  } else {
    // Perform dummy password validation to maintain consistent timing
    await this.performDummyPasswordValidation(password);
  }

  if (!user || !isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }
  // ...
}

private async performDummyPasswordValidation(password: string): Promise<void> {
  await bcrypt.compare(password, authConfig.dummyPasswordHash);
}
```

### 3. JWT Token Security

#### Token Configuration
```typescript
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'fallback-secret',
  expiresIn: '7d',
};
```

#### Token Structure
```typescript
// Payload
{
  "sub": "user-uuid",      // Subject (user ID)
  "email": "user@email.com",
  "iat": 1234567890,       // Issued at
  "exp": 1234567890        // Expires at
}
```

#### Token Generation
```typescript
private generateToken(user: User): string {
  const payload = { sub: user.id, email: user.email };
  return this.jwtService.sign(payload);
}
```

## Authorization Patterns

### 1. Resource Ownership Verification

All services verify that users can only access their own resources:

```typescript
async getAccountById(accountId: string, userId: string): Promise<Account> {
  const account = await this.accountRepository.findById(accountId);

  if (!account) {
    throw new NotFoundException('Account not found');
  }

  // Verify ownership
  if (account.userId !== userId) {
    throw new ForbiddenException('Access denied');
  }

  return account;
}
```

### 2. Service-Level Authorization

Authorization logic is implemented at the service layer:

```typescript
@Injectable()
export class AccountService {
  async getUserAccounts(userId: string): Promise<Account[]> {
    // Automatically filters by userId
    return this.accountRepository.findByUserId(userId);
  }

  async updateAccount(
    accountId: string,
    userId: string,
    updateData: UpdateAccountDto,
  ): Promise<Account> {
    // First verify ownership, then update
    const account = await this.getAccountById(accountId, userId);
    return this.accountRepository.update(accountId, updateData);
  }
}
```

## Data Transfer Objects (DTOs)

### 1. Authentication DTOs

#### Registration DTO
```typescript
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}
```

#### Login DTO
```typescript
export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
```

#### Auth Response DTO
```typescript
export class AuthResponseDto {
  @ApiProperty()
  user: PublicUser;

  @ApiProperty()
  token: string;

  @ApiProperty()
  expiresIn: string;

  static create(user: User, token: string): AuthResponseDto {
    const dto = new AuthResponseDto();
    dto.user = user.toPublic();
    dto.token = token;
    dto.expiresIn = jwtConfig.expiresIn;
    return dto;
  }
}
```

### 2. User Types

#### Public User Interface
```typescript
export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Usage:** Safe user data for client consumption (no password hash).

## Implementation Guidelines

### 1. Adding Authentication to New Endpoints

```typescript
@UseGuards(JwtAuthGuard)
@ApiTags('your-resource')
@ApiBearerAuth()
@Controller('your-resource')
export class YourController {
  @Get()
  async getResources(
    @CurrentUser() user: PublicUser,
  ): Promise<ResourceDto[]> {
    return this.yourService.getUserResources(user.id);
  }
}
```

### 2. Service Authorization Pattern

```typescript
@Injectable()
export class YourService {
  async getResourceById(
    resourceId: string,
    userId: string,
  ): Promise<Resource> {
    const resource = await this.repository.findById(resourceId);

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    // Authorization check
    if (resource.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return resource;
  }
}
```

### 3. Error Handling

#### Authentication Errors
```typescript
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Authorization Errors
```typescript
{
  "statusCode": 403,
  "message": "Access denied",
  "error": "Forbidden"
}
```

#### Invalid Credentials
```typescript
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

## Configuration

### Environment Variables

```env
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-use-strong-random-value"
JWT_EXPIRES_IN="7d"

# Application
NODE_ENV="development"
```

### Auth Configuration (`src/config/auth.config.ts`)

```typescript
export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  saltRounds: 12,
  dummyPasswordHash: '$2b$12$dummyHashToPreventTimingAttacks...',
};
```

## Testing Patterns

### 1. Authentication Testing

```typescript
describe('AuthService', () => {
  it('should register new user', async () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = await authService.register(registerDto);

    expect(result.user.email).toBe(registerDto.email);
    expect(result.token).toBeDefined();
  });

  it('should login with valid credentials', async () => {
    // Setup user
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = await authService.login(loginDto);

    expect(result.user.email).toBe(loginDto.email);
    expect(result.token).toBeDefined();
  });
});
```

### 2. Authorization Testing

```typescript
describe('AccountController', () => {
  it('should deny access to other users accounts', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const account = await createTestAccount(user1.id);

    // User2 tries to access User1's account
    await expect(
      accountService.getAccountById(account.id, user2.id)
    ).rejects.toThrow(ForbiddenException);
  });
});
```

### 3. Integration Testing

```typescript
describe('Authentication E2E', () => {
  it('should protect private endpoints', async () => {
    const response = await request(app.getHttpServer())
      .get('/accounts')
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');
  });

  it('should allow access with valid token', async () => {
    const { token } = await authTestHelper.registerAndLogin();

    const response = await request(app.getHttpServer())
      .get('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

## Security Best Practices

### 1. Token Management
- Use strong, random JWT secrets
- Set appropriate token expiration times
- Consider implementing token refresh mechanism for long-lived sessions

### 2. Password Security
- Enforce strong password requirements
- Use sufficient bcrypt salt rounds (12+)
- Never log or expose password hashes

### 3. Authorization
- Always verify resource ownership at service layer
- Use principle of least privilege
- Implement consistent authorization patterns

### 4. Error Handling
- Don't expose sensitive information in error messages
- Use consistent error responses
- Log security events for monitoring

### 5. Configuration
- Use environment variables for secrets
- Different configurations for different environments
- Regular secret rotation in production

This authentication system provides a solid foundation for secure user management while being extensible for future requirements like role-based access control, OAuth integration, or multi-factor authentication.