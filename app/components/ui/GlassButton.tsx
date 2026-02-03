import { cn } from "@/lib/utils";
import React from "react";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export function GlassButton({ className, variant = "primary", size = "md", ...props }: GlassButtonProps) {
  const variants = {
    primary: "bg-white/10 hover:bg-white/20 text-white border-white/20",
    secondary: "bg-black/20 hover:bg-black/30 text-white/80 border-transparent",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-500/20",
  };

  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-6 py-3",
  };

  return (
    <button
      className={cn(
        "glass-btn border transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        "focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
