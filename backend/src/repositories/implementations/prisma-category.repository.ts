import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Category, CategoryType } from '../../entities/category.entity';
import { ICategoryRepository } from '../interfaces/category-repository.interface';
import { CreateCategoryData } from '../types/category-repository.types';

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaService) {}

  async save(data: CreateCategoryData): Promise<Category> {
    const created = await this.prisma.category.create({
      data: {
        userId: data.userId,
        name: data.name,
        type: data.type,
        icon: data.icon,
        color: data.color,
      },
    });

    return this.mapToEntity(created);
  }

  async saveMany(data: CreateCategoryData[]): Promise<Category[]> {
    const created = await this.prisma.category.createMany({
      data: data.map(d => ({
        userId: d.userId,
        name: d.name,
        type: d.type,
        icon: d.icon,
        color: d.color,
      })),
      skipDuplicates: true,
    });

    // Fetch the created categories
    const categories = await this.prisma.category.findMany({
      where: {
        userId: data[0].userId,
      },
    });

    return categories.map(c => this.mapToEntity(c));
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    return category ? this.mapToEntity(category) : null;
  }

  async findByUserId(userId: string): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' },
      ],
    });

    return categories.map(c => this.mapToEntity(c));
  }

  async findByUserIdAndType(
    userId: string,
    type: CategoryType,
  ): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        userId,
        type: type as string,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    return categories.map(c => this.mapToEntity(c));
  }

  async update(
    id: string,
    data: Partial<CreateCategoryData>,
  ): Promise<Category | null> {
    try {
      const updated = await this.prisma.category.update({
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
      await this.prisma.category.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async existsByUserIdAndName(
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean> {
    const where: any = {
      userId,
      name: {
        equals: name,
        mode: 'insensitive', // Case-insensitive comparison
      },
      isActive: true,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.category.count({ where });
    return count > 0;
  }

  private mapToEntity(prismaCategory: any): Category {
    return new Category(
      prismaCategory.id,
      prismaCategory.userId,
      prismaCategory.name,
      prismaCategory.type as CategoryType,
      prismaCategory.icon,
      prismaCategory.color,
      prismaCategory.isActive,
      prismaCategory.createdAt,
      prismaCategory.updatedAt,
    );
  }
}