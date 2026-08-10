import { Link, useLocation } from "wouter";
import { LayoutDashboard, CreditCard, Settings, PieChart, LogOut, Wallet, Coins, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";

export function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: CreditCard, label: "My Cards", href: "/cards" },
    { icon: Coins, label: "Cash Expenses", href: "/cash-expenses" },
    { icon: PieChart, label: "Analytics", href: "/analytics" },
    { icon: Wallet, label: "Loans", href: "/loans" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col border-r border-border/70 bg-card/90 px-4 py-5 shadow-[20px_0_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur lg:flex">
      <div className="mb-8 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 text-xl font-bold text-white shadow-lg shadow-primary/25">
          F
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> FinTrack
          </div>
          <p className="text-xs text-muted-foreground">Smart finance control</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
              )}
            >
              <span className={cn("rounded-xl p-2 transition-colors", isActive ? "bg-white/15" : "bg-background/70 group-hover:bg-primary/10") }>
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
              </span>
              {item.label}
              {isActive && <span className="ml-auto h-2.5 w-2.5 rounded-full bg-white/90" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-2">
        <Link href="/login" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [location] = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
    { icon: CreditCard, label: "Cards", href: "/cards" },
    { icon: Coins, label: "Cash", href: "/cash-expenses" },
    { icon: PieChart, label: "Stats", href: "/analytics" },
    { icon: Wallet, label: "Loans", href: "/loans" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border p-2 z-50 pb-safe">
      <nav className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[64px]",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              <item.icon className={cn("w-6 h-6", isActive && "fill-current/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <div className="p-2">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
