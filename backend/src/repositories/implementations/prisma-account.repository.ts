import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Account, AccountType, Currency } from '../../entities/account.entity';
import { IAccountRepository } from '../interfaces/account-repository.interface';
import { Account as PrismaAccount } from '@prisma/client';
import { CreateAccountData, UpdateAccountData } from '../types/account-repository.types';

@Injectable()
export class PrismaAccountRepository implements IAccountRepository {
  constructor(private prisma: PrismaService) {}

  async save(accountData: CreateAccountData): Promise<Account> {
    const created = await this.prisma.account.create({
      data: {
        userId: accountData.userId,
        name: accountData.name,
        accountType: accountData.accountType,
        currency: accountData.currency,
        balance: accountData.balance,
        bankName: accountData.bankName,
        accountNumber: accountData.accountNumber,
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<Account | null> {
    const account = await this.prisma.account.findUnique({
      where: { id },
    });

    return account ? this.mapToEntity(account) : null;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'asc' }],
    });

    return accounts.map((account) => this.mapToEntity(account));
  }

  async findActiveByUserId(userId: string): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return accounts.map((account) => this.mapToEntity(account));
  }

  async update(
    id: string,
    updateData: UpdateAccountData,
  ): Promise<Account | null> {
    try {
      const updated = await this.prisma.account.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      return this.mapToEntity(updated);
    } catch {
      // Handle case where an account doesn't exist
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.account.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateBalance(id: string, newBalance: number): Promise<Account | null> {
    try {
      const updated = await this.prisma.account.update({
        where: { id },
        data: {
          balance: newBalance,
          updatedAt: new Date(),
        },
      });

      return this.mapToEntity(updated);
    } catch {
      return null;
    }
  }

  async findByUserIdAndType(
    userId: string,
    accountType: string,
  ): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
        accountType,
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return accounts.map((account) => this.mapToEntity(account));
  }

  async findByUserIdAndCurrency(
    userId: string,
    currency: string,
  ): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
        currency,
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return accounts.map((account) => this.mapToEntity(account));
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.account.count({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  async existsByUserIdAndName(
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean> {
    const whereClause = {
      userId,
      name,
      isActive: true,
      ...(excludeId && { id: { not: excludeId } }),
    };

    const count = await this.prisma.account.count({
      where: whereClause,
    });

    return count > 0;
  }

  private mapToEntity(prismaAccount: PrismaAccount): Account {
    return new Account(
      prismaAccount.id,
      prismaAccount.userId,
      prismaAccount.name,
      prismaAccount.accountType as AccountType,
      prismaAccount.currency as Currency,
      Number(prismaAccount.balance),
      prismaAccount.bankName,
      prismaAccount.accountNumber,
      prismaAccount.isActive,
      prismaAccount.createdAt,
      prismaAccount.updatedAt,
    );
  }
}
