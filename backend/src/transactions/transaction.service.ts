import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { ITransactionRepository } from '../repositories/interfaces/transaction-repository.interface';
import { IAccountRepository } from '../repositories/interfaces/account-repository.interface';
import { REPOSITORY_TOKENS } from '../repositories/repository.module';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTION)
    private transactionRepo: ITransactionRepository,
    @Inject(REPOSITORY_TOKENS.ACCOUNT) private accountRepo: IAccountRepository,
  ) {}

  async createTransaction(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    // Verify account ownership
    const account = await this.accountRepo.findById(dto.accountId);
    if (!account || !account.isOwnedBy(userId)) {
      throw new ForbiddenException('Access denied to this account');
    }

    // For transfers, verify destination account
    if (dto.type === TransactionType.TRANSFER) {
      if (!dto.toAccountId) {
        throw new BadRequestException(
          'Destination account required for transfers',
        );
      }

      const toAccount = await this.accountRepo.findById(dto.toAccountId);
      if (!toAccount || !toAccount.isOwnedBy(userId)) {
        throw new ForbiddenException('Access denied to destination account');
      }

      // Update both account balances
      await this.accountRepo.updateBalance(
        dto.accountId,
        account.getBalance() - dto.amount,
      );
      await this.accountRepo.updateBalance(
        dto.toAccountId,
        toAccount.getBalance() + dto.amount,
      );
    } else if (dto.type === TransactionType.EXPENSE) {
      // Update account balance for expense
      await this.accountRepo.updateBalance(
        dto.accountId,
        account.getBalance() - dto.amount,
      );
    } else if (dto.type === TransactionType.INCOME) {
      // Update account balance for income
      await this.accountRepo.updateBalance(
        dto.accountId,
        account.getBalance() + dto.amount,
      );
    }

    // Create transaction record
    const transactionData = Transaction.create(
      userId,
      dto.accountId,
      dto.type,
      dto.amount,
      dto.description,
      dto.categoryId,
      dto.transactionDate,
      dto.toAccountId,
    );

    return this.transactionRepo.save(transactionData);
  }

  async getUserTransactions(
    userId: string,
    filters?: {
      accountId?: string;
      categoryId?: string;
      type?: TransactionType;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<Transaction[]> {
    return this.transactionRepo.findByFilters({
      userId,
      ...filters,
    });
  }

  async getTransaction(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepo.findById(id);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (!transaction.isOwnedBy(userId)) {
      throw new ForbiddenException('Access denied');
    }

    return transaction;
  }

  async updateTransaction(
    id: string,
    userId: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    await this.getTransaction(id, userId); // Verify ownership

    const updated = await this.transactionRepo.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Transaction not found');
    }

    return updated;
  }

  async deleteTransaction(id: string, userId: string): Promise<void> {
    const transaction = await this.getTransaction(id, userId);

    // Restore account balance
    const account = await this.accountRepo.findById(transaction.accountId);
    if (account) {
      if (transaction.isExpense()) {
        await this.accountRepo.updateBalance(
          transaction.accountId,
          account.getBalance() + transaction.amount,
        );
      } else if (transaction.isIncome()) {
        await this.accountRepo.updateBalance(
          transaction.accountId,
          account.getBalance() - transaction.amount,
        );
      } else if (transaction.isTransfer() && transaction.toAccountId) {
        // Reverse transfer
        const toAccount = await this.accountRepo.findById(
          transaction.toAccountId,
        );
        if (toAccount) {
          await this.accountRepo.updateBalance(
            transaction.accountId,
            account.getBalance() + transaction.amount,
          );
          await this.accountRepo.updateBalance(
            transaction.toAccountId,
            toAccount.getBalance() - transaction.amount,
          );
        }
      }
    }

    await this.transactionRepo.delete(id);
  }

  async getMonthlyStats(userId: string, year: number, month: number) {
    return this.transactionRepo.getMonthlyTotals(userId, year, month);
  }

  async getAccountTransactions(
    accountId: string,
    userId: string,
  ): Promise<Transaction[]> {
    // Verify account ownership first
    const account = await this.accountRepo.findById(accountId);
    if (!account || !account.isOwnedBy(userId)) {
      throw new ForbiddenException('Access denied');
    }

    return this.transactionRepo.findByFilters({
      userId,
      accountId,
    });
  }
}
