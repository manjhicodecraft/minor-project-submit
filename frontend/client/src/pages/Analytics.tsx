import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar, MobileNav } from "@/components/layout/Navbar";
import { StatCard } from "@/components/dashboard/StatCard";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { useUser, useAccounts, useTransactions, useSavingGoals, useCards } from '@/hooks/use-finance';
import { ButtonCustom } from "@/components/ui/button-custom";
import { apiGet } from "@/lib/api";
import { api } from "@shared/routes";
import { useAuth } from "@/contexts/AuthContext";
import { getCashExpenses } from "@/lib/cashExpenses";
import { CashExpense } from "@shared/schema";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subYears, parseISO } from "date-fns";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, CreditCard, DollarSign } from "lucide-react";

// Time filter types
type TimeFilter = 'day' | 'month' | 'year';

// Transaction type that includes both regular transactions and cash expenses
type TransactionWithCash = {
  id: number | string;
  accountId?: number;
  amount: string;
  type: string;
  category?: string | null;
  description?: string | null;
  date: Date;
  isOffline?: boolean;
};

export default function Analytics() {
  const { user: authUser } = useAuth();
  const { data: user } = useUser(authUser?.id);
  const { data: accounts } = useAccounts(authUser?.id);
  const { data: savingGoals } = useSavingGoals(authUser?.id);
  const { data: cards = [] } = useCards(authUser?.id);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  // Get cash expenses from localStorage
  const cashExpenses = useMemo(() => {
    if (authUser?.id) {
      return getCashExpenses(authUser.id);
    }
    return [];
  }, [authUser?.id]);

  // Fetch all transactions for all accounts
  const { data: allTransactions = [] } = useQuery({
    queryKey: ['all-transactions', accounts?.map(a => a.id)],
    queryFn: async () => {
      if (!accounts || accounts.length === 0) return [];
      
      // Fetch transactions for all accounts in parallel
      const transactionPromises = accounts.map(account => 
        apiGet(`${api.transactions.list.path}?accountId=${account.id}`)
          .then(data => api.transactions.list.responses[200].parse(data))
          .catch(error => {
            console.error(`Error fetching transactions for account ${account.id}:`, error);
            return []; // Return empty array on error for this account
          })
      );
      
      const transactionsArrays = await Promise.all(transactionPromises);
      // Flatten all transactions into a single array
      return transactionsArrays.flat();
    },
    enabled: !!accounts && accounts.length > 0,
  });

  // Combine regular transactions and cash expenses
  const allTransactionsWithCash = useMemo(() => {
    const combined: TransactionWithCash[] = [
      ...allTransactions.map(t => ({
        ...t,
        date: new Date(t.date)
      })),
      ...cashExpenses.map(expense => ({
        id: expense.id,
        amount: expense.amount,
        type: 'debit',
        category: expense.category,
        description: expense.description || expense.category,
        date: new Date(expense.date),
        isOffline: true
      }))
    ];
    
    return combined;
  }, [allTransactions, cashExpenses]);

  // Filter transactions based on time filter
  const filteredTransactions = useMemo(() => {
    if (allTransactionsWithCash.length === 0) return [];

    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (timeFilter) {
      case 'day':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    return allTransactionsWithCash.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [allTransactionsWithCash, timeFilter]);

  // Calculate weekly spending for the chart (only debits)
  const calculateWeeklySpending = (transactions: TransactionWithCash[]) => {
    if (timeFilter === 'day') {
      // For day view, show hourly data
      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      const hourlyTotals: Record<string, number> = {};
      hours.forEach(hour => hourlyTotals[hour] = 0);
      
      transactions
        .filter(t => t.type === 'debit')
        .forEach(transaction => {
          const date = new Date(transaction.date);
          const hour = date.getHours();
          const hourKey = `${hour}:00`;
          hourlyTotals[hourKey] = (hourlyTotals[hourKey] || 0) + Number(transaction.amount);
        });

      return hours.map(hour => ({
        name: hour,
        amount: hourlyTotals[hour]
      }));
    } else if (timeFilter === 'month') {
      // For month view, show daily data for the month
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      const dailyTotals: Record<string, number> = {};
      days.forEach(day => dailyTotals[day.toString()] = 0);
      
      transactions
        .filter(t => t.type === 'debit')
        .forEach(transaction => {
          const date = new Date(transaction.date);
          if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
            const day = date.getDate();
            dailyTotals[day.toString()] = (dailyTotals[day.toString()] || 0) + Number(transaction.amount);
          }
        });

      return days.map(day => ({
        name: day.toString(),
        amount: dailyTotals[day.toString()]
      }));
    } else {
      // For year view, show monthly data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyTotals: Record<string, number> = {};
      months.forEach(month => monthlyTotals[month] = 0);
      
      const currentYear = new Date().getFullYear();
      transactions
        .filter(t => t.type === 'debit')
        .forEach(transaction => {
          const date = new Date(transaction.date);
          if (date.getFullYear() === currentYear) {
            const month = months[date.getMonth()];
            monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(transaction.amount);
          }
        });

      return months.map(month => ({
        name: month,
        amount: monthlyTotals[month]
      }));
    }
  };

  // Calculate category spending
  const calculateCategorySpending = (transactions: TransactionWithCash[]) => {
    const categoryTotals: Record<string, number> = {};

    transactions
      .filter(t => t.type === 'debit') // Only debits (spending)
      .forEach(transaction => {
        const category = transaction.category || 'Others';
        categoryTotals[category] = (categoryTotals[category] || 0) + Number(transaction.amount);
      });

    // Define category mapping for colors
    const categoryMap: Record<string, { name: string; color: string }> = {
      'Food': { name: 'Food', color: '#82ca9d' },
      'Shopping': { name: 'Shopping', color: '#8884d8' },
      'Transport': { name: 'Transport', color: '#ffc658' },
      'Bills': { name: 'Bills', color: '#ff8042' },
      'Entertainment': { name: 'Entertainment', color: '#0088fe' },
      'Healthcare': { name: 'Healthcare', color: '#ff7300' },
      'Education': { name: 'Education', color: '#00c49f' },
      'Travel': { name: 'Travel', color: '#ff6666' },
      'Others': { name: 'Others', color: '#cccccc' }
    };

    // Convert to chart format
    const categoryData = Object.entries(categoryTotals)
      .map(([key, value]) => {
        const categoryInfo = categoryMap[key] || { name: key, color: '#cccccc' };
        return {
          name: categoryInfo.name,
          value: value,
          color: categoryInfo.color,
        };
      })
      .sort((a, b) => b.value - a.value); // Sort by value descending

    return categoryData;
  };

  // Calculate stats
  const totalSpent = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [filteredTransactions]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [filteredTransactions]);

  const expenseData = useMemo(() => calculateWeeklySpending(filteredTransactions), [filteredTransactions, timeFilter]);
  const categoryData = useMemo(() => calculateCategorySpending(filteredTransactions), [filteredTransactions]);

  // Time filter buttons
  const timeFilterOptions = [
    { value: 'day', label: 'Day' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navbar />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pb-24 lg:pb-8 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <header className="flex flex-col gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your spending patterns and financial trends</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {timeFilterOptions.map((option) => (
              <ButtonCustom
                key={option.value}
                variant={timeFilter === option.value ? "default" : "outline"}
                size="sm"
                className="rounded-xl flex-1 min-w-[80px]"
                onClick={() => setTimeFilter(option.value as TimeFilter)}
              >
                {option.label}
              </ButtonCustom>
            ))}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Spent" 
            value={`$${totalSpent.toFixed(2)}`} 
            trend={timeFilter === 'day' ? "Today" : timeFilter === 'month' ? "This Month" : "This Year"} 
            trendUp={false}
            icon={TrendingDown}
            variant="primary"
          />
          <StatCard 
            title="Total Income" 
            value={`$${totalIncome.toFixed(2)}`} 
            trend={timeFilter === 'day' ? "Today" : timeFilter === 'month' ? "This Month" : "This Year"} 
            trendUp={true}
            icon={TrendingUp}
            variant="primary"
          />
          <StatCard 
            title="Net Balance" 
            value={`$${(totalIncome - totalSpent).toFixed(2)}`} 
            trend={timeFilter === 'day' ? "Today" : timeFilter === 'month' ? "This Month" : "This Year"} 
            trendUp={(totalIncome - totalSpent) >= 0}
            icon={(totalIncome - totalSpent) >= 0 ? TrendingUp : TrendingDown}
            variant="primary"
          />
          <StatCard 
            title="Avg. Daily Expense" 
            value={`$${filteredTransactions.length > 0 ? (totalSpent / (timeFilter === 'day' ? 1 : timeFilter === 'month' ? new Date().getDate() : 365)).toFixed(2) : '0.00'}`} 
            trend={timeFilter === 'day' ? "Today" : timeFilter === 'month' ? "This Month" : "This Year"} 
            trendUp={false}
            icon={DollarSign}
            variant="primary"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                <div>
                  <h3 className="text-xl font-bold font-display">
                    Spending Analytics
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ({timeFilter === 'day' ? 'Hourly' : timeFilter === 'month' ? 'Daily' : 'Monthly'})
                  </p>
                </div>
              </div>
              <div className="h-[250px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={expenseData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#9ca3af', fontSize: 10}}
                      angle={-45}
                      textAnchor='end'
                      dx={-10}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#9ca3af', fontSize: 10}} 
                      tickFormatter={(value) => `$${value}`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value) => [`$${value}`, 'Amount']}
                      labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold font-display">Recent Transactions</h3>
              </div>
              <div className="bg-card rounded-2xl p-2 shadow-sm border border-border/50">
                <TransactionList transactions={filteredTransactions.slice(0, 5) as any} limit={5} />
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Category Breakdown */}
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
              <h3 className="text-xl font-bold font-display mb-5">Category Breakdown</h3>
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">${categoryData.reduce((sum, cat) => sum + cat.value, 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2">
                {categoryData.map((cat, index) => {
                  const total = categoryData.reduce((sum, c) => sum + c.value, 0);
                  const percentage = total > 0 ? Math.round((cat.value / total) * 100) : 0;
                  return (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="truncate max-w-[100px]">{cat.name}</span>
                      </div>
                      <span className="font-semibold">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Spending Categories */}
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
              <h3 className="text-xl font-bold font-display mb-4">Top Spending Categories</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {categoryData.slice(0, 5).map((cat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="capitalize truncate max-w-[100px]">{cat.name}</span>
                    </div>
                    <span className="font-semibold">${cat.value.toFixed(2)}</span>
                  </div>
                ))}
                {categoryData.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No spending data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}