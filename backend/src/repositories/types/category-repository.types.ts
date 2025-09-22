export interface CreateCategoryData {
  userId: string;
  name: string;
  type: string;
  icon?: string | null;
  color?: string | null;
  isActive?: boolean;
}
