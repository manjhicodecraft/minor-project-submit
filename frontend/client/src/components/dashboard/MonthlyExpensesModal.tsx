import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ButtonCustom } from "@/components/ui/button-custom";
import { format, startOfMonth, endOfMonth, isSameMonth, isToday, isThisMonth } from "date-fns";
import { TransactionList } from "./TransactionList";
import { Transaction, CashExpense } from "@shared/schema";

interface MonthlyExpensesModalProps {
  open: boolean;
  onClose: () => void;
  transactions: (Transaction | CashExpense)[];
}

export function MonthlyExpensesModal({ 
  open, 
  onClose, 
  transactions 
}: MonthlyExpensesModalProps) {
  // Filter to get only debit transactions (expenses) for the current month
  const monthlyExpenses = useMemo(() => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const isDebit = ('type' in transaction && transaction.type === 'debit') || 
                       ('isOffline' in transaction && transaction.isOffline === true);
        
        // Include transactions from the current month or up to today if it's the current month
        const isWithinCurrentMonth = transactionDate >= startOfCurrentMonth && 
                                    transactionDate <= endOfCurrentMonth;
        
        // If it's the current month, only include transactions up to today
        if (isThisMonth(transactionDate)) {
          return isDebit && transactionDate <= new Date();
        }
        
        return isDebit && isWithinCurrentMonth;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending
  }, [transactions]);

  // Group expenses by date
  const expensesByDate = useMemo(() => {
    const grouped: Record<string, (Transaction | CashExpense)[]> = {};
    
    monthlyExpenses.forEach(expense => {
      const dateKey = format(new Date(expense.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(expense);
    });
    
    // Sort dates in descending order (most recent first)
    return Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        date,
        dayName: format(new Date(date), 'EEEE'),
        isToday: isToday(new Date(date)),
        expenses: grouped[date].sort((a, b) => 
          Number(b.amount) - Number(a.amount) // Sort expenses by amount descending
        )
      }));
  }, [monthlyExpenses]);

  // Calculate total expenses for the month
  const totalMonthlyExpenses = useMemo(() => {
    return monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  }, [monthlyExpenses]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Monthly Expenses</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {expensesByDate.length} days with expenses • Total: ${totalMonthlyExpenses.toFixed(2)}
            </p>
          </div>
          <ButtonCustom variant="outline" size="icon" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </ButtonCustom>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-grow mt-2">
          {expensesByDate.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No expenses recorded this month</p>
              <p className="text-sm mt-2">Start adding transactions to see your daily spending</p>
            </div>
          ) : (
            <div className="space-y-6">
              {expensesByDate.map(({ date, dayName, isToday, expenses }) => (
                <div key={date} className="border-b border-border pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {format(new Date(date), 'MMMM d, yyyy')}
                      </h3>
                      {isToday && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {dayName}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {expenses.map((expense, index) => (
                      <div 
                        key={String(expense.id) + index} 
                        className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {expense.description || expense.category || 'Expense'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {expense.category && `Category: ${expense.category}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">
                            -${Number(expense.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(expense.date), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-2 mt-2 border-t border-border/50 flex justify-between font-semibold">
                      <span>Daily Total:</span>
                      <span className="text-red-600">
                        -${expenses.reduce((sum, exp) => sum + Number(exp.amount), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}