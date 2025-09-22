import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { IAccountRepository } from '../repositories/interfaces/account-repository.interface';
import {
  CreateAccountDto,
  UpdateAccountDto,
  UpdateBalanceDto,
} from './dto/account.dto';
import { REPOSITORY_TOKENS } from '../repositories/repository.module';

@Injectable()
export class AccountService {
  constructor(
    @Inject(REPOSITORY_TOKENS.ACCOUNT)
    private accountRepository: IAccountRepository,
  ) {}

  async createAccount(
    userId: string,
    createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    const {
      name,
      accountType,
      currency,
      balance = 0,
      bankName,
      accountNumber,
    } = createAccountDto;

    // Check if user already has an account with this name
    const nameExists = await this.accountRepository.existsByUserIdAndName(
      userId,
      name,
    );
    if (nameExists) {
      throw new BadRequestException('Account with this name already exists');
    }

    // Create account entity
    const accountData = Account.create(
      userId,
      name,
      accountType,
      currency,
      balance,
      bankName,
      accountNumber,
    );

    // Save to database
    return this.accountRepository.save({
      userId: accountData.userId,
      name: accountData.name,
      accountType: accountData.accountType as string,
      currency: accountData.currency as string,
      balance: Number(accountData.balance),
      bankName: accountData.bankName,
      accountNumber: accountData.accountNumber,
    });
  }

  async getUserAccounts(userId: string): Promise<Account[]> {
    return this.accountRepository.findByUserId(userId);
  }

  async getActiveUserAccounts(userId: string): Promise<Account[]> {
    return this.accountRepository.findActiveByUserId(userId);
  }

  async getAccountById(accountId: string, userId: string): Promise<Account> {
    const account = await this.accountRepository.findById(accountId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (!account.isOwnedBy(userId)) {
      throw new ForbiddenException('Access denied to this account');
    }

    return account;
  }

  async updateAccount(
    accountId: string,
    userId: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    // First verify ownership
    await this.getAccountById(accountId, userId);

    // Check if new name conflicts with existing accounts (if name is being updated)
    if (updateAccountDto.name) {
      const nameExists = await this.accountRepository.existsByUserIdAndName(
        userId,
        updateAccountDto.name,
        accountId,
      );
      if (nameExists) {
        throw new BadRequestException('Account with this name already exists');
      }
    }

    const updatedAccount = await this.accountRepository.update(
      accountId,
      updateAccountDto,
    );

    if (!updatedAccount) {
      throw new NotFoundException('Account not found');
    }

    return updatedAccount;
  }

  async updateAccountBalance(
    accountId: string,
    userId: string,
    updateBalanceDto: UpdateBalanceDto,
  ): Promise<Account> {
    const account = await this.getAccountById(accountId, userId);

    // Validate balance update through entity business logic
    try {
      account.updateBalance(updateBalanceDto.balance);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Invalid balance update',
      );
    }

    const updatedAccount = await this.accountRepository.updateBalance(
      accountId,
      updateBalanceDto.balance,
    );

    if (!updatedAccount) {
      throw new NotFoundException('Account not found');
    }

    return updatedAccount;
  }

  async deactivateAccount(accountId: string, userId: string): Promise<Account> {
    // Verify ownership
    await this.getAccountById(accountId, userId);

    const updatedAccount = await this.accountRepository.update(accountId, {
      isActive: false,
    });

    if (!updatedAccount) {
      throw new NotFoundException('Account not found');
    }

    return updatedAccount;
  }

  async activateAccount(accountId: string, userId: string): Promise<Account> {
    // Verify ownership
    await this.getAccountById(accountId, userId);

    const updatedAccount = await this.accountRepository.update(accountId, {
      isActive: true,
    });

    if (!updatedAccount) {
      throw new NotFoundException('Account not found');
    }

    return updatedAccount;
  }

  async deleteAccount(accountId: string, userId: string): Promise<void> {
    // Verify ownership
    await this.getAccountById(accountId, userId);

    // TODO: Before deleting, check if account has transactions
    // For now, we'll just deactivate instead of hard delete
    const deactivated = await this.accountRepository.update(accountId, {
      isActive: false,
    });

    if (!deactivated) {
      throw new NotFoundException('Account not found');
    }
  }

  async getAccountsByType(
    userId: string,
    accountType: string,
  ): Promise<Account[]> {
    return this.accountRepository.findByUserIdAndType(userId, accountType);
  }

  async getAccountsByCurrency(
    userId: string,
    currency: string,
  ): Promise<Account[]> {
    return this.accountRepository.findByUserIdAndCurrency(userId, currency);
  }

  async getUserAccountsCount(userId: string): Promise<number> {
    return this.accountRepository.countByUserId(userId);
  }
}
