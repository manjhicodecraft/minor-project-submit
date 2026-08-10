import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FinCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  gradient?: string;
  compact?: boolean;
  glass?: boolean;
}

export function FinCard({
  children,
  className,
  hoverable = true,
  gradient,
  compact = false,
  glass = false,
}: FinCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={hoverable ? { y: -4, scale: 1.01, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-border/70 bg-card/90 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur",
        compact ? "p-4" : "p-5 sm:p-6",
        glass && "bg-white/70 dark:bg-slate-900/70",
        hoverable && "transition-shadow duration-300 hover:shadow-[0_25px_70px_-25px_rgba(79,70,229,0.45)]",
        className
      )}
    >
      {gradient && (
        <div className={cn("absolute inset-0 opacity-70", gradient)} />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
