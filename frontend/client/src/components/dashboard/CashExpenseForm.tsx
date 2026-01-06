import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addCashExpense } from "@/lib/cashExpenses";
import { useAuth } from "@/contexts/AuthContext";

const cashExpenseSchema = z.object({
  amount: z.string().min(1, "Amount is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
});

type CashExpenseFormData = z.infer<typeof cashExpenseSchema>;

interface CashExpenseFormProps {
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

export function CashExpenseForm({ onSubmitSuccess, onCancel }: CashExpenseFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CashExpenseFormData>({
    resolver: zodResolver(cashExpenseSchema),
    defaultValues: {
      amount: "",
      category: "Food",
      description: "",
      currency: "USD",
    },
  });

  const categories = [
    "Food", "Shopping", "Transport", "Bills", "Entertainment", 
    "Healthcare", "Education", "Travel", "Others"
  ];

  const currencies = [
    "USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD", "CHF", "CNY", "Others"
  ];

  const handleSubmit = async (data: CashExpenseFormData) => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addCashExpense(user.id, {
        amount: data.amount,
        category: data.category,
        description: data.description || null,
        date: new Date(),
        currency: data.currency,
      });

      form.reset();
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      setError("Failed to add cash expense. Please try again.");
      console.error("Error adding cash expense:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...form.register("amount")}
              className={form.formState.errors.amount ? "border-destructive" : ""}
            />
            {form.formState.errors.amount && (
              <p className="text-destructive text-sm mt-1">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              {...form.register("currency")}
              className={`w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ${
                form.formState.errors.currency ? "border-destructive" : ""
              }`}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            {form.formState.errors.currency && (
              <p className="text-destructive text-sm mt-1">
                {form.formState.errors.currency.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              {...form.register("category")}
              className={`w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ${
                form.formState.errors.category ? "border-destructive" : ""
              }`}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {form.formState.errors.category && (
              <p className="text-destructive text-sm mt-1">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              {...form.register("description")}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <ButtonCustom
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </ButtonCustom>
          <ButtonCustom type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Expense"}
          </ButtonCustom>
        </div>
      </form>
    </div>
  );
}