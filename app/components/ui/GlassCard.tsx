import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  active?: boolean;
}

export function GlassCard({ className, children, active, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card border-white/10 hover:border-white/20",
        active && "bg-white/10 border-white/30 ring-1 ring-white/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
