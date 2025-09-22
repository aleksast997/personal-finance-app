// src/entities/transaction.entity.ts
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly accountId: string,
    public readonly categoryId: string | null,
    public readonly type: TransactionType,
    public readonly amount: number,
    public readonly description: string,
    public readonly transactionDate: Date,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    // For transfers
    public readonly toAccountId: string | null = null,
    public readonly fromAccountId: string | null = null,
  ) {}

  static create(
    userId: string,
    accountId: string,
    type: TransactionType,
    amount: number,
    description: string,
    categoryId?: string,
    transactionDate?: Date,
    toAccountId?: string,
  ) {
    return {
      userId,
      accountId,
      categoryId: categoryId || null,
      type,
      amount,
      description,
      transactionDate: transactionDate || new Date(),
      toAccountId:
        type === TransactionType.TRANSFER ? toAccountId || null : null,
      fromAccountId: type === TransactionType.TRANSFER ? accountId : null,
    };
  }

  isExpense(): boolean {
    return this.type === TransactionType.EXPENSE;
  }

  isIncome(): boolean {
    return this.type === TransactionType.INCOME;
  }

  isTransfer(): boolean {
    return this.type === TransactionType.TRANSFER;
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  getFormattedAmount(): string {
    const sign = this.isExpense() ? '-' : this.isIncome() ? '+' : '';
    return `${sign}${this.amount.toFixed(2)}`;
  }
}
