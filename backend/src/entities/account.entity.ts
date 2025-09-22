export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT = 'credit',
  CASH = 'cash',
}

export enum Currency {
  RSD = 'RSD',
  EUR = 'EUR',
  USD = 'USD',
}

export class Account {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly accountType: AccountType,
    public readonly currency: Currency,
    private balance: number,
    public readonly bankName: string | null = null,
    public readonly accountNumber: string | null = null,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  // Factory method for creating new accounts
  static create(
    userId: string,
    name: string,
    accountType: AccountType,
    currency: Currency = Currency.RSD,
    initialBalance: number = 0,
    bankName?: string,
    accountNumber?: string,
  ): Pick<
    Account,
    | 'userId'
    | 'name'
    | 'accountType'
    | 'currency'
    | 'bankName'
    | 'accountNumber'
    | 'isActive'
  > & { balance: number } {
    return {
      userId,
      name: name.trim(),
      accountType,
      currency,
      balance: initialBalance,
      bankName: bankName?.trim() || null,
      accountNumber: accountNumber?.trim() || null,
      isActive: true,
    };
  }

  // Business methods
  getBalance(): number {
    return this.balance;
  }

  getFormattedBalance(): string {
    return `${this.balance.toFixed(2)} ${this.currency}`;
  }

  updateBalance(newBalance: number): Account {
    if (newBalance < 0 && this.accountType !== AccountType.CREDIT) {
      throw new Error('Non-credit accounts cannot have negative balance');
    }

    return new Account(
      this.id,
      this.userId,
      this.name,
      this.accountType,
      this.currency,
      newBalance,
      this.bankName,
      this.accountNumber,
      this.isActive,
      this.createdAt,
      new Date(), // updated timestamp
    );
  }

  deactivate(): Account {
    return new Account(
      this.id,
      this.userId,
      this.name,
      this.accountType,
      this.currency,
      this.balance,
      this.bankName,
      this.accountNumber,
      false, // isActive = false
      this.createdAt,
      new Date(), // updated timestamp
    );
  }

  activate(): Account {
    return new Account(
      this.id,
      this.userId,
      this.name,
      this.accountType,
      this.currency,
      this.balance,
      this.bankName,
      this.accountNumber,
      true, // isActive = true
      this.createdAt,
      new Date(), // updated timestamp
    );
  }

  // Validation methods
  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  canAcceptCurrency(currency: Currency): boolean {
    return this.currency === currency;
  }

  // For serialization
  toPublic() {
    return {
      id: this.id,
      name: this.name,
      accountType: this.accountType,
      currency: this.currency,
      balance: this.balance,
      formattedBalance: this.getFormattedBalance(),
      bankName: this.bankName,
      // Don't expose account number in public view
      hasAccountNumber: !!this.accountNumber,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // For detailed view (owner only)
  toDetailed() {
    return {
      ...this.toPublic(),
      accountNumber: this.accountNumber,
    };
  }
}
