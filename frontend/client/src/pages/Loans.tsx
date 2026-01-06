import { Navbar, MobileNav } from "@/components/layout/Navbar";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wallet, Calendar, AlertCircle, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLoans } from "@/hooks/use-finance";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { ProfileDropdown } from "@/components/dashboard/ProfileDropdown";

export default function Loans() {
  const { user: authUser } = useAuth();
  const { data: loans = [], isLoading } = useLoans(authUser?.id);

  // Calculate totals
  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
  const totalPrincipal = loans.reduce((sum, loan) => sum + loan.totalAmount, 0);
  
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg font-medium text-white/80">
                <span>Total Outstanding</span>
                <Wallet className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold mb-2">${totalOutstanding.toLocaleString()}</div>
              <p className="text-sm text-indigo-200">Total initial principal: ${totalPrincipal.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-card shadow-lg border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg font-medium">
                <span>Next EMI Due</span>
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextEmiLoan ? (
                <>
                  <div className="text-4xl font-display font-bold mb-2">${nextEmiLoan.emiAmount.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Due on next month
                  </p>
                  <ButtonCustom variant="outline" size="sm" className="mt-4 w-full">Pay Now</ButtonCustom>
                </>
              ) : (
                <p className="text-muted-foreground">No upcoming EMIs</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold font-display">Active Loans</h3>
          {loans.length > 0 ? (
            loans.map((loan) => {
              const percentage = Math.round(((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100);
              return (
                <div key={loan.id} className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
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
                </div>
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
