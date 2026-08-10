import { Navbar, MobileNav } from "@/components/layout/Navbar";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Progress } from "@/components/ui/progress";
import { Wallet, Calendar, AlertCircle, Bell, Sparkles } from "lucide-react";
import { FinCard } from "@/components/ui/FinCard";
import { useAuth } from '@/contexts/AuthContext';
import { useLoans } from '@/hooks/use-finance';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ProfileDropdown } from '@/components/dashboard/ProfileDropdown';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportLoanExpensesToPDF } from '@/lib/pdfExporter';
import { Loan } from '@shared/schema';

export default function Loans() {
  const { user: authUser } = useAuth();
  const { data: loans = [], isLoading } = useLoans(authUser?.id);

  // Calculate totals
  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
  const totalPrincipal = loans.reduce((sum, loan) => sum + loan.totalAmount, 0);
  
  // Function to export loan expenses to PDF
  const handleExportLoansToPDF = () => {
    const loansForExport = loans.map(loan => ({
      id: loan.id,
      amount: loan.totalAmount.toString(),
      category: loan.loanType,
      description: `Loan ID: ${loan.id}`,
      date: new Date(), // Using current date for export
      currency: 'USD',
      isOffline: false,
      type: 'credit'
    }));
    
    exportLoanExpensesToPDF(
      loansForExport,
      `loan-expenses-${new Date().toISOString().split('T')[0]}.pdf`
    );
  };
  
  // Find next EMI due (simple approach - first loan)
  const nextEmiLoan = loans.length > 0 ? loans[0] : null;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Navbar />
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 pb-24 lg:pb-8 max-w-[1200px] mx-auto w-full">
          <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">Loans & Liabilities</h1>
              <p className="text-muted-foreground">Track your repayment progress and upcoming EMIs.</p>
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
          <div className="flex justify-center items-center h-full">
            <p>Loading loans data...</p>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navbar />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pb-24 lg:pb-8 max-w-[1200px] mx-auto w-full">
        <header className="mb-8 flex flex-col gap-4 rounded-[32px] border border-border/60 bg-gradient-to-br from-background via-card/80 to-background p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Debt overview
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Loans & Liabilities</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">Track your repayment progress and upcoming EMIs.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl"
              onClick={handleExportLoansToPDF}
            >
              <Download className="w-4 h-4" /> Export PDF
            </Button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FinCard gradient="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500" className="text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Total Outstanding</p>
                <p className="mt-2 text-3xl font-semibold sm:text-4xl">${totalOutstanding.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-3"><Wallet className="h-6 w-6" /></div>
            </div>
            <p className="mt-5 text-sm text-indigo-100">Total initial principal: ${totalPrincipal.toLocaleString()}</p>
          </FinCard>

          <FinCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next EMI Due</p>
                <p className="mt-2 text-3xl font-semibold sm:text-4xl">${nextEmiLoan ? nextEmiLoan.emiAmount.toLocaleString() : '0'}</p>
              </div>
              <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-500"><AlertCircle className="h-6 w-6" /></div>
            </div>
            {nextEmiLoan ? (
              <>
                <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /> Due on next month</p>
                <ButtonCustom variant="outline" size="sm" className="mt-4 w-full rounded-2xl">Pay Now</ButtonCustom>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No upcoming EMIs</p>
            )}
          </FinCard>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold font-display">Active Loans</h3>
          {loans.length > 0 ? (
            loans.map((loan) => {
              const percentage = Math.round(((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100);
              return (
                <FinCard key={loan.id} className="p-6">
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-lg font-bold">{loan.loanType}</h4>
                      <p className="text-sm text-muted-foreground">Loan ID: {loan.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className="text-2xl font-bold font-display">${loan.remainingAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Paid: ${(loan.totalAmount - loan.remainingAmount).toLocaleString()}</span>
                      <span>{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                    <div className="text-right text-xs text-muted-foreground">Total: ${loan.totalAmount.toLocaleString()}</div>
                  </div>
                </FinCard>
              );
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-card/50 rounded-2xl border border-dashed border-border">
              <p>No active loans found</p>
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
