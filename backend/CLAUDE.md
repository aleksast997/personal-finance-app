# Claude Instructions for Personal Finance API

This is a NestJS-based personal finance API built with TypeScript, Prisma ORM, and PostgreSQL.

## Project Structure
- **Framework**: NestJS (Node.js framework)
- **Database**: PostgreSQL with Prisma ORM
- **Language**: TypeScript
- **Testing**: Jest
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI

## Key Commands

### Development
- `npm run start:dev` - Start development server with watch mode
- `npm run start:debug` - Start with debug mode
- `npm run build` - Build the project
- `npm run start:prod` - Start production server

### Code Quality
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests

### Database
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate dev` - Run database migrations
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database (if seed script exists)

## Important Notes
- Always run `npm run lint` and `npm run test` before committing changes
- Use TypeScript strict mode - ensure proper typing
- Follow NestJS patterns and decorators
- Use Prisma for all database operations
- Implement proper error handling and validation
- Use class-validator for DTO validation
- Maintain API documentation with Swagger decorators

## File Conventions
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- DTOs: `*.dto.ts`
- Entities/Models: `*.entity.ts` or use Prisma schema
- Tests: `*.spec.ts` (unit) or `*.e2e-spec.ts` (e2e)
- Modules: `*.module.ts`

## Environment
- Environment variables should be defined in `.env`
- Use `@nestjs/config` for configuration management
- Database connection configured through Prisma