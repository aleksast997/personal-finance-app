# API Design Guidelines

## Overview

This document outlines the API design patterns and conventions used in the Personal Finance API. Following these guidelines ensures consistency, maintainability, and a great developer experience.

## RESTful Design Principles

### Resource-Based URLs
- Use nouns, not verbs in URLs
- Use plural nouns for collections
- Use hierarchical structure for related resources

```typescript
// ✅ Good
GET /accounts
GET /accounts/:id
GET /transactions
POST /accounts

// ❌ Bad
GET /getAccounts
GET /getAccountById/:id
POST /createAccount
```

### HTTP Methods

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Retrieve resources | `GET /accounts` |
| POST | Create new resource | `POST /accounts` |
| PUT | Replace entire resource | `PUT /accounts/:id` |
| PATCH | Partial update | `PATCH /accounts/:id/balance` |
| DELETE | Remove resource | `DELETE /accounts/:id` |

### Status Codes

Use appropriate HTTP status codes:

```typescript
// Success responses
200 OK        // GET, PUT, PATCH operations
201 Created   // POST operations
204 No Content // DELETE operations

// Client error responses
400 Bad Request      // Invalid request data
401 Unauthorized     // Missing/invalid authentication
403 Forbidden        // Access denied
404 Not Found        // Resource not found
409 Conflict         // Resource conflict
422 Unprocessable Entity // Validation errors

// Server error responses
500 Internal Server Error // Generic server error
```

## Controller Structure

### Controller Decoration

```typescript
@ApiTags('accounts')        // Swagger grouping
@ApiBearerAuth()           // Authentication requirement
@Controller('accounts')     // Route prefix
@UseGuards(JwtAuthGuard)   // Global authentication
export class AccountController {
  constructor(
    private readonly accountService: AccountService
  ) {}
}
```

### Endpoint Definition Pattern

```typescript
@Post()
@ApiOperation({ summary: 'Create a new account' })
@ApiResponse({
  status: 201,
  description: 'Account successfully created',
  type: DetailedAccountResponseDto,
})
@ApiResponse({ status: 400, description: 'Bad request' })
async createAccount(
  @CurrentUser() user: PublicUser,
  @Body() createAccountDto: CreateAccountDto,
): Promise<DetailedAccountResponseDto> {
  const account = await this.accountService.createAccount(
    user.id,
    createAccountDto,
  );
  return DetailedAccountResponseDto.fromEntity(account);
}
```

**Key Elements:**
- HTTP method decorator
- OpenAPI operation summary
- Response type documentation
- Error response documentation
- Dependency injection
- Input validation via DTOs
- Proper return types

### Query Parameters

Use `@Query()` for filtering, pagination, and optional parameters:

```typescript
@Get()
@ApiQuery({
  name: 'active',
  required: false,
  description: 'Filter by active accounts only',
  type: Boolean,
})
async getUserAccounts(
  @CurrentUser() user: PublicUser,
  @Query('active') activeOnly?: boolean,
): Promise<AccountResponseDto[]> {
  // Implementation
}
```

### Path Parameters

Use `@Param()` for resource identifiers:

```typescript
@Get(':id')
@ApiParam({ name: 'id', description: 'Account ID' })
async getAccountById(
  @CurrentUser() user: PublicUser,
  @Param('id') accountId: string,
): Promise<DetailedAccountResponseDto> {
  // Implementation
}
```

## DTO (Data Transfer Object) Patterns

### Input DTOs

Use class-validator decorators for validation:

```typescript
export class CreateAccountDto {
  @ApiProperty({ example: 'Tekući račun' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    enum: AccountType,
    example: AccountType.CHECKING,
    description: 'Type of account',
  })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiPropertyOptional({
    example: 50000,
    description: 'Initial balance (default: 0)',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  balance?: number;
}
```

**Key Principles:**
- Use `@ApiProperty()` for required fields
- Use `@ApiPropertyOptional()` for optional fields
- Include examples and descriptions
- Use appropriate validation decorators
- Separate DTOs for different operations

### Response DTOs

Create dedicated response DTOs for different levels of detail:

```typescript
export class AccountResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: AccountType })
  accountType: AccountType;

  // ... other properties

  static fromEntity(account: Account): AccountResponseDto {
    const dto = new AccountResponseDto();
    const publicData = account.toPublic();
    Object.assign(dto, publicData);
    return dto;
  }
}

export class DetailedAccountResponseDto extends AccountResponseDto {
  @ApiProperty({ nullable: true })
  accountNumber: string | null;

  static fromEntity(account: Account): DetailedAccountResponseDto {
    const dto = new DetailedAccountResponseDto();
    const detailedData = account.toDetailed();
    Object.assign(dto, detailedData);
    return dto;
  }
}
```

**Benefits:**
- Security: Control what data is exposed
- Flexibility: Different views for different use cases
- Type safety: Compile-time checking
- Documentation: Auto-generated API docs

### DTO Inheritance

Use inheritance for related DTOs:

```typescript
// Base DTO
export class BaseAccountDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ enum: AccountType })
  accountType: AccountType;
}

// Specific DTOs
export class CreateAccountDto extends BaseAccountDto {
  @ApiProperty()
  currency: Currency;
}

export class UpdateAccountDto extends PartialType(BaseAccountDto) {
  // Automatically makes all properties optional
}
```

## Authentication & Authorization

### JWT Authentication

All protected endpoints use JWT authentication:

```typescript
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountController {
  // All methods require authentication
}
```

### Current User Access

Use the `@CurrentUser()` decorator to access authenticated user:

```typescript
async createAccount(
  @CurrentUser() user: PublicUser,
  @Body() createAccountDto: CreateAccountDto,
): Promise<DetailedAccountResponseDto> {
  // user.id is available for authorization
}
```

### Resource Authorization

Always verify user owns the resource:

```typescript
async getAccountById(
  @CurrentUser() user: PublicUser,
  @Param('id') accountId: string,
): Promise<DetailedAccountResponseDto> {
  // Service validates user.id has access to accountId
  const account = await this.accountService.getAccountById(
    accountId,
    user.id, // Pass user ID for authorization
  );
  return DetailedAccountResponseDto.fromEntity(account);
}
```

## Error Handling

### Standard Error Responses

Use consistent error response format:

```typescript
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "property": "name",
      "constraints": {
        "isNotEmpty": "name should not be empty"
      }
    }
  ]
}
```

### Custom Exception Filters

Implement global exception filter for consistent error handling:

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Format all errors consistently
  }
}
```

## Swagger/OpenAPI Documentation

### Controller-Level Documentation

```typescript
@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountController {}
```

### Endpoint Documentation

```typescript
@Post()
@ApiOperation({
  summary: 'Create a new account',
  description: 'Creates a new financial account for the authenticated user'
})
@ApiResponse({
  status: 201,
  description: 'Account successfully created',
  type: DetailedAccountResponseDto,
})
@ApiResponse({
  status: 400,
  description: 'Invalid input data'
})
@ApiResponse({
  status: 401,
  description: 'User not authenticated'
})
```

### DTO Documentation

```typescript
export class CreateAccountDto {
  @ApiProperty({
    description: 'Account name',
    example: 'Tekući račun',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
```

## URL Patterns

### Collection Operations

```typescript
GET    /accounts           // Get all user accounts
POST   /accounts           // Create new account
GET    /accounts/count     // Get account count
```

### Resource Operations

```typescript
GET    /accounts/:id       // Get specific account
PUT    /accounts/:id       // Update entire account
DELETE /accounts/:id       // Delete account
```

### Sub-resource Operations

```typescript
PATCH  /accounts/:id/balance     // Update account balance
PATCH  /accounts/:id/activate    // Activate account
PATCH  /accounts/:id/deactivate  // Deactivate account
```

### Filtering and Querying

```typescript
GET /accounts?active=true           // Filter by status
GET /accounts/by-type/:type         // Filter by type
GET /accounts/by-currency/:currency // Filter by currency
```

## Response Formatting

### Success Responses

```typescript
// Single resource
{
  "id": "uuid",
  "name": "Account Name",
  "balance": 1000.50,
  "currency": "RSD"
}

// Collection
[
  {
    "id": "uuid1",
    "name": "Account 1"
  },
  {
    "id": "uuid2",
    "name": "Account 2"
  }
]

// Count/Statistics
{
  "count": 5
}
```

### Error Responses

```typescript
// Validation Error
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}

// Not Found
{
  "statusCode": 404,
  "message": "Account not found",
  "error": "Not Found"
}

// Forbidden
{
  "statusCode": 403,
  "message": "Access denied",
  "error": "Forbidden"
}
```

## Pagination Guidelines

For large collections, implement cursor-based pagination:

```typescript
@Get()
@ApiQuery({ name: 'limit', required: false, type: Number })
@ApiQuery({ name: 'cursor', required: false, type: String })
async getTransactions(
  @CurrentUser() user: PublicUser,
  @Query('limit') limit = 20,
  @Query('cursor') cursor?: string,
): Promise<PaginatedResponseDto<TransactionResponseDto>> {
  // Implementation
}
```

Response format:
```typescript
{
  "data": [...],
  "pagination": {
    "hasNext": true,
    "nextCursor": "cursor_value",
    "limit": 20
  }
}
```

## Versioning Strategy

Use URL versioning for major API changes:

```typescript
@Controller('v1/accounts')  // Current version
@Controller('v2/accounts')  // Future version
```

## Best Practices

### 1. Consistency
- Use consistent naming conventions
- Follow established patterns across all endpoints
- Use same error response format

### 2. Security
- Always validate user ownership of resources
- Use DTOs to control data exposure
- Implement rate limiting for sensitive operations

### 3. Performance
- Use appropriate HTTP status codes
- Implement caching headers where appropriate
- Use pagination for large datasets

### 4. Documentation
- Document all endpoints with Swagger
- Include examples in API documentation
- Keep documentation up to date

### 5. Testing
- Write integration tests for all endpoints
- Test error scenarios
- Validate response schemas

### 6. Validation
- Use class-validator for input validation
- Provide meaningful error messages
- Validate business rules at service layer

## Example Implementation Checklist

When adding a new endpoint:

- [ ] Define appropriate HTTP method and URL
- [ ] Create/update DTOs with validation
- [ ] Add Swagger documentation
- [ ] Implement authentication/authorization
- [ ] Handle errors appropriately
- [ ] Write tests
- [ ] Update API documentation

Following these guidelines ensures a consistent, secure, and well-documented API that provides an excellent developer experience.