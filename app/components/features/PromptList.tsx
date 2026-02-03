import React from "react";
import { Prompt } from "@/lib/types";
import { GlassCard } from "@/app/components/ui/GlassCard";
import { Lock, Crown, Heart } from "lucide-react";

interface PromptListProps {
  prompts: Prompt[];
  onSelect: (prompt: Prompt) => void;
  isUnlocked: boolean;
  onUnlockClick: () => void;
  favorites: string[];
}

export function PromptList({
  prompts,
  onSelect,
  isUnlocked,
  onUnlockClick,
  favorites
}: PromptListProps) {
  if (prompts.length === 0) {
    return (
      <div className="text-center py-20 text-white/50">
        <p className="text-xl">No prompts found matching your criteria.</p>
      </div>
    );
  }

  const handleClick = (prompt: Prompt) => {
    if (prompt.tier === "premium" && !isUnlocked) {
      onUnlockClick();
    } else {
      onSelect(prompt);
    }
  };

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      role="list"
      aria-label="Prompt templates"
    >
      {prompts.map((prompt) => {
        const isPremiumLocked = prompt.tier === "premium" && !isUnlocked;
        const isFavorite = favorites.includes(prompt.id);

        return (
          <GlassCard
            key={prompt.id}
            role="listitem"
            tabIndex={0}
            className={`cursor-pointer group flex flex-col h-full hover:scale-[1.02] relative focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent ${
              isPremiumLocked ? "opacity-90" : ""
            }`}
            onClick={() => handleClick(prompt)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick(prompt);
              }
            }}
            aria-label={`${prompt.title}${isPremiumLocked ? " - Premium locked, click to unlock" : ""}${isFavorite ? " - Favorited" : ""}`}
          >
            {/* Favorite Indicator */}
            {isFavorite && !isPremiumLocked && (
              <div className="absolute -top-2 -left-2 z-10">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-pink-500/30 to-red-500/30 border border-pink-500/40">
                  <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                </div>
              </div>
            )}

            {/* Premium Badge */}
            {prompt.tier === "premium" && (
              <div className="absolute -top-2 -right-2 z-10">
                {isPremiumLocked ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-500/40 text-yellow-300 text-xs font-bold">
                    <Lock className="w-3 h-3" />
                    <span>PREMIUM</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-500/40 text-green-300 text-xs font-bold">
                    <Crown className="w-3 h-3" />
                    <span>PREMIUM</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/5 text-white/60 uppercase tracking-wider">
                {prompt.category}
              </span>
              <span className="text-xs text-white/40">{prompt.estimatedTimeSaved}</span>
            </div>

            <h3 className={`text-xl font-bold mb-2 transition-colors ${
              isPremiumLocked
                ? "text-white/70"
                : "text-white/90 group-hover:text-blue-200"
            }`}>
              {prompt.title}
            </h3>
            <p className={`text-sm line-clamp-3 mb-4 flex-1 ${
              isPremiumLocked ? "text-white/40" : "text-white/60"
            }`}>
              {isPremiumLocked
                ? "Unlock premium to access this enterprise-grade prompt template..."
                : prompt.description
              }
            </p>

            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
              {isPremiumLocked ? (
                <span className="text-xs text-yellow-400/80 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Click to unlock premium access
                </span>
              ) : (
                prompt.frameworks.map(fw => (
                  <span key={fw} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-200/70 border border-blue-500/20">
                    {fw}
                  </span>
                ))
              )}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
