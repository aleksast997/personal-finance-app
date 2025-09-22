export interface CreateAccountData {
  userId: string;
  name: string;
  accountType: string;
  currency: string;
  balance: number;
  bankName?: string | null;
  accountNumber?: string | null;
}

export interface UpdateAccountData {
  name?: string;
  bankName?: string;
  accountNumber?: string;
  isActive?: boolean;
}