import { Category, CategoryType } from '../../entities/category.entity';
import { CreateCategoryData } from '../types/category-repository.types';

export interface ICategoryRepository {
  save(data: CreateCategoryData): Promise<Category>;
  saveMany(data: CreateCategoryData[]): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findByUserId(userId: string): Promise<Category[]>;
  findByUserIdAndType(userId: string, type: CategoryType): Promise<Category[]>;
  update(
    id: string,
    data: Partial<CreateCategoryData>,
  ): Promise<Category | null>;
  delete(id: string): Promise<boolean>;
  existsByUserIdAndName(
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean>;
}
