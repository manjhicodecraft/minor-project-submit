import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ElementType;
  className?: string;
  variant?: "default" | "primary" | "dark";
  onClick?: () => void;
}

export function StatCard({ 
  title, 
  value, 
  trend, 
  trendUp, 
  icon: Icon = TrendingUp, 
  className,
  variant = "default",
  onClick
}: StatCardProps) {
  
  const isPrimary = variant === "primary";
  const isDark = variant === "dark";

  return (
    <div className={cn(
      "rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden",
      onClick && "cursor-pointer",
      isPrimary ? "bg-primary text-primary-foreground shadow-xl shadow-primary/25" :
      isDark ? "bg-gray-900 text-white shadow-xl" :
      "bg-card border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl",
      className
    )} onClick={onClick}>
      {/* Background decoration */}
      {isPrimary && (
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      )}
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={cn(
          "p-3 rounded-2xl",
          isPrimary ? "bg-white/20" : 
          isDark ? "bg-gray-800" : 
          "bg-primary/10 text-primary"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
            trendUp 
              ? (isPrimary || isDark ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400")
              : (isPrimary || isDark ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400")
          )}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <p className={cn(
          "text-sm font-medium mb-1",
          isPrimary || isDark ? "text-white/70" : "text-muted-foreground"
        )}>{title}</p>
        <h3 className="text-3xl font-display font-bold tracking-tight">{value}</h3>
      </div>
    </div>
  );
}
