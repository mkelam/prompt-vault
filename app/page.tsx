"use client";

import React, { useState, useMemo } from "react";
import promptsData from "@/data/prompts.json";
import { Prompt } from "@/lib/types";
import { PromptSearch } from "@/app/components/features/PromptSearch";
import { PromptList } from "@/app/components/features/PromptList";
import { PromptModal } from "@/app/components/features/PromptModal";
import { UnlockModal } from "@/app/components/features/UnlockModal";
import { useLicenseKey } from "@/hooks/useLicenseKey";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Lock, Unlock, Crown, Heart, Clock, Download } from "lucide-react";
import { exportLibraryToJSON, exportLibraryToExcel, exportLibraryToHTML } from "@/lib/export";

type FilterMode = "all" | "favorites" | "recent";

export default function Home() {
  const allPrompts = promptsData as unknown as Prompt[];

  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>(allPrompts);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const { isUnlocked, isLoading, unlock, lock } = useLicenseKey();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recentIds, addToRecent } = useRecentlyViewed();
  const { trackPromptView, trackFavoriteToggle, trackFilterModeChange, trackPremiumUnlock } = useAnalytics();

  // Count free and premium prompts
  const freeCount = allPrompts.filter(p => p.tier === "free").length;
  const premiumCount = allPrompts.filter(p => p.tier === "premium").length;

  // Get prompts based on filter mode
  const displayPrompts = useMemo(() => {
    let basePrompts = filteredPrompts;

    if (filterMode === "favorites") {
      basePrompts = allPrompts.filter(p => favorites.includes(p.id));
    } else if (filterMode === "recent") {
      basePrompts = recentIds
        .map(id => allPrompts.find(p => p.id === id))
        .filter((p): p is Prompt => p !== undefined);
    }

    return basePrompts;
  }, [filteredPrompts, filterMode, favorites, recentIds, allPrompts]);

  // Handle prompt selection (track recently viewed and analytics)
  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    addToRecent(prompt.id);
    trackPromptView(prompt.id, prompt.title, prompt.category, prompt.tier);
  };

  // Handle filter mode change with analytics
  const handleFilterModeChange = (mode: FilterMode) => {
    setFilterMode(mode);
    trackFilterModeChange(mode);
  };

  // Handle favorite toggle with analytics
  const handleToggleFavorite = (promptId: string) => {
    const action = isFavorite(promptId) ? "remove" : "add";
    toggleFavorite(promptId);
    trackFavoriteToggle(promptId, action);
  };

  // Handle premium unlock with analytics
  const handleUnlock = (key: string) => {
    const success = unlock(key);
    trackPremiumUnlock(success);
    return success;
  };

  return (
    <>
      {/* Skip Link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <main
        id="main-content"
        className="min-h-screen p-6 md:p-12 lg:p-24 max-w-7xl mx-auto space-y-12"
        role="main"
      >
        {/* Header */}
        <header className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200 pb-2">
          BizPrompt Vault
        </h1>
        <p className="text-xl text-blue-100/60 max-w-2xl mx-auto">
          The Offline-First Enterprise Prompt Repository.
          <span className="block text-sm mt-2 text-white/40">Secure. Fast. Framework-Aligned.</span>
        </p>

        {/* Premium Status Banner */}
        {!isLoading && (
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {isUnlocked ? (
              <button
                onClick={() => lock()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 text-sm hover:bg-green-500/30 transition-colors"
              >
                <Crown className="w-4 h-4" />
                Premium Unlocked ({premiumCount} prompts)
                <span className="text-white/40 text-xs ml-2">(click to lock)</span>
              </button>
            ) : (
              <button
                onClick={() => setShowUnlockModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-300 text-sm hover:bg-yellow-500/30 transition-colors"
              >
                <Lock className="w-4 h-4" />
                Unlock {premiumCount} Premium Prompts
              </button>
            )}

            {/* Download Library Button */}
            <div className="relative">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 text-sm hover:bg-blue-500/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Library
              </button>

              {/* Download Dropdown */}
              {showDownloadMenu && (
                <div className="absolute top-full mt-2 right-0 z-50 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden min-w-[200px]">
                  <button
                    onClick={() => {
                      exportLibraryToExcel(allPrompts);
                      setShowDownloadMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-3"
                  >
                    <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                      📊
                    </span>
                    <div>
                      <div className="font-medium">Excel (.xlsx)</div>
                      <div className="text-xs text-white/40">All prompts with summary</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      exportLibraryToHTML(allPrompts);
                      setShowDownloadMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-3 border-t border-white/10"
                  >
                    <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                      🌐
                    </span>
                    <div>
                      <div className="font-medium">Interactive HTML</div>
                      <div className="text-xs text-white/40">Offline-ready web app</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      exportLibraryToJSON(allPrompts);
                      setShowDownloadMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-3 border-t border-white/10"
                  >
                    <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                      {"{ }"}
                    </span>
                    <div>
                      <div className="font-medium">JSON (.json)</div>
                      <div className="text-xs text-white/40">Raw data for developers</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Search & Filter Section */}
      <section className="max-w-3xl mx-auto">
        <PromptSearch prompts={allPrompts} onFilter={setFilteredPrompts} />
      </section>

      {/* Quick Filters */}
      <section className="flex justify-center px-2" aria-label="View filters">
        <div
          className="inline-flex flex-wrap justify-center items-center gap-1 sm:gap-2 p-1 rounded-xl bg-white/5 border border-white/10"
          role="tablist"
          aria-label="Filter prompt view"
        >
          <button
            onClick={() => handleFilterModeChange("all")}
            role="tab"
            aria-selected={filterMode === "all"}
            aria-controls="prompts-panel"
            className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
              filterMode === "all"
                ? "bg-blue-500/20 text-blue-200 border border-blue-500/30"
                : "text-white/60 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterModeChange("favorites")}
            role="tab"
            aria-selected={filterMode === "favorites"}
            aria-controls="prompts-panel"
            className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
              filterMode === "favorites"
                ? "bg-pink-500/20 text-pink-200 border border-pink-500/30"
                : "text-white/60 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <Heart className={`w-4 h-4 ${filterMode === "favorites" ? "fill-pink-300" : ""}`} aria-hidden="true" />
            <span className="hidden xs:inline">Favorites</span>
            <span className="xs:hidden">Favs</span>
            {favorites.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-pink-500/30 text-xs" aria-label={`${favorites.length} favorites`}>
                {favorites.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleFilterModeChange("recent")}
            role="tab"
            aria-selected={filterMode === "recent"}
            aria-controls="prompts-panel"
            className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
              filterMode === "recent"
                ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                : "text-white/60 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            Recent
            {recentIds.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-purple-500/30 text-xs" aria-label={`${recentIds.length} recent`}>
                {recentIds.length}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* Results Grid */}
      <section id="prompts-panel" role="tabpanel" aria-label={`${filterMode === "all" ? "All" : filterMode === "favorites" ? "Favorite" : "Recent"} prompts`}>
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-white/50 text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
            {filterMode === "favorites" && <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />}
            {filterMode === "recent" && <Clock className="w-4 h-4 text-purple-400" />}
            {filterMode === "all" ? "Available Prompts" : filterMode === "favorites" ? "Favorite Prompts" : "Recently Viewed"}
            <span className="text-white/30">({displayPrompts.length})</span>
          </h2>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              {freeCount} Free
            </span>
            <span className="flex items-center gap-1">
              {isUnlocked ? (
                <Unlock className="w-3 h-3 text-green-400" />
              ) : (
                <Lock className="w-3 h-3 text-yellow-400" />
              )}
              {premiumCount} Premium
            </span>
          </div>
        </div>

        {/* Empty State for Favorites/Recent */}
        {displayPrompts.length === 0 && filterMode !== "all" && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              {filterMode === "favorites" ? (
                <Heart className="w-8 h-8 text-white/30" />
              ) : (
                <Clock className="w-8 h-8 text-white/30" />
              )}
            </div>
            <p className="text-white/50 text-lg mb-2">
              {filterMode === "favorites" ? "No favorites yet" : "No recently viewed prompts"}
            </p>
            <p className="text-white/30 text-sm">
              {filterMode === "favorites"
                ? "Click the heart icon on any prompt to add it to your favorites."
                : "Prompts you view will appear here for quick access."}
            </p>
            <button
              onClick={() => setFilterMode("all")}
              className="mt-4 text-blue-300 hover:text-blue-200 text-sm inline-flex items-center gap-1"
            >
              Browse all prompts
            </button>
          </div>
        )}

        {displayPrompts.length > 0 && (
          <PromptList
            prompts={displayPrompts}
            onSelect={handleSelectPrompt}
            isUnlocked={isUnlocked}
            onUnlockClick={() => setShowUnlockModal(true)}
            favorites={favorites}
          />
        )}
      </section>

      {/* Prompt Detail Modal */}
      {selectedPrompt && (
        <PromptModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          isFavorite={isFavorite(selectedPrompt.id)}
          onToggleFavorite={() => handleToggleFavorite(selectedPrompt.id)}
        />
      )}

      {/* Unlock Modal */}
      {showUnlockModal && (
        <UnlockModal
          onClose={() => setShowUnlockModal(false)}
          onUnlock={handleUnlock}
        />
      )}
      </main>
    </>
  );
}
