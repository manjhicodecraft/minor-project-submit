import { useState, useMemo } from "react";
import { Navbar, MobileNav } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { getCashExpenses } from "@/lib/cashExpenses";
import { CashExpense } from "@shared/schema";
import { format } from "date-fns";
import { Plus, Wallet, TrendingDown } from "lucide-react";
import { ButtonCustom } from "@/components/ui/button-custom";
import { CashExpenseForm } from "@/components/dashboard/CashExpenseForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CashExpenses() {
  const { user } = useAuth();
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

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
    return [...cashExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cashExpenses]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navbar />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pb-24 lg:pb-8 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Cash Expenses</h1>
            <p className="text-muted-foreground">Track your offline spending</p>
          </div>
          
          <div className="flex items-center gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cash Spent</p>
                <p className="text-2xl font-bold font-display">${totalCashSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold font-display">{cashExpenses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
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
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 mb-8">
          <h2 className="text-xl font-bold font-display mb-4">Category Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div key={category} className="bg-secondary/50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{category}</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>
                <div className="mt-2 w-full bg-background rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(total / totalCashSpent) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Expenses List */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-display">All Cash Expenses</h2>
            <span className="text-sm text-muted-foreground">
              {cashExpenses.length} {cashExpenses.length === 1 ? 'expense' : 'expenses'}
            </span>
          </div>

          {cashExpenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card/50 rounded-2xl border border-dashed border-border">
              <p>No cash expenses found</p>
              <p className="text-sm mt-2">Add your first cash expense to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedExpenses.map((expense) => (
                <div 
                  key={expense.id} 
                  className="group flex items-center justify-between p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/20 hover:bg-accent/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300 shadow-sm">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {expense.description || expense.category}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(expense.date), "MMM d, yyyy • h:mm a")}
                      </p>
                      <span className="text-xs text-muted-foreground bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full inline-block mt-1">
                        {expense.currency} • Cash Expense
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block font-display font-bold text-lg text-foreground">
                      -${Number(expense.amount).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize bg-secondary px-2 py-0.5 rounded-full inline-block mt-1">
                      {expense.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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