# Personal Finance API

A comprehensive RESTful API for personal finance management built with NestJS, TypeScript, Prisma ORM, and PostgreSQL. This API provides secure user authentication and complete financial data management capabilities.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with registration and login
- **Account Management**: Multiple account types (checking, savings, credit, cash) with multi-currency support
- **Transaction Tracking**: Comprehensive transaction management with categorization
- **Category Management**: Custom income and expense categories with visual customization
- **Multi-Currency Support**: Built-in support for RSD, EUR, and USD
- **Repository Pattern**: Clean architecture with repository pattern implementation
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Database Migrations**: Prisma-based database schema management
- **Type Safety**: Full TypeScript implementation with strict typing

## 🏗️ Architecture

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport strategies
- **Validation**: Class-validator for DTO validation
- **Documentation**: Swagger/OpenAPI integration
- **Testing**: Jest for unit and e2e testing
- **Code Quality**: ESLint + Prettier configuration

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd personal-finance-app/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://postgres:password123@localhost:5432/personal_finance_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Application
PORT=3000
NODE_ENV="development"
```

### 4. Database Setup

#### Option A: Using Docker Compose (Recommended)
```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Optional: Seed the database
npm run db:seed
```

#### Option B: Local PostgreSQL
```bash
# Create database manually
createdb personal_finance_db

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### 5. Start the application
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Interactive API documentation is available via Swagger UI:
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## 🔗 API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login

### Accounts
- `GET /accounts` - Get user accounts
- `POST /accounts` - Create new account
- `PUT /accounts/:id` - Update account
- `DELETE /accounts/:id` - Delete account

### Transactions
- `GET /transactions` - Get user transactions
- `POST /transactions` - Create new transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

### Categories
- `GET /categories` - Get user categories
- `POST /categories` - Create new category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

## 🗄️ Database Schema

### Users
- Personal information and authentication
- Account ownership and transaction history

### Accounts
- Multiple account types (checking, savings, credit, cash)
- Multi-currency support (RSD, EUR, USD)
- Bank information and account numbers

### Transactions
- Income and expense tracking
- Category classification
- Account-to-account transfers

### Categories
- Custom income/expense categories
- Visual customization (icons, colors)
- User-specific categorization

## 🧪 Testing

```bash
# Unit tests
npm run test

# Unit tests with watch mode
npm run test:watch

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔍 Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npx tsc --noEmit
```

## 🐳 Docker Support

The project includes Docker Compose configuration for easy development setup:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Included Services:
- **PostgreSQL**: Database server on port 5432
- **pgAdmin**: Database GUI on port 8080 (admin@admin.com / admin123)

## 🔧 Database Management

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev

# Reset database (caution: data loss)
npx prisma migrate reset

# View database in browser
npx prisma studio

# Seed database with sample data
npm run db:seed
```

## 📁 Project Structure

```
src/
├── auth/           # Authentication module
├── accounts/       # Account management
├── transactions/   # Transaction handling
├── categories/     # Category management
├── common/         # Shared utilities
├── config/         # Configuration files
├── entities/       # Domain entities
├── prisma/         # Database service
├── repositories/   # Data access layer
└── main.ts         # Application entry point

prisma/
├── schema.prisma   # Database schema
├── migrations/     # Database migrations
└── seed.ts         # Database seeding

test/
├── app.e2e-spec.ts # End-to-end tests
└── jest-e2e.json   # E2E test configuration
```

## 🚀 Deployment

### Production Checklist
1. Set secure environment variables
2. Configure production database
3. Run database migrations
4. Build the application
5. Start with PM2 or similar process manager

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is [UNLICENSED](LICENSE) - Private use only.

## 🔒 Security

- JWT tokens for authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection protection via Prisma
- CORS configuration
- Environment variable protection

## 📞 Support

For support and questions, please create an issue in the repository.