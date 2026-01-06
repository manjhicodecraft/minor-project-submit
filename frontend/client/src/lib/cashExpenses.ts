import { CashExpense } from "@shared/schema";

const CASH_EXPENSES_KEY = 'offline_cash_expenses';

export function getCashExpenses(userId: number): CashExpense[] {
  try {
    const expensesStr = localStorage.getItem(`${CASH_EXPENSES_KEY}_${userId}`);
    if (!expensesStr) return [];
    
    const expenses = JSON.parse(expensesStr);
    // Convert date strings back to Date objects
    return expenses.map((expense: any) => ({
      ...expense,
      date: new Date(expense.date),
      isOffline: true
    }));
  } catch (error) {
    console.error('Error loading cash expenses:', error);
    return [];
  }
}

export function addCashExpense(userId: number, expense: Omit<CashExpense, 'id' | 'isOffline'>): CashExpense {
  const expenses = getCashExpenses(userId);
  const newExpense: CashExpense = {
    ...expense,
    id: `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
    isOffline: true
  };
  
  expenses.push(newExpense);
  saveCashExpenses(userId, expenses);
  return newExpense;
}

export function saveCashExpenses(userId: number, expenses: CashExpense[]): void {
  try {
    localStorage.setItem(`${CASH_EXPENSES_KEY}_${userId}`, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving cash expenses:', error);
  }
}

export function deleteCashExpense(userId: number, expenseId: string): boolean {
  try {
    const expenses = getCashExpenses(userId);
    const filteredExpenses = expenses.filter(expense => expense.id !== expenseId);
    
    if (filteredExpenses.length !== expenses.length) {
      saveCashExpenses(userId, filteredExpenses);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting cash expense:', error);
    return false;
  }
}