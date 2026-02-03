"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "bizprompt_recently_viewed";
const MAX_RECENT = 10;

interface RecentItem {
  id: string;
  viewedAt: number;
}

export function useRecentlyViewed() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setRecentItems(JSON.parse(stored));
        }
      } catch (error) {
        console.error("[RecentlyViewed] Failed to load:", error);
      }
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isLoading && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentItems));
      } catch (error) {
        console.error("[RecentlyViewed] Failed to save:", error);
      }
    }
  }, [recentItems, isLoading]);

  const addToRecent = useCallback((promptId: string) => {
    setRecentItems((prev) => {
      // Remove if already exists
      const filtered = prev.filter((item) => item.id !== promptId);

      // Add to beginning with current timestamp
      const newItems = [
        { id: promptId, viewedAt: Date.now() },
        ...filtered,
      ];

      // Keep only MAX_RECENT items
      return newItems.slice(0, MAX_RECENT);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentItems([]);
  }, []);

  const getRecentIds = useCallback(() => {
    return recentItems.map((item) => item.id);
  }, [recentItems]);

  return {
    recentItems,
    recentIds: getRecentIds(),
    isLoading,
    addToRecent,
    clearRecentlyViewed,
    count: recentItems.length,
  };
}
