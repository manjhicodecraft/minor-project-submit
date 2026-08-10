import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar, MobileNav } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { getCashExpenses } from "@/lib/cashExpenses";
import { FinCard } from "@/components/ui/FinCard";
import { format } from "date-fns";
import { Plus, Wallet, TrendingDown, Search, Filter } from "lucide-react";
import { ButtonCustom } from "@/components/ui/button-custom";
import { CashExpenseForm } from "@/components/dashboard/CashExpenseForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportCashExpensesToPDF } from '@/lib/pdfExporter';

export default function CashExpenses() {
  const { user } = useAuth();
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Get cash expenses from localStorage
  const cashExpenses = useMemo(() => {
    if (user?.id) {
      return getCashExpenses(user.id);
    }
    return [];
  }, [user?.id]);

  // Calculate summary data
  const totalCashSpent = useMemo(() => {
    return cashExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  }, [cashExpenses]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    cashExpenses.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + Number(expense.amount);
    });
    return totals;
  }, [cashExpenses]);

  const sortedExpenses = useMemo(() => {
    const filtered = cashExpenses.filter((expense) => {
      const matchesSearch = `${expense.description || ""} ${expense.category}`.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === "All" || expense.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cashExpenses, search, filterCategory]);

  // Function to export cash expenses to PDF
  const handleExportCashExpensesToPDF = () => {
    const expensesForExport = cashExpenses.map(expense => ({
      id: expense.id,
      amount: expense.amount,
      category: expense.category,
      description: expense.description || '',
      date: new Date(expense.date),
      currency: expense.currency,
      isOffline: true,
      type: undefined
    }));
    
    exportCashExpensesToPDF(
      expensesForExport,
      `cash-expenses-${new Date().toISOString().split('T')[0]}.pdf`
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navbar />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pb-24 lg:pb-8 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 rounded-[32px] border border-border/60 bg-gradient-to-br from-background via-card/80 to-background p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Offline spending
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Cash Expenses</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">Track your offline spending with clarity</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl"
              onClick={handleExportCashExpensesToPDF}
            >
              <Download className="w-4 h-4" /> Export PDF
            </Button>
            <ButtonCustom 
              variant="default" 
              className="gap-2 rounded-xl"
              onClick={() => setShowAddExpenseModal(true)}
            >
              <Plus className="w-4 h-4" /> Add Cash Expense
            </ButtonCustom>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <FinCard hoverable={false} className="bg-gradient-to-br from-rose-500/10 to-background">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cash Spent</p>
                <p className="text-2xl font-bold font-display">${totalCashSpent.toFixed(2)}</p>
              </div>
            </div>
          </FinCard>

          <FinCard hoverable={false} className="bg-gradient-to-br from-sky-500/10 to-background">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold font-display">{cashExpenses.length}</p>
              </div>
            </div>
          </FinCard>

          <FinCard hoverable={false} className="bg-gradient-to-br from-emerald-500/10 to-background">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Expense</p>
                <p className="text-2xl font-bold font-display">
                  ${cashExpenses.length > 0 ? (totalCashSpent / cashExpenses.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </FinCard>
        </div>

        {/* Category Breakdown */}
        <FinCard className="mb-8 p-6">
          <h2 className="mb-4 text-xl font-semibold">Category Breakdown</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div key={category} className="rounded-xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{category}</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-background">
                  <div 
                    className="h-2 rounded-full bg-primary" 
                    style={{ width: `${(total / totalCashSpent) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </FinCard>

        {/* Cash Expenses List */}
        <FinCard className="p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">All Cash Expenses</h2>
              <p className="text-sm text-muted-foreground">{cashExpenses.length} {cashExpenses.length === 1 ? 'expense' : 'expenses'}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="w-full rounded-2xl border border-border/70 bg-background/80 py-2 pl-9 pr-3 text-sm sm:w-44" />
              </div>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full appearance-none rounded-2xl border border-border/70 bg-background/80 py-2 pl-9 pr-3 text-sm sm:w-40">
                  <option value="All">All categories</option>
                  {Object.keys(categoryTotals).map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
            </div>
          </div>

          {cashExpenses.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border/70 bg-background/50 py-12 text-center text-muted-foreground">
              <p className="font-medium">No cash expenses found</p>
              <p className="mt-2 text-sm">Add your first cash expense to get started</p>
            </div>
          ) : sortedExpenses.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border/70 bg-background/50 py-12 text-center text-muted-foreground">
              <p className="font-medium">No matching expenses</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedExpenses.map((expense) => (
                <div 
                  key={expense.id} 
                  className="group flex items-center justify-between rounded-2xl border border-border/40 bg-card p-4 transition-all duration-200 hover:border-primary/20 hover:bg-accent/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:text-primary">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                        {expense.description || expense.category}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(expense.date), "MMM d, yyyy • h:mm a")}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                        {expense.currency} • Cash Expense
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-lg font-bold text-foreground">
                      -${Number(expense.amount).toLocaleString()}
                    </span>
                    <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs capitalize text-muted-foreground">
                      {expense.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </FinCard>
      </main>

      <MobileNav />

      {/* Add Cash Expense Modal */}
      <Dialog open={showAddExpenseModal} onOpenChange={setShowAddExpenseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Cash Expense</DialogTitle>
          </DialogHeader>
          <CashExpenseForm 
            onSubmitSuccess={() => setShowAddExpenseModal(false)}
            onCancel={() => setShowAddExpenseModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}