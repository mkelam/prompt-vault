"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "bizprompt_license_unlocked";
const VALID_LICENSE_KEYS = [
  "BIZPROMPT-PRO-2024",
  "BIZPROMPT-PREMIUM-VIP",
  "ENTERPRISE-UNLOCK-KEY"
];

export function useLicenseKey() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load unlock state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      setIsUnlocked(stored === "true");
      setIsLoading(false);
    }
  }, []);

  const validateKey = useCallback((key: string): boolean => {
    const normalizedKey = key.trim().toUpperCase();
    return VALID_LICENSE_KEYS.includes(normalizedKey);
  }, []);

  const unlock = useCallback((key: string): boolean => {
    if (validateKey(key)) {
      setIsUnlocked(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, "true");
      }
      return true;
    }
    return false;
  }, [validateKey]);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    isUnlocked,
    isLoading,
    unlock,
    lock,
    validateKey
  };
}
