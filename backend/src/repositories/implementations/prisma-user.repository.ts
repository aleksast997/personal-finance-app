import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { User } from '../../entities/user.entity';
import {
  CreateUserData,
  UpdateUserData,
  UserFilters,
} from '../types/user-repository.types';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async save(userData: CreateUserData): Promise<User> {
    const dbUser = await this.prisma.user.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash: userData.passwordHash,
      },
    });

    return this.mapToEntity(dbUser);
  }

  async findById(id: string): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id },
    });

    return dbUser ? this.mapToEntity(dbUser) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({
      where: { email },
    });

    return dbUser ? this.mapToEntity(dbUser) : null;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({
      where: { email },
    });

    return dbUser ? this.mapToEntity(dbUser) : null;
  }

  async findMany(filters?: UserFilters): Promise<User[]> {
    const dbUsers = await this.prisma.user.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
    });

    return dbUsers.map((dbUser) => this.mapToEntity(dbUser));
  }

  async update(id: string, updateData: UpdateUserData): Promise<User> {
    const dbUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(dbUser);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        lastLogin: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  // Private helper to map a database model to a domain entity
  private mapToEntity(dbUser: PrismaUser): User {
    return new User(
      dbUser.id,
      dbUser.email,
      dbUser.firstName,
      dbUser.lastName,
      dbUser.passwordHash,
      dbUser.isActive,
      dbUser.lastLogin ?? null,
      dbUser.createdAt,
      dbUser.updatedAt,
    );
  }
}
