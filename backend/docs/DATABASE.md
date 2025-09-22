# Database Conventions & Schema Design

## Overview

This application uses PostgreSQL as the primary database with Prisma ORM for type-safe database access. The database schema follows established conventions for maintainability, performance, and data integrity.

## Database Technology Stack

- **Database**: PostgreSQL 15+
- **ORM**: Prisma 6.x
- **Migration Tool**: Prisma Migrate
- **Query Builder**: Prisma Client (auto-generated)
- **Database GUI**: Prisma Studio / pgAdmin

## Schema Conventions

### 1. Naming Conventions

#### Table Names
- Use **snake_case** for table names
- Use **plural nouns** for table names
- Map model names to table names using `@@map()`

```prisma
model User {
  // Model in PascalCase
  @@map("users")  // Table in snake_case plural
}

model Account {
  @@map("accounts")
}
```

#### Column Names
- Use **snake_case** for column names
- Map field names using `@map()`
- Use descriptive, clear names

```prisma
model User {
  firstName    String    @map("first_name")
  lastName     String    @map("last_name")
  passwordHash String    @map("password_hash")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  lastLogin    DateTime? @map("last_login")
  isActive     Boolean   @default(true) @map("is_active")
}
```

#### Foreign Key Columns
- Use `{related_table_singular}_id` format
- Always map to snake_case

```prisma
model Account {
  userId    String @map("user_id") @db.Uuid
  user      User   @relation(fields: [userId], references: [id])
}
```

### 2. Data Types

#### Primary Keys
- Use **UUID** for all primary keys
- Use `@db.Uuid` directive for PostgreSQL optimization

```prisma
model User {
  id String @id @default(uuid()) @db.Uuid
}
```

#### Strings
- Specify appropriate column types for PostgreSQL
- Use `@db.VarChar(n)` for limited strings
- Use `@db.Text` for unlimited text

```prisma
model User {
  email     String  @unique @db.VarChar(255)
  firstName String  @db.VarChar(100)
  bio       String? @db.Text
}
```

#### Numbers
- Use `Decimal` for monetary values
- Specify precision and scale for financial data

```prisma
model Account {
  balance Decimal @default(0) @db.Decimal(15, 2)
}

model Transaction {
  amount Decimal @db.Decimal(10, 2)
}
```

#### Timestamps
- Include `createdAt` and `updatedAt` on all entities
- Use `@default(now())` for creation timestamps
- Use `@updatedAt` for automatic updates

```prisma
model User {
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
}
```

### 3. Relationships

#### One-to-Many
```prisma
model User {
  id       String    @id @default(uuid()) @db.Uuid
  accounts Account[]
}

model Account {
  id     String @id @default(uuid()) @db.Uuid
  userId String @map("user_id") @db.Uuid
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### Many-to-One with Optional
```prisma
model Transaction {
  id         String    @id @default(uuid()) @db.Uuid
  categoryId String?   @db.Uuid
  category   Category? @relation(fields: [categoryId], references: [id])
}
```

#### Self-Referencing (Future Enhancement)
```prisma
model Category {
  id        String     @id @default(uuid()) @db.Uuid
  parentId  String?    @db.Uuid
  parent    Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryHierarchy")
}
```

### 4. Indexes

#### Single Column Indexes
```prisma
model User {
  email String @unique @db.VarChar(255)
  // Automatically creates unique index
}
```

#### Composite Indexes
```prisma
model Transaction {
  userId          String    @db.Uuid
  transactionDate DateTime

  @@index([userId, transactionDate])
}
```

#### Unique Constraints
```prisma
model Category {
  userId String @db.Uuid
  name   String

  @@unique([userId, name])
}
```

### 5. Enums

Define enums for constrained string values:

```prisma
enum AccountType {
  CHECKING
  SAVINGS
  CREDIT
  CASH
}

enum Currency {
  RSD
  EUR
  USD
}

model Account {
  accountType AccountType
  currency    Currency    @default(RSD)
}
```

## Schema Organization

### Current Schema Structure

```prisma
// Generator and datasource configuration
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Core user management
model User {
  // User fields and relations
}

// Financial entities
model Account {
  // Account fields and relations
}

model Transaction {
  // Transaction fields and relations
}

model Category {
  // Category fields and relations
}
```

### Domain Models

#### 1. User Model
```prisma
model User {
  id           String    @id @default(uuid()) @db.Uuid
  email        String    @unique
  passwordHash String    @map("password_hash")
  firstName    String    @map("first_name")
  lastName     String    @map("last_name")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  lastLogin    DateTime? @map("last_login")
  isActive     Boolean   @default(true) @map("is_active")

  // Relations
  accounts     Account[]
  transactions Transaction[]
  categories   Category[]

  @@map("users")
}
```

**Key Features:**
- UUID primary key
- Unique email constraint
- Password hash storage (never plain text)
- Soft delete via `isActive` flag
- Audit fields (`createdAt`, `updatedAt`)
- User activity tracking (`lastLogin`)

#### 2. Account Model
```prisma
model Account {
  id            String      @id @default(uuid()) @db.Uuid
  userId        String      @map("user_id") @db.Uuid
  name          String
  accountType   AccountType @map("account_type")
  currency      Currency    @default(RSD)
  balance       Decimal     @default(0) @db.Decimal(15, 2)
  bankName      String?     @map("bank_name")
  accountNumber String?     @map("account_number") // Encrypted
  isActive      Boolean     @default(true) @map("is_active")
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")

  // Relations
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[] @relation("AccountTransactions")

  @@map("accounts")
}
```

**Key Features:**
- Multi-currency support
- Decimal precision for monetary values
- Optional bank information
- Soft delete capability
- Cascade delete with user

#### 3. Transaction Model
```prisma
model Transaction {
  id              String    @id @default(uuid()) @db.Uuid
  userId          String    @db.Uuid
  accountId       String    @db.Uuid
  categoryId      String?   @db.Uuid
  type            String
  amount          Decimal   @db.Decimal(10, 2)
  description     String
  transactionDate DateTime
  toAccountId     String?   @db.Uuid    // For transfers
  fromAccountId   String?   @db.Uuid    // For transfers
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user     User      @relation(fields: [userId], references: [id])
  account  Account   @relation("AccountTransactions", fields: [accountId], references: [id])
  category Category? @relation(fields: [categoryId], references: [id])

  @@index([userId, transactionDate])
  @@index([accountId])
}
```

**Key Features:**
- Flexible transaction types
- Optional categorization
- Transfer support (between accounts)
- Optimized indexes for common queries
- Precise decimal amounts

#### 4. Category Model
```prisma
model Category {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  name      String
  type      String   // income or expense
  icon      String?
  color     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user         User          @relation(fields: [userId], references: [id])
  transactions Transaction[]

  @@unique([userId, name])
  @@index([userId, type])
}
```

**Key Features:**
- User-specific categories
- Visual customization (icon, color)
- Income/expense type classification
- Unique name per user
- Optimized queries by user and type

## Migration Strategies

### 1. Migration Files

Prisma generates migration files in `prisma/migrations/`:

```
prisma/migrations/
├── 20250919111201_init/
│   └── migration.sql
└── migration_lock.toml
```

### 2. Migration Commands

```bash
# Create new migration
npx prisma migrate dev --name "add_user_preferences"

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate client after schema changes
npx prisma generate
```

### 3. Schema Evolution Best Practices

#### Adding Optional Fields
```prisma
model User {
  // Existing fields...

  // New optional field (safe)
  timezone String? @map("timezone")
}
```

#### Adding Required Fields with Defaults
```prisma
model Account {
  // Existing fields...

  // New required field with default (safe)
  sortOrder Int @default(0) @map("sort_order")
}
```

#### Renaming Fields (Two-Step Process)
```sql
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN full_name VARCHAR(200);

-- Step 2: Populate data
UPDATE users SET full_name = first_name || ' ' || last_name;

-- Step 3: Drop old columns (in next migration)
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;
```

## Performance Optimization

### 1. Index Strategy

#### Query-Driven Indexing
```prisma
model Transaction {
  // Index for user's transaction history
  @@index([userId, transactionDate])

  // Index for account transactions
  @@index([accountId])

  // Index for category analysis
  @@index([categoryId, transactionDate])
}
```

#### Unique Constraints as Indexes
```prisma
model User {
  email String @unique  // Automatically creates index
}

model Category {
  @@unique([userId, name])  // Composite unique index
}
```

### 2. Query Optimization

#### Selective Loading
```typescript
// Good: Load only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
  }
});

// Better: Include relations efficiently
const userWithAccounts = await prisma.user.findFirst({
  where: { id: userId },
  include: {
    accounts: {
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    }
  }
});
```

#### Pagination
```typescript
// Cursor-based pagination for large datasets
const transactions = await prisma.transaction.findMany({
  where: { userId },
  take: 20,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { transactionDate: 'desc' }
});
```

### 3. Connection Pooling

Prisma automatically handles connection pooling:

```env
# Database URL with connection pooling
DATABASE_URL="postgresql://user:password@localhost:5432/db?schema=public&connection_limit=10&pool_timeout=20"
```

## Data Integrity & Constraints

### 1. Foreign Key Constraints

```prisma
model Account {
  userId String @db.Uuid
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Cascade Behaviors:**
- `Cascade`: Delete child records when parent is deleted
- `Restrict`: Prevent deletion if child records exist
- `SetNull`: Set foreign key to null when parent is deleted

### 2. Check Constraints (Future Enhancement)

```sql
-- Add check constraints via raw SQL
ALTER TABLE accounts
ADD CONSTRAINT check_positive_balance
CHECK (balance >= 0);

ALTER TABLE transactions
ADD CONSTRAINT check_positive_amount
CHECK (amount > 0);
```

### 3. Data Validation

#### Application-Level Validation
```typescript
// In entity or service layer
if (balance < 0) {
  throw new BadRequestException('Balance cannot be negative');
}
```

#### Database-Level Validation
```prisma
model User {
  email String @unique @db.VarChar(255)
  // Database enforces uniqueness and length limits
}
```

## Backup & Recovery

### 1. Backup Strategy

```bash
# Full database backup
pg_dump -h localhost -U postgres -d personal_finance_db > backup.sql

# Schema-only backup
pg_dump -h localhost -U postgres -s -d personal_finance_db > schema.sql

# Data-only backup
pg_dump -h localhost -U postgres -a -d personal_finance_db > data.sql
```

### 2. Point-in-Time Recovery

For production, enable WAL archiving and configure continuous backup.

## Testing Strategies

### 1. Database Testing

#### Test Database Setup
```typescript
// test/setup.ts
beforeAll(async () => {
  await prisma.$executeRaw`DROP SCHEMA IF EXISTS test CASCADE`;
  await prisma.$executeRaw`CREATE SCHEMA test`;
  // Run migrations
  execSync('npx prisma migrate deploy');
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

#### Test Data Management
```typescript
// Clean database between tests
beforeEach(async () => {
  const deleteTransactions = prisma.transaction.deleteMany();
  const deleteAccounts = prisma.account.deleteMany();
  const deleteCategories = prisma.category.deleteMany();
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([
    deleteTransactions,
    deleteAccounts,
    deleteCategories,
    deleteUsers,
  ]);
});
```

### 2. Migration Testing

```typescript
describe('Database Migrations', () => {
  it('should migrate from previous version', async () => {
    // Test migration compatibility
  });

  it('should maintain data integrity', async () => {
    // Test that existing data survives migration
  });
});
```

## Monitoring & Maintenance

### 1. Query Performance Monitoring

```sql
-- Enable query logging in PostgreSQL
SET log_statement = 'all';
SET log_min_duration_statement = 1000;  -- Log queries > 1s
```

### 2. Database Statistics

```sql
-- Analyze table statistics
ANALYZE users;
ANALYZE accounts;
ANALYZE transactions;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 3. Index Usage Analysis

```sql
-- Check index usage
SELECT
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## Future Enhancements

### 1. Advanced Features

- **Partitioning**: Partition transactions table by date for better performance
- **Read Replicas**: Separate read/write operations for scalability
- **Event Sourcing**: Track all changes for audit trails
- **Soft Deletes**: Implement comprehensive soft delete strategy

### 2. Schema Extensions

- **User Preferences**: Store user settings and configurations
- **Budgets**: Budget management and tracking
- **Goals**: Financial goal setting and monitoring
- **Recurring Transactions**: Automated transaction templates

### 3. Performance Improvements

- **Materialized Views**: Pre-computed aggregations for reporting
- **Caching Layer**: Redis for frequently accessed data
- **Search Optimization**: Full-text search for transactions
- **Data Archiving**: Archive old transactions for performance

This database design provides a solid foundation for a personal finance application while being extensible for future requirements and scalable for growing datasets.