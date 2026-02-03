"use client";

import { useCallback } from "react";

// Analytics event types for tracking user behavior
export type AnalyticsEvent =
  | { type: "page_view"; page: string }
  | { type: "prompt_view"; promptId: string; promptTitle: string; category: string; tier: "free" | "premium" }
  | { type: "prompt_copy"; promptId: string; promptTitle: string }
  | { type: "prompt_export"; promptId: string; promptTitle: string; format: "excel" | "markdown" }
  | { type: "search"; query: string; resultsCount: number }
  | { type: "category_filter"; category: string }
  | { type: "premium_unlock_attempt"; success: boolean }
  | { type: "favorite_toggle"; promptId: string; action: "add" | "remove" }
  | { type: "filter_mode_change"; mode: "all" | "favorites" | "recent" };

// Analytics configuration
interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  endpoint?: string;
}

const defaultConfig: AnalyticsConfig = {
  enabled: true,
  debug: process.env.NODE_ENV === "development",
  endpoint: undefined, // Set this to your analytics endpoint
};

// Local storage key for analytics data (for offline-first support)
const ANALYTICS_QUEUE_KEY = "bizprompt_analytics_queue";
const MAX_QUEUE_SIZE = 100;

// Get queued events from localStorage
function getQueuedEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(ANALYTICS_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save events to localStorage queue
function saveToQueue(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  try {
    const queue = getQueuedEvents();
    queue.push(event);
    // Keep only the most recent events
    const trimmedQueue = queue.slice(-MAX_QUEUE_SIZE);
    localStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(trimmedQueue));
  } catch (error) {
    console.warn("[Analytics] Failed to save to queue:", error);
  }
}

// Send event to analytics endpoint (placeholder for future integration)
async function sendToEndpoint(event: AnalyticsEvent, config: AnalyticsConfig) {
  if (!config.endpoint) return;

  try {
    await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      }),
    });
  } catch (error) {
    // Silently fail - analytics should never break the app
    if (config.debug) {
      console.warn("[Analytics] Failed to send event:", error);
    }
  }
}

// Main analytics hook
export function useAnalytics(config: Partial<AnalyticsConfig> = {}) {
  const mergedConfig = { ...defaultConfig, ...config };

  const track = useCallback(
    (event: AnalyticsEvent) => {
      if (!mergedConfig.enabled) return;

      // Debug logging
      if (mergedConfig.debug) {
        console.log("[Analytics]", event.type, event);
      }

      // Save to local queue for offline-first support
      saveToQueue(event);

      // Send to endpoint if configured
      if (mergedConfig.endpoint) {
        sendToEndpoint(event, mergedConfig);
      }
    },
    [mergedConfig]
  );

  // Convenience methods for common events
  const trackPromptView = useCallback(
    (promptId: string, promptTitle: string, category: string, tier: "free" | "premium") => {
      track({ type: "prompt_view", promptId, promptTitle, category, tier });
    },
    [track]
  );

  const trackPromptCopy = useCallback(
    (promptId: string, promptTitle: string) => {
      track({ type: "prompt_copy", promptId, promptTitle });
    },
    [track]
  );

  const trackPromptExport = useCallback(
    (promptId: string, promptTitle: string, format: "excel" | "markdown") => {
      track({ type: "prompt_export", promptId, promptTitle, format });
    },
    [track]
  );

  const trackSearch = useCallback(
    (query: string, resultsCount: number) => {
      track({ type: "search", query, resultsCount });
    },
    [track]
  );

  const trackCategoryFilter = useCallback(
    (category: string) => {
      track({ type: "category_filter", category });
    },
    [track]
  );

  const trackPremiumUnlock = useCallback(
    (success: boolean) => {
      track({ type: "premium_unlock_attempt", success });
    },
    [track]
  );

  const trackFavoriteToggle = useCallback(
    (promptId: string, action: "add" | "remove") => {
      track({ type: "favorite_toggle", promptId, action });
    },
    [track]
  );

  const trackFilterModeChange = useCallback(
    (mode: "all" | "favorites" | "recent") => {
      track({ type: "filter_mode_change", mode });
    },
    [track]
  );

  // Get analytics summary from queue (useful for debugging/dashboard)
  const getAnalyticsSummary = useCallback(() => {
    const events = getQueuedEvents();
    return {
      totalEvents: events.length,
      promptViews: events.filter((e) => e.type === "prompt_view").length,
      searches: events.filter((e) => e.type === "search").length,
      exports: events.filter((e) => e.type === "prompt_export").length,
      copies: events.filter((e) => e.type === "prompt_copy").length,
    };
  }, []);

  return {
    track,
    trackPromptView,
    trackPromptCopy,
    trackPromptExport,
    trackSearch,
    trackCategoryFilter,
    trackPremiumUnlock,
    trackFavoriteToggle,
    trackFilterModeChange,
    getAnalyticsSummary,
  };
}
