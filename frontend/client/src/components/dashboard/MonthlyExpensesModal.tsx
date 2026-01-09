import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ButtonCustom } from "@/components/ui/button-custom";
import { format, startOfMonth, endOfMonth, isSameMonth, isToday, isThisMonth } from "date-fns";
import { TransactionList } from "./TransactionList";
import { Transaction, CashExpense } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

  // Separate online and cash expenses
  const { onlineExpenses, cashExpenses } = useMemo(() => {
    const online = monthlyExpenses.filter(expense => 
      'type' in expense && expense.type === 'debit'
    );
    
    const cash = monthlyExpenses.filter(expense => 
      'isOffline' in expense && expense.isOffline === true
    );
    
    return { onlineExpenses: online, cashExpenses: cash };
  }, [monthlyExpenses]);

  // Calculate totals for each category
  const onlineTotal = useMemo(() => {
    return onlineExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  }, [onlineExpenses]);

  const cashTotal = useMemo(() => {
    return cashExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  }, [cashExpenses]);

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

  // Prepare data for the chart
  const chartData = [
    { name: 'Online', value: onlineTotal },
    { name: 'Cash', value: cashTotal },
  ];

  // Navy blue color palette
  const navyBlue = '#1e3a8a';
  const navyBlueLight = '#314b9e';
  const navyBlueDark = '#0f1e42';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Monthly Expenses Breakdown</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Total: ${totalMonthlyExpenses.toFixed(2)} • {expensesByDate.length} days with expenses
            </p>
          </div>
          <ButtonCustom variant="outline" size="icon" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </ButtonCustom>
        </DialogHeader>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card p-4 rounded-xl border border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Online Expenses</h3>
            <p className="text-2xl font-bold" style={{ color: navyBlue }}>${onlineTotal.toFixed(2)}</p>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Cash Expenses</h3>
            <p className="text-2xl font-bold" style={{ color: navyBlue }}>${cashTotal.toFixed(2)}</p>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Monthly</h3>
            <p className="text-2xl font-bold" style={{ color: navyBlue }}>${totalMonthlyExpenses.toFixed(2)}</p>
          </div>
        </div>
        
        {/* Chart Visualization */}
        <div className="h-48 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
              <CartesianGrid strokeDasharray="0" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 12}}
                interval={0}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 12}} 
                tickFormatter={(value) => `$${value}`} 
                domain={[0, 'auto']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value) => [`$${value}`, 'Amount']}
              />
              <Bar 
                dataKey="value" 
                name="Amount"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? navyBlue : navyBlueLight} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="overflow-y-auto flex-grow">
          <div className="space-y-6">
            {/* Online Expenses Section */}
            {onlineExpenses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: navyBlue }}>
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                  Online Expenses
                </h3>
                <div className="space-y-2">
                  {onlineExpenses.map((expense, index) => {
                    const isTransaction = 'type' in expense;
                    return (
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
                          <p className="font-semibold" style={{ color: navyBlueDark }}>
                            -${Number(expense.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(expense.date), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 mt-2 border-t border-border/50 flex justify-between font-semibold" style={{ color: navyBlue }}>
                    <span>Online Total:</span>
                    <span style={{ color: navyBlueDark }}>
                      -${onlineTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Cash Expenses Section */}
            {cashExpenses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: navyBlue }}>
                  <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                  Cash Expenses
                </h3>
                <div className="space-y-2">
                  {cashExpenses.map((expense, index) => {
                    const isCashExpense = 'isOffline' in expense;
                    return (
                      <div 
                        key={String(expense.id) + index} 
                        className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {expense.description || expense.category || 'Cash Expense'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {expense.category && `Category: ${expense.category}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold" style={{ color: navyBlueDark }}>
                            -${Number(expense.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(expense.date), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 mt-2 border-t border-border/50 flex justify-between font-semibold" style={{ color: navyBlue }}>
                    <span>Cash Total:</span>
                    <span style={{ color: navyBlueDark }}>
                      -${cashTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* If no expenses */}
            {onlineExpenses.length === 0 && cashExpenses.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No expenses recorded this month</p>
                <p className="text-sm mt-2">Start adding transactions to see your spending breakdown</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}