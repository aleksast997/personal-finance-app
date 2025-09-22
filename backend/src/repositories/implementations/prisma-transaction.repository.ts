// src/repositories/implementations/prisma-transaction.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Transaction,
  TransactionType,
} from '../../entities/transaction.entity';
import { ITransactionRepository } from '../interfaces/transaction-repository.interface';
import {
  CreateTransactionData,
  TransactionFilters,
  UpdateTransactionData,
} from '../types/transaction-repository.types';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private prisma: PrismaService) {}

  async save(data: CreateTransactionData): Promise<Transaction> {
    const created = await this.prisma.transaction.create({
      data: {
        userId: data.userId,
        accountId: data.accountId,
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        transactionDate: data.transactionDate,
        toAccountId: data.toAccountId,
        fromAccountId: data.fromAccountId,
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    return transaction ? this.mapToEntity(transaction) : null;
  }

  async findByFilters(filters: TransactionFilters): Promise<Transaction[]> {
    const where: {
      userId: string;
      OR?: Array<{ accountId: string } | { toAccountId: string }>;
      categoryId?: string;
      type?: string;
      transactionDate?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      userId: filters.userId,
    };

    if (filters.accountId) {
      where.OR = [
        { accountId: filters.accountId },
        { toAccountId: filters.accountId },
      ];
    }

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.type) where.type = filters.type;

    if (filters.dateFrom || filters.dateTo) {
      where.transactionDate = {};
      if (filters.dateFrom) where.transactionDate.gte = filters.dateFrom;
      if (filters.dateTo) where.transactionDate.lte = filters.dateTo;
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
    });

    return transactions.map((t) => this.mapToEntity(t));
  }

  async update(
    id: string,
    data: UpdateTransactionData,
  ): Promise<Transaction | null> {
    try {
      const updated = await this.prisma.transaction.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return this.mapToEntity(updated);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.transaction.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getSumByType(
    userId: string,
    type: TransactionType,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<number> {
    const where: {
      userId: string;
      type: TransactionType;
      transactionDate?: {
        gte?: Date;
        lte?: Date;
      };
    } = { userId, type };

    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) where.transactionDate.gte = dateFrom;
      if (dateTo) where.transactionDate.lte = dateTo;
    }

    const result = await this.prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
    });

    return Number(result._sum.amount || 0);
  }

  async getMonthlyTotals(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [income, expense] = await Promise.all([
      this.getSumByType(userId, TransactionType.INCOME, startDate, endDate),
      this.getSumByType(userId, TransactionType.EXPENSE, startDate, endDate),
    ]);

    return {
      income,
      expense,
      net: income - expense,
    };
  }

  private mapToEntity(prismaTransaction: {
    id: string;
    userId: string;
    accountId: string;
    categoryId: string | null;
    type: string;
    amount: unknown;
    description: string;
    transactionDate: Date;
    createdAt: Date;
    updatedAt: Date;
    toAccountId: string | null;
    fromAccountId: string | null;
  }): Transaction {
    return new Transaction(
      prismaTransaction.id,
      prismaTransaction.userId,
      prismaTransaction.accountId,
      prismaTransaction.categoryId,
      prismaTransaction.type as TransactionType,
      Number(prismaTransaction.amount),
      prismaTransaction.description,
      prismaTransaction.transactionDate,
      prismaTransaction.createdAt,
      prismaTransaction.updatedAt,
      prismaTransaction.toAccountId,
      prismaTransaction.fromAccountId,
    );
  }
}
