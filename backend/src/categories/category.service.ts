import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Category, CategoryType } from '../entities/category.entity';
import { ICategoryRepository } from '../repositories/interfaces/category-repository.interface';
import { REPOSITORY_TOKENS } from '../repositories/repository.module';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(REPOSITORY_TOKENS.CATEGORY)
    private categoryRepo: ICategoryRepository,
  ) {}

  /**
   * Create default categories for a new user
   */
  async createDefaultCategories(userId: string): Promise<Category[]> {
    const defaultCategories = Category.getDefaultCategories(userId);
    return this.categoryRepo.saveMany(defaultCategories);
  }

  /**
   * Create a custom category
   */
  async createCategory(
    userId: string,
    dto: CreateCategoryDto,
  ): Promise<Category> {
    // Check if category name already exists for this user
    const exists = await this.categoryRepo.existsByUserIdAndName(
      userId,
      dto.name,
    );
    if (exists) {
      throw new BadRequestException('Category with this name already exists');
    }

    const categoryData = Category.create(
      userId,
      dto.name,
      dto.type,
      dto.icon,
      dto.color,
    );

    return this.categoryRepo.save(categoryData);
  }

  /**
   * Get all categories for a user
   */
  async getUserCategories(userId: string): Promise<Category[]> {
    const categories = await this.categoryRepo.findByUserId(userId);

    // If user has no categories, create defaults
    if (categories.length === 0) {
      return this.createDefaultCategories(userId);
    }

    return categories;
  }

  /**
   * Get categories by type (income or expense)
   */
  async getCategoriesByType(
    userId: string,
    type: CategoryType,
  ): Promise<Category[]> {
    return this.categoryRepo.findByUserIdAndType(userId, type);
  }

  /**
   * Get a specific category
   */
  async getCategory(id: string, userId: string): Promise<Category> {
    const category = await this.categoryRepo.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!category.isOwnedBy(userId)) {
      throw new ForbiddenException('Access denied to this category');
    }

    return category;
  }

  /**
   * Update a category
   */
  async updateCategory(
    id: string,
    userId: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    // Verify ownership
    await this.getCategory(id, userId);

    // Check if new name conflicts with existing categories
    if (dto.name) {
      const exists = await this.categoryRepo.existsByUserIdAndName(
        userId,
        dto.name,
        id, // exclude current category
      );
      if (exists) {
        throw new BadRequestException('Category with this name already exists');
      }
    }

    const updated = await this.categoryRepo.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Category not found');
    }

    return updated;
  }

  /**
   * Delete a category (soft delete by deactivating)
   */
  async deleteCategory(id: string, userId: string): Promise<void> {
    await this.getCategory(id, userId);

    // Instead of hard delete, deactivate the category
    await this.categoryRepo.update(id, {
      name: '',
      userId: '',
      icon: undefined,
      type: '',
      color: undefined,
      isActive: false,
    });
  }

  /**
   * Initialize categories for a new user (called after registration)
   */
  async initializeUserCategories(userId: string): Promise<void> {
    const existingCategories = await this.categoryRepo.findByUserId(userId);

    if (existingCategories.length === 0) {
      await this.createDefaultCategories(userId);
    }
  }
}
