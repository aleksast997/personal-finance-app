// src/repositories/interfaces/transaction-repository.interface.ts
import {
  Transaction,
  TransactionType,
} from '../../entities/transaction.entity';
import {
  CreateTransactionData,
  TransactionFilters,
  UpdateTransactionData,
} from '../types/transaction-repository.types';

export interface ITransactionRepository {
  save(data: CreateTransactionData): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByFilters(filters: TransactionFilters): Promise<Transaction[]>;
  update(id: string, data: UpdateTransactionData): Promise<Transaction | null>;
  delete(id: string): Promise<boolean>;

  // Analytics queries
  getSumByType(
    userId: string,
    type: TransactionType,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<number>;
  getMonthlyTotals(
    userId: string,
    year: number,
    month: number,
  ): Promise<{
    income: number;
    expense: number;
    net: number;
  }>;
}
