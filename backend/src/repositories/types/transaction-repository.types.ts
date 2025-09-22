import { TransactionType } from '../../entities/transaction.entity';

export interface CreateTransactionData {
  userId: string;
  accountId: string;
  categoryId?: string | null;
  type: string;
  amount: number;
  description: string;
  transactionDate: Date;
  toAccountId?: string | null;
  fromAccountId?: string | null;
}

export interface UpdateTransactionData {
  categoryId?: string;
  description?: string;
  transactionDate?: Date;
}

export interface TransactionFilters {
  userId: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  dateFrom?: Date;
  dateTo?: Date;
}