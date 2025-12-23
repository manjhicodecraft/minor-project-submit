import React from 'react';
import { Card as CardComponent } from '@/components/ui/card';

// Define the Card type
interface Card {
  id: number;
  contactNumber: string;
  cardAccountNumber: string;
  accountType: string;
  initialBalance: string;
  createdAt: string | Date;
}

// Define the props for the CardDisplay component
interface CardDisplayProps {
  cards: Card[];
  onDeleteCard: (id: number) => void;
}

export function CardDisplay({ cards, onDeleteCard }: CardDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div 
          key={card.id} 
          className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <span className="font-bold text-lg">{card.accountType.charAt(0)}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCard(card.id);
                }}
                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete card"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <h3 className="text-lg font-bold font-display mb-2">{card.accountType} Card</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-mono">**** **** **** {card.cardAccountNumber.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact:</span>
                <span>{card.contactNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-semibold">${parseFloat(card.initialBalance).toLocaleString()}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-4">
              Added: {new Date(card.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}