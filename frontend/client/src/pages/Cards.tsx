import React, { useState, useEffect } from 'react';
import { Navbar, MobileNav } from '@/components/layout/Navbar';
import { CardForm } from '@/components/dashboard/CardForm';
import { CardDisplay } from '@/components/dashboard/CardDisplay';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDelete } from '@/lib/api';

// Define the Card type
interface Card {
  id: number;
  contactNumber: string;
  cardAccountNumber: string;
  accountType: string;
  initialBalance: string;
  createdAt: string | Date;
}

export default function Cards() {
  // State to track if we're currently adding a card
  const [isAddingCard, setIsAddingCard] = useState(false);
  
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch cards from API
  const { data: cards = [], isLoading, error } = useQuery({
    queryKey: ['cards', authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return [];
      const response = await apiGet(`/api/cards?userId=${authUser.id}`);
      return response;
    },
    enabled: !!authUser?.id
  });
  
  // Mutation for adding a card
  const addCardMutation = useMutation({
    mutationFn: async (cardData: Omit<Card, 'id' | 'createdAt'>) => {
      if (!authUser?.id) {
        throw new Error('User not authenticated');
      }
      
      const cardWithUserId = {
        ...cardData,
        userId: authUser.id
      };
      
      const response = await apiPost('/api/cards', cardWithUserId);
      return response;
    },
    onSuccess: (newCard) => {
      // Invalidate and refetch cards
      queryClient.invalidateQueries({ queryKey: ['cards', authUser?.id] });
      
      // Show success message
      toast({
        title: "Card Added Successfully!",
        description: `Your ${newCard.accountType} card has been added to your account.`,
        duration: 3000,
      });
      
      // Reset the adding state
      setIsAddingCard(false);
    },
    onError: (error) => {
      toast({
        title: "Error adding card",
        description: error.message || "Failed to add card. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for deleting a card
  const deleteCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiDelete(`/api/cards/${id}`);
      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch cards
      queryClient.invalidateQueries({ queryKey: ['cards', authUser?.id] });
      
      toast({
        title: "Card Deleted",
        description: "Your card has been successfully removed.",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting card",
        description: error.message || "Failed to delete card. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Function to add a new card
  const handleAddCard = (cardData: Omit<Card, 'id' | 'createdAt'>) => {
    addCardMutation.mutate(cardData);
  };
  
  // Function to delete a card
  const handleDeleteCard = (id: number) => {
    deleteCardMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navbar />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pb-24 lg:pb-8 max-w-[1600px] mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold">Card Management</h1>
          <p className="text-muted-foreground">Manage your cards in one place</p>
        </header>

        {/* Add Cards Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-display">Add New Card</h2>
            <button 
              onClick={() => setIsAddingCard(!isAddingCard)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
            >
              {isAddingCard ? 'Cancel' : 'Add New Card'}
            </button>
          </div>
          
          {isAddingCard && (
            <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
              <CardForm onAddCard={handleAddCard} />
            </div>
          )}
        </section>

        {/* My Cards Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-display">My Cards</h2>
            <span className="text-sm text-muted-foreground">
              {cards.length} {cards.length === 1 ? 'card' : 'cards'}
            </span>
          </div>
          
          {isLoading ? (
            <div className="bg-card p-12 rounded-2xl border border-border/50 text-center">
              <p className="text-muted-foreground">Loading cards...</p>
            </div>
          ) : cards.length > 0 ? (
            <CardDisplay 
              cards={cards} 
              onDeleteCard={handleDeleteCard} 
            />
          ) : (
            <div className="bg-card p-12 rounded-2xl border border-border/50 text-center">
              <h3 className="text-xl font-semibold mb-2">No cards yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first card using the form above
              </p>
              <button 
                onClick={() => setIsAddingCard(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
              >
                Add Card
              </button>
            </div>
          )}
        </section>
      </main>

      <MobileNav />
    </div>
  );
}