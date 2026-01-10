import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { format, differenceInDays, addMonths, addYears, parseISO } from "date-fns";
import { SavingGoal } from "@shared/schema";

interface SavingGoalsModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

interface NewSavingGoal {
  category: string;
  targetAmount: string;
  currentAmount: string;
  goalType: 'monthly' | 'yearly';
  deadline: string;
}

export function SavingGoalsModal({ 
  open, 
  onClose, 
  userId 
}: SavingGoalsModalProps) {
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [newGoal, setNewGoal] = useState<NewSavingGoal>({
    category: '',
    targetAmount: '0',
    currentAmount: '0',
    goalType: 'monthly',
    deadline: ''
  });
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');
  
  // Load saving goals from localStorage
  useEffect(() => {
    const loadSavingGoals = () => {
      if (!userId) return;
      
      try {
        const savedGoals = localStorage.getItem(`savingGoals_${userId}`);
        if (savedGoals) {
          const parsedGoals = JSON.parse(savedGoals);
          // Ensure date strings are converted to Date objects
          const goalsWithDates = parsedGoals.map((goal: any) => ({
            ...goal,
            createdAt: goal.createdAt ? new Date(goal.createdAt) : undefined,
            deadline: goal.deadline ? new Date(goal.deadline) : undefined
          }));
          setSavingGoals(goalsWithDates);
        }
      } catch (error) {
        console.error('Error loading saving goals:', error);
      }
    };
    
    loadSavingGoals();
    
    // Set default deadline based on current goal type
    setNewGoal(prev => ({
      ...prev,
      deadline: calculateDeadline(prev.goalType)
    }));
  }, [userId]);

  // Calculate deadline based on goal type
  const calculateDeadline = (type: 'monthly' | 'yearly'): string => {
    const now = new Date();
    if (type === 'monthly') {
      return format(addMonths(now, 1), 'yyyy-MM-dd');
    } else {
      return format(addYears(now, 1), 'yyyy-MM-dd');
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle goal type change
  const handleGoalTypeChange = (type: 'monthly' | 'yearly') => {
    setNewGoal(prev => ({
      ...prev,
      goalType: type,
      deadline: calculateDeadline(type)
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGoal.category || !newGoal.targetAmount) {
      alert('Please fill in all required fields');
      return;
    }

    const targetAmountNum = parseFloat(newGoal.targetAmount);
    const currentAmountNum = parseFloat(newGoal.currentAmount || '0');
    
    if (isNaN(targetAmountNum) || targetAmountNum <= 0) {
      alert('Please enter a valid target amount');
      return;
    }

    if (isNaN(currentAmountNum) || currentAmountNum < 0) {
      alert('Please enter a valid current amount');
      return;
    }

    if (currentAmountNum > targetAmountNum) {
      alert('Current amount cannot exceed target amount');
      return;
    }

    // Generate a unique ID (using timestamp as number)
    const newId = Date.now();
    
    const newSavingGoal: SavingGoal = {
      id: newId,
      userId: parseInt(userId, 10), // Convert string userId to number
      category: newGoal.category,
      targetAmount: targetAmountNum,
      currentAmount: currentAmountNum,
      goalType: newGoal.goalType,
      deadline: new Date(newGoal.deadline),
      createdAt: new Date(),
      editable: true
    };

    const updatedGoals = [...savingGoals, newSavingGoal];
    setSavingGoals(updatedGoals);
    
    // Save to localStorage
    try {
      localStorage.setItem(`savingGoals_${userId}`, JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('Error saving saving goals:', error);
    }

    // Reset form
    setNewGoal({
      category: '',
      targetAmount: '0',
      currentAmount: '0',
      goalType: 'monthly',
      deadline: calculateDeadline('monthly')
    });
  };

  // Delete a saving goal
  const handleDeleteGoal = (id: number) => {
    const updatedGoals = savingGoals.filter(goal => goal.id !== id);
    setSavingGoals(updatedGoals);
    
    // Save to localStorage
    try {
      localStorage.setItem(`savingGoals_${userId}`, JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('Error deleting saving goal:', error);
    }
  };

  // Calculate progress percentage
  const calculateProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min(100, (current / target) * 100);
  };

  // Calculate days remaining
  const calculateDaysRemaining = (deadline: Date) => {
    const today = new Date();
    return Math.max(0, differenceInDays(deadline, today));
  };

  // Filter goals by type
  const monthlyGoals = savingGoals.filter(goal => goal.goalType === 'monthly');
  const yearlyGoals = savingGoals.filter(goal => goal.goalType === 'yearly');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Saving Goals</DialogTitle>
          <ButtonCustom variant="outline" size="icon" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </ButtonCustom>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-grow">
          {/* Tabs for Monthly/Yearly */}
          <div className="flex border-b border-border mb-4">
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === 'monthly' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('monthly')}
            >
              Monthly Goals
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === 'yearly' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('yearly')}
            >
              Yearly Goals
            </button>
          </div>
          
          {/* Add New Goal Form */}
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-secondary/30 rounded-xl">
            <h3 className="font-semibold mb-3">Add New {activeTab === 'monthly' ? 'Monthly' : 'Yearly'} Goal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="category">Goal Category *</Label>
                <Input
                  id="category"
                  name="category"
                  value={newGoal.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Vacation Fund, Emergency Savings"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="targetAmount">Target Amount *</Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newGoal.targetAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="currentAmount">Current Amount</Label>
                <Input
                  id="currentAmount"
                  name="currentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newGoal.currentAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <ButtonCustom type="submit" className="w-full">
              Add {activeTab === 'monthly' ? 'Monthly' : 'Yearly'} Goal
            </ButtonCustom>
          </form>
          
          {/* Goals List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {activeTab === 'monthly' ? 'Monthly Goals' : 'Yearly Goals'} 
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({activeTab === 'monthly' ? monthlyGoals.length : yearlyGoals.length} goals)
              </span>
            </h3>
            
            {activeTab === 'monthly' ? (
              monthlyGoals.length > 0 ? (
                <div className="space-y-3">
                  {monthlyGoals.map(goal => {
                    const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                    const daysRemaining = calculateDaysRemaining(goal.deadline!);
                    const isExpired = daysRemaining <= 0;
                    
                    return (
                      <div key={goal.id} className="p-4 bg-card rounded-xl border border-border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{goal.category}</h4>
                            <p className="text-sm text-muted-foreground">
                              Target: ${goal.targetAmount.toFixed(2)}
                            </p>
                          </div>
                          <ButtonCustom 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </ButtonCustom>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress: {progress.toFixed(1)}%</span>
                            <span>{isExpired ? 'Expired' : `${daysRemaining} days left`}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Started: {goal.createdAt ? format(goal.createdAt, 'MMM d, yyyy') : 'N/A'}</span>
                          <span>Due: {goal.deadline ? format(goal.deadline, 'MMM d, yyyy') : 'N/A'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No {activeTab} goals yet</p>
                  <p className="text-sm mt-1">Add your first goal to start saving!</p>
                </div>
              )
            ) : (
              yearlyGoals.length > 0 ? (
                <div className="space-y-3">
                  {yearlyGoals.map(goal => {
                    const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                    const daysRemaining = calculateDaysRemaining(goal.deadline!);
                    const isExpired = daysRemaining <= 0;
                    
                    return (
                      <div key={goal.id} className="p-4 bg-card rounded-xl border border-border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{goal.category}</h4>
                            <p className="text-sm text-muted-foreground">
                              Target: ${goal.targetAmount.toFixed(2)}
                            </p>
                          </div>
                          <ButtonCustom 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </ButtonCustom>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress: {progress.toFixed(1)}%</span>
                            <span>{isExpired ? 'Expired' : `${daysRemaining} days left`}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Started: {goal.createdAt ? format(goal.createdAt, 'MMM d, yyyy') : 'N/A'}</span>
                          <span>Due: {goal.deadline ? format(goal.deadline, 'MMM d, yyyy') : 'N/A'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No {activeTab} goals yet</p>
                  <p className="text-sm mt-1">Add your first goal to start saving!</p>
                </div>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}