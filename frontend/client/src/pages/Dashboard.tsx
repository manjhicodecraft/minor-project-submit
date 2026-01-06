import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar, MobileNav } from "@/components/layout/Navbar";
import { StatCard } from "@/components/dashboard/StatCard";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { useUser, useAccounts, useTransactions, useSavingGoals, useCards, type Card } from '@/hooks/use-finance';
import { Input } from "@/components/ui/input";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Search, Plus, Bell, Filter, CreditCard, ChevronDown, User } from "lucide-react";
import { ProfileDropdown } from "@/components/dashboard/ProfileDropdown";
import { CashExpenseForm } from "@/components/dashboard/CashExpenseForm";
import { getCashExpenses } from "@/lib/cashExpenses";
import { useAuth } from "@/contexts/AuthContext";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertAccountSchema } from "@shared/schema";
import { api } from "@shared/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { apiGet } from "@/lib/api";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Calculate weekly spending from transactions
const calculateWeeklySpending = (transactions: any[]) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Group transactions by day of week
  const dailyTotals: Record<string, number> = {};
  days.forEach(day => dailyTotals[day] = 0);
  
  transactions
    .filter(t => t.type === 'debit') // Only debits (spending)
    .forEach(transaction => {
      const date = new Date(transaction.date);
      const dayOfWeek = days[date.getDay()]; // 0 = Sunday, 1 = Monday, etc.
      dailyTotals[dayOfWeek] = (dailyTotals[dayOfWeek] || 0) + Number(transaction.amount);
    });

  // Convert to chart format
  const expenseData = days.map(day => ({
    name: day,
    amount: dailyTotals[day]
  }));
  
  return expenseData;
};

// Calculate category spending from transactions with account information
const calculateCategorySpending = (transactions: any[], accounts: any[]) => {
  // Create a map of account IDs to account names for easy lookup
  const accountMap = accounts?.reduce((acc, account) => {
    acc[account.id] = `${account.bank?.name} (...${account.accountNumber.slice(-4)})`;
    return acc;
  }, {} as Record<number, string>) || {};
  
  // Define category mapping
  const categoryMap: Record<string, { name: string; color: string }> = {
    'Shopping': { name: 'Shopping', color: '#8884d8' },
    'Food': { name: 'Food', color: '#82ca9d' },
    'Transport': { name: 'Transport', color: '#ffc658' },
    'Bills': { name: 'Bills', color: '#ff8042' },
    'Entertainment': { name: 'Entertainment', color: '#0088fe' },
    'Others': { name: 'Others', color: '#00c49f' }
  };
  
  // Group transactions by category
  const categoryTotals: Record<string, { amount: number; accounts: Set<string> }> = {};

  transactions
    .filter(t => t.type === 'debit') // Only debits (spending)
    .forEach(transaction => {
      const category = transaction.category || 'Others';
      const accountName = accountMap[transaction.accountId] || `Account ${transaction.accountId}`;
      
      if (!categoryTotals[category]) {
        categoryTotals[category] = { amount: 0, accounts: new Set() };
      }
      
      categoryTotals[category].amount += Number(transaction.amount);
      categoryTotals[category].accounts.add(accountName);
    });

  // Convert to chart format
  const categoryData = Object.entries(categoryTotals)
    .map(([key, value]) => {
      const categoryInfo = categoryMap[key] || { name: key, color: '#cccccc' };
      return {
        name: categoryInfo.name,
        value: value.amount,
        color: categoryInfo.color,
        accounts: Array.from(value.accounts)
      };
    })
    .sort((a, b) => b.value - a.value) // Sort by value descending
    .slice(0, 4); // Take top 4 categories

  return categoryData;
};

export default function Dashboard() {
  const { user: authUser } = useAuth();
  const { data: user } = useUser(authUser?.id);
  const { data: accounts } = useAccounts(authUser?.id);
  const { data: savingGoals } = useSavingGoals(authUser?.id);
  const { data: cards = [] } = useCards(authUser?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [showBankBalances, setShowBankBalances] = useState(false);
  const [showCashExpenseModal, setShowCashExpenseModal] = useState(false);

  // Get cash expenses from localStorage
  const cashExpenses = useMemo(() => {
    if (authUser?.id) {
      return getCashExpenses(authUser.id);
    }
    return [];
  }, [authUser?.id]);

  // Fetch transactions for all accounts or selected account
  const { data: allTransactions = [] } = useQuery({
    queryKey: ['all-transactions', accounts?.map(a => a.id), selectedAccountId],
    queryFn: async () => {
      // If a specific account is selected, only fetch its transactions
      if (selectedAccountId) {
        const data = await apiGet(`${api.transactions.list.path}?accountId=${selectedAccountId}`);
        return api.transactions.list.responses[200].parse(data);
      }
      
      // Otherwise fetch transactions for all accounts
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

  // Combine regular transactions with cash expenses
  const allTransactionsWithCash = useMemo(() => {
    return [...allTransactions, ...cashExpenses];
  }, [allTransactions, cashExpenses]);

  // Memoize calculations that depend on transactions
  const expenseData = useMemo(() => calculateWeeklySpending(allTransactionsWithCash), [allTransactionsWithCash]);
  const categoryData = useMemo(() => calculateCategorySpending(allTransactionsWithCash, accounts || []), [allTransactionsWithCash, accounts]);
  
  // Calculate monthly spend (debits)
  const monthlySpend = useMemo(() => 
    allTransactionsWithCash.filter(t => 'type' in t ? t.type === 'debit' : true) // Cash expenses are considered as debits
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
    [allTransactionsWithCash]
  );
    
  // Get the first saving goal for display
  const primarySavingGoal = useMemo(() => 
    savingGoals && savingGoals.length > 0 ? savingGoals[0] : null,
    [savingGoals]
  );

  const savingGoalProgress = useMemo(() => 
    primarySavingGoal ? 
      Math.round((primarySavingGoal.currentAmount / primarySavingGoal.targetAmount) * 100) : 0,
    [primarySavingGoal]
  );

  const totalBalance = useMemo(() => 
    accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0,
    [accounts]
  );

  const bankBalances = useMemo(() => {
    if (!accounts) return [];
    
    const bankMap: Record<string, { bank: any, totalBalance: number, accounts: any[] }> = {};
    
    // Define bank names mapping
    const bankNames: Record<number, string> = {
      1: 'SBI',
      2: 'Bank of Baroda',
      3: 'Punjab National Bank',
      4: 'RBI',
      5: 'HDFC Bank',
      6: 'Union Bank',
      7: 'ICICI Bank',
      8: 'Axis Bank',
      9: 'Bank of India',
      10: 'Yes Bank'
    };
    
    accounts.forEach(account => {
      // Use bankId as key if bank object doesn't exist
      const bankKey = account.bank ? account.bank.id : `unknown-${account.bankId || '0'}`;
      const bankInfo = account.bank || { 
        id: account.bankId, 
        name: bankNames[account.bankId as number] || 'Unknown Bank' 
      };
      
      if (!bankMap[bankKey]) {
        bankMap[bankKey] = {
          bank: bankInfo,
          totalBalance: 0,
          accounts: []
        };
      }
      
      bankMap[bankKey].totalBalance += Number(account.balance || 0);
      bankMap[bankKey].accounts.push(account);
    });
    
    return Object.values(bankMap);
  }, [accounts]);

  // AddAccountDialog component definition
  const AddAccountDialogComponent = () => {
    const form = useForm({
      resolver: zodResolver(insertAccountSchema),
      defaultValues: {
        accountNumber: "",
        type: "Savings",
        balance: "0",
        bankId: 1, // Default to mock bank
        userId: authUser?.id || 1, // Use authenticated user ID or fallback to 1
      }
    });

    return (
      <Dialog>
        <DialogTrigger asChild>
          <ButtonCustom size="sm" className="gap-2 rounded-xl">
            <Plus className="w-4 h-4" /> Add Card
          </ButtonCustom>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Link New Account</DialogTitle>
          </DialogHeader>
          <form className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Account Number</Label>
              <Input {...form.register("accountNumber")} placeholder="1234567890" />
            </div>
            <div className="grid gap-2">
              <Label>Account Type</Label>
              <select {...form.register("type")} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Savings">Savings</option>
                <option value="Checking">Checking</option>
                <option value="Credit">Credit Card</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Initial Balance</Label>
              <Input type="number" {...form.register("balance")} />
            </div>
            <ButtonCustom type="button" className="w-full">Link Account</ButtonCustom>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground flex">
        <Navbar />
        
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 pb-24 lg:pb-8 max-w-[1600px] mx-auto w-full">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold">Hello, {user?.fullName?.split(' ')[0] || "User"} 👋</h1>
              <p className="text-muted-foreground">Here's your financial overview for today.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search transactions..." 
                  className="pl-10 w-64 rounded-xl bg-card"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Account Selector Dropdown */}
              {accounts && accounts.length > 1 && (
                <select 
                  className="bg-card border border-border rounded-xl px-3 py-2 text-sm"
                  value={selectedAccountId || ''}
                  onChange={(e) => setSelectedAccountId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">All Accounts</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.bank?.name} (...{account.accountNumber.slice(-4)})
                    </option>
                  ))}
                </select>
              )}
              
              <ButtonCustom 
                variant="outline" 
                size="icon" 
                className="rounded-xl"
                onClick={() => setShowCashExpenseModal(true)}
                title="Add Cash Expense"
              >
                <Plus className="w-5 h-5" />
              </ButtonCustom>
              <ButtonCustom variant="outline" size="icon" className="rounded-xl">
                <Bell className="w-5 h-5" />
              </ButtonCustom>
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              <ProfileDropdown>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center font-bold cursor-pointer">
                  {user?.fullName?.[0] || "U"}
                </div>
              </ProfileDropdown>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Total Balance" 
              value={`$${totalBalance.toLocaleString()}`} 
              trend="+2.5%" 
              trendUp={true}
              variant="primary"
              onClick={() => setShowBankBalances(true)}
            />
            <StatCard 
              title="Monthly Spend" 
              value={`$${monthlySpend.toLocaleString()}`} 
              trend="-4.1%" 
              trendUp={true} 
              icon={CreditCard}
            />
            <StatCard 
              title="Savings Goal" 
              value={primarySavingGoal ? `$${primarySavingGoal.currentAmount.toLocaleString()}` : "$0"} 
              trend={`${savingGoalProgress}%`} 
              trendUp={true} 
              variant="dark"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart Area */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold font-display">
                    Spending Analytics
                    {selectedAccountId && accounts?.find(a => a.id === selectedAccountId) && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({accounts.find(a => a.id === selectedAccountId)?.bank?.name} ...{accounts.find(a => a.id === selectedAccountId)?.accountNumber.slice(-4)})
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    <select className="bg-secondary/50 text-sm rounded-lg px-3 py-1 border-none outline-none">
                      <option>This Week</option>
                      <option>Last Week</option>
                    </select>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={expenseData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Linked Accounts and Cards */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-display">My Cards & Accounts</h3>
                  <AddAccountDialogComponent />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Render Accounts */}
                  {accounts?.map((account) => (
                    <div key={`account-${account.id}`} className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <CreditCard className="w-24 h-24" />
                       </div>
                       <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                               {/* Mock bank icon */}
                               <span className="font-bold text-lg">{account.bank?.name?.[0]}</span>
                            </div>
                            {account.isLinked && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Linked</span>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{account.bank?.name}</p>
                          <p className="font-mono text-sm mb-4">**** **** **** {account.accountNumber.slice(-4)}</p>
                          <p className="text-2xl font-bold font-display">${Number(account.balance).toLocaleString()}</p>
                       </div>
                    </div>
                  ))}
                  {/* Render Cards */}
                  {cards?.map((card) => (
                    <div key={`card-${card.id}`} className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <CreditCard className="w-24 h-24" />
                       </div>
                       <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                               <span className="font-bold text-lg">{card.accountType?.charAt(0)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{card.accountType} Card</p>
                          <p className="font-mono text-sm mb-4">**** **** **** {card.cardAccountNumber?.slice(-4)}</p>
                          <p className="text-2xl font-bold font-display">${Number(card.initialBalance).toLocaleString()}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Area */}
            <div className="space-y-8">
              {/* Category Pie Chart */}
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
                <h3 className="text-xl font-bold font-display mb-6">Categories</h3>
                <div className="h-[200px] w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
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
                         <p className="text-xl font-bold">${categoryData.reduce((sum, cat) => sum + cat.value, 0).toLocaleString()}</p>
                      </div>
                   </div>
                </div>
                <div className="mt-4 space-y-3">
                   {categoryData.map((cat) => {
                      const total = categoryData.reduce((sum, c) => sum + c.value, 0);
                      const percentage = total > 0 ? Math.round((cat.value / total) * 100) : 0;
                      return (
                        <div key={cat.name} className="flex justify-between items-center text-sm">
                           <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                              <span>{cat.name}</span>
                           </div>
                           <span className="font-semibold">{percentage}%</span>
                        </div>
                      );
                   })}
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold font-display">Recent Activity</h3>
                    <ButtonCustom variant="link" size="sm" className="h-auto p-0">View All</ButtonCustom>
                 </div>
                 <div className="bg-card rounded-3xl p-2 shadow-sm border border-border/50">
                    <TransactionList transactions={allTransactionsWithCash} limit={5} />
                 </div>
              </div>
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
      
      {/* Bank Balances Popup */}
      <BankBalancesDialog 
        open={showBankBalances} 
        onOpenChange={setShowBankBalances}
        bankBalances={bankBalances}
      />
      
      {/* Cash Expense Modal */}
      <Dialog open={showCashExpenseModal} onOpenChange={setShowCashExpenseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Cash Expense</DialogTitle>
          </DialogHeader>
          <CashExpenseForm 
            onSubmitSuccess={() => setShowCashExpenseModal(false)}
            onCancel={() => setShowCashExpenseModal(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// Bank Balances Dialog Component
function BankBalancesDialog({ open, onOpenChange, bankBalances }: { open: boolean; onOpenChange: (open: boolean) => void; bankBalances: { bank: any, totalBalance: number, accounts: any[] }[] }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bank Balances</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {bankBalances.length > 0 ? (
            <div className="space-y-4">
              {bankBalances.map((bankData) => (
                <div key={bankData.bank.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{bankData.bank.name}</h3>
                    <span className="font-bold">${bankData.totalBalance.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {bankData.accounts.map((account: any) => (
                      <div key={account.id} className="flex justify-between">
                        <span>{account.type} (...{account.accountNumber.slice(-4)})</span>
                        <span>${Number(account.balance).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No accounts found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

