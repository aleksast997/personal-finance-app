// Data structures for repository operations (NOT HTTP DTOs)
export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface UserFilters {
  email?: string;
  isActive?: boolean;
}
