import { User } from '../../entities/user.entity';
import {
  CreateUserData,
  UpdateUserData,
  UserFilters,
} from '../types/user-repository.types';

export interface IUserRepository {
  // Core CRUD operations
  save(userData: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findMany(filters?: UserFilters): Promise<User[]>;
  update(id: string, updateData: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;

  // Auth-specific methods
  findByEmailWithPassword(email: string): Promise<User | null>;
  updateLastLogin(id: string): Promise<void>;

  // Domain-specific queries
  existsByEmail(email: string): Promise<boolean>;
}
