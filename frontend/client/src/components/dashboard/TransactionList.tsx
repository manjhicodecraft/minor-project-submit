import { format } from "date-fns";
import { type Transaction, type CashExpense } from "@shared/schema";
import { ShoppingBag, Coffee, Home, Car, Utensils, Zap, MoreHorizontal, Coins, Wallet } from "lucide-react";
import { ButtonCustom } from "@/components/ui/button-custom";

const categoryIcons: Record<string, React.ElementType> = {
  Shopping: ShoppingBag,
  Food: Coffee,
  Rent: Home,
  Transport: Car,
  Dining: Utensils,
  Utilities: Zap,
};

interface TransactionListProps {
  transactions: (Transaction | CashExpense)[];
  limit?: number;
}

export function TransactionList({ transactions, limit }: TransactionListProps) {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-card/50 rounded-2xl border border-dashed border-border">
        <p>No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayTransactions.map((tx) => {
        // Determine if this is a CashExpense or regular Transaction
        const isCashExpense = 'isOffline' in tx && tx.isOffline === true;
        const Icon = categoryIcons[tx.category || ""] || (isCashExpense ? Wallet : ShoppingBag);
        
        // Handle type property for regular transactions vs cash expenses
        const isCredit = !isCashExpense && (tx as Transaction).type === "credit";
        const transactionType = isCashExpense ? "offline" : (tx as Transaction).type;
        
        return (
          <div 
            key={tx.id} 
            className="group flex items-center justify-between p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/20 hover:bg-accent/50 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300 shadow-sm">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {tx.description || tx.category || "Transaction"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {tx.date ? format(new Date(tx.date), "MMM d, yyyy • h:mm a") : "Date N/A"}
                </p>
                {isCashExpense && (
                  <span className="text-xs text-muted-foreground bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full inline-block mt-1">
                    Cash Expense
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className={`block font-display font-bold text-lg ${isCredit ? 'text-green-600' : 'text-foreground'}`}>
                {!isCashExpense && (tx as Transaction).type === "credit" ? "+" : "-"}${Number(tx.amount).toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground capitalize bg-secondary px-2 py-0.5 rounded-full inline-block mt-1">
                {transactionType}
              </span>
            </div>
          </div>
        );
      })}
      
      {limit && transactions.length > limit && (
        <ButtonCustom variant="ghost" className="w-full mt-4 text-muted-foreground hover:text-foreground">
          View All Transactions
        </ButtonCustom>
      )}
    </div>
  );
}
