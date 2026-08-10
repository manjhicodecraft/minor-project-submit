import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative overflow-hidden rounded-[24px] border p-5 sm:p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] transition-all duration-300",
        onClick && "cursor-pointer",
        isPrimary ? "bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 text-white" :
        isDark ? "bg-slate-950 text-white" :
        "bg-card/90 border-border/70 hover:border-primary/30",
        className
      )}
      onClick={onClick}
    >
      {isPrimary && (
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
      )}
      <div className="relative z-10 flex items-start justify-between">
        <div className={cn(
          "rounded-2xl p-3",
          isPrimary ? "bg-white/20" : isDark ? "bg-white/10" : "bg-primary/10 text-primary"
        )}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            trendUp
              ? (isPrimary || isDark ? "bg-emerald-500/20 text-emerald-100" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400")
              : (isPrimary || isDark ? "bg-white/15 text-white/90" : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400")
          )}>
            {trendUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {trend}
          </div>
        )}
      </div>
      <div className="relative z-10 mt-6">
        <p className={cn("mb-2 text-sm font-medium", isPrimary || isDark ? "text-white/75" : "text-muted-foreground")}>{title}</p>
        <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{value}</h3>
      </div>
    </motion.div>
  );
}
