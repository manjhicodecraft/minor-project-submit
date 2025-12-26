import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Transaction } from '@shared/schema';

interface CardDetailsModalProps {
  card: {
    id: number;
    contactNumber: string;
    cardAccountNumber: string;
    accountType: string;
    initialBalance: string;
    createdAt: string | Date;
  } | null;
  transactions: Transaction[];
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
}

export function CardDetailsModal({ 
  card, 
  transactions, 
  isOpen, 
  isLoading, 
  onClose 
}: CardDetailsModalProps) {
  if (!card) return null;

  const formatDate = (date: string | Date) => {
    if (typeof date === 'string') {
      return format(new Date(date), 'MMM d, yyyy • h:mm a');
    }
    return format(date, 'MMM d, yyyy • h:mm a');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">
              {card.accountType} Card Details
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Account Number: **** **** **** {card.cardAccountNumber.slice(-4)}
          </div>
        </DialogHeader>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading card expenses...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions found for this card</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[50vh] pr-4">
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground">
                        <span className="font-bold text-lg">
                          {transaction.category?.charAt(0) || transaction.description?.charAt(0) || 'T'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {transaction.description || transaction.category || "Transaction"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`block font-display font-bold text-lg ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-foreground'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}${Number(transaction.amount).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        {transaction.category && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {transaction.category}
                          </Badge>
                        )}
                        <Badge 
                          variant={transaction.type === 'credit' ? 'default' : 'outline'} 
                          className={`text-xs ${
                            transaction.type === 'credit' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          }`}
                        >
                          {transaction.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}