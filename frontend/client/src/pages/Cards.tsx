import React, { useState, useEffect } from 'react';
import { Navbar, MobileNav } from '@/components/layout/Navbar';
import { CardForm } from '@/components/dashboard/CardForm';
import { CardDisplay } from '@/components/dashboard/CardDisplay';
import { CardDetailsModal } from '@/components/dashboard/CardDetailsModal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDelete } from '@/lib/api';
import { Transaction } from '@shared/schema';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Bell, Sparkles } from 'lucide-react';
import { ProfileDropdown } from '@/components/dashboard/ProfileDropdown';
import { FinCard } from '@/components/ui/FinCard';

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
  
  // State for card details modal
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch cards from API
  const { data: cards = [], isLoading: cardsLoading, error } = useQuery({
    queryKey: ['cards', authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return [];
      const response: Card[] = await apiGet(`/api/cards?userId=${authUser.id}`);
      return response;
    },
    enabled: !!authUser?.id
  });
  
  // Fetch transactions for selected card
  const {
    data: cardTransactions = [],
    isLoading: transactionsLoading,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['cardTransactions', selectedCard?.id],
    queryFn: async () => {
      if (!selectedCard?.id) return [];
      const response: Transaction[] = await apiGet(`/api/cards/${selectedCard.id}/transactions`);
      return response;
    },
    enabled: false // Only fetch when modal is opened
  });
  
  // Function to handle card click
  const handleCardClick = async (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
    
    // Fetch transactions for the selected card
    try {
      await refetchTransactions();
    } catch (error) {
      toast({
        title: "Error fetching transactions",
        description: "Failed to load transactions for this card. Please try again.",
        variant: "destructive",
      });
    }
  };
  
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
      return response as Card;
    },
    onSuccess: (newCard: Card) => {
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
        <header className="mb-8 flex flex-col gap-4 rounded-[32px] border border-border/60 bg-gradient-to-br from-background via-card/80 to-background p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Card hub
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Card Management</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">Manage your cards in one place</p>
          </div>
          <div className="flex items-center gap-4">
            <ButtonCustom variant="outline" size="icon" className="rounded-xl">
              <Bell className="w-5 h-5" />
            </ButtonCustom>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <ProfileDropdown>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center font-bold cursor-pointer">
                {authUser?.fullName?.[0] || "U"}
              </div>
            </ProfileDropdown>
          </div>
        </header>

        {/* Add Cards Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Add New Card</h2>
            <button 
              onClick={() => setIsAddingCard(!isAddingCard)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
            >
              {isAddingCard ? 'Cancel' : 'Add New Card'}
            </button>
          </div>
          
          {isAddingCard && (
            <FinCard className="p-6">
              <CardForm onAddCard={handleAddCard} />
            </FinCard>
          )}
        </section>

        {/* My Cards Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">My Cards</h2>
            <span className="text-sm text-muted-foreground">
              {cards.length} {cards.length === 1 ? 'card' : 'cards'}
            </span>
          </div>
          
          {cardsLoading ? (
            <FinCard className="p-12 text-center">
              <p className="text-muted-foreground">Loading cards...</p>
            </FinCard>
          ) : cards.length > 0 ? (
            <CardDisplay 
              cards={cards} 
              onDeleteCard={handleDeleteCard} 
              onCardClick={handleCardClick}
            />
          ) : (
            <FinCard className="p-12 text-center">
              <h3 className="mb-2 text-xl font-semibold">No cards yet</h3>
              <p className="mb-4 text-muted-foreground">
                Add your first card using the form above
              </p>
              <button 
                onClick={() => setIsAddingCard(true)}
                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Add Card
              </button>
            </FinCard>
          )}
        </section>
      </main>

      <MobileNav />
      
      {/* Card Details Modal */}
      <CardDetailsModal
        card={selectedCard}
        transactions={cardTransactions}
        isOpen={isModalOpen}
        isLoading={transactionsLoading}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}