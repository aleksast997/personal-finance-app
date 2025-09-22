// src/entities/category.entity.ts
export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class Category {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly type: CategoryType,
    public readonly icon: string | null,
    public readonly color: string | null,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(
    userId: string,
    name: string,
    type: CategoryType,
    icon?: string,
    color?: string,
  ) {
    return {
      userId,
      name: name.trim(),
      type,
      icon: icon || null,
      color: color || null,
      isActive: true,
    };
  }

  static getDefaultCategories(
    userId: string,
  ): Array<ReturnType<typeof Category.create>> {
    return [
      // Expense categories
      {
        ...Category.create(
          userId,
          'Food & Dining',
          CategoryType.EXPENSE,
          '🍔',
          '#FF6B6B',
        ),
      },
      {
        ...Category.create(
          userId,
          'Transportation',
          CategoryType.EXPENSE,
          '🚗',
          '#4ECDC4',
        ),
      },
      {
        ...Category.create(
          userId,
          'Shopping',
          CategoryType.EXPENSE,
          '🛍️',
          '#45B7D1',
        ),
      },
      {
        ...Category.create(
          userId,
          'Entertainment',
          CategoryType.EXPENSE,
          '🎬',
          '#96CEB4',
        ),
      },
      {
        ...Category.create(
          userId,
          'Bills & Utilities',
          CategoryType.EXPENSE,
          '💡',
          '#FFEAA7',
        ),
      },
      {
        ...Category.create(
          userId,
          'Healthcare',
          CategoryType.EXPENSE,
          '🏥',
          '#DDA0DD',
        ),
      },
      {
        ...Category.create(
          userId,
          'Education',
          CategoryType.EXPENSE,
          '📚',
          '#98D8C8',
        ),
      },
      {
        ...Category.create(
          userId,
          'Other Expense',
          CategoryType.EXPENSE,
          '📌',
          '#95A5A6',
        ),
      },

      // Income categories
      {
        ...Category.create(
          userId,
          'Salary',
          CategoryType.INCOME,
          '💰',
          '#27AE60',
        ),
      },
      {
        ...Category.create(
          userId,
          'Freelance',
          CategoryType.INCOME,
          '💻',
          '#3498DB',
        ),
      },
      {
        ...Category.create(
          userId,
          'Investment',
          CategoryType.INCOME,
          '📈',
          '#9B59B6',
        ),
      },
      {
        ...Category.create(
          userId,
          'Other Income',
          CategoryType.INCOME,
          '💵',
          '#1ABC9C',
        ),
      },
    ];
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }
}
