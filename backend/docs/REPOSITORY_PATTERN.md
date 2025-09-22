# Repository Pattern Implementation

## Overview

This project implements the **Repository Pattern** to abstract data access logic and provide a clean separation between the domain layer and infrastructure layer. This pattern enables better testability, maintainability, and flexibility in data persistence strategies.

## Pattern Structure

```
Domain Layer
├── entities/                     # Rich domain models
├── repositories/interfaces/      # Repository contracts
└── repositories/types/          # Data transfer types

Infrastructure Layer
└── repositories/implementations/ # Concrete implementations
```

## Core Components

### 1. Domain Entities (`src/entities/`)

Rich domain models that contain business logic and behavior.

```typescript
// Example: User entity
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    private passwordHash: string,
    public readonly isActive: boolean = true,
    // ... other properties
  ) {}

  // Business methods
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.passwordHash);
  }

  // Factory methods
  static async create(email: string, firstName: string, lastName: string, plainPassword: string) {
    // ... implementation
  }
}
```

**Key Principles:**
- Encapsulate business logic within entities
- Immutable data where possible (readonly properties)
- Factory methods for complex creation logic
- Separation of public interface from internal state

### 2. Repository Interfaces (`src/repositories/interfaces/`)

Abstract contracts defining data operations without implementation details.

```typescript
// Example: IUserRepository interface
export interface IUserRepository {
  // Core CRUD operations
  save(userData: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findMany(filters?: UserFilters): Promise<User[]>;
  update(id: string, updateData: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;

  // Domain-specific methods
  findByEmailWithPassword(email: string): Promise<User | null>;
  updateLastLogin(id: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}
```

**Key Principles:**
- Define behavior, not implementation
- Use domain entities as return types
- Include domain-specific query methods
- Return promises for async operations
- Use specific data types for parameters

### 3. Repository Types (`src/repositories/types/`)

Data structures for repository operations, separate from HTTP DTOs.

```typescript
// Example: User repository types
export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface UserFilters {
  email?: string;
  isActive?: boolean;
}
```

**Key Principles:**
- Separate from HTTP DTOs
- Focus on data needed for persistence operations
- Use optional properties for partial updates
- Include filter types for queries

### 4. Repository Implementations (`src/repositories/implementations/`)

Concrete implementations of repository interfaces using specific data access technologies.

```typescript
// Example: Prisma implementation
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async save(userData: CreateUserData): Promise<User> {
    const dbUser = await this.prisma.user.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash: userData.passwordHash,
      },
    });

    return this.mapToEntity(dbUser);
  }

  // ... other methods

  // Private mapping method
  private mapToEntity(dbUser: PrismaUser): User {
    return new User(
      dbUser.id,
      dbUser.email,
      dbUser.firstName,
      dbUser.lastName,
      dbUser.passwordHash,
      dbUser.isActive,
      dbUser.lastLogin ?? null,
      dbUser.createdAt,
      dbUser.updatedAt,
    );
  }
}
```

**Key Principles:**
- Implement repository interface exactly
- Use dependency injection for data access services
- Map between database models and domain entities
- Handle errors appropriately
- Use private methods for internal operations

## Implementation Guidelines

### Adding a New Repository

1. **Create Entity** (`src/entities/[name].entity.ts`)
```typescript
export class YourEntity {
  constructor(
    public readonly id: string,
    // ... other properties
  ) {}

  // Business methods
  someBusinessMethod(): boolean {
    // Business logic here
  }
}
```

2. **Define Types** (`src/repositories/types/[name]-repository.types.ts`)
```typescript
export interface CreateYourEntityData {
  // Required fields for creation
}

export interface UpdateYourEntityData {
  // Optional fields for updates
}

export interface YourEntityFilters {
  // Fields for filtering/searching
}
```

3. **Create Interface** (`src/repositories/interfaces/[name]-repository.interface.ts`)
```typescript
export interface IYourEntityRepository {
  save(data: CreateYourEntityData): Promise<YourEntity>;
  findById(id: string): Promise<YourEntity | null>;
  // ... other methods
}
```

4. **Implement Repository** (`src/repositories/implementations/prisma-[name].repository.ts`)
```typescript
@Injectable()
export class PrismaYourEntityRepository implements IYourEntityRepository {
  constructor(private prisma: PrismaService) {}

  async save(data: CreateYourEntityData): Promise<YourEntity> {
    // Implementation
  }

  private mapToEntity(dbModel: any): YourEntity {
    // Mapping logic
  }
}
```

5. **Register in Module** (`src/repositories/repository.module.ts`)
```typescript
@Module({
  providers: [
    {
      provide: 'IYourEntityRepository',
      useClass: PrismaYourEntityRepository,
    },
  ],
  exports: ['IYourEntityRepository'],
})
export class RepositoryModule {}
```

### Using Repositories in Services

```typescript
@Injectable()
export class YourEntityService {
  constructor(
    @Inject('IYourEntityRepository')
    private yourEntityRepository: IYourEntityRepository,
  ) {}

  async createEntity(createDto: CreateEntityDto): Promise<YourEntity> {
    // Convert DTO to repository data
    const entityData: CreateYourEntityData = {
      // Map DTO fields to repository data
    };

    return await this.yourEntityRepository.save(entityData);
  }
}
```

## Testing Strategy

### Unit Testing Repositories

```typescript
describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        // ... other methods
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    prismaService = module.get(PrismaService);
  });

  it('should save user', async () => {
    const userData: CreateUserData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      passwordHash: 'hashedPassword',
    };

    const dbUser = { id: '1', ...userData, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    prismaService.user.create.mockResolvedValue(dbUser);

    const result = await repository.save(userData);

    expect(result).toBeInstanceOf(User);
    expect(result.email).toBe(userData.email);
  });
});
```

### Integration Testing with In-Memory Database

```typescript
describe('UserRepository Integration', () => {
  let repository: PrismaUserRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Setup test database
    const module = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [PrismaUserRepository],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.user.deleteMany();
  });

  it('should persist and retrieve user', async () => {
    const userData: CreateUserData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      passwordHash: 'hashedPassword',
    };

    const savedUser = await repository.save(userData);
    const foundUser = await repository.findById(savedUser.id);

    expect(foundUser).toBeTruthy();
    expect(foundUser!.email).toBe(userData.email);
  });
});
```

### Mocking Repositories in Service Tests

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IUserRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      // ... other methods
    };

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'IUserRepository', useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get('IUserRepository');
  });

  it('should create user', async () => {
    const createDto = { email: 'test@example.com', firstName: 'John', lastName: 'Doe', password: 'password' };
    const user = new User('1', 'test@example.com', 'John', 'Doe', 'hashedPassword');

    repository.save.mockResolvedValue(user);

    const result = await service.createUser(createDto);

    expect(repository.save).toHaveBeenCalled();
    expect(result).toBe(user);
  });
});
```

## Best Practices

### 1. Interface Design
- Keep interfaces focused and cohesive
- Use domain-specific method names
- Return domain entities, not database models
- Include both basic CRUD and domain-specific operations

### 2. Implementation Guidelines
- Always map database models to domain entities
- Handle database errors and throw appropriate domain exceptions
- Use transactions for multi-step operations
- Implement proper logging for debugging

### 3. Error Handling
```typescript
async findById(id: string): Promise<User | null> {
  try {
    const dbUser = await this.prisma.user.findUnique({
      where: { id },
    });

    return dbUser ? this.mapToEntity(dbUser) : null;
  } catch (error) {
    throw new RepositoryError(`Failed to find user with id ${id}`, error);
  }
}
```

### 4. Performance Considerations
- Include necessary database indexes in Prisma schema
- Use select/include to limit data fetching
- Implement proper pagination for large datasets
- Consider caching for frequently accessed data

### 5. Domain Entity Guidelines
- Keep entities focused on business logic
- Use factory methods for complex creation
- Implement validation within entities
- Provide serialization methods for different contexts

## Migration Strategies

### Changing Data Access Technology
The repository pattern makes it easy to switch from Prisma to another ORM or database:

1. Implement new repository classes (e.g., `TypeOrmUserRepository`)
2. Update dependency injection configuration
3. Domain layer remains unchanged
4. Run integration tests to verify behavior

### Adding New Query Methods
1. Add method to repository interface
2. Implement in all concrete repositories
3. Update tests
4. Use in services

This pattern provides flexibility for evolving data access needs while maintaining clean architecture principles.