import { Module } from '@nestjs/common';
import { PrismaUserRepository } from './implementations/prisma-user.repository';
import { PrismaAccountRepository } from './implementations/prisma-account.repository';
import { PrismaTransactionRepository } from './implementations/prisma-transaction.repository';
import { PrismaCategoryRepository } from './implementations/prisma-category.repository';

export const REPOSITORY_TOKENS = {
  USER: Symbol('USER_REPOSITORY'),
  ACCOUNT: Symbol('ACCOUNT_REPOSITORY'),
  TRANSACTION: Symbol('TRANSACTION_REPOSITORY'),
  CATEGORY: Symbol('CATEGORY_REPOSITORY'),
} as const;

@Module({
  providers: [
    {
      provide: REPOSITORY_TOKENS.USER,
      useClass: PrismaUserRepository,
    },
    {
      provide: REPOSITORY_TOKENS.ACCOUNT,
      useClass: PrismaAccountRepository,
    },
    {
      provide: REPOSITORY_TOKENS.TRANSACTION,
      useClass: PrismaTransactionRepository,
    },
    {
      provide: REPOSITORY_TOKENS.CATEGORY,
      useClass: PrismaCategoryRepository,
    },
  ],
  exports: [
    REPOSITORY_TOKENS.USER,
    REPOSITORY_TOKENS.ACCOUNT,
    REPOSITORY_TOKENS.TRANSACTION,
    REPOSITORY_TOKENS.CATEGORY,
  ],
})
export class RepositoryModule {}
