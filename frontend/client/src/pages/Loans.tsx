import { useMemo, useState } from "react";
import { Navbar, MobileNav } from "@/components/layout/Navbar";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Progress } from "@/components/ui/progress";
import { Wallet, Calendar, AlertCircle, Bell, Sparkles, Landmark, Percent, Clock3, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { FinCard } from "@/components/ui/FinCard";
import { useAuth } from '@/contexts/AuthContext';
import { useAccounts, useLoans } from '@/hooks/use-finance';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ProfileDropdown } from '@/components/dashboard/ProfileDropdown';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportLoanExpensesToPDF } from '@/lib/pdfExporter';
import { Loan } from '@shared/schema';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

type LoanWithSchedule = Loan & {
  lenderName?: string;
  interestRate?: number;
  tenureMonths?: number;
  startDate?: string;
  expectedEndDate?: string;
  status?: string;
  installments?: Array<{ installmentNumber: number; dueDate: string; amount: number; principalAmount?: number; interestAmount?: number; status: 'paid' | 'pending' | 'overdue' }>;
};

const currency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
const formatDate = (date?: string) => date ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date)) : 'Not available';

function installmentsFor(loan: LoanWithSchedule) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (loan.installments ?? []).map((item) => ({ ...item, status: item.status !== 'paid' && new Date(item.dueDate) < today ? 'overdue' as const : item.status })).sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
}

export default function Loans() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const { data: rawLoans = [], isLoading, isError } = useLoans(authUser?.id);
  const { data: accounts = [] } = useAccounts(authUser?.id);
  const loans = rawLoans as LoanWithSchedule[];
  const [selectedLoan, setSelectedLoan] = useState<LoanWithSchedule | null>(null);

  const overview = useMemo(() => {
    const activeLoans = loans.filter((loan) => loan.status?.toLowerCase() !== 'closed');
    const scheduled = activeLoans.flatMap((loan) => installmentsFor(loan).map((emi) => ({ ...emi, loan })));
    const unpaid = scheduled.filter((emi) => emi.status !== 'paid');
    const upcoming = unpaid.filter((emi) => emi.status === 'pending');
    const overdue = unpaid.filter((emi) => emi.status === 'overdue');
    return {
      activeLoans, upcoming, overdue, nextEmi: upcoming[0],
      totalOutstanding: activeLoans.reduce((sum, loan) => sum + Number(loan.remainingAmount), 0),
      totalPrincipal: activeLoans.reduce((sum, loan) => sum + Number(loan.totalAmount), 0),
      monthlyEmi: activeLoans.reduce((sum, loan) => sum + Number(loan.emiAmount), 0),
      remainingInterest: unpaid.reduce((sum, emi) => sum + Number(emi.interestAmount || 0), 0),
      hasSchedule: scheduled.length > 0,
    };
  }, [loans]);
  
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
  
  const paymentUnavailable = () => toast({
    title: 'EMI payment is not available yet',
    description: 'This loan has no saved EMI schedule or payment API. No payment or transaction was created.',
    variant: 'destructive',
  });
  
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

        {isError ? (
          <FinCard className="mb-8 border-rose-500/30 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-rose-500" />
            <h2 className="font-semibold">Could not load loans</h2>
            <p className="mt-1 text-sm text-muted-foreground">Please try again when the service is available.</p>
          </FinCard>
        ) : <>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <FinCard gradient="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500" className="text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Total Outstanding</p>
                <p className="mt-2 text-3xl font-semibold sm:text-4xl">{currency(overview.totalOutstanding)}</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-3"><Wallet className="h-6 w-6" /></div>
            </div>
            <p className="mt-5 text-sm text-indigo-100">Total initial principal: {currency(overview.totalPrincipal)}</p>
          </FinCard>

          <FinCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next EMI Due</p>
                <p className="mt-2 text-3xl font-semibold sm:text-4xl">{overview.nextEmi ? currency(overview.nextEmi.amount) : '—'}</p>
              </div>
              <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-500"><AlertCircle className="h-6 w-6" /></div>
            </div>
            {overview.nextEmi ? (
              <>
                <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /> {overview.nextEmi.loan.loanType} · {formatDate(overview.nextEmi.dueDate)}</p>
                <ButtonCustom variant="outline" size="sm" className="mt-4 w-full rounded-2xl" onClick={paymentUnavailable}>Pay EMI</ButtonCustom>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No upcoming EMIs</p>
            )}
          </FinCard>
          <FinCard>
            <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Monthly EMI</p><p className="mt-2 text-3xl font-semibold sm:text-4xl">{currency(overview.monthlyEmi)}</p></div><div className="rounded-2xl bg-primary/10 p-3 text-primary"><Landmark className="h-6 w-6" /></div></div>
            <p className="mt-5 text-sm text-muted-foreground">{overview.activeLoans.length} active loan{overview.activeLoans.length === 1 ? '' : 's'}</p>
          </FinCard>
          <FinCard>
            <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Interest Remaining</p><p className="mt-2 text-3xl font-semibold sm:text-4xl">{overview.hasSchedule ? currency(overview.remainingInterest) : '—'}</p></div><div className="rounded-2xl bg-violet-500/10 p-3 text-violet-500"><Percent className="h-6 w-6" /></div></div>
            <p className="mt-5 text-sm text-muted-foreground">{overview.hasSchedule ? 'Across scheduled unpaid EMIs' : 'EMI schedule not available'}</p>
          </FinCard>
        </div>

        {overview.overdue.length > 0 && <FinCard className="mb-8 border-rose-500/30 bg-rose-500/[0.03]"><div className="flex gap-3"><AlertCircle className="mt-0.5 h-5 w-5 text-rose-500" /><div><p className="font-semibold text-rose-700 dark:text-rose-400">{overview.overdue.length} overdue EMI{overview.overdue.length === 1 ? '' : 's'} · {currency(overview.overdue.reduce((sum, emi) => sum + emi.amount, 0))}</p><p className="mt-1 text-sm text-muted-foreground">Review overdue payments to keep your repayment plan on track.</p></div></div></FinCard>}

        <div className="space-y-6">
          <h3 className="text-xl font-bold font-display">Active Loans</h3>
          {overview.activeLoans.length > 0 ? (
            overview.activeLoans.map((loan) => {
              const installments = installmentsFor(loan);
              const paidEmis = installments.filter((emi) => emi.status === 'paid').length;
              const totalEmis = installments.length || (loan.emiAmount ? Math.ceil(loan.totalAmount / loan.emiAmount) : 0);
              const percentage = loan.totalAmount ? Math.round(((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100) : 0;
              const next = installments.find((emi) => emi.status !== 'paid');
              return (
                <FinCard key={loan.id} className="p-6">
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-lg font-bold">{loan.loanType}</h4>
                      <p className="text-sm text-muted-foreground">{loan.lenderName || 'Lender not available'} · Loan ID: {loan.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className="text-2xl font-bold font-display">{currency(loan.remainingAmount)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Paid: {currency(loan.totalAmount - loan.remainingAmount)}</span>
                      <span>{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                    <div className="text-right text-xs text-muted-foreground">Total: {currency(loan.totalAmount)}</div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><div><p className="text-muted-foreground">EMI / month</p><p className="mt-1 font-semibold">{currency(loan.emiAmount)}</p></div><div><p className="text-muted-foreground">Interest</p><p className="mt-1 font-semibold">{loan.interestRate == null ? 'Not available' : `${loan.interestRate}%`}</p></div><div><p className="text-muted-foreground">EMIs paid</p><p className="mt-1 font-semibold">{paidEmis} / {totalEmis || '—'}</p></div><div><p className="text-muted-foreground">Next EMI</p><p className="mt-1 font-semibold">{next ? formatDate(next.dueDate) : 'Not available'}</p></div></div>
                  <div className="mt-6 flex gap-3"><Button variant="outline" className="flex-1 rounded-xl" onClick={() => setSelectedLoan(loan)}>View Details <ChevronRight className="ml-1 h-4 w-4" /></Button><ButtonCustom className="flex-1 rounded-xl" onClick={paymentUnavailable}>Pay EMI</ButtonCustom></div>
                </FinCard>
              );
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-card/50 rounded-2xl border border-dashed border-border">
              <Landmark className="mx-auto mb-3 h-8 w-8" /><p className="font-semibold">No active loans</p><p className="mt-1 text-sm">Your active loans and repayment information will appear here.</p>
            </div>
          )}
        </div>
        <section className="mt-10"><h3 className="text-xl font-bold font-display">Upcoming EMI Payments</h3><p className="mt-1 text-sm text-muted-foreground">Nearest scheduled payments, sorted by due date.</p><FinCard className="mt-4 overflow-hidden p-0">{overview.upcoming.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">No upcoming EMI payments are available.</p> : <div className="divide-y divide-border/60">{overview.upcoming.map((emi) => <div key={`${emi.loan.id}-${emi.installmentNumber}`} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{emi.loan.loanType}</p><p className="mt-1 text-sm text-muted-foreground">EMI #{emi.installmentNumber} · {formatDate(emi.dueDate)}</p></div><div className="flex items-center gap-3"><span className="font-semibold">{currency(emi.amount)}</span><ButtonCustom size="sm" className="rounded-xl" onClick={paymentUnavailable}>Pay EMI</ButtonCustom></div></div>)}</div>}</FinCard></section>
        </>}
      </main>

      <Dialog open={!!selectedLoan} onOpenChange={(open) => !open && setSelectedLoan(null)}>
        {selectedLoan && <LoanDetails loan={selectedLoan} accounts={accounts} onPay={paymentUnavailable} />}
      </Dialog>

      <MobileNav />
    </div>
  );
}

function LoanDetails({ loan, accounts, onPay }: { loan: LoanWithSchedule; accounts: any[]; onPay: () => void }) {
  const installments = installmentsFor(loan);
  const paid = installments.filter((emi) => emi.status === 'paid').length;
  const totalInterest = installments.reduce((sum, emi) => sum + Number(emi.interestAmount || 0), 0);
  const totalRepayment = installments.reduce((sum, emi) => sum + emi.amount, 0);
  const amountPaid = Math.max(0, loan.totalAmount - loan.remainingAmount);
  const percent = loan.totalAmount ? Math.round((amountPaid / loan.totalAmount) * 100) : 0;
  const summary = [
    ['Original principal', currency(loan.totalAmount)], ['Total interest', installments.length ? currency(totalInterest) : 'Not available'],
    ['Total repayment', installments.length ? currency(totalRepayment) : 'Not available'], ['Outstanding amount', currency(loan.remainingAmount)],
    ['EMI amount', currency(loan.emiAmount)], ['Interest rate', loan.interestRate == null ? 'Not available' : `${loan.interestRate}%`],
    ['Loan tenure', loan.tenureMonths == null ? 'Not available' : `${loan.tenureMonths} months`], ['Expected end date', formatDate(loan.expectedEndDate)],
  ];
  return <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto"><DialogHeader><DialogTitle className="text-2xl">{loan.loanType}</DialogTitle><DialogDescription>{loan.lenderName || 'Lender details are not available for this loan.'}</DialogDescription></DialogHeader>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{summary.map(([label, value]) => <div key={label} className="rounded-2xl border border-border/60 bg-muted/30 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>)}</div>
    <section><div className="mb-3 flex items-center justify-between"><div><h3 className="font-semibold">Repayment Progress</h3><p className="text-sm text-muted-foreground">{paid} paid · {Math.max(0, installments.length - paid)} remaining</p></div><span className="font-semibold text-primary">{percent}%</span></div><Progress value={percent} className="h-3" /><div className="mt-3 flex justify-between text-sm"><span>Amount paid: {currency(amountPaid)}</span><span>Amount remaining: {currency(loan.remainingAmount)}</span></div></section>
    <section><div className="mb-3 flex flex-wrap items-end justify-between gap-2"><div><h3 className="font-semibold">EMI Schedule</h3><p className="text-sm text-muted-foreground">Payment records are sorted by due date.</p></div>{accounts.length > 0 && <span className="text-xs text-muted-foreground">{accounts.length} payment account{accounts.length === 1 ? '' : 's'} available</span>}</div>{installments.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No EMI schedule is available for this loan yet.</div> : <div className="overflow-x-auto rounded-2xl border border-border/60"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-muted/50 text-xs text-muted-foreground"><tr><th className="p-3">EMI No.</th><th className="p-3">Due Date</th><th className="p-3">EMI</th><th className="p-3">Principal</th><th className="p-3">Interest</th><th className="p-3">Status</th><th className="p-3" /></tr></thead><tbody>{installments.map((emi) => <tr key={emi.installmentNumber} className="border-t border-border/60"><td className="p-3 font-medium">#{emi.installmentNumber}</td><td className="p-3">{formatDate(emi.dueDate)}</td><td className="p-3">{currency(emi.amount)}</td><td className="p-3">{emi.principalAmount == null ? '—' : currency(emi.principalAmount)}</td><td className="p-3">{emi.interestAmount == null ? '—' : currency(emi.interestAmount)}</td><td className="p-3"><EmiStatus status={emi.status} /></td><td className="p-3">{emi.status !== 'paid' && <ButtonCustom size="sm" className="rounded-lg" onClick={onPay}>Pay EMI</ButtonCustom>}</td></tr>)}</tbody></table></div>}</section>
  </DialogContent>;
}

function EmiStatus({ status }: { status: 'paid' | 'pending' | 'overdue' }) {
  const config = status === 'paid' ? { Icon: CheckCircle2, style: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' } : status === 'overdue' ? { Icon: XCircle, style: 'bg-rose-500/10 text-rose-700 dark:text-rose-400' } : { Icon: Clock3, style: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${config.style}`}><config.Icon className="h-3.5 w-3.5" />{status}</span>;
}
