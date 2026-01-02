
export type Category = 'Salário' | 'Objetivos' | 'Despesas' | 'Custos de vida' | 'Investimentos' | 'Entretenimento' | 'Extras';

export type TransactionType = 'income' | 'expense';
export type InstallmentPeriod = 'week' | 'month' | 'year';
export type InstallmentTypeMode = 'none' | 'discount' | 'interest';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: Category;
  amount: number;
  description: string;
  date: string;
  dueDate?: string;
  isPaid?: boolean;
  isPriority?: boolean;
  installments?: string;
  installmentValue?: number;
  interestRate?: string;
  discountAmount?: number;
  installmentType?: InstallmentTypeMode;
  installmentPeriod?: InstallmentPeriod;
  fileType?: 'pdf' | 'image';
  fileData?: string;
  fileName?: string;
  futureTransactionIds?: string[]; // To link installments
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  deadline: string;
}

export interface UserProfile {
  nickname: string;
  avatarId?: string;
}

export interface AppData {
  transactions: Transaction[];
  goals: Goal[];
  userProfile?: UserProfile;
}

export interface User {
  username: string;
  nickname?: string;
  isAuthenticated: boolean;
  source: 'local' | 'google';
  avatarUrl?: string;
  avatarId?: string;
  pin?: string;
}

export interface SyncState {
  status: 'idle' | 'syncing' | 'saved' | 'error';
  lastSynced: Date | null;
}
