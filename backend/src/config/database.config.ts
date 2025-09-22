export const databaseConfig = {
  url:
    process.env.DATABASE_URL ||
    'postgresql://postgres:password123@localhost:5432/personal_finance_db',
};

export const appConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  environment: process.env.NODE_ENV || 'development',
};
