# Personal Finance App

A comprehensive personal finance management application built with modern technologies across multiple platforms.

## Project Structure

```
personal-finance-app/
├── backend/          # NestJS API (TypeScript)
├── mobile/           # Flutter mobile app (Dart) - Coming Soon
├── web/              # React web application (TypeScript) - Coming Soon
├── services/         # Python microservices - Coming Soon
└── docs/             # Documentation - Coming Soon
```

## Current Status

### ✅ Backend API (NestJS)
- **Technology**: NestJS, TypeScript, Prisma ORM, PostgreSQL
- **Features**:
  - JWT Authentication with Passport
  - User management
  - Account management
  - Category management
  - Transaction tracking
  - Financial analytics
  - RESTful API with Swagger documentation
  - Repository pattern with clean architecture
  - Docker support for development

### 🚧 Planned Components

- **Mobile App (Flutter)**: Cross-platform mobile application for iOS and Android
- **Web App (React)**: Modern web interface with responsive design
- **Python Services**: Microservices for advanced analytics, reporting, and integrations

## Getting Started

### Backend Development

Navigate to the backend directory and follow the setup instructions:

```bash
cd backend
npm install
```

See [backend/README.md](./backend/README.md) for detailed setup and usage instructions.

## Architecture

This monorepo contains a full-stack personal finance application with:

- **Backend**: Handles business logic, authentication, and data persistence
- **Frontend(s)**: User interfaces for web and mobile platforms
- **Services**: Specialized microservices for analytics and integrations

## Contributing

1. Clone the repository
2. Navigate to the specific project directory
3. Follow the setup instructions for that component
4. Create feature branches for new development
5. Submit pull requests for review

## License

This project is licensed under the MIT License.