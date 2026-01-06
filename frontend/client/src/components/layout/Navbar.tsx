import { Link, useLocation } from "wouter";
import { LayoutDashboard, CreditCard, Settings, PieChart, LogOut, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";

export function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: CreditCard, label: "My Cards", href: "/cards" },
    { icon: PieChart, label: "Analytics", href: "/analytics" },
    { icon: Wallet, label: "Loans", href: "/loans" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-card border-r border-border/50 shadow-xl z-50">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/25">
            F
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">FinTrack</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-primary/10 text-primary font-semibold shadow-sm" 
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}>
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
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
