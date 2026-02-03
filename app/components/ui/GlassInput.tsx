import { cn } from "@/lib/utils";
import React from "react";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function GlassInput({ className, ...props }: GlassInputProps) {
  return (
    <input
      className={cn(
        "glass w-full bg-black/20 focus:bg-black/40 text-white placeholder:text-white/40 border-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all outline-none rounded-lg px-4 py-2",
        className
      )}
      {...props}
    />
  );
}
