"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "bizprompt_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (error) {
        console.error("[Favorites] Failed to load:", error);
      }
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (!isLoading && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error("[Favorites] Failed to save:", error);
      }
    }
  }, [favorites, isLoading]);

  const addFavorite = useCallback((promptId: string) => {
    setFavorites((prev) => {
      if (prev.includes(promptId)) return prev;
      return [...prev, promptId];
    });
  }, []);

  const removeFavorite = useCallback((promptId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== promptId));
  }, []);

  const toggleFavorite = useCallback((promptId: string) => {
    setFavorites((prev) => {
      if (prev.includes(promptId)) {
        return prev.filter((id) => id !== promptId);
      }
      return [...prev, promptId];
    });
  }, []);

  const isFavorite = useCallback(
    (promptId: string) => favorites.includes(promptId),
    [favorites]
  );

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
    count: favorites.length,
  };
}
