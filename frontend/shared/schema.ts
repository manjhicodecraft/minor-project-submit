import { z } from "zod";

// Zod schema objects with $inferSelect
export const users = {
  $inferSelect: null as unknown as User,
};

export const banks = {
  $inferSelect: null as unknown as Bank,
};

export const accounts = {
  $inferSelect: null as unknown as Account,
};

export const transactions = {
  $inferSelect: null as unknown as Transaction,
};

export const cards = {
  $inferSelect: null as unknown as Card,
};

// === BASE SCHEMAS ===

// Create simplified schemas for validation
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  mobile: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  monthlyBudget: z.string().optional(),
  currency: z.string().optional(),
  appPin: z.string().optional(),
  fingerprintEnabled: z.boolean().optional(),
  isProfileComplete: z.boolean().optional()
});

export const insertBankSchema = z.object({
  name: z.string(),
  icon: z.string().optional()
});

export const insertAccountSchema = z.object({
  userId: z.number(),
  bankId: z.number(),
  accountNumber: z.string(),
  type: z.string(),
  balance: z.string().optional(),
  isLinked: z.boolean().optional(),
  loanAmount: z.string().optional(),
  loanPaid: z.string().optional()
});

export const insertTransactionSchema = z.object({
  accountId: z.number(),
  amount: z.string(),
  type: z.string(),
  category: z.string().optional(),
  description: z.string().optional()
});

// === EXPLICIT API CONTRACT TYPES ===

export type User = {
  id: number;
  username: string;
  password: string;
  fullName?: string | null;
  email?: string | null;
  mobile?: string | null;
  city?: string | null;
  country?: string | null;
  profilePicture?: string | null;
  monthlyBudget?: string | null;
  currency: string;
  appPin?: string | null;
  fingerprintEnabled: boolean;
  isProfileComplete: boolean;
  createdAt: Date;
};

export type Bank = {
  id: number;
  name: string;
  icon?: string | null;
};

export type Account = {
  id: number;
  userId: number;
  bankId: number;
  accountNumber: string;
  type: string;
  balance: string;
  isLinked: boolean;
  loanAmount?: string | null;
  loanPaid?: string | null;
  createdAt: Date;
};

export type Transaction = {
  id: number;
  accountId: number;
  amount: string;
  type: string;
  category?: string | null;
  description?: string | null;
  date: Date;
};

export type SavingGoal = {
  id: number;
  userId: number;
  category?: string | null;
  targetAmount: number;
  currentAmount: number;
  goalType?: 'monthly' | 'yearly';
  deadline?: Date;
  createdAt?: Date;
  editable: boolean;
};

export type Loan = {
  id: number;
  userId: number;
  loanType: string;
  totalAmount: number;
  emiAmount: number;
  remainingAmount: number;
};

export type Card = {
  id: number;
  userId: number;
  contactNumber: string;
  cardAccountNumber: string;
  accountType: string;
  initialBalance: string;
  createdAt: Date;
  duePayments?: number;
};

// Cash Expense type for offline transactions
export type CashExpense = {
  id: string; // Using string ID for offline expenses
  amount: string;
  category: string;
  description?: string | null;
  date: Date;
  currency: string;
  isOffline: true; // Flag to distinguish from regular transactions
};

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Card schema
export const insertCardSchema = z.object({
  userId: z.number(),
  contactNumber: z.string(),
  cardAccountNumber: z.string(),
  accountType: z.string(),
  initialBalance: z.string()
});

export type InsertCard = z.infer<typeof insertCardSchema>;

export type CreateUserRequest = InsertUser;
export type UpdateUserRequest = Partial<InsertUser>;
export type CreateAccountRequest = InsertAccount;
export type CreateTransactionRequest = InsertTransaction;
export type CreateCardRequest = InsertCard;
// Response types
export type UserResponse = User;
export type BankResponse = Bank;
export type AccountResponse = Account & { bank?: Bank };
export type TransactionResponse = Transaction;

export type CardResponse = Card;

// For the multi-step signup
export type SignupStep1Request = Pick<InsertUser, "fullName" | "email" | "mobile" | "city" | "country">;
export type SignupStep2Request = { linkedAccountIds: number[] }; // IDs of demo accounts to link
export type SignupStep3Request = Pick<InsertUser, "monthlyBudget" | "currency">; // And categories preference (could be stored in user or implied)
export type SignupStep4Request = Pick<InsertUser, "username" | "password" | "appPin" | "fingerprintEnabled">;
