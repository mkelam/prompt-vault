"use client";

import React, { useState } from "react";
import { GlassCard } from "@/app/components/ui/GlassCard";
import { GlassButton } from "@/app/components/ui/GlassButton";
import { X, Lock, Unlock, AlertCircle, ExternalLink } from "lucide-react";

interface UnlockModalProps {
  onClose: () => void;
  onUnlock: (key: string) => boolean;
}

export function UnlockModal({ onClose, onUnlock }: UnlockModalProps) {
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsValidating(true);

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const isValid = onUnlock(licenseKey);

    if (isValid) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError("Invalid license key. Please check and try again.");
    }

    setIsValidating(false);
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlock-modal-title"
    >
      <GlassCard
        className="w-full max-w-md relative bg-black/50 border-white/20"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-4">
            {success ? (
              <Unlock className="w-8 h-8 text-green-400" />
            ) : (
              <Lock className="w-8 h-8 text-yellow-400" />
            )}
          </div>
          <h2
            id="unlock-modal-title"
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-orange-200"
          >
            {success ? "Premium Unlocked!" : "Unlock Premium Prompts"}
          </h2>
          <p className="text-white/60 mt-2 text-sm">
            {success
              ? "You now have access to all premium prompts."
              : "Enter your license key to access 50+ premium enterprise prompts."}
          </p>
        </div>

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* License Key Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                License Key
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => {
                  setLicenseKey(e.target.value);
                  setError("");
                }}
                placeholder="BIZPROMPT-XXXX-XXXX"
                className="glass-input text-center font-mono tracking-wider uppercase"
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <GlassButton
              type="submit"
              className="w-full justify-center"
              disabled={!licenseKey.trim() || isValidating}
            >
              {isValidating ? (
                <>
                  <span className="animate-spin mr-2">&#9696;</span>
                  Validating...
                </>
              ) : (
                "Unlock Premium"
              )}
            </GlassButton>

            {/* Purchase Link */}
            <div className="pt-4 border-t border-white/10 text-center">
              <p className="text-white/40 text-sm mb-2">
                Don&apos;t have a license key?
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Purchase integration coming soon! For now, use demo key: BIZPROMPT-PRO-2024");
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Get Premium Access
              </a>
            </div>
          </form>
        )}

        {success && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-300 text-sm">
              <Unlock className="w-4 h-4" />
              All premium prompts are now available
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
