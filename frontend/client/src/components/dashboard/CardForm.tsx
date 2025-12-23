import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Label } from '@/components/ui/label';

// Define the props for the CardForm component
interface CardFormProps {
  onAddCard: (cardData: { contactNumber: string; cardAccountNumber: string; accountType: string; initialBalance: string }) => void;
}

export function CardForm({ onAddCard }: CardFormProps) {
  // State for form inputs
  const [contactNumber, setContactNumber] = useState('');
  const [cardAccountNumber, setCardAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('Savings');
  const [initialBalance, setInitialBalance] = useState('');
  // State for validation errors
  const [errors, setErrors] = useState<{ contactNumber?: string; cardAccountNumber?: string; accountType?: string; initialBalance?: string }>({});

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous errors
    setErrors({});
    
    // Validation
    const newErrors: { contactNumber?: string; cardAccountNumber?: string; accountType?: string; initialBalance?: string } = {};
    
    // Contact Number validation
    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^[0-9]{10,15}$/.test(contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid contact number (10-15 digits)';
    }
    
    // Card Account Number validation
    if (!cardAccountNumber.trim()) {
      newErrors.cardAccountNumber = 'Card account number is required';
    } else if (!/^[0-9]{10,20}$/.test(cardAccountNumber)) {
      newErrors.cardAccountNumber = 'Please enter a valid account number (10-20 digits)';
    }
    
    // Account Type validation
    if (!accountType.trim()) {
      newErrors.accountType = 'Account type is required';
    }
    
    // Initial Balance validation
    if (!initialBalance.trim()) {
      newErrors.initialBalance = 'Initial balance is required';
    } else if (isNaN(parseFloat(initialBalance)) || parseFloat(initialBalance) < 0) {
      newErrors.initialBalance = 'Please enter a valid positive number';
    }
    
    // Check if there are any validation errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Call the parent function to add the card
    onAddCard({
      contactNumber,
      cardAccountNumber,
      accountType,
      initialBalance
    });
    
    // Reset form fields
    setContactNumber('');
    setCardAccountNumber('');
    setAccountType('Savings');
    setInitialBalance('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Contact Number Field */}
        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact Number *</Label>
          <Input
            id="contactNumber"
            type="tel"
            placeholder="Enter contact number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className={errors.contactNumber ? 'border-red-500' : ''}
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-sm">{errors.contactNumber}</p>
          )}
        </div>
        
        {/* Card Account Number Field */}
        <div className="space-y-2">
          <Label htmlFor="cardAccountNumber">Card Account Number *</Label>
          <Input
            id="cardAccountNumber"
            type="text"
            placeholder="Enter card account number"
            value={cardAccountNumber}
            onChange={(e) => setCardAccountNumber(e.target.value)}
            className={errors.cardAccountNumber ? 'border-red-500' : ''}
          />
          {errors.cardAccountNumber && (
            <p className="text-red-500 text-sm">{errors.cardAccountNumber}</p>
          )}
        </div>
        
        {/* Account Type Field */}
        <div className="space-y-2">
          <Label htmlFor="accountType">Account Type *</Label>
          <select
            id="accountType"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className={`w-full h-10 rounded-md border px-3 py-2 ${errors.accountType ? 'border-red-500' : 'border-input'} bg-background text-sm`}
          >
            <option value="Savings">Savings</option>
            <option value="Current">Current</option>
            <option value="Credit">Credit</option>
          </select>
          {errors.accountType && (
            <p className="text-red-500 text-sm">{errors.accountType}</p>
          )}
        </div>
        
        {/* Initial Balance Field */}
        <div className="space-y-2">
          <Label htmlFor="initialBalance">Initial Balance *</Label>
          <Input
            id="initialBalance"
            type="number"
            placeholder="Enter initial balance"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            className={errors.initialBalance ? 'border-red-500' : ''}
          />
          {errors.initialBalance && (
            <p className="text-red-500 text-sm">{errors.initialBalance}</p>
          )}
        </div>
      </div>
      
      {/* Form Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <ButtonCustom
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg transition-colors"
        >
          Add Card
        </ButtonCustom>
      </div>
    </form>
  );
}