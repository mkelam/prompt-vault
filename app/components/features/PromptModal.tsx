"use client";

import React from "react";
import { Prompt } from "@/lib/types";
import { GlassCard } from "@/app/components/ui/GlassCard";
import { GlassButton } from "@/app/components/ui/GlassButton";
import { cn } from "@/lib/utils";
import { exportToExcel, exportToMarkdown } from "@/lib/export";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Copy, X, Check, FileDown, FileText, Loader2, Heart } from "lucide-react";

interface PromptModalProps {
  prompt: Prompt;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function PromptModal({ prompt, onClose, isFavorite, onToggleFavorite }: PromptModalProps) {
  const [variables, setVariables] = React.useState<Record<string, string>>({});
  const [copied, setCopied] = React.useState(false);
  const [filledTemplate, setFilledTemplate] = React.useState(prompt.template);
  const [exportingType, setExportingType] = React.useState<"excel" | "markdown" | null>(null);
  const { trackPromptCopy, trackPromptExport } = useAnalytics();

  // Update filled template whenever variables change
  React.useEffect(() => {
    let result = prompt.template;
    Object.entries(variables).forEach(([key, value]) => {
      if (value) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        result = result.replace(regex, value);
      }
    });
    setFilledTemplate(result);
  }, [variables, prompt.template]);

  // Reset state when prompt changes
  React.useEffect(() => {
    setVariables({});
    setCopied(false);
    setFilledTemplate(prompt.template);
    setExportingType(null);
  }, [prompt]);

  const handleVariableChange = (name: string, value: string) => {
    setVariables((prev: Record<string, string>) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(filledTemplate);
      setCopied(true);
      trackPromptCopy(prompt.id, prompt.title);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleExportExcel = async () => {
    if (!prompt) return;
    setExportingType("excel");
    await new Promise(resolve => setTimeout(resolve, 800));
    exportToExcel(prompt, variables);
    trackPromptExport(prompt.id, prompt.title, "excel");
    setExportingType(null);
  };

  const handleExportMarkdown = async () => {
    if (!prompt) return;
    setExportingType("markdown");
    await new Promise(resolve => setTimeout(resolve, 800));
    exportToMarkdown(prompt, variables);
    trackPromptExport(prompt.id, prompt.title, "markdown");
    setExportingType(null);
  };

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <GlassCard
        className="w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] sm:rounded-2xl rounded-none overflow-y-auto relative bg-black/40 border-white/20"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 uppercase tracking-wider">
              {prompt.category}
            </span>
            <span className="text-xs text-white/50">
              {prompt.estimatedTimeSaved} saved
            </span>
            {prompt.tier === "premium" && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-200 uppercase tracking-wider">
                PREMIUM
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Favorite Button - min 44x44 touch target */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={cn(
                "min-w-[44px] min-h-[44px] p-2.5 sm:p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
                isFavorite
                  ? "bg-pink-500/20 text-pink-400 hover:bg-pink-500/30"
                  : "text-white/50 hover:text-pink-400 hover:bg-white/10"
              )}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={cn("w-6 h-6 sm:w-5 sm:h-5", isFavorite && "fill-pink-400")} />
            </button>
            {/* Close Button - min 44x44 touch target */}
            <button
              className="min-w-[44px] min-h-[44px] p-2.5 sm:p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="w-7 h-7 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Left: Input Form */}
          <div className="flex-1 space-y-4 md:space-y-6">
            {/* Header */}
            <div>
              <h2
                id="modal-title"
                className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white leading-tight"
              >
                {prompt.title}
              </h2>
              <p className="text-white/70 mt-2 text-sm sm:text-base">{prompt.description}</p>

              {/* Frameworks */}
              {prompt.frameworks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {prompt.frameworks.map((fw) => (
                    <span
                      key={fw}
                      className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20"
                    >
                      {fw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Variable Inputs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90">
                Customize Variables
              </h3>
              {prompt.variables.map((v) => (
                <div key={v.name} className="space-y-1">
                  <label className="text-sm font-medium text-white/80 flex items-center justify-between">
                    <span className="capitalize">{v.name.replace(/_/g, " ")}</span>
                    {v.required && (
                      <span className="text-red-400 text-xs">*Required</span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder={v.example}
                    value={variables[v.name] || ""}
                    onChange={(e) => handleVariableChange(v.name, e.target.value)}
                    className="glass-input text-sm"
                    aria-describedby={`${v.name}-description`}
                  />
                  <p
                    id={`${v.name}-description`}
                    className="text-xs text-white/40"
                  >
                    {v.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Export Actions */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                Export Options
              </h3>
              <div className="flex gap-3">
                <GlassButton
                  size="sm"
                  variant="secondary"
                  onClick={handleExportExcel}
                  disabled={!!exportingType}
                  className="flex items-center gap-2 flex-1 justify-center"
                >
                  {exportingType === "excel" ? (
                    <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 text-green-400" />
                  )}
                  {exportingType === "excel" ? "Exporting..." : "Excel"}
                </GlassButton>
                <GlassButton
                  size="sm"
                  variant="secondary"
                  onClick={handleExportMarkdown}
                  disabled={!!exportingType}
                  className="flex items-center gap-2 flex-1 justify-center"
                >
                  {exportingType === "markdown" ? (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4 text-blue-400" />
                  )}
                  {exportingType === "markdown" ? "Exporting..." : "Markdown"}
                </GlassButton>
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 flex flex-col h-full min-h-[250px] sm:min-h-[400px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white/90">Preview</h3>
              <GlassButton
                size="sm"
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-2",
                  copied ? "bg-green-500/20 text-green-200" : ""
                )}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy Prompt"}
              </GlassButton>
            </div>
            <div className="flex-1 p-6 rounded-xl bg-black/30 border border-white/10 font-mono text-sm leading-relaxed whitespace-pre-wrap text-white/80 overflow-auto">
              {filledTemplate.split(/(\{\{\w+\}\})/).map((part: string, i: number) => {
                if (part.startsWith("{{") && part.endsWith("}}")) {
                  const key = part.slice(2, -2);
                  const isFilled = !!variables[key];
                  return (
                    <span
                      key={i}
                      className={cn(
                        "transition-colors duration-200",
                        isFilled
                          ? "text-blue-300 font-bold"
                          : "text-yellow-500/80"
                      )}
                    >
                      {variables[key] || part}
                    </span>
                  );
                }
                return <React.Fragment key={i}>{part}</React.Fragment>;
              })}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
