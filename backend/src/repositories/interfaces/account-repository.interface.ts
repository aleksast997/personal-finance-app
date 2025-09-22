import { Account } from '../../entities/account.entity';
import {
  CreateAccountData,
  UpdateAccountData,
} from '../types/account-repository.types';

export interface IAccountRepository {
  // Basic CRUD operations
  save(accountData: CreateAccountData): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account[]>;
  findActiveByUserId(userId: string): Promise<Account[]>;
  update(id: string, updateData: UpdateAccountData): Promise<Account | null>;
  delete(id: string): Promise<boolean>;

  // Balance operations
  updateBalance(id: string, newBalance: number): Promise<Account | null>;

  // Business queries
  findByUserIdAndType(userId: string, accountType: string): Promise<Account[]>;
  findByUserIdAndCurrency(userId: string, currency: string): Promise<Account[]>;
  countByUserId(userId: string): Promise<number>;

  // Validation
  existsByUserIdAndName(
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean>;
}
