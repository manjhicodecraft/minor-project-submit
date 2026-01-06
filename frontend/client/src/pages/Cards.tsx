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
import { Bell } from 'lucide-react';
import { ProfileDropdown } from '@/components/dashboard/ProfileDropdown';

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
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Card Management</h1>
            <p className="text-muted-foreground">Manage your cards in one place</p>
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
          
          {cardsLoading ? (
            <div className="bg-card p-12 rounded-2xl border border-border/50 text-center">
              <p className="text-muted-foreground">Loading cards...</p>
            </div>
          ) : cards.length > 0 ? (
            <CardDisplay 
              cards={cards} 
              onDeleteCard={handleDeleteCard} 
              onCardClick={handleCardClick}
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